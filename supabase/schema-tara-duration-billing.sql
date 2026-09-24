-- MindSpace for Business — bill Tara credits by call duration, not by call count
--
-- Run this once, after schema-credit-anonymization.sql.
--
-- Previously: start_tara_session() deducted exactly 1 credit the instant a
-- call STARTED, regardless of length — a 10-second call and a 30-minute
-- call cost the same, and a call that started but never actually connected
-- (mic permission denied, ElevenLabs connection failure) still burned a
-- credit for a conversation that never happened.
--
-- Now: starting a call only reserves a session (checked against credits
-- being available at all, nothing deducted yet). Credits are deducted when
-- the call ENDS, based on real duration — 1 credit per minute, rounded up,
-- with a floor of 1 credit for any call that actually connected. A call
-- that never connects (duration 0) is never charged and never logged, so
-- it never appears in the per-member breakdown either.
--
-- If credits run out mid-call, the call is allowed to finish (nobody gets
-- cut off mid-conversation) — the org's balance can go slightly negative
-- for that one settlement; the NEXT call attempt is what's blocked.

-- ── tara_sessions: track when a session ends and how long it ran ───────────
alter table public.tara_sessions
  add column if not exists ended_at timestamptz,
  add column if not exists duration_seconds int;

-- ── tara_credit_usage: one row per BILLED session, with its own credit count
-- (was implicitly "1 row = 1 credit"; now a session can cost more than 1) ──
alter table public.tara_credit_usage
  add column if not exists credits_used int not null default 1;

-- ── start_tara_session(), redefined ──────────────────────────────────────────
-- No longer deducts anything. Just checks the org has at least 1 credit
-- available, opens a session row, and hands back its id so the client can
-- report duration back at end_tara_session(). Return shape changed (added
-- session_id), so the old function must be dropped first.
drop function if exists public.start_tara_session(text);

create or replace function public.start_tara_session(p_org_id text)
returns table (session_id uuid, credits_remaining int, total_credits int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_used int;
  v_session_id uuid;
begin
  select oca.total_credits, oca.credits_used into v_total, v_used
  from public.org_credit_accounts as oca
  where oca.org_id = p_org_id;

  if v_total is null or v_used >= v_total then
    raise exception 'No Tara credits remaining for this organization';
  end if;

  insert into public.tara_sessions (user_id, org_id)
    values (auth.uid(), p_org_id)
    returning id into v_session_id;

  return query select v_session_id, (v_total - v_used), v_total;
end;
$$;

grant execute on function public.start_tara_session(text) to anon, authenticated;

-- ── end_tara_session() ──────────────────────────────────────────────────────
-- Settles a session: computes credits from real duration (1 per minute,
-- rounded up, minimum 1 for any call that actually connected), deducts them,
-- and logs the pseudonymous usage row HR's dashboard reads. A duration of 0
-- (or less) means the call never actually connected — nothing is charged
-- and nothing is logged, so a failed connection attempt leaves no trace.
create or replace function public.end_tara_session(p_org_id text, p_session_id uuid, p_duration_seconds int)
returns table (credits_charged int, credits_remaining int, total_credits int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_used int;
  v_credits int;
  v_label text;
begin
  update public.tara_sessions as ts
    set ended_at = now(),
        duration_seconds = p_duration_seconds
    where ts.id = p_session_id
      and ts.user_id = auth.uid()
      and ts.org_id = p_org_id;

  if not found then
    raise exception 'Tara session not found for this user';
  end if;

  if p_duration_seconds is null or p_duration_seconds <= 0 then
    select oca.total_credits, oca.credits_used into v_total, v_used
    from public.org_credit_accounts as oca
    where oca.org_id = p_org_id;
    return query select 0, greatest(coalesce(v_total, 0) - coalesce(v_used, 0), 0), coalesce(v_total, 0);
    return;
  end if;

  v_credits := greatest(1, ceil(p_duration_seconds / 60.0))::int;

  update public.org_credit_accounts as oca
    set credits_used = oca.credits_used + v_credits,
        updated_at = now()
    where oca.org_id = p_org_id
    returning oca.total_credits, oca.credits_used into v_total, v_used;

  if not found then
    raise exception 'No credit account found for this organization';
  end if;

  v_label := public._credit_pseudonym_label(auth.uid(), p_org_id);
  insert into public.tara_credit_usage (org_id, member_label, credits_used)
    values (p_org_id, v_label, v_credits);

  return query select v_credits, greatest(v_total - v_used, 0), v_total;
end;
$$;

grant execute on function public.end_tara_session(text, uuid, int) to anon, authenticated;

-- ── org_credit_usage_by_member(), redefined ──────────────────────────────────
-- Sums actual credits per member instead of counting rows (a row is no
-- longer always worth exactly 1 credit).
create or replace function public.org_credit_usage_by_member(p_org_id text)
returns table (member_label text, credits_used int, last_used_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select member_label, sum(credits_used)::int as credits_used, max(used_at) as last_used_at
  from public.tara_credit_usage
  where org_id = p_org_id
  group by member_label
  order by credits_used desc, member_label;
$$;

grant execute on function public.org_credit_usage_by_member(text) to anon, authenticated;
