# MindSpace for Business

> **Corporate Mental Wellbeing & Actionable HR Sentiment Platform**
> A human-centered workplace wellness solution that converts anonymous employee check-ins into plain-English executive briefings, privacy-safe response breakdowns, and targeted organizational interventions.

---

## 📖 For AI Agents & LLMs
For a full deep-dive into the system architecture, domain models, dual-engine AI fallback, privacy guarantees, and complete directory mapping, please refer to **[LLM_CONTEXT.md](./LLM_CONTEXT.md)**.

---

## ✨ Key Features

1. **Anonymous Employee Check-In (`/check-in`)**:
   - 5-minute intuitive check-in covering stress, restlessness/anxiety, and mood/energy.
   - 16 workplace pressure chips (workload, sleep, recognition, overtime, etc.).
   - Optional unattributed free-text notes.
   - Private *"Just for you"* reflection screen with direct confidential therapist outreach.

2. **The Executive Report (`/admin/report`)**:
   - Plain-English synthesis written by an Occupational Psychologist AI (Gemini 2.5 Flash) with automatic local rules fallback.
   - Visual 100-figure icon grid representing workforce proportions.
   - Unlinked employee quotes and prioritized weekly actions.

3. **Workforce Sentiment & Tiers (`/admin/feelings`)**:
   - Clear breakdown across 4 emotional health tiers: *Doing well*, *Holding steady*, *Running on empty*, and *Needs real support*.
   - Team-by-team sentiment cards with strict $k$-anonymity ($k \ge 5$) masking.

4. **Root-Cause Workplace Pressures (`/admin/pressures`)**:
   - Ranked workplace issues showing affected headcounts and shares.
   - Clear explanations of underlying operational causes (e.g. planning capacity vs. effort).

5. **Action Plan & Interventions (`/admin/actions`)**:
   - **Policy Changes**: Work scheduling, capacity caps, and after-hours messaging boundaries.
   - **Company Activities**: Therapist-led sleep & recovery workshops, decompression circles (@ ₹500/seat), confidential 1:1 counseling, and team recognition rituals.

6. **Deep Analytical Drilldowns (`/admin/data/*`)**:
   - Cohort Heatmap, Wellbeing Explorer (item-level question metrics), and Driver Analysis ($r^2$ explained variance).

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Typecheck codebase
npm run typecheck
```

- **Employee Check-In:** [http://localhost:5174/check-in](http://localhost:5174/check-in)
- **HR Console:** [http://localhost:5174/admin/report](http://localhost:5174/admin/report)
  - HR admins sign in with real Supabase Auth email/password, gated by the `hr_admins`
    table (see `supabase/schema-hr-auth.sql` and `scripts/seed-hr-admin.mjs`). Ask a
    teammate for credentials — there is no shared demo login anymore.
