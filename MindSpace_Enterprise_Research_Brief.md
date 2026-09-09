# MindSpace for Business — Attendance & HR Analytics Research Brief

**Prepared:** 8 September 2026
**For:** Officials pitch meeting
**Status:** Research only — no application code changed
**Core decision:** Import HR data, don't record attendance ourselves

---

## PART A — PITCH KIT
*(Keep this section separate — this is what to say, ask, and never promise in the room.)*

### A1. Positioning

Do not pitch MindSpace as a Darwinbox competitor — we'd lose on every axis they compete on (no payroll, no recruitment, no compliance engine, no implementation muscle). Pitch the layer they structurally cannot build.

**Core line to say:**
> "Darwinbox is the system of record. MindSpace is the system of trust."

Their HRMS knows *that* attendance dropped. It cannot know *why*, because employees don't tell the truth to the system that signs their payslip. Anonymity isn't a feature bolted onto a payroll vendor — it's an architectural commitment, and it's ours.

**Why we don't do attendance — say this when asked:**
> "The moment we're the system that marks you absent, we're the system you lie to."

This turns the biggest apparent gap in the product into the reason to buy it.

**What we add:**
> "We add the one field none of your systems can collect: how your people actually feel — answered honestly, because we've made it architecturally impossible for us to attach a name to it."

---

### A2. The 60-Second Pitch

Five beats, in this order:

1. **The gap.** "You already measure absence, leave and task completion. What you can't measure is why any of it is moving. Exit interviews are too late and engagement surveys are annual."
2. **The moment.** "There's exactly one action every employee performs every single day — starting and ending work. We attach one question to it: ten seconds, one tap, optional."
3. **The guarantee.** "HR never sees a row. Our database physically cannot return an individual answer — it's enforced in the schema, not a policy document. Below five respondents we return nothing at all."
4. **The original metric.** "Because we ask on the way in and on the way out, we can measure the difference. Team by team, we can show whether a day at work leaves people more depleted than it found them. Nobody else has that number."
5. **The fit.** "We replace nothing. Your attendance, leave and task data stays exactly where it is — we read it, aggregate it, and show it next to sentiment. Six weeks to org-wide, not six months."

**One-sentence version, if that's all you get:**
> "We don't replace anything — we read your existing HR data and add the one column it's missing."

---

### A3. Objection Handling

**They'll say:** "Can managers see individual scores? Just for their own team, to support people properly."
**Say:** No — and argue commercially, not ethically. "The moment employees believe it's individually visible, they stop answering honestly, usually within a month. You'd be paying for an expensive random number generator. The anonymity is what makes the data worth having." (The data-quality argument wins with commercially-minded officers better than the ethics argument alone.)

**They'll say:** "We already have an HRMS. Why do we need this?"
**Say:** "Your HRMS is a system of record — it stores what happened. It has no mechanism for collecting honest subjective data, because it's the same system that runs payroll and performance. We're not duplicating it, we're reading from it."

**They'll say:** "This sounds like employee surveillance."
**Say:** State the four mitigations out loud, in order: (1) the mood question is always optional and never blocks anything; (2) HR sees aggregates only, enforced in the database; (3) the five-person threshold is contractual and visible to employees; (4) employees can see, export and delete their own data. Add: "Monitored workers are 49% more likely to *pretend* to work. We're built to avoid exactly that."

**They'll say:** "Our IT team will never approve a new system touching attendance."
**Say:** "Agreed — and they shouldn't. We don't write to attendance. We read a nightly export, aggregate it at ingestion, and discard the identified rows. Nothing we do can affect a payslip." (This objection actually confirms the architecture we already chose.)

**They'll say:** "How long is implementation?"
**Say:** "Six weeks to org-wide, including a two-week pilot." Then pause — let them compare it to their HRMS's 3–6 months themselves.

**They'll say:** "Can you integrate with our system specifically?"
**Say:** "Three ways, whichever your team can approve fastest: a nightly CSV drop that needs nothing from engineering, a unified HRIS connector that already covers Workday, SuccessFactors, BambooHR and Darwinbox, or a direct API integration." (Lead with the CSV option — it can't get blocked.)

---

### A4. Questions to Ask Them

Ask all five, write down the answers, let them shape the follow-up proposal.

1. **What HRMS are you running today, and do you already have API access enabled on it?**
   Determines the entire integration path and timeline. If API access needs a procurement cycle, go CSV and say so in the room.

2. **How do employees currently mark attendance — biometric device, mobile app, web portal, or manual register? What share are desk-based vs. frontline?**
   Tells you whether the prompt can live in Teams/Slack, or whether you need a shared-tablet kiosk mode on day one.

3. **Who owns the employee-privacy decision here — HR, Legal, or IT Security?**
   Find that person in week one. They can veto the deal in week five.

4. **Where does task and project completion data actually live — Jira, Asana, Monday, or something internal?**
   The productivity index needs it, and it's almost never in the HRMS itself. Usually a second integration.

5. **Have you run an employee engagement or wellbeing survey before? What was the response rate, and what happened to the results?**
   The most revealing question. A low response rate or results that went nowhere tells you what employees expect from you — and gives you the story for why this time is different.

---

### A5. Never Promise

Someone will ask for at least one of these, usually framed generously ("just to help managers support their people"). Decline all four:

- **Individual productivity or wellbeing scores.** Team level only, minimum five respondents, no exceptions.
- **Real-time manager alerts about a named person.** Fastest way to destroy employee trust and the data with it.
- **Anything implying HR can see who said what.** Including "only in an emergency" — if the capability exists, employees assume it's used.
- **Payroll, statutory compliance, or overtime calculation.** Getting this wrong doesn't cost a bug report — it costs someone their correct salary, and the liability is real.

---

### A6. Numbers to Have Ready

| Number | What it means |
|---|---|
| **41%** | Lower absenteeism in engaged business units (Gallup) — the ROI number |
| **17%** | Higher productivity in those same units (Gallup) |
| **3–6 months** | Typical Darwinbox implementation timeline |
| **6 weeks** | Our timeline to org-wide, including a two-week pilot |
| **₹200–600 PEPM** | Indicative Darwinbox per-employee-per-month pricing, India, 2026 |
| **49%** | More likely that monitored workers pretend to work — use when surveillance comes up |

Also worth knowing: Darwinbox implementation is a *separate* line item from subscription — roughly $5,000 for a 10-person company up to $50,000 at 1,000 employees. Use this comparison if cost-of-change comes up.

---

## PART B — RESEARCH

### B0. The Core Tension (and how it's resolved)

MindSpace today is **anonymity-first**. The schema (`schema-daily-mood.sql`) enforces it: row-level security locks every row to `auth.uid()`, HR reads only `security definer` functions that return counts, and the mood breakdown is withheld entirely — zero rows, not an approximation — below the k-anonymity threshold.

Attendance is the opposite: **identity-first**. HR must know a specific named person badged in at a specific time, permanently and auditably, because payroll and labour law depend on it.

**The risk:** put "How are you feeling today?" on the same screen as the punch clock, behind the same login, and employees will assume HR can see their mood next to their name. The moment they believe that, they stop telling the truth, and the analytics product becomes noise.

**The resolution — one moment, two data planes:**

```
Employee opens MindSpace at 09:47
   ├─► ATTENDANCE PLANE  → identified, audited, HR-visible
   │    { employee_id, timestamp, IN } → their HRMS
   └─► WELLBEING PLANE   → pseudonymous, k-anonymised, aggregate-only
        { anon_token, mood, org, team, date } → MindSpace
```

Two writes. No foreign key between them. They share only org, team, and date bucket. Because the join key is never created, an individual's mood cannot be recovered by a breach, a subpoena, or an admin with database credentials — not as policy, but as a fact about what the data physically contains.

Frame this as: *"We can prove to your employees that we cannot betray them, which is why our data is worth trusting."*

---

### B1. Darwinbox Teardown

**What it is:** A full-stack Human Capital Management suite (Hyderabad, Microsoft-backed), 1,400+ enterprise customers. Covers the entire employee lifecycle — recruitment, onboarding, core HR (leave, attendance, directory), payroll, employee movement, engagement, talent management, people analytics. Single codebase with deep per-tenant configuration, microservices architecture, API-based integration.

**Business model:**
- Subscription, per-employee-per-month, pay-as-you-go — no license/seat caps.
- Pricing never published; every quote built from headcount, module mix, and contract length.
- Indicative India bands (2026): ₹200–600 PEPM. Global quotes roughly $5 PEPM at 100 employees, falling to ~$3 at 1,000.
- Implementation is a separate line item — $5,000 (10-person business) to $50,000 (1,000 employees) — taking **3–6 months** to go live.

*The implementation timeline and cost is the opening: we're not selling a six-month migration with a five-figure services bill — we're selling something that goes live in weeks, alongside what they already run.*

**The subdomain model:** Darwinbox runs multi-tenant with a dedicated subdomain per customer — `https://<customer>.darwinbox.in/`. Each tenant gets a dedicated share of the instance: its own data, configuration, user management, and tenant-specific functionality. That subdomain is also the API base URL.

Login flow:
1. Employee navigates to `acme.darwinbox.in`
2. Either local credentials (employee ID or official email + password), or
3. **SAML 2.0 SSO** against the company's identity provider — Microsoft Entra ID (Azure AD), Okta, ManageEngine, and miniOrange are all documented. Enterprises overwhelmingly choose SSO: no new password, instant deprovisioning on exit.

**Attendance module:**
- Capture: facial recognition, geo-tagging, biometric device integration (eSSL and similar), kiosk, web, mobile.
- Geofence enforcement: admins define a radius per site; punches outside it are rejected.
- WFH/WFO rostering: managers define/verify who's remote on which days.
- Regularization workflows: employees flag missing/incorrect punches, managers approve, records amended with audit trail.
- Voicebot "Darwin": apply for leave, regularize attendance, check request status conversationally. (Note: Darwinbox already ships a voice agent for HR tasks — we already have ElevenLabs wired for Tara. We're on the same road.)

**The API:**
Darwinbox exposes a REST API across nine modules: Employee Core (in/out), Recruitment, Onboarding, Attendance & Timesheets, Leave, Performance, Compensation, Expenses & Recognition, Travel.

- Base URL: `https://<subdomain>.darwinbox.in/…`
- Auth: token-based, SHA512 hash of admin email + secret key + epoch timestamp (shared-secret, not OAuth; credentials issued by the customer's own Darwinbox admin).
- Access: request-only, granted to privileged users via the customer's Darwinbox account team.
- Docs: `api-docs.darwinbox.com`, plus a public Postman workspace.

The relevant endpoint is **Add Attendance Punches**:
```
POST /attendance/punches
{
  "EMP001": [
    { "id": "...", "timestamp": "2026-09-08 09:47:00", "machine_id": "MINDSPACE_WEB", "status": 1 },
    { "id": "...", "timestamp": "2026-09-08 18:20:00", "machine_id": "MINDSPACE_WEB", "status": 2 }
  ]
}
status: 1 = punch in    status: 2 = punch out
```

This means MindSpace *could* register as a virtual attendance device — becoming a `machine_id` feeding their existing policy engine, payroll sync, and compliance reports untouched. **We've deliberately chosen not to do this** (see B4) — but it's worth knowing about and mentioning as something we *could* do, since declining it is a considered decision, not a limitation.

**The Marketplace:** Darwinbox runs an AppDirect-powered Marketplace — ~60 vetted third-party partners across 13–14 categories, reachable at `marketplace.darwinbox.com` or via SSO from inside a customer's dashboard.
- "Employee Engagement" is an **existing category** — we wouldn't be asking them to invent a slot for us.
- Partners undergo screening and compliance certification before listing.
- For customers selecting a partner product, Darwinbox waives integration setup cost and covers API consumption for the first six months.
- Vendor-side application process, revenue share, and security criteria are **not publicly documented** — needs a direct approach to their partnerships team. (Open item — see B8.)

---

### B2. How Attendance Actually Works

Four layers:

**Layer 1 — Capture** (the raw punch):

| Method | Anti-fraud strength | Notes |
|---|---|---|
| Web/desktop login punch | Low | Trivially shareable |
| Mobile + GPS geofence | Medium | Rejected outside site radius; needs mock-location detection |
| Selfie/face match + liveness | High | Eliminates proxy/buddy punching |
| Kiosk / shared tablet (NFC, PIN, QR) | Medium–High | For staff without company phones |
| Biometric hardware (fingerprint, palm, iris) | Highest | Existing device fleet, fed via API |

2026 consensus: verification rests on four signals — location (GPS/geofence), identity (face/fingerprint/live photo), device (kiosk or registered handset), time integrity (blocks backdated marking). Face + GPS is table stakes; Teams/Slack integration near-mandatory.

**Layer 2 — Policy engine:** Turns raw swipes into meaning. A shift policy defines expected shifts per weekday; an attendance policy processes swipes against it to compute hours worked, late arrivals, overtime, half-days. Heavily India-specific (shift allowances, OT rules, statutory registers).

**Layer 3 — Regularization:** The correction loop. Employee spots a missing/wrong entry → raises a request with a reason → manager/HR approves → record amended with audit trail. Significant share of HR ticket volume.

**Layer 4 — Downstream sync:** Attendance → leave balances → payroll → statutory reporting.

**Scope decision: do not build layers 2–4.** Years of engineering, regulatory, unglamorous, and exactly what the customer already pays their HRMS vendor for. Getting overtime calculation wrong doesn't produce a bug report — it produces an incorrect salary.

**Three architectures considered:**

1. **MindSpace as system of record** — we own attendance end to end. Fine for the current demo; never sell to an enterprise (inherits the entire compliance/payroll burden).
2. **MindSpace as capture endpoint** — we own the moment, their HRMS owns the record; we POST punches to their system as a virtual device. Days of integration work; requires customer to provision API credentials and exposes us to their uptime/rate limits.
3. **MindSpace as read-only consumer (CHOSEN)** — they keep punching into their existing HRMS/biometric fleet exactly as today. We *pull* attendance, absence, and task data for analytics only; the mood prompt lives independently. Lowest friction, lowest risk, fastest yes from a cautious HR officer, and at enterprise scale the *only* thing IT would approve. Trade-off: loses the guaranteed daily touchpoint — solved in B3 without giving up anything else.

---

### B3. Keeping the Check-In Moment (Without Owning Attendance)

The reason to want attendance was never attendance — it was the daily touchpoint. That can be kept without owning the record.

Clock-in is the one action every employee performs daily. Attaching a mood prompt to it solves the adoption problem that kills most wellbeing apps (Headspace/Unmind/Wysa fight for engagement; 20–30% activation is considered good).

**Four ways to keep the hook, cheapest first:**

1. **Attendance-triggered nudge (recommended).** We're already importing their attendance feed. When we see a punch-in for someone who hasn't checked in today, we push the prompt (Teams, Slack, mobile push, or email) seconds later. Some HRMS platforms expose webhooks that fire on attendance events, making this near-real-time. Same at punch-out.
2. **Teams/Slack as the surface.** Most enterprises live in one of them already. A daily prompt inside the tool they have open beats a new app — two taps, no new login.
3. **Deep link from their HRMS.** After punching in, their portal shows a tile/redirect to our subdomain. Works well on platforms with a marketplace (apps reachable via SSO from the customer's dashboard).
4. **First-login-of-day prompt in our own app.** Weakest hook, zero dependencies — roughly what exists today.

Start with #1 and #2 — that's where the daily habit actually forms.

**Four rules for the prompt:**

**Rule 1 — The punch is mandatory, the mood is not.** Attendance must complete whether or not they answer. A visible, non-punitive Skip is required. If answering becomes a condition of being marked present, consent is coerced (legally worthless) and everyone taps the middle option to get to their desk.

**Rule 2 — Check-in and check-out ask different questions.**

| Moment | Measures | Question | Interaction |
|---|---|---|---|
| Check-in (~09:00) | Capacity — what they brought *to* work (sleep, commute, home life) | "How are you arriving today?" | One tap, 5-point scale |
| Check-out (~18:00) | Load — what work *did* to them | "How was today?" + one optional pressure chip | Two taps max |

Reuse the existing 16 workplace-pressure chips from the check-in flow for the check-out chip so the taxonomy stays consistent.

**The original metric:** `mood_out − mood_in`, aggregated by team over a week, is a **Workday Drain Index** — a directly attributable measure of whether a team's work is depleting or energising the people doing it. No HRMS can produce it (doesn't ask); no wellbeing app can produce it (not present at clock-out). This is the strongest original claim in the pitch.

**Rule 3 — Under ten seconds, or it dies.** Check-in: one tap, no scroll, no typing. Check-out: two taps max, free text always optional. Anything longer and within three weeks the workforce reflexively taps "Okay," producing a flat line. Cap at once per day per direction, dismissible, never re-prompt same day.

**Rule 4 — Give the employee something back, immediately.** Never a dead end. The existing "Just for you" reflection screen is the right pattern — someone tapping "overwhelmed" should see their own private 30-day trend and a route to confidential therapist outreach/workshops. This also defuses the surveillance accusation: it's a tool they use, not a sensor pointed at them.

---

### B4. Importing Their Data

**What we import:**

| Field | Source | What we derive |
|---|---|---|
| Employee ID, team, dept, manager, location | Employee core | Cohort rollups — the only strictly required feed |
| Attendance / present days | Attendance module | Presence consistency, late-arrival trend |
| Absence & unplanned leave | Leave module | Absenteeism rate, sick-leave clustering |
| Overtime / after-hours | Attendance module | Overload flag — recorded as **risk**, never achievement |
| Task completion | Jira / Asana / their PM tool | Completion rate per team |
| Tenure, join date | Employee core | New-joiner vs. veteran segmentation |
| **Mood in / mood out** | **MindSpace** | **Drain Index, pressure attribution, sentiment tiers** |

Everything but the last row already exists inside their organisation. Only the last row is ours — and it's the one that explains all the others.

**Cadence:** Nightly batch is sufficient — we're computing weekly team trends, not a real-time ops dashboard.

**Mechanism, offer all three, in this order:**

1. **Nightly SFTP/CSV drop.** Boring, closes fastest, needs nothing from their engineering team — this is how Headspace for Work, Unmind, etc. actually deploy. **Have this ready** — some HR officers can't get API credentials approved inside a quarter.
2. **Unified HRIS API** (Merge, Knit, Unified.to). One integration covering Workday, SuccessFactors, BambooHR, ADP, Gusto, Rippling and Darwinbox among 180+ platforms — provider handles translation, rate limiting, retries, sync. This is the difference between a product and a consultancy.
3. **Direct API** to whatever they run, when volume justifies a bespoke connector.

(SCIM is the standard for provisioning/deprovisioning from an identity provider; mature products typically use both an HR API for org data and SCIM for account lifecycle.)

**The trap to avoid — critical:** Importing identified attendance data into an anonymity-first system re-creates exactly the risk we architected around. If we store `employee_id → absent 6 days` in the same database as `employee_id → felt overwhelmed`, we've built the join key we promised employees doesn't exist. It doesn't matter that the UI never shows it — it exists, and it can be breached, subpoenaed, or queried by an admin.

**The fix — aggregate at the door:**
```
Their HRMS → import job → collapse to (org, team, week) → store
                              │
                        drop employee_id here
                              │
                        never persist the row-level import
```
Roll up to team-week aggregates during ingestion, apply the existing k ≥ 5 gate, discard identified rows. What persists: `Engineering, week 37: 4.2% unplanned absence, 81% task completion` — joinable to mood aggregates on `(org, team, week)`, joinable to nothing else, ever.

---

### B5. The Productivity Index

Standard components in HR analytics practice:
- **Task completion rate** = completed ÷ assigned tasks over a period.
- **Absenteeism rate** — frequent unplanned absence is a recognised leading indicator of burnout/disengagement.
- **Engagement score** — low engagement reliably precedes poor performance and higher absence.

**A defensible composite** (team level, z-scored, weights shown to customer and configurable — never a black box):

```
Team Productivity Index =
    0.40 × z(task_completion_rate)
  + 0.25 × z(attendance_consistency)     // presence reliability, not raw hours
  + 0.20 × z(engagement/mood_score)
  + 0.15 × z(1 − unplanned_absence_rate)
```

**Four hard rules:**
1. **Team level only, minimum k = 5.** Never an individual score.
2. **Never join mood to identity, even server-side.** Join on `(org, team, week)`, not `employee_id`. If the join key doesn't exist, we can't be breached, subpoenaed, or pressured into producing it.
3. **Hours worked is not productivity.** Weight consistency, not volume — flag sustained overtime as risk, not achievement.
4. **Correlate, don't claim causation** — but do surface the correlation, it's the whole value proposition. E.g., "Teams reporting high after-hours pressure show 2.3× the unplanned-absence rate."

**ROI benchmark (Gallup):** Engaged business units see **41% lower absenteeism and 17% higher productivity.**

---

### B6. Deployment & Tenancy

**Subdomain per tenant** (same model as Darwinbox):
```
acme.mindspace.app     → Acme's branded instance
globex.mindspace.app   → Globex's branded instance
```

The scaffolding already exists: `TenantContext.tsx` has the exact TODO for resolving a real tenant by subdomain/custom domain, and `tenant-theme.ts` already applies per-tenant branding. Wildcard DNS + wildcard cert makes onboarding a new tenant a database row, not a deployment.

Why subdomain over a shared login page: branding (trust/adoption), SSO routing (identifies which IdP to redirect to before login), a trivially explainable data-isolation story, and it matches what their HRMS already does.

**Employee onboarding — three routes:**
1. **SSO (SAML 2.0 / OIDC)** against Entra ID, Okta, or Google Workspace — no new password, instant deprovisioning. `EmployeeAuthContext.tsx` already runs on Supabase Auth with Google; Supabase supports per-domain SAML SSO, so this is a configuration path, not a rewrite.
2. **Employee ID + magic link/OTP to work email** — for frontline/factory staff with no corporate SSO identity.
3. **Kiosk mode** — shared tablet, employee ID + PIN or QR. Essential for manufacturing, retail, warehouse.

Worth quoting in the meeting — the existing comment in `EmployeeAuthContext.tsx`: *"Employee accounts run entirely on Supabase Auth — a deliberately separate system from AuthContext (HR login) ... the two are only ever joined by aggregate counts, server-side."* Two independent auth systems that never share a session or token. This is a genuine privacy architecture, not a policy promise.

**Rollout sequence:**

| When | What happens |
|---|---|
| Week 0 | Contract, DPIA, employee communication (written jointly with HR) |
| Week 1 | Tenant provisioned, subdomain live, branding applied |
| Week 1–2 | In parallel: SSO configured · employee roster imported · data feed tested |
| Week 3–4 | Pilot — one department, 50–200 people, two weeks |
| Week 5 | Review pilot data with HR; tune k-threshold and prompt timing |
| Week 6 | Org-wide rollout |

**Six weeks to org-wide** — say this right after mentioning their HRMS's 3–6 month timeline.

---

### B7. Privacy & Legal

**Data classification:** Free-text answers about stress/workload can tip into GDPR Article 9 special-category health data, requiring an additional lawful condition beyond the ordinary basis. Pseudonymous data (where a platform holds a re-identification key even if managers never see it) remains personal data with full data-subject rights — only genuinely anonymous data sits outside GDPR entirely, which is exactly why the two-plane architecture matters.

**India — DPDP Act:** Applies to all personal data processed digitally, employee data included. The employer is a Data Fiduciary. Section 7's limited legitimate-use basis for employment processing does **not** exempt the employer from full Section 8 obligations: purpose limitation, data minimisation, accuracy, security safeguards, breach notification.

**DPIA:** A recurring, company-wide programme tracking sentiment over time should have a Data Protection Impact Assessment on file. Recommend it proactively.

**Monitoring & consent:** Jurisdictions vary — EU requires consent; California, Connecticut, New York impose notice/consent requirements for electronic monitoring; several US states require explicit written consent for biometric collection (relevant if face-recognition punching comes up). Undisclosed/intrusive monitoring risks privacy claims, surveillance-statute violations, retaliation allegations, unfair-labour-practice complaints.

**The trust argument (also commercial):** Excessive surveillance produces stressed, distrustful employees — monitored workers are 49% more likely to pretend to work — and measurably damages morale, trust, and retention. Our four mitigations: (1) mood is optional and never blocks anything; (2) HR sees aggregates only, enforced in the database; (3) the k-threshold is contractual and visible to employees; (4) employees can view, export, and delete their own data.

---

### B8. Open Items

Things not resolved from public sources — don't improvise answers to these in the room:

- **Darwinbox vendor-side partner terms** — application process, revenue share, security certification requirements are all unpublished. Needs a direct approach to their partnerships team.
- **Darwinbox API rate limits, pagination, webhook support** — not documented publicly. Their public Postman workspace is the next stop; a customer's own admin can pull the full spec.
- **What this specific customer actually runs.** Question 1 in the Pitch Kit settles it. Accenture is a major implementation partner for *both* Workday and SAP SuccessFactors, and its careers portal runs on Workday — a signal, not proof, about its internal HR core. Don't state which system they use unless they say so first.
- **Whether the check-in/check-out pairing is settled internally.** The Drain Index needs both ends of the day; an attendance-triggered nudge preserves it, a generic once-daily prompt doesn't. Agree this internally before the meeting.

---

## Sources

- [Darwinbox — Time & Attendance](https://darwinbox.com/en-us/products/time-and-attendance)
- [Darwinbox — Leave & Attendance module](https://darwinbox.com/blog/track-better-act-smarter-with-our-leave-and-attendance-module)
- [Darwinbox — API documentation](https://api-docs.darwinbox.com/)
- [Knit — Darwinbox API integration guide](https://www.getknit.dev/blog/a-to-z-of-integrating-with-darwinbox-api)
- [Ampletrails — Darwinbox attendance punch API](https://ampletrails.com/integrating-essl-biometric-systems-with-darwinbox-api/biometric-access-control-systems)
- [Indusface — Darwinbox multitenant architecture](https://www.indusface.com/resources/case-studies/darwinbox-multitenant-application-protection-through-apptrana/)
- [Microsoft — Entra ID SSO for Darwinbox](https://learn.microsoft.com/en-us/entra/identity/saas-apps/darwinbox-entra-integration-tutorial)
- [Darwinbox — Marketplace FAQs](https://explore.darwinbox.com/lp/marketplace-faqs)
- [AppDirect — Darwinbox partner marketplace](https://www.appdirect.com/resources/darwinbox-enhances-partner-ecosystem-with-appdirect-powered-marketplace)
- [HROne — Darwinbox pricing 2026](https://hrone.cloud/blog/darwinbox-pricing/)
- [ITQlick — Darwinbox cost breakdown](https://www.itqlick.com/darwinbox/pricing)
- [HROne — Attendance apps & capture methods](https://hrone.cloud/blog/employee-attendance-app/)
- [Truein — Location-based attendance](https://truein.com/blogs/location-based-attendance-system)
- [greytHR — Attendance management guide](https://www.greythr.com/guides/guide-to-attendance-management/)
- [Runtime HRMS — Shift policies](https://docs.runtimehrms.com/attendance-and-leaves/shift-policies)
- [PeopleStrong — HRMS webhooks](https://www.peoplestrong.com/blog/hrms-integration-with-webhooks/)
- [Knit — Unified HRIS API](https://www.getknit.dev/integration-categories/hrms-api)
- [Merge — Darwinbox connector](https://www.merge.dev/integrations/darwinbox)
- [Unified.to — HRIS sync & SCIM](https://unified.to/blog/how_to_sync_employee_and_user_data_from_workday_bamboohr_and_180_hr_platforms_with_a_unified_api)
- [AIHR — Measuring employee productivity](https://www.aihr.com/blog/how-to-measure-employee-productivity/)
- [Gallup — Workforce productivity metrics](https://www.gallup.com/workplace/713102/measuring-workforce-productivity.aspx)
- [Perceptyx — GDPR & employee surveys](https://blog.perceptyx.com/what-does-gdpr-mean-for-employee-surveys)
- [AMLEGALS — DPDPA employee data, India](https://amlegalsdpdpa.com/privacy-topics/employee-data-protection-dpdpa-india)
- [Nelson Mullins — Electronic workplace monitoring](https://www.nelsonmullins.com/insights/blogs/the-hr-minute/employee-privacy/electronic-workplace-monitoring-privacy-compliance-and-risk-management-considerations-for-employers)
- [Headspace for Work — SSO deployment](https://help.headspace.com/hc/en-us/sections/19804702486555-Single-Sign-On-SSO)
- [Unmind — Enterprise deployment](https://unmind.com/enterprise)
- [SAP SuccessFactors — Time tracking](https://www.sap.com/products/hcm/employee-time-tracking-software.html)

---

*No application code was modified. Figures cited from public vendor documentation and published benchmarks; pricing is indicative, not quoted.*
