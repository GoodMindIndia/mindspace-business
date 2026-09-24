-- MindSpace for Business — Real HR admin authentication
--
-- Replaces the hardcoded demo HR accounts previously in AuthContext.tsx with
-- real Supabase Auth users, gated by an explicit allowlist table. Run this
-- once, after schema-employee.sql.
--
-- Being a Supabase Auth user is not enough on its own to reach /admin — only
-- an id present in `hr_admins` is treated as an HR admin. The client calls
-- `hr_admin_profile()` right after signing in; a Supabase Auth user who
-- isn't in `hr_admins` gets zero rows back and is signed out immediately
-- (see AuthContext.tsx).
--
-- To create the first HR accounts, use scripts/seed-hr-admin.mjs (needs the
-- project's service role key — run it locally, never in the browser).

create table if not exists public.hr_admins (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id text not null default 'demo-acme',
  name text not null,
  title text not null default '',
  created_at timestamptz not null default now()
);

alter table public.hr_admins enable row level security;

drop policy if exists "HR admins can read their own row" on public.hr_admins;
create policy "HR admins can read their own row" on public.hr_admins
  for select
  using (auth.uid() = id);

-- ── hr_admin_profile() ──────────────────────────────────────────────────────
-- Confirms the signed-in Supabase Auth user is an authorised HR admin and
-- returns their display profile. Zero rows means "not authorised".
create or replace function public.hr_admin_profile()
returns table (org_id text, name text, title text)
language sql
security definer
set search_path = public
as $$
  select org_id, name, title
  from public.hr_admins
  where id = auth.uid();
$$;

grant execute on function public.hr_admin_profile() to authenticated;
