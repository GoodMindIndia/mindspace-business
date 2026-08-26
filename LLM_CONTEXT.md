# MindSpace for Business — AI / LLM Context & Architecture Guide

> **Quick Summary for AI Agents & LLMs:**
> MindSpace for Business is a white-labeled workplace mental wellbeing platform. It has an **employee-facing app** (`/app/*`, real Supabase accounts — assessments, an AI companion "Tara", therapy booking) and an **HR admin console** (`/admin/*`, aggregate-only analytics with k-anonymity). The two are cleanly separated: employees never see aggregate data, HR never sees an individual's answers.
>
> **Read this before trusting anything below at face value — and read §0 first.** This codebase is mid-migration: an older Firestore/Gemini/anonymous-check-in architecture and a newer Supabase/real-account architecture are both live at once, wired into different admin routes. Verify against the actual file before making claims about it; don't assume this doc is current by the time you read it either — check the top-level `git log` date against your session date.

---

## 0. State of the Migration (read this first)

The product started as a fully anonymous, no-login check-in tool (Firestore-backed, `/check-in`) whose aggregates were synthesized into a narrative report by Gemini. It is being rebuilt into a real-account employee app (Supabase-backed, `/app/*`) with a simpler counts-based HR dashboard. **That rebuild is not finished**, so three different data architectures currently coexist under `/admin`:

| Admin route | Nav label | Data source | Status |
|---|---|---|---|
| `/admin/report` | Overview | `org-stats-service.ts` + `org-analytics-service.ts` → Supabase RPCs (`org_employee_stats`, `org_assessment_breakdown`, `org_booking_breakdown`, `org_weekly_trend`) | **Current / actively developed.** Real schema (`profiles`, `assessment_records`, `therapy_bookings`), k-anonymity enforced in SQL. |
| `/admin/feelings`, `/admin/pressures`, `/admin/actions` | Feelings, Pressures, Actions | `ReportContext.tsx` → `snapshot-service.ts` → `response-store.ts` (anonymous check-ins) → `gemini-service.ts` (AI narrative) | **Legacy, still live.** Built on the old anonymous check-in model; nothing here reads the new `profiles`/`assessment_records` tables. |
| `/admin/data/heatmap`, `/admin/data/explorer`, `/admin/data/drivers` | Cohort Heatmap, Item Explorer, Driver Analysis | `analytics-service.ts` → `getOverallRollup()` → static demo JSON (`src/data/demo/overall-rollup.json`, `weekly-rollups.json`) | **Legacy, still live, demo-data only.** A third, older rollup model — not wired to Supabase or to the anonymous-check-in store either. |
| `src/admin/pages/OverviewPage.tsx` | — | old rollup engine | **Dead code.** Not mounted in `App.tsx` — superseded by the new `ReportPage.tsx`. Safe to ignore or delete, but hasn't been. |

Consequences for anyone (human or AI) working in `/admin`:
- Don't assume a change to the Supabase schema affects Feelings/Pressures/Actions/Deep-analytics — it won't, they don't read it.
- Don't assume the anonymous check-in flow (`/check-in`, `AnonymousCheckIn`) still has a live entry point for real users — it doesn't; `App.tsx` has no route for it anymore. Those pages currently only show whatever demo/local data is seeded, or is populated by the seed script.
- `firebase` and `@supabase/supabase-js` are both still dependencies. Firebase (`src/lib/firebase.ts`) gets a best-effort mirrored write from `response-store.ts` but the live `.env` has Firebase vars blank — it's effectively inert. Supabase is the real backend.
- When asked to add or change **analytics**, the near-term real target is `ReportPage.tsx` / `org-analytics-service.ts` / `org-stats-service.ts` — that's the one route on a real, current schema.

---

## 1. Core Product Philosophy & Tenets

1. **Words Over Raw Metrics** (Feelings/Pressures/Actions pages): HR leads are not statisticians — plain-English diagnosis over indices. The new Overview page (`/admin/report`) instead leads with numbers/charts by design (see its own file comment: "Numbers lead, prose stays out of the way").
2. **Privacy by Construction**:
   - Anonymous check-ins (legacy path) never collect uid/email/name/IP/device fingerprint.
   - Real employee accounts (current path) are individually owned data (`profiles`, `assessment_records`, `therapy_bookings`), locked by Postgres row-level security to `auth.uid() = user_id` — **no one but the employee, not even via the anon key, can read another user's row.**
   - HR's dashboard reads *only* `security definer` SQL functions (`org_employee_stats`, `org_assessment_breakdown`, `org_booking_breakdown`, `org_weekly_trend`) that return counts, never a row. k-anonymity (default k=5, from `organization.policy.kAnonymity`) is enforced **inside the SQL function** — a suppressed group's count never leaves the database, it isn't just hidden in the UI.
3. **Diagnose Root Causes, Not Symptoms** (legacy Gemini pages) / **Diagnose via Signal + Trend** (new Overview page — week-over-week deltas are already built into every `StatTile`).
4. **Two Kinds of Fixes** (Actions page, legacy): Policy & Workflow Changes, and Therapist Sessions & Company Rituals.

---

## 2. System Architecture

```
┌───────────────────────────────┐     ┌──────────────────────────────────┐
│   EMPLOYEE APP (/app/*)       │     │   LEGACY ANONYMOUS CHECK-IN       │
│   Real Supabase accounts      │     │   No route in App.tsx today —     │
│   (Google sign-in)            │     │   only reachable via seed script  │
│                                │     │   / demo data, not real users     │
│ home    → EmployeeDashboardPage    └──────────────────┬─────────────────┘
│ tara    → TaraPage (mock voice UI)                    │
│ assess. → AssessmentsPage/Runner  saveCheckIn()        │
│ book    → BookSessionPage                    ▼
│ profile → ProfilePage          ┌──────────────────────────────────┐
└───────────────┬───────────────┘  │ response-store.ts                │
                │ writes           │ Supabase (primary) + localStorage │
                ▼                  │ (fallback) + Firestore (inert     │
┌───────────────────────────────┐  │ mirror, blank in .env)            │
│ SUPABASE                      │  └──────────────────┬────────────────┘
│ profiles, assessment_records, │                     ▼
│ therapy_bookings (RLS-locked) │  ┌──────────────────────────────────┐
└───────────────┬───────────────┘  │ snapshot-service.ts →            │
                │ security definer  │ FeelingSnapshot → gemini-service │
                │ RPCs, k-masked    │ (Gemini 2.5 Flash, or local rules│
                ▼                   │ fallback) → WellbeingReport      │
┌───────────────────────────────┐  └──────────────────┬────────────────┘
│ org-stats-service.ts          │                     ▼
│ org-analytics-service.ts      │  ┌──────────────────────────────────┐
└───────────────┬───────────────┘  │ /admin/feelings, /pressures,      │
                ▼                   │ /admin/actions (ReportContext)    │
┌───────────────────────────────┐  └───────────────────────────────────┘
│ /admin/report (ReportPage)    │
│ — current, real-schema KPIs   │  /admin/data/{heatmap,explorer,drivers}
└───────────────────────────────┘  ← analytics-service.ts, static demo JSON only
```

---

## 3. Application Routing & Pages (`src/App.tsx`)

| Route | Component | Audience | Notes |
|---|---|---|---|
| `/` | `pages/LandingPage.tsx` | Public | Marketing landing page. |
| `/login` | `pages/LoginPage.tsx` | HR | HR/People team auth. |
| `/app/login` | `pages/EmployeeLoginPage.tsx` | Employees | Google sign-in via Supabase. |
| `/app/home` | `employee/EmployeeDashboardPage.tsx` | Employees | Wellbeing hub: mood check-in widget, quick stats, Tara/Assessments/Booking cards, breathing exercise, EAP notice. |
| `/app/tara` | `employee/TaraPage.tsx` | Employees | AI companion call UI (`tara-service.ts`) — currently a local mic/call-state mock. |
| `/app/assessments` | `employee/AssessmentsPage.tsx` | Employees | Lists clinical assessments + completion history (`employee-assessment-service.ts`). |
| `/app/assessments/:type` | `employee/AssessmentRunnerPage.tsx` | Employees | Runs one assessment, writes to `assessment_records`. |
| `/app/book` | `employee/BookSessionPage.tsx` | Employees | Therapy booking form (`booking-service.ts`) → `therapy_bookings`. |
| `/app/profile` | `employee/ProfilePage.tsx` | Employees | Account info, sign-out. |
| `/admin/report` | `admin/pages/ReportPage.tsx` | HR | **Current KPI dashboard** — see §0. Sign-ups, assessments taken, sessions booked, severity mix, per-domain breakdown, booking format breakdown, last-8-weeks trend. All week-over-week deltas already present. |
| `/admin/feelings` | `admin/pages/FeelingsPage.tsx` | HR | Legacy: 4 mood tiers + team breakdown, from Gemini/rules-engine report. |
| `/admin/pressures` | `admin/pages/PressuresPage.tsx` | HR | Legacy: ranked workplace pressures + root causes. |
| `/admin/actions` | `admin/pages/ActionsPage.tsx` | HR | Legacy: policy changes + therapist session catalog. |
| `/admin/data/heatmap` | `admin/pages/CohortHeatmapPage.tsx` | HR analysts | Legacy, static demo rollup JSON only. |
| `/admin/data/explorer` | `admin/pages/WellbeingExplorerPage.tsx` | HR analysts | Legacy, static demo rollup JSON only. |
| `/admin/data/drivers` | `admin/pages/DriverAnalysisPage.tsx` | HR analysts | Legacy, static demo rollup JSON only. |

`src/admin/pages/OverviewPage.tsx` exists but is **not routed** — dead code left over from before `ReportPage.tsx` was rebuilt.

---

## 4. Current Supabase Schema (the real, live data model)

Defined in `supabase/schema-employee.sql` and `supabase/schema-employee-analytics.sql`. **This is the entire live schema — three tables, no more:**

- **`profiles`** — one row per signed-in employee (`id`, `org_id`, `display_name`, `avatar_url`, `created_at`). RLS: owner-only.
- **`assessment_records`** — every assessment taken (`user_id`, `org_id`, `domain`, `score`, `max_score`, `level`, `items` jsonb, `submitted_at`). RLS: owner-only.
- **`therapy_bookings`** — booking requests (`user_id`, `org_id`, `session_format` ∈ `group|1:1`, `preferred_slot`, `status` ∈ `requested|confirmed|cancelled`, `notes`, `created_at`). RLS: owner-only.

HR's only door in is four `security definer` SQL functions, each grouped/counted, each enforcing k-anonymity **in SQL**:
- `org_employee_stats(org_id)` → total signups / assessments / bookings.
- `org_assessment_breakdown(org_id, k)` → counts by domain × severity level (severity split withheld if domain total < k).
- `org_booking_breakdown(org_id, k)` → counts by format × status (status split withheld if format total < k).
- `org_weekly_trend(org_id, weeks)` → weekly signups/assessments/bookings, unmasked (same grain as the all-time totals).

**There is no leave, attendance, productivity, or HRIS data anywhere in this schema or in `organization.json`.** `organization.json` is tenant config only (branding, plan, policy, pricing) — not a data source. Any HR-outcome analytics (leave trends, productivity, absenteeism) would need a new data source — see §6.

---

## 5. Legacy Domain Types (still present, only used by the legacy pages)

- `src/domain/check-in.ts` — `AnonymousCheckIn` (no identity; team/workPattern/tenureBand + stress/anxiety/depression domain scores + feeling chips + free-text note).
- `src/domain/snapshot.ts` — `FeelingSnapshot` (moodTiers, toughestSignals, themes, teams, voices) — the aggregate `gemini-service.ts` synthesizes into a `WellbeingReport`.
- `src/domain/wellbeing-report.ts` — `WellbeingReport`, Zod-validated, written by Gemini 2.5 Flash or `writeLocalReport()` fallback.
- `src/domain/types.ts` — `Organization`, `Member`, `OrgRollup`, `OrgInsight`, etc. Comment in the file still says "Mirrors implementation.md §5 (Firestore data model)" — that's the tell this is the old model. Backs the `/admin/data/*` pages via static demo JSON only.

None of these connect to the Supabase `profiles`/`assessment_records`/`therapy_bookings` tables.

---

## 6. What Analytics Exist Today vs. What HR Actually Wants

`/admin/report` today answers **"how are employees engaging with the wellbeing programme?"** — sign-ups, assessments taken, severity mix, bookings, week-over-week movement on those three counts. That's activity/engagement analytics.

It does not yet answer the questions an HR operator is likely to actually open this dashboard for: *is the programme moving the needle on the business* — productivity, absenteeism/leave, retention risk — and *what changed since last week/month*. See the conversation-in-progress for a menu of concrete additions once you're ready to scope that; the schema gap (§4) is the first thing to resolve, since none of that outcome data is currently collected anywhere in this app.

---

## 7. AI Synthesis (legacy pages only)

`src/services/gemini-service.ts`:
1. **Primary**: Gemini 2.5 Flash via `netlify/functions/generate-report.mts` (prod) or `VITE_GEMINI_API_KEY` (local dev). Output validated against `wellbeingReportSchema` (Zod).
2. **Fallback**: `writeLocalReport()` — deterministic rules engine, zero API dependency.
3. Reports cached in `localStorage` (`mindspace.business.report.v1`), keyed by snapshot fingerprint. UI shows provenance (`writtenBy: 'gemini' | 'local'`).

This pipeline feeds `/admin/feelings`, `/admin/pressures`, `/admin/actions` only — **not** `/admin/report`.

---

## 8. Directory Map & Key Files

```
c:\Lucide Tech\mindspace-for-business\
├── netlify/functions/generate-report.mts   # Gemini proxy (legacy pages only)
├── scripts/seed-demo-tenant.ts             # Synthetic tenant data for legacy demo path
├── supabase/
│   ├── schema-employee.sql                 # profiles, assessment_records, therapy_bookings + org_employee_stats()
│   └── schema-employee-analytics.sql       # org_assessment_breakdown, org_booking_breakdown, org_weekly_trend
├── src/
│   ├── admin/
│   │   ├── AdminLayout.tsx                 # Sidebar: "Reports" (Overview/Feelings/Pressures/Actions) + "Deep analytics" (Heatmap/Explorer/Drivers)
│   │   ├── ReportContext.tsx               # Legacy-pipeline state (snapshot + Gemini report), used by Feelings/Pressures/Actions
│   │   ├── charts/                         # ChartCard, StatTile, RankedBarChart, StackedShareBar, TrendChart — used by the new ReportPage
│   │   └── pages/
│   │       ├── ReportPage.tsx              # CURRENT — real-schema KPI dashboard
│   │       ├── OverviewPage.tsx            # DEAD — not routed
│   │       ├── FeelingsPage.tsx / PressuresPage.tsx / ActionsPage.tsx   # legacy, Gemini-driven
│   │       └── CohortHeatmapPage.tsx / WellbeingExplorerPage.tsx / DriverAnalysisPage.tsx  # legacy, static demo JSON
│   ├── app/                                # TenantContext, AuthContext (HR), EmployeeAuthContext, route guards
│   ├── employee/                           # EmployeeLayout, EmployeeDashboardPage, TaraPage, Assessments*, BookSessionPage, ProfilePage
│   ├── domain/                             # assessments.ts (current), check-in.ts/snapshot.ts/types.ts (legacy)
│   ├── lib/
│   │   ├── supabase.ts                     # Current backend client
│   │   ├── firebase.ts                     # Legacy/inert (blank env vars in practice)
│   │   ├── tenant-theme.ts, tier.ts, viz-palette.ts, utils.ts
│   ├── services/
│   │   ├── org-stats-service.ts            # CURRENT — org_employee_stats RPC wrapper
│   │   ├── org-analytics-service.ts        # CURRENT — breakdown/trend RPC wrappers
│   │   ├── employee-assessment-service.ts  # CURRENT — writes assessment_records
│   │   ├── booking-service.ts              # CURRENT — writes therapy_bookings
│   │   ├── tara-service.ts                 # CURRENT (mock voice UI backing)
│   │   ├── response-store.ts               # Legacy anonymous check-in store (Supabase primary / localStorage fallback / Firestore inert mirror)
│   │   ├── snapshot-service.ts, gemini-service.ts, analytics-service.ts, demo-data.ts, engagement-demo.ts, trend-service.ts  # legacy pipeline
│   ├── data/demo/                          # organization.json (tenant config), members.json, overall-rollup.json, weekly-rollups.json (legacy demo data)
│   ├── App.tsx, main.tsx
├── package.json   # both `firebase` and `@supabase/supabase-js` present
├── tailwind.config.ts, tsconfig.json, vite.config.ts
```

---

## 9. Environment Variables & Demo Accounts

### 9.1 `.env`
```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_REPORT_ENDPOINT=/.netlify/functions/generate-report   # legacy pages
GEMINI_API_KEY=...                                          # legacy pages, server-side
VITE_GEMINI_API_KEY=...                                     # legacy pages, local dev only
VITE_FIREBASE_API_KEY=            # left blank in practice — Firebase is inert
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

### 9.2 Demo HR Login (legacy `AuthContext`, active when real auth isn't configured)
- `hr@mindspace.example` / `wellbeing2026` (Priya Raghavan, Head of People)
- `people@mindspace.example` / `wellbeing2026` (Daniel Okafor)

Employee accounts use real Google sign-in via Supabase (`/app/login`) — no fixed demo credentials.

---

## 10. Common Developer Workflows

- **Run Dev Server:** `npm run dev` (`http://localhost:5174`)
- **Typecheck:** `npm run typecheck` (`tsc -b --noEmit`)
- **Turn on the current HR dashboard:** run `supabase/schema-employee.sql` then `supabase/schema-employee-analytics.sql` in your Supabase project. Until then, `/admin/report` shows a "Not set up yet" state rather than zeroes.
- **Populate real data:** sign in at `/app/login`, take assessments, book a session. `/admin/report` reflects it immediately (no k-anonymity cache to clear — counts are live RPCs).
- **Legacy pages (Feelings/Pressures/Actions/Deep analytics):** still driven by `scripts/seed-demo-tenant.ts` / demo JSON / the old anonymous check-in flow — not affected by the above.
