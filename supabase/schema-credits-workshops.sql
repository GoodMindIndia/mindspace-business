-- MindSpace for Business — Tara credit plans & workshop requests
--
-- Run this once in your Supabase project's SQL editor, after schema-employee.sql
-- and schema-employee-analytics.sql. It only adds tables and functions.
--
-- Same anonymity contract as the rest of the employee schema:
--   * `tara_sessions` and `workshop_requests` are row-level-security locked to
--     the owning user (auth.uid() = user_id). HR never reads a row from either.
--   * HR's dashboard only reads security definer functions that return counts.
--   * `org_credit_accounts` has no client write policy at all — the only way
--     `credits_used` moves is through start_tara_session() below, so a leaked
--     anon key can't hand itself unlimited credits.

create extension if not exists pgcrypto;

-- ── org_credit_accounts ─────────────────────────────────────────────────────
-- One row per org: the Tara credit plan HR has purchased, and how much of it
-- has been used. One credit = one Tara conversation.
create table if not exists public.org_credit_accounts (
  org_id text primary key,
  plan_name text not null default 'Starter',
  total_credits int not null default 0,
  credits_used int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.org_credit_accounts enable row level security;

-- ── tara_sessions ────────────────────────────────────────────────────────────
-- One row per Tara conversation an employee starts. Owner-only RLS, same
-- pattern as assessment_records/therapy_bookings.
create table if not exists public.tara_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  org_id text not null default 'demo-acme',
  started_at timestamptz not null default now()
);

alter table public.tara_sessions enable row level security;

drop policy if exists "Employees manage their own tara sessions" on public.tara_sessions;
create policy "Employees manage their own tara sessions" on public.tara_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── start_tara_session() ────────────────────────────────────────────────────
-- Atomically logs a session and deducts one credit from the org's pool.
-- Raises if the org is out of credits, so the client can block the call
-- before it connects rather than after.
create or replace function public.start_tara_session(p_org_id text)
returns table (credits_remaining int, total_credits int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_used int;
begin
  -- Table alias + fully-qualified columns throughout: the function's own OUT
  -- parameters (credits_remaining, total_credits) become PL/pgSQL variables
  -- in scope here, and "total_credits" unqualified is ambiguous between that
  -- variable and the org_credit_accounts column of the same name.
  update public.org_credit_accounts as oca
    set credits_used = oca.credits_used + 1,
        updated_at = now()
    where oca.org_id = p_org_id
      and oca.credits_used < oca.total_credits
    returning oca.total_credits, oca.credits_used
    into v_total, v_used;

  if not found then
    raise exception 'No Tara credits remaining for this organization';
  end if;

  insert into public.tara_sessions (user_id, org_id) values (auth.uid(), p_org_id);

  return query select (v_total - v_used), v_total;
end;
$$;

grant execute on function public.start_tara_session(text) to anon, authenticated;

-- ── org_credit_balance() ────────────────────────────────────────────────────
-- What HR's Overview page reads: plan name, total, used, remaining. Never a
-- row, never tied to a person.
create or replace function public.org_credit_balance(p_org_id text)
returns table (plan_name text, total_credits int, credits_used int, credits_remaining int)
language sql
security definer
set search_path = public
as $$
  select plan_name, total_credits, credits_used, greatest(total_credits - credits_used, 0)
  from public.org_credit_accounts
  where org_id = p_org_id;
$$;

grant execute on function public.org_credit_balance(text) to anon, authenticated;

-- ── workshop_requests ────────────────────────────────────────────────────────
-- What an employee wants a workshop about. Owner-only RLS — HR never sees who
-- asked, only the aggregate counts below.
create table if not exists public.workshop_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  org_id text not null default 'demo-acme',
  topic text not null,
  details text not null default '',
  created_at timestamptz not null default now()
);

alter table public.workshop_requests enable row level security;

drop policy if exists "Employees manage their own workshop requests" on public.workshop_requests;
create policy "Employees manage their own workshop requests" on public.workshop_requests
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── org_workshop_request_summary() ──────────────────────────────────────────
-- Counts of requests by topic. Same k-anonymity rule as everywhere else: a
-- topic with fewer than p_k requests is folded into "Other" instead of shown
-- on its own, so a lone request never reads as identifiable.
drop function if exists public.org_workshop_request_summary(text, int);

create or replace function public.org_workshop_request_summary(p_org_id text, p_k int default 5)
returns table (topic text, total int)
language sql
security definer
set search_path = public
as $$
  with by_topic as (
    select wr.topic, count(*)::int as total
    from public.workshop_requests wr
    where wr.org_id = p_org_id
    group by wr.topic
  )
  select topic, total from by_topic where total >= p_k
  union all
  select 'Other' as topic, coalesce(sum(total), 0)::int as total
  from by_topic where total < p_k
  having coalesce(sum(total), 0) > 0;
$$;

grant execute on function public.org_workshop_request_summary(text, int) to anon, authenticated;

-- ── Starter credit plans ─────────────────────────────────────────────────────
-- Seed both org ids this app checks in demo mode. Adjust totals or insert a
-- new row per real tenant as plans are sold.
insert into public.org_credit_accounts (org_id, plan_name, total_credits, credits_used)
values ('demo-acme', 'Growth', 1000, 0)
on conflict (org_id) do nothing;
