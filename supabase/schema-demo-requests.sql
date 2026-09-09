-- MindSpace for Business — inbound "Request a Demo" leads from the
-- marketing landing page (src/components/DemoRequestModal.tsx).
--
-- Run this once in your Supabase project's SQL editor. It only adds a
-- table — no dependency on the other schema-*.sql files.
--
-- Same posture as anonymous_checkins in lib/supabase.ts: the public site
-- has no session, so inserts are open to anon, but unlike a check-in this
-- data is *not* anonymous by design (we need to be able to email the
-- person back) — so reads are locked to the service role only. No one
-- browsing the site can list other companies' demo requests.

create extension if not exists pgcrypto;

create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  work_email text not null,
  company_size text not null,
  message text not null default '',
  source_page text not null default 'landing',
  created_at timestamptz not null default now()
);

alter table public.demo_requests enable row level security;

drop policy if exists "Anyone can submit a demo request" on public.demo_requests;
create policy "Anyone can submit a demo request" on public.demo_requests
  for insert
  with check (
    length(trim(company_name)) > 0
    and length(trim(work_email)) > 0
    and work_email like '%@%'
  );

-- Deliberately no select policy for anon/authenticated — only the
-- service role (used from a trusted server context, e.g. a future
-- Netlify function that emails sales) can read submissions back.
