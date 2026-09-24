# Multi-Company (Multi-Tenant) Architecture Plan

Status: **planned, not yet implemented**. This document captures the agreed direction for
taking MindSpace from a single-tenant demo (`eap.mindspace.ai`) to a platform that serves
many companies from one codebase, each on its own subdomain (e.g. `acme.mindspace.ai`,
`betacorp.mindspace.ai`), with zero cross-company data mixing.

Out of scope for this document: HR-uploaded attendance/leave data and productivity
reporting — tracked separately, deliberately left out here.

## Goals (agreed in planning discussion)

1. **One codebase, one deployment.** Shipping a fix or feature should never require
   touching or redeploying anything per-company. Every `*.mindspace.ai` subdomain runs
   the same build.
2. **Every company gets its own subdomain**, resolved at runtime, with its own branding
   (already partially supported via `applyTenantBranding` in `src/lib/tenant-theme.ts`).
3. **Company data must never mix.** Not "unlikely to," not "protected by convention" —
   enforced so a bug or a forgotten filter cannot leak one company's data into another's
   session.
4. **Cost/ops has to scale** — this is not one huge enterprise customer, it's many
   companies at ~500–1000 employees each. Avoid an architecture that multiplies
   operational work per customer signed.

## Chosen model: pooled database + subdomain routing + enforced RLS

We evaluated "separate Supabase project per company" (the *silo* model) and rejected it
as the default: it multiplies cost and migration/ops work per customer for isolation
that a shared database can already guarantee correctly. Instead:

- **One shared Supabase project**, all companies' data lives in the same tables.
- **Every tenant-scoped table already carries `org_id`** — this is already true in the
  existing schema (`supabase/schema-*.sql`) and domain types (`Organization`, `org_id`
  on `OrgSignal`, `OrgThemeSignal`, `OrgRollup`, etc.) — no structural change needed there.
- **Postgres Row-Level Security (RLS) enforces the isolation**, not application code.
  This is the part that actually prevents mixing: RLS policies run inside the database
  itself on every query, so even a forgotten `WHERE org_id = ...` in application code
  cannot return another company's rows.
- **Subdomain determines which company a session belongs to**, and that `org_id` gets
  attached to the authenticated session (custom JWT claim, or looked up from `profiles`
  by RLS policies), which is what the RLS policies check against.

This gives the hard "cannot mix" guarantee the business requires, without the
per-company database/migration/cost overhead of full physical separation.

## Current gaps vs. this plan (verified in code, as of this doc)

- `src/app/TenantContext.tsx` **always returns the hardcoded demo org**
  (`getDemoOrganization()`), regardless of subdomain. Contains an existing
  `// TODO(P0 follow-up): resolve real tenant from Firestore by subdomain/custom domain`
  comment — this needs to become a real Supabase lookup by subdomain, not Firestore.
- `src/lib/supabase.ts` creates **one global Supabase client** from a single `.env`
  URL/key pair — fine under the pooled model (all tenants share this one project), no
  change needed here specifically because of multi-tenancy, but see auth note below.
- Current RLS policies (`supabase/schema-*.sql`) are **"own row only"** — they do not
  check the authenticated user's `org_id` against the row's `org_id` at all. Under the
  pooled model, this is the actual security hole: two companies sharing this database
  today would not be isolated from each other with the current policies.
- Employee auth (Supabase Google OAuth) has **no organization boundary check** — any
  Google account can currently sign in and reach `/app` regardless of company. Needs
  either Google Workspace domain restriction (`hd` parameter) per org, or an
  invite/allowlist check against the resolved tenant before granting access.
- HR/Admin auth (`src/app/AuthContext.tsx`) is either hardcoded demo credentials or a
  Firebase custom-claim system that is referenced but not implemented anywhere in this
  repo — this needs to be resolved as part of, not after, multi-tenancy, since HR auth
  also needs an org boundary.

## Implementation plan

### 1. `organizations` directory table (public, non-sensitive)
A table holding one row per company: `org_id`, `subdomain`, `custom_domain` (nullable,
for later), `branding` (colors/logo/app name — already modeled), `plan`/`seats`, `status`.
Readable without auth (subdomain resolution has to happen before login).

### 2. Subdomain resolution replaces the hardcoded tenant
`TenantContext.tsx` reads `window.location.hostname`, extracts the subdomain, queries
`organizations` for a match, and uses that as the active tenant — replacing
`getDemoOrganization()` as the non-demo path. Demo mode (no subdomain match / local dev)
keeps falling back to the seeded demo tenant.

### 3. Org boundary attached at login
When a user authenticates (employee via Supabase Google OAuth, HR via whatever auth is
finalized), the resolved `org_id` from step 2 is written onto their `profiles` row (already
partially done — `EmployeeAuthContext.tsx` already upserts `org_id` into `profiles` on
sign-in) and/or included as a custom claim, so it's available to RLS policies without a
extra round trip.

### 4. RLS policies rewritten to enforce `org_id`, not just "own row"
Every tenant-scoped table gets a policy shaped like:

```sql
using (org_id = (select org_id from profiles where id = auth.uid()))
```

This is the change that actually closes the "must not mix" requirement. Needs to be
applied across all tables in `supabase/schema-*.sql` (`daily_mood_checkins`,
`assessment_records`, `therapy_bookings`, `workshop_requests`, `tara_sessions`,
`org_credit_accounts`, etc.), and the aggregate RPC functions (`org_mood_tiers`,
`org_employee_stats`, `org_weekly_trend`, etc.) need to be checked so they can't be
called with an arbitrary `p_org_id` that doesn't match the caller's own org.

### 5. Sign-in restricted per company
Add a per-org allowed-email-domain (or invite list) check at sign-in, so Company A's
employees cannot land inside Company B's subdomain session even if they have a Google
account. Enforced at minimum via RLS (step 4 makes this safe even without it), but
should also be checked at sign-in for a clean UX ("this account isn't part of
company-x's workspace").

### 6. Onboarding a new company = a data write, not a deploy
New customer process becomes: insert one `organizations` row, no code change, no
redeploy. DNS: since all subdomains share the same deployment, only a wildcard
`*.mindspace.ai` DNS record is needed once — no per-company DNS work beyond that
(custom domains, if ever offered, are the one exception — those need a CNAME per
company, tracked separately from subdomain-only customers).

### 7. Wildcard subdomain hosting — decide before committing further to Netlify
Confirm Netlify's wildcard-subdomain support (may require Netlify-managed DNS) versus
Vercel's (generally more straightforward for `*.domain` → one project). Both Netlify
(`netlify.toml`) and Vercel (`vercel.json`) configs currently exist in the repo; only
Netlify currently hosts the real serverless function (Gemini report proxy), so switching
would also mean porting that function.

## Data volume / scaling note (why "one shared database" isn't a capacity problem)

At ~1000 employees per company, expect roughly 1–1.5M rows/year per company across all
tenant tables combined (daily check-ins being the largest contributor). Even at 50+
companies this stays in the tens of millions of rows/year range — well within what a
single well-indexed Postgres instance (what Supabase runs) handles. The requirement is
**indexing every tenant table on `org_id`** (and `org_id` + date for time-series tables)
so per-company queries stay fast regardless of total platform size.

If the platform ever outgrows a single Postgres instance (many years / very large
customer count away, not a near-term concern): the standard scaling path is **sharding
by tenant group** — a handful of Postgres instances, each holding many tenants, not one
database per company. The subdomain → org lookup (step 2) is exactly the mechanism that
would extend to "which shard" at that point, so this remains a config change, not a
rearchitecture.

## What does *not* need to change per company

- Application code / UI — one build serves everyone.
- Deployment — one Netlify (or Vercel) site.
- Feature changes/bug fixes — one deploy, live for all companies immediately.
- Branding, plan limits, feature flags — these are **data**, not code, and already fit
  the `Organization` model (`branding`, `plan` fields already exist in
  `src/domain/types.ts`).
