# Landing Page & UI Refresh Brief

**Prepared:** 8 September 2026
**Scope:** `src/pages/LandingPage.tsx` (1,015 lines), the "Eucalyptus & Oat" design system in `tailwind.config.ts` / `src/styles/index.css`
**Status:** Research + recommendations only — no code changed
**Trigger:** Current landing page reads as flat/lifeless; need a "Request a Demo" / "Talk to us" path for inbound company inquiries; benchmarked against Darwinbox's marketing site

---

## 1. What the current landing page actually has

Read the full file before judging it — it's not unfinished, it's *restrained to the point of sameness*. Structure, top to bottom:

1. Sticky nav (wordmark, 4 links, Employee Sign In + HR Login buttons)
2. Hero — eyebrow badge, serif headline, subhead, two CTA buttons (both internal login links), a 4-stat spec strip, then a tabbed product-screenshot mock (5 tabs: Overview / Analytics / Teams / Therapy / Privacy) with browser-chrome framing
3. Trust strip — 3 text pills ("Aggregate-only reporting," etc.)
4. Bento feature grid — 1 large tile + 4 small tiles
5. "How it works" — 4-step numbered row
6. Therapy spotlight — split card, quote block
7. Testimonials — 3 cards
8. Pricing — 2 cards
9. FAQ — accordion, 6 questions
10. Closing CTA band
11. Footer — wordmark, 3 links, copyright

**Palette:** cream (`#FAF7F2`), olive/eucalyptus green (`#2D6A4F`), warm greys (`#56685A`, `#78897B`), one clay/ochre accent (`#9E6B38`) used sparingly, one faint purple-to-green radial blur used twice. Everything else is white cards on cream with `#EAE4D9` hairline borders.

**Type:** Newsreader (serif) for headings, Inter (sans) for body — a good pairing that's currently under-used.

**Motion:** almost none. A `fade-in` on tab switch, a `hover:scale-[1.02]` on two buttons, a pulsing dot on one badge, and a mobile-menu slide-in. That's the entire animation budget across 1,000+ lines.

---

## 2. Why it reads as dull — the actual diagnosis

This isn't vague ("needs more color"). Four concrete, specific problems:

### 2.1 One color is doing all the work
`#2D6A4F` is the CTA button, the active tab, the icon fill, the pricing badge, the step-number circle, the checkmark, the footer link hover, *and* the only saturated color other than the barely-visible purple blur. There is no second accent to create visual rhythm — every section looks like a variation on the same white-card-on-cream template, so the eye has nothing to travel toward. Darwinbox, by contrast, commits hard to a near-black/white contrast field and lets a single sparkle-badge purple do all its "look here" work — one loud move against a otherwise disciplined ground. MindSpace has the discipline but skipped the loud move entirely.

### 2.2 Every section is the same shape
Eyebrow label → serif H2 → white rounded-2xl card(s) with a 1px `#EAE4D9` border. That pattern repeats nine times in a row (bento, steps, therapy, testimonials, pricing, FAQ, closing CTA). Nothing interrupts the rhythm — no full-bleed section, no dark section, no section that breaks the `max-w-5xl` column. A page that never changes its own visual grammar reads as a template, even when the individual components are well-built.

### 2.3 The product is described, never shown
The hero mock is real UI (bar charts, a mood tier list, tab switching) but it's the *only* moving, demonstrable thing on the entire page. Everything below it — the bento tiles, the "how it works" steps, the therapy card — is text and icons describing the product, not screenshots or motion depicting it. A visitor scrolls past nine sections of prose-with-icons before the page shows them anything real again.

### 2.4 Nothing before the fold; nothing to click but "log in"
Both hero CTAs (`Sign In as an Employee`, `HR Analytics Dashboard`) assume the visitor already has an account. There is no CTA anywhere on the page for someone who doesn't — a prospect, a curious HR director, an official at a meeting. That's a real functional gap, not a design one, and it's #3 below.

---

## 3. Darwinbox's landing page — what they actually do

Public homepage and product pages (`darwinbox.com`, `darwinbox.com/en-us/products/time-and-attendance`):

- **Dark, high-contrast hero.** White text and logo on a dark ground, one sparkle-emoji badge announcing their newest product ("Meet Darwinbox Cortex ✨"), headline "Built to Make Enterprises Change-Ready."
- **Mega-menu navigation.** Products, Industries & Solutions, Interactive Demos, Resources, Customers, Company — a much wider information architecture than a single-page scroll, because they're a platform with dozens of modules to route into.
- **"Schedule a Demo" everywhere.** At least 3 instances of the same CTA visible on the homepage alone — header, hero banner, and again further down — all wired to a HubSpot-hosted scheduling/form flow, not a plain mailto or a dead link.
- **Full-bleed, high-resolution product imagery** on product pages (their attendance page hero image is 2668×2000px) rather than a bordered device-frame screenshot — the product visual dominates the viewport instead of sitting inside a browser-chrome card.
- **Scale as social proof.** A blunt stat callout — "1,400+ Enterprises Are Saving Time and Boosting Productivity With Darwinbox" — sits right under the hero, plus a "See All Customer Stories" link into a dedicated case-study library.
- **Interactive Demos as a first-class nav item**, not buried in a submenu — suggesting a self-serve product tour exists independent of the sales-scheduled demo.

**What's actually transferable** (not "copy the aesthetic" — MindSpace's calmer palette suits a wellbeing product; a dark, high-energy B2B SaaS look would fight the subject matter):

- The **repetition discipline** on the CTA. One clear action, asked for repeatedly, in the same words, is more effective than five different buttons that each mean something slightly different.
- **Full-bleed product visuals** instead of everything living inside a bordered card.
- **A scale/proof stat** stated bluntly, not woven into a testimonial.
- **A named, real form/scheduling flow** behind the CTA — not a link that goes nowhere.

---

## 4. "Request a Demo" — what to add

This is the functional gap, not a cosmetic one: **there is currently no way for a prospect to contact the company from the landing page.** Every existing CTA routes to a login screen. Fix, concretely:

### 4.1 Where it goes
- **Primary nav** — add a 5th, visually distinct nav item: `Request a Demo`, styled as a filled button (not a text link like the other four), right of the existing HR Login button. This is the Darwinbox pattern — the demo CTA is never just another nav link.
- **Hero** — add it as a *third* button alongside the two existing sign-in CTAs, or replace `HR Analytics Dashboard` as the secondary hero CTA with it (the HR login link can live in the nav only — a prospect landing on this page for the first time has no HR account yet, so leading with a login button undersells the page to exactly the visitor who most needs converting).
- **Closing CTA band** — the section right before the footer already asks "Ready to see what your people are really telling you?" — this is the natural second placement, replacing or sitting alongside the two login buttons there.

Three placements, same wording, same target — matching the Darwinbox repetition pattern from 3.2.

### 4.2 What it should be
Not a `mailto:` link, not a dead anchor. Two reasonable builds, in order of effort:

**Option A — inline form, no new page (recommended to start).** A modal or dedicated `/request-demo` route with a short form: company name, work email, company size (select), a free-text "What are you hoping to solve?" field. On submit, write to a new Supabase table (`demo_requests`) — the pattern already exists in this codebase (`schema-daily-mood.sql`, `schema-employee.sql` are Supabase-backed) — and fire a Netlify function to email the sales inbox, following the same pattern as the existing `netlify/functions/generate-report.mts`. Show a plain confirmation state ("We'll be in touch within one business day") rather than redirecting away.

**Option B — external scheduler embed.** Point the button at a Calendly/HubSpot-style scheduling link, same as Darwinbox does. Zero backend work, but weaker: it hands the first touch to a third-party tool and collects no qualifying information before the call.

Start with A. It's a small, self-contained addition (one new route or modal, one new table, one new Netlify function) and it's the piece that actually lets the company convert a meeting like the one you're about to have into a tracked lead — which a Calendly link alone doesn't give you.

### 4.3 Copy
Keep it specific, not generic:
- Button label: **"Request a Demo"**, not "Contact Us" or "Get Started" — specific enough that a visitor knows exactly what happens next.
- Form header: **"See MindSpace with your own org's data"** or similar — ties the ask to the actual product rather than a generic sales form.
- Confirmation: state a real, honest turnaround ("within one business day"), never leave the visitor wondering if the form actually sent.

---

## 5. Concrete refinements to the existing UI

In rough priority order — highest-impact, lowest-effort first.

### 5.1 Give the page a second accent color
Introduce one more saturated color used deliberately and sparingly — for example the existing clay/ochre (`#9E6B38`) currently only used on one bento icon, promoted to also mark "this is new / this is different" moments: the demo-request CTA, a "New" badge on a feature, or one full section background. Two colors trading off against a calm neutral base reads as designed; one color repeated forty times reads as a template default.

### 5.2 Break the card-grid rhythm at least once
Pick one section — the therapy spotlight is the best candidate, since it's already a split-panel — and let it run full-width/full-bleed instead of sitting inside the `max-w-5xl` column with a border. A single section that breaks the pattern reads as a deliberate high point; if every section breaks the pattern, nothing does.

### 5.3 Add a scale/proof stat near the top
Darwinbox leads with "1,400+ Enterprises." MindSpace's current spec strip (`5 min`, `₹500`, `k ≥ 5`, `24/7`) is about the *product*, not about *adoption*. Once there's a real number to cite — pilot org count, employees onboarded, sessions booked — add a second, blunter stat directly under the hero: "Trusted by N teams" or similar. Until there's a real number, don't fabricate one — an honest product-spec strip beats an invented traction number.

### 5.4 Extend motion beyond the hero tabs
The tab-switch `fade-in` proves the team already knows how to animate this codebase — it just isn't used anywhere else. Cheap, high-return additions: scroll-triggered fade/slide-up on each major section as it enters the viewport (a few lines with `IntersectionObserver` or a lightweight library), a subtle count-up on the spec-strip numbers, and hover-lift (not just border-color-change) on the bento and testimonial cards to make them read as interactive rather than static.

### 5.5 Show product screenshots below the fold, not just in the hero
The bento tiles, "how it works" steps, and therapy card are currently icon + prose. At least the large bento tile and the therapy card have room for a small real UI screenshot or mock (a Tara chat bubble thread, an actual therapy-booking calendar view) instead of a single icon glyph — this is the single highest-leverage change for making the page feel less like a brochure and more like a real product, since it's currently only proven once, in the hero.

### 5.6 Footer is underbuilt for a B2B enterprise sale
Three links and a copyright line undersells a product being pitched to enterprise officials. Add: a company/about link, a security/trust page (worth having given how much of the pitch rests on the anonymity architecture — see the research brief), a contact/demo link (reusing 4.1's flow), and social/LinkedIn if applicable. This is also where a compliance badge strip (SOC2, ISO, DPDP-readiness — whichever are actually true) would sit once accurate to state.

### 5.7 The mega-menu question
Darwinbox's wide nav (Products / Industries / Resources / Customers / Company) makes sense for a company with dozens of modules. MindSpace is currently a single-product page and should **not** copy this — a sprawling nav with mostly-empty destination pages would be worse than the current 4-link nav. Revisit only once there are genuinely multiple distinct pages (e.g., a dedicated `/security` page, a `/pricing` page, a `/case-studies` page) to route into.

---

## 6. What NOT to change

- **The calm palette itself.** Cream/olive suits a mental-health product; a loud, saturated B2B-SaaS look (Darwinbox's dark hero, for instance) would work against the subject matter. The fix is a second accent and more motion, not a different base palette.
- **The serif/sans pairing.** Newsreader + Inter is a good, deliberate choice already in place — under-used, not wrong.
- **The k-anonymity/privacy messaging.** This is the product's strongest differentiator (see the earlier research brief) and is already well-represented in the FAQ and trust strip — don't dilute it while adding energy elsewhere.

---

## 7. Suggested order of work

1. Add the Request-a-Demo flow (Section 4) — this is a functional gap, not a polish item, and it's what makes the upcoming meeting able to generate a tracked follow-up.
2. Second accent color + motion-on-scroll (5.1, 5.4) — cheapest, broadest visual impact.
3. Real screenshots/mocks in the bento and therapy sections (5.5) — highest-effort, highest-payoff.
4. Footer buildout + full-bleed section break (5.2, 5.6) — polish pass once the above is in.
5. Revisit nav structure (5.7) only once there are real additional pages to route into.

---

*No application code was modified in preparing this brief.*
