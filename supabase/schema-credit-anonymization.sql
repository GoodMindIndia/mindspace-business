-- MindSpace for Business — Per-employee Tara credit usage, without identity
--
-- Run this once, after schema-credits-workshops.sql.
--
-- HR asked to see that credits are genuinely spread across real employees,
-- not concentrated suspiciously. The old `org_credit_balance()` only ever
-- returned an org-wide total, which couldn't prove that. This adds a
-- per-employee breakdown WITHOUT adding a per-employee identity anywhere:
--
--   * Each employee gets a stable pseudonym ("Team member N") the first time
--     they use Tara, derived as a keyed hash (HMAC-SHA256) of their user id.
--     The key lives in `_credit_pseudonym_secret`, ONE ROW PER COMPANY (not
--     one shared key for the whole platform) — this repo is heading toward a
--     pooled multi-tenant database (see MULTI_TENANT_ARCHITECTURE.md), and a
--     per-org key means a compromise of one company's key can never expose
--     another company's employees. It's provisioned automatically the first
--     time an org uses Tara — onboarding a new company stays "insert a row,"
--     never a manual per-company setup step. RLS is enabled with ZERO
--     policies granted to anon/authenticated — the anon key this app ships
--     to the browser cannot read it under any circumstance, and neither can
--     a signed-in employee or HR admin. Only the security-definer functions
--     below (which run as the table owner) can read it.
--   * `tara_credit_usage`, what `org_credit_usage_by_member()` reads, never
--     stores a user id or a name — only the pseudonym and a timestamp.
--   * `tara_sessions` (schema-credits-workshops.sql) keeps recording the real
--     user id as before; that table is owner-only RLS and was never exposed
--     to HR. This migration doesn't touch it or the anonymity guarantee it
--     already had.
--
-- Caveat, stated plainly: this defeats every normal path to identity — the
-- app, the HR dashboard, the anon/authenticated API roles, ordinary table
-- browsing. It is not proof against someone who deliberately uses the
-- Supabase project owner's own database-engine access (the SQL editor
-- running as the `postgres` role) to read `_credit_pseudonym_secret`
-- directly and recompute the hash themselves — no scheme hosted on
-- infrastructure you also administer can be airtight against you. Treat
-- reading that table as a bright line nobody should cross outside a real
-- incident investigation.

create extension if not exists pgcrypto;

-- ── _credit_pseudonym_secret ─────────────────────────────────────────────────
-- One key per org, auto-provisioned on first use (see
-- _credit_pseudonym_label() below). RLS enabled, no policies at all: anon
-- and authenticated get zero access, full stop. Only security-definer
-- functions below (owned by the same role that ran this script) can read it.
create table if not exists public._credit_pseudonym_secret (
  org_id text primary key,
  secret bytea not null,
  created_at timestamptz not null default now()
);

alter table public._credit_pseudonym_secret enable row level security;
revoke all on public._credit_pseudonym_secret from anon, authenticated;

-- ── org_credit_pseudonym_counters ────────────────────────────────────────────
-- Next sequence number to hand out per org, so labels read "Team member 1",
-- "Team member 2", ... instead of raw hashes.
create table if not exists public.org_credit_pseudonym_counters (
  org_id text primary key,
  next_seq int not null default 1
);

alter table public.org_credit_pseudonym_counters enable row level security;
revoke all on public.org_credit_pseudonym_counters from anon, authenticated;

-- ── org_credit_pseudonyms ────────────────────────────────────────────────────
-- Maps a keyed hash of a user id to a stable display label. The hash alone
-- is not reversible without `_credit_pseudonym_secret`, and this table is
-- never joined to `profiles` or `auth.users` by anything in this schema.
create table if not exists public.org_credit_pseudonyms (
  org_id text not null,
  pseudonym_hash text not null,
  label text not null,
  first_seen_at timestamptz not null default now(),
  primary key (org_id, pseudonym_hash)
);

alter table public.org_credit_pseudonyms enable row level security;
revoke all on public.org_credit_pseudonyms from anon, authenticated;

-- ── tara_credit_usage ────────────────────────────────────────────────────────
-- What `org_credit_usage_by_member()` reads. No user id, no name — ever.
create table if not exists public.tara_credit_usage (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  member_label text not null,
  used_at timestamptz not null default now()
);

alter table public.tara_credit_usage enable row level security;
revoke all on public.tara_credit_usage from anon, authenticated;

-- ── _credit_pseudonym_label() ────────────────────────────────────────────────
-- Internal helper: given a real user id, returns their stable pseudonym for
-- this org, minting one on first use. Not granted to anon/authenticated —
-- only callable from other security-definer functions owned by the same
-- role, which is how start_tara_session() below uses it.
create or replace function public._credit_pseudonym_label(p_user_id uuid, p_org_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret bytea;
  v_hash text;
  v_label text;
  v_seq int;
begin
  -- Provision this org's key on first-ever use. on conflict do nothing
  -- makes this safe against two concurrent first calls for the same org.
  insert into public._credit_pseudonym_secret (org_id, secret)
    values (p_org_id, gen_random_bytes(32))
  on conflict (org_id) do nothing;

  select secret into v_secret from public._credit_pseudonym_secret where org_id = p_org_id;

  v_hash := encode(hmac(p_user_id::text, v_secret, 'sha256'), 'hex');

  select label into v_label
  from public.org_credit_pseudonyms
  where org_id = p_org_id and pseudonym_hash = v_hash;

  if v_label is not null then
    return v_label;
  end if;

  insert into public.org_credit_pseudonym_counters (org_id, next_seq)
    values (p_org_id, 2)
  on conflict (org_id) do update
    set next_seq = public.org_credit_pseudonym_counters.next_seq + 1
  returning next_seq - 1 into v_seq;

  insert into public.org_credit_pseudonyms (org_id, pseudonym_hash, label)
    values (p_org_id, v_hash, 'Team member ' || v_seq)
  on conflict (org_id, pseudonym_hash) do update
    set label = public.org_credit_pseudonyms.label
  returning label into v_label;

  return v_label;
end;
$$;

-- ── start_tara_session(), redefined ──────────────────────────────────────────
-- Same credit-deduction logic as schema-credits-workshops.sql, plus one
-- extra insert: a pseudonymous usage row HR's per-member report reads. The
-- real user id still goes into tara_sessions exactly as before, for the
-- employee's own history — that table was never HR-visible.
create or replace function public.start_tara_session(p_org_id text)
returns table (credits_remaining int, total_credits int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_used int;
  v_label text;
begin
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

  v_label := public._credit_pseudonym_label(auth.uid(), p_org_id);
  insert into public.tara_credit_usage (org_id, member_label) values (p_org_id, v_label);

  return query select (v_total - v_used), v_total;
end;
$$;

grant execute on function public.start_tara_session(text) to anon, authenticated;

-- ── org_credit_usage_by_member() ─────────────────────────────────────────────
-- What HR's dashboard reads: pseudonym, credits used, last active — never a
-- user id, name, or email. No k-anonymity floor here deliberately: the whole
-- point is proving usage is spread across real, distinct people, so masking
-- a lone employee's count would defeat that.
create or replace function public.org_credit_usage_by_member(p_org_id text)
returns table (member_label text, credits_used int, last_used_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select member_label, count(*)::int as credits_used, max(used_at) as last_used_at
  from public.tara_credit_usage
  where org_id = p_org_id
  group by member_label
  order by credits_used desc, member_label;
$$;

grant execute on function public.org_credit_usage_by_member(text) to anon, authenticated;
