# 07 — Research Synthesis & Sanity Check

Scope: read 00–06 together, surface what they actually tell us, and reality-check
the research phase before the decisions phase starts. This doc does not decide
anything; it narrows the decision space so the next phase doesn't re-do the
research it already has.

Inputs: `00-tooling.md`, `01-ui-conventions.md`, `02-typography.md`,
`03-performance.md`, `04-responsive-foundations.md`, `05-retro-precedents.md`,
`06-astro-patterns.md`.

---

## 1. Executive summary

The research phase is thorough, well-sourced, and larger than the problem.
`kayra-almanac` is a 10-project static Astro 5 portfolio on Vercel. No forms,
no auth, no commerce, no search, no login. The mobile task is "make the
existing desktop-first site legible and usable on a phone without losing the
early-2000s academic look." That is all.

What the research actually tells us, in plain language:

- **Responsive wins by default.** There is no case for a separate m-dot site,
  no case for dynamic serving, no case for adaptive server-side branching
  (04 §2). One codebase, one URL, CSS adapts.
- **The current site is already close.** Viewport meta is correct (04 §6,
  06 §8). Body at 16px Arial is defensible (02 §1). The `#0000EE`/`#551A8B`
  link palette passes WCAG AA and AAA "by historical accident" (02 §5, 02 §9).
  Three existing breakpoints at 768/800/900 and a handful of overlays are the
  surface area that actually needs reshaping (04 preamble).
- **The fight is about four things, not forty.** (1) The 880px desktop
  measure bleeding into narrow viewports. (2) The `position: fixed` overlays —
  SNN panel, InstrumentPanel, LeftNav — that don't have a mobile behavior.
  (3) The inline JS (notably the ~500-line SNN IIFE in `BaseLayout.astro`)
  that parses on every mobile pageload while painting nothing (06 §9).
  (4) The GIF assets that weren't chosen for mobile networks (03 §3.5).
- **Everything else is either a known-good default or a decision the research
  already constrained to 2–3 options.** Touch targets: 24px AA floor or 44px
  AAA (01 §1). Body line-height: 1.35 retro or 1.5 modern (02 §3). Measure:
  px-clamped, `ch`-based, or viewport-relative (05 §8.4). Pick one each; stop.
- **Several research threads should not translate to decisions at all.**
  Dark mode (02 §8), PWA/manifest (06 §8), View Transitions (06 §3), service
  workers, container queries (04 §4), webrings (05 §6), catalog filter UIs
  (01 §7), m-dot comparisons (04 §2), and Lighthouse CI gating (03 §10.4) are
  all things the research explores responsibly but that the task — a 10-page
  static site — does not need.

The decisions phase should therefore be smaller than the research phase, not
larger. Three decisions docs, ~15 pickable questions, is the target shape.
Anything beyond that is drift.

---

## 2. Restating the goal

A "mobile version" of this site means: a reader who opens any of the ~10
project pages, the home index, the logbook, or a notebook entry on a phone
can read the content at comfortable body size, tap any link without missing,
navigate to another section without scrolling through acres of desktop
chrome, and does not pay a JS or image tax for features (SNN canvas,
instrument overlays) they can't see. The early-2000s academic personality —
Arial italic-bold heads, Courier labels, `#0000EE` links, pixelated figures,
white paper + black ink — survives, because it is the reason this site
exists. Mobile is a reading-posture concession, not a redesign.

It is **not** a rebuild, **not** a framework migration, **not** a content
overhaul, **not** a design-system rollout, **not** a greenfield re-platform.
It is a CSS pass plus a small handful of component-level decisions about
what happens to each piece of desktop chrome at narrow viewports.

---

## 3. Scope sanity check per doc

### 3.1 `01-ui-conventions.md`

- **Got right:** the touch-target reconciliation across HIG/Material/WCAG
  (01 §1.3 — 24 AA vs 44 AAA) is the one piece of cross-platform arithmetic
  the decisions phase genuinely needs. `dvh`/`svh`/`lvh` clarification
  (01 §4.1) is load-bearing for anything that was going to use `vh`. The
  `:focus-visible` vs `:focus` note (01 §4.5) is a real bug-prevention.
  The §5.3 observation that visual density and hit-area are independent
  ("small visible affordance + padded hit area") is the single most useful
  finding in the whole research track — it dissolves the apparent
  retro-vs-modern conflict.
- **Drifted:** §2 "bottom tab bar vs hamburger vs combo" — this is a
  mobile-app navigation taxonomy. A 10-project portfolio with 5 spine
  sections does not need a tab bar; the NN/g combo-wins-86% finding is
  about task-engagement on apps, not about a static reading site.
  §3 (gestures) is mostly inapplicable — the site has no custom gestures
  and won't. §6 (lightbox/modal/sheet) matters only if lightboxes return.
  §7 (inputs and forms, scoped to `/catalog` filters) describes a feature
  that **does not exist on this site** — there is no catalog page with
  filters; this section is a research artifact.
- **Missing:** no concrete mapping from the existing LeftNav/ProofStrip/
  header to mobile equivalents. The tradeoffs are cataloged; the
  "which of these chrome pieces survives" question is left as open
  question #3 without addressing *this site's specific chrome*.

### 3.2 `02-typography.md`

- **Got right:** the platform-minimum table (§1) and the Bringhurst measure
  numbers (§2) ground the body-size discussion. The contrast audit (§5)
  is a real artifact — confirming that the current palette passes AA/AAA
  saves the decisions phase an hour. The §9 cross-cutting observations —
  especially "the biggest mobile reading risk is the 1.35 body
  line-height, not the 16px body size" — compresses the whole doc to one
  useful sentence.
- **Drifted:** §4 (font loading) — FOUT/FOIT/FOFT, `unicode-range`,
  `size-adjust`, preload waterfalls — is a complete treatment of a problem
  the site shouldn't have, because the current stack is system
  (Arial/Helvetica/Courier). If the decision is "no webfont," half of §4
  is dead weight. §7 (fluid `clamp()`) is accurate but likely overkill —
  §9 open-question #9 already wonders whether a site this small needs
  fluid type at all. §8 (dark mode) — 70 lines on a feature the user
  hasn't asked for.
- **Missing:** no audit of *where* the 1.35 line-height is currently
  applied. No check on whether the italic-bold headings (H1–H3) actually
  wrap in ways that break at 320px. No note on whether `-webkit-font-smoothing:
  none` is applied globally or scoped (§4 says "revisit" but doesn't look).

### 3.3 `03-performance.md`

- **Got right:** the CWV thresholds, the "don't lazy-load the LCP image"
  note (§3.3), the GIF-to-video argument (§3.5), the INP/TBT distinction
  (§7.1), and the §8 anti-pattern list are all load-bearing for
  implementation. The §9 Astro-5-specific section is practical. The
  resource-weight budgets (§10.2) are reasonable.
- **Drifted:** the budget matrix (§10) is calibrated for a content-rich
  site, not a 10-page portfolio. Lighthouse CI on every PR, a 3-run
  median enforcement, CrUX origin-level tracking, Vercel Speed Insights
  privacy analysis — all defensible; all bigger than the task. The
  2018–2019 Moto G4 parse-time benchmarks (§2.3) are cited for a site
  that ships ~0 JS today. §4 (font budget) overlaps 02 §4 and assumes a
  webfont fight that isn't happening.
- **Missing:** no measurement of the *current* site. The doc is entirely
  forward-looking budgets; there is no baseline number for "what does the
  home page weigh right now, what's its LCP on Slow 4G, what does the SNN
  IIFE actually cost to parse on mobile." Without that, budgets are
  abstract. The first 30 minutes of the implementation phase should close
  this gap.

### 3.4 `04-responsive-foundations.md`

- **Got right:** the content-driven vs device-driven framing (§4) is
  correct and important. The "current site has 3 breakpoints at 768/800/900"
  audit (preamble) is the most concrete research fact in the whole set.
  The §6 note that the current viewport meta is already correct saves a
  decision. The §10 WCAG reflow reminder (320 CSS px floor) gives the
  implementation phase a concrete test target.
- **Drifted:** §2 (responsive vs adaptive vs m-dot) is thorough but the
  comparison is unnecessary — for a personal portfolio, m-dot was never
  a candidate; the table exists to rule out something nobody was going
  to do. §4 discussion of subgrid and container queries — real primitives,
  but a mostly single-column reading site has no reason to reach for
  `@container`. §5 (layout primitives: Grid/Flexbox/subgrid/aspect-ratio/
  logical properties) is a CSS textbook; the site's existing grid pages
  already use `minmax()` + `auto-fit`. §9 (print stylesheet) — 70 lines
  of research on a feature the doc itself concludes is probably not
  worth the maintenance surface.
- **Missing:** a list of the specific selectors or files where the
  current desktop-first `max-width` queries live. §3 talks about
  "retrofitting a desktop-first codebase" in principle but doesn't grep
  for the actual rules that need inverting or leaving alone.

### 3.5 `05-retro-precedents.md`

- **Got right:** the mfw/Tufte/Bear Blog/brutalist-web lineage (§1, §4)
  correctly identifies the "responsiveness by default" stance as the
  serious retro option. The personality-preservation catalog (§5.4) —
  typography, color, microcopy, one-signature-survivor — is the most
  decision-ready content in the whole research set. The §8 conflicts
  table is accurate. §3's observation that Courier is the single
  strongest personality signal is load-bearing.
- **Drifted:** §6 (webrings/linkrolls) — interesting lineage, not
  requested. §4.3 Y2K revival and §4.4 Neocities tour are contextual
  color rather than decision input. The list of brutalistwebsites.com
  examples is precedent research for an aesthetic the site has already
  chosen. §10 (15 conflicts with modern conventions) slightly
  over-counts — several entries restate each other (e.g., "dense inline
  tap targets" and "density-per-viewport" are the same conflict twice).
- **Missing:** a direct look at the *current* `kayra-almanac` assets
  through this lens — which precedent does each existing component
  most resemble (LeftNav ≈ Tufte sidenotes? ProofStrip ≈ academic page
  header? SNN ≈ terminal ornament?). The doc gives us precedent
  families but doesn't map the site's existing parts onto them.

### 3.6 `06-astro-patterns.md`

- **Got right:** the content-collections migration note (§1 — legacy
  `type: 'content'` → `loader: glob()`) is a real v6 pothole and worth
  knowing. The client-directive cost model (§4), especially the
  `client:media` description, is load-bearing for the SNN-panel
  decision. The §9 inline-script audit of `BaseLayout.astro` is the
  most actionable finding in any research doc. §10 build-inspection
  tools will be used in implementation.
- **Drifted:** §2 responsive image modes (`widths`/`sizes`/`densities`/
  `layout`) describe features the site may or may not need — a photo
  portfolio would; this is mostly diagrams, GIFs, and screenshots. §3
  View Transitions is half the doc and ends at "probably not worth 3KB
  for a mostly-static site" anyway. §7 (prefetch strategies) is
  over-detailed for 10 pages with obvious link topology. §8's PWA /
  apple-touch-icon / theme-color / manifest table treats a static
  portfolio like an installable app.
- **Missing:** no baseline measurement. The doc says "500-line IIFE
  parses on every page" but doesn't report an actual byte count,
  parse-time on a mid-tier Android, or an LCP impact for the SNN
  panel as it exists today. The decisions phase will want "the current
  cost is X, the proposed change saves Y" — neither number exists yet.

---

## 4. Contradictions and tensions across docs

These are real clashes that the decisions phase will have to resolve. Not
listed here: matters where two docs *agree* (e.g., never disable pinch-zoom
— 01 §3.1 + 04 §6 concur), or where a doc supersedes itself (02 §9
explicitly dissolves some of its own §4 tension).

1. **Font-loading pipeline vs system-font minimalism.** 02 §4 presents a
   full webfont hygiene kit (WOFF2, subsetting, `font-display: swap`,
   `size-adjust` metrics, preload). 05 §1 (the mfw chain, Bear Blog,
   brutalist-web) argues that shipping no webfont is the superior
   retro-modern position. 02 §9 leans toward "default should stay system,"
   but the webfont section remains. The decisions phase must answer:
   webfont at all? If no, 02 §4 is archival.

2. **Touch target 44 AAA vs inline-link density.** 01 §1.1 gives 44 CSS px
   as the HIG/AAA ceiling. 05 §7 and §8.2 argue dense inline linkrolls
   (12–16px targets) are on-spine retro and WCAG-24-compliant via the
   spacing exception. 01 §1.5 and §5.3 propose visual-vs-hit-area decoupling
   as the reconciliation; 05 §8.6 treats the conflict as unresolved. The
   decisions phase must pick: AAA everywhere, AA-with-spacing in prose, or
   decouple visual from hit-area.

3. **Fluid `clamp()` type vs fixed retro sizes.** 02 §7 walks through
   fluid-type patterns; 02 §9 open-question #9 wonders whether to use them
   at all. 05 §7.1 and §8.3 prefer fixed sizes as part of the retro grammar.
   04 §4 advocates fluid rules between breakpoints as the modern idiom.
   One picks fluid or static; the decisions phase must commit.

4. **Content-driven breakpoints vs no breakpoints.** 04 §4 argues for
   content-driven inflection points (a small set, 3–5). 05 §1.1–§1.3
   presents the mfw/Bear Blog lineage as evidence that zero breakpoints
   can be the correct retro answer — let the text reflow against the
   viewport, let `ch` or `%` do the work. 04 §11 open-question #2 defers
   the count entirely. The decisions phase must pick a number (including
   0 or 1).

5. **Line-height 1.5 (modern comfort) vs 1.35 (retro density).** 02 §3
   reports 1.5 as the NN/g comfort band and flags 1.35 as aggressive for
   mobile. 05 §7.1 prefers 1.25–1.4 as a density-preservation lever. 02 §9
   calls 1.35-on-320px the single biggest mobile reading risk. The
   decisions phase must pick: keep 1.35 across the board, bump body-only
   to 1.5 on narrow viewports, or accept the reading hit for aesthetic
   reasons.

6. **Discoverability-first nav vs ornament-as-identity.** 01 §2 quotes
   NN/g: hidden nav (hamburger) engages 57% of tasks vs 86% for combo
   nav, and §2.3 implies a hybrid for 10 projects + 5 spine sections.
   05 §5 and §8.6 treat decorative chrome (LeftNav, ProofStrip, SNN) as
   identity-critical, which pushes against adding visible mobile nav on
   top of them. The decisions phase must decide whether the mobile nav
   is a visible top-bar/combo/tab (discoverability wins) or a hub +
   in-content links (atmosphere wins, NN/g penalty accepted).

7. **`dvh` baseline vs `svh` safety-belt.** 01 §4.1 presents both as
   valid; 04 §4 likewise. They are not mutually exclusive, but the
   decisions phase wants a blanket policy so component authors don't
   arbitrate per-usage. 01 open-question #5 flags this.

8. **Signature GIF vs `prefers-reduced-motion` / performance.** 03 §3.5
   makes the case for replacing animated GIFs with `<video>` or statics.
   03 §8.5 enforces reduced-motion discipline on all continuous
   animations. 05 §5.1 and §5.4 argue a single signature GIF is the
   likely personality survivor on mobile. The decisions phase must pick:
   keep animated, serve static under `prefers-reduced-motion`, or drop
   animation entirely.

9. **View Transitions as modern-retro nicety vs zero-JS baseline.** 06 §3
   describes `<ClientRouter />` as ~3 KB plus rebinding overhead. 06 §4
   notes the repo currently has zero framework JS. 03 §2 budgets ≤50 KB
   JS as target; 3 KB is small against that, but it's infinite against
   the current baseline of 0. 06 open-question #5 defers. Decisions
   phase must pick yes/no.

10. **Courier fragility on mobile vs Courier as defining signal.** 02 §6
    and 02 §9 flag Courier-at-11px as the single most fragile token
    on the site (iOS/Android rendering divergence, below NN/g
    legibility floor). 05 §3 argues Courier is the strongest
    personality signal and must be preserved. The decisions phase must
    pick the reconciliation: keep at 11px, bump mobile to 12–13px, or
    scope Courier to non-body contexts.

11. **Link-hover delta `#0000EE → #0000CC`.** 02 §5 flags the 4%
    lightness shift as visually too subtle as a sole cue and mobile has
    no hover anyway. 05 §8.1 and §10 keep `#0000EE` as the identity
    marker. The decisions phase must pick what the *tap-pressed* state
    looks like (the web hover equivalent on touch).

12. **SNN panel strategy — covered in four docs, not yet decided.**
    01 §4.4, 04 §5, 05 §5.3, 06 §4 all describe the same overlay-panel
    question with overlapping option sets (bottom sheet, full-screen
    modal, inline, hidden, gated `is:inline`, promoted to
    `client:media` island). The decisions phase needs one answer, not
    four option-set enumerations.

---

## 5. Redundant coverage

Topics the decisions phase only needs one source-of-truth for. The research
repeated these across docs; that's fine for research, actively confusing
for decisions.

- **Touch target sizing:** 01 §1, 02 §5 (tangential), 05 §8.2. Use 01 §1.
- **Line length / measure:** 01 §5.1, 02 §2, 05 §2 and §7. Use 02 §2.
- **Viewport meta, `dvh`/`svh`, safe-area-inset, 100vh trap:** 01 §4, 04 §6
  and §7, 06 §8. Use 04 §6–§7.
- **SNN panel fate:** 01 §4.4, 04 §5, 05 §5.3, 06 §4. Needs one decision,
  probably authored in the layout-and-chrome decision doc.
- **GIF pipeline:** 03 §3.5, 06 §2. Use 03 §3.5 for format argument,
  06 §2 for Astro-specific pipeline question.
- **`prefers-reduced-motion`:** 03 §8.5, 06 §3. Use 06 §3.
- **WCAG target size:** 01 §1, 02 §5, 05 §8.2. Use 01 §1.
- **Responsive image primitives:** 03 §3, 06 §2. Use 06 §2 for
  Astro-specific; 03 §3 stays as the format rationale.
- **Font loading:** 02 §4, 03 §4. If webfont decision is "no," both are
  reference-only.
- **Viewport breakpoint philosophy:** 04 §4, 02 §9 (hinted), 05 §7.1.
  Use 04 §4.

---

## 6. The actually-small decision set

The research implies dozens of pickable questions. Most are implementation
details. Below is the short list — 16 items, each decidable in one sentence.
The rest is either implied by these or belongs in implementation PRs.

1. **Breakpoint count and values.** One mobile threshold, a small 3-step set
   (sm/md/lg), or zero (reflow-only).
2. **Viewport meta.** Keep current, or add `viewport-fit=cover` for
   edge-to-edge on notched devices.
3. **Touch-target floor.** WCAG AA (24 px, with spacing rule for prose) or
   WCAG AAA / HIG (44 px everywhere).
4. **Mobile body font size.** 16 px (keep), 17–18 px (bump), or smaller
   (retro-faithful; not recommended by any modern source).
5. **Mobile body line-height.** Keep 1.35, relax to 1.5 on mobile only, or
   pick a middle value and apply site-wide.
6. **Measure policy.** `max-width: min(880px, 100vw - Xpx)`, a `ch`-based
   clamp, or explicit per-breakpoint values.
7. **Nav pattern at mobile.** Hub homepage + back-links, hamburger,
   combo (top bar + menu), or no-chrome scroller.
8. **LeftNav fate at mobile.** Collapsed to top-of-page links, hidden,
   disclosure-triggered, or kept.
9. **SNN panel fate at mobile.** Hide CSS-only (current), hide + gate the
   IIFE behind `matchMedia`, promote to `client:media` island, or remove
   entirely.
10. **InstrumentPanel fate at mobile.** Hide, inline, or tap-to-expand.
11. **Signature GIF fate.** Keep animated, serve static under
    `prefers-reduced-motion`, replace with `<video>`, or replace with
    static unconditionally.
12. **Webfont: yes or no.** (Almost certainly no; codify it.)
13. **Dark mode: yes or no.** (User has not asked; codify no.)
14. **View Transitions: yes or no.** (~3 KB runtime vs zero-JS baseline.)
15. **Focus ring visual treatment.** Required by WCAG; pick a color/offset
    that reads retro.
16. **`prefers-reduced-motion` honoring.** Pick: universal (all animation
    honors it) or explicit per-component.

Not on this list because they are implementation choices once the above
are set: which files to touch first, which `@media` queries to invert,
what the mobile-specific CSS filename is, whether to migrate content
collections to the v5 `loader: glob()` shape in the same PR, whether to
use `@layer`, which tool runs Lighthouse, what the test matrix looks like.

Not on this list because they are pre-ruled-out (see §8): service
worker, m-dot site, PWA manifest, bottom tab bar, pull-to-refresh
handler, container queries, View Transitions as a core feature, JS
framework adoption, Lighthouse CI gating, catalog filter UI, webring.

---

## 7. Recommended shape of the decisions phase

Do **not** write one decisions doc per research doc. That would produce six
decisions docs for a 16-item decision set and multiply surface area.

Target shape: **three decision docs**, grouped by who-reads-what and what
lands together.

- **`docs/mobile/decisions/01-scope-and-floor.md`** — what "done" means;
  accessibility floor (AA with opportunistic AAA per 01 §10); target
  devices and reflow floor (320 CSS px per 04 §10); `prefers-reduced-motion`
  policy; pre-ruled-out list (service worker, m-dot, PWA, webfont, dark
  mode, View Transitions unless reconsidered). Covers decisions 12, 13,
  14, 16 and records the §8 "what NOT to build" list as a durable
  statement.
- **`docs/mobile/decisions/02-layout-and-chrome.md`** — breakpoints
  (decision 1), viewport meta (2), measure policy (6), nav pattern (7),
  and the fate of each piece of existing chrome: LeftNav (8), SNN (9),
  InstrumentPanel (10), signature GIF (11). This is the decision doc
  that the SNN-panel-appears-in-four-research-docs collision resolves
  into.
- **`docs/mobile/decisions/03-typography-and-color.md`** — touch-target
  floor (3), body size (4), line-height (5), Courier strategy (from
  contradiction #10), link hover/tap state (contradiction #11), focus
  ring (15). The retro-palette confirmation (02 §5) lives here as a
  durable note rather than a decision (nothing to decide — already
  AA/AAA).

One more optional:

- **`docs/mobile/decisions/04-implementation-playbook.md`** (may live in
  `docs/mobile/implementation/` instead) — not decisions; the ordered
  list of PRs, the measurement baseline to capture first (per §3.3 and
  §3.6 gap findings), the audit commands to run (grep for `max-width`
  in existing CSS, grep for `.render()`, grep for `vh`), and the
  Lighthouse / Playwright call pattern for validation. This is where
  00-tooling.md finally pays off.

What this shape beats: a 6-doc mirror of the research, where "02 typography
research" → "02 typography decisions" etc. That mirror forces the measure
decision (a layout concern) into the typography doc, the SNN fate
(chrome + performance + Astro patterns) into three docs, and leaves the
reader hunting. Group by decision, not by research origin.

---

## 8. What NOT to build

The research occasionally points toward features that should be
explicitly declined for this site. The decisions phase should write
"no" down so it doesn't get re-litigated each time someone reads the
research fresh.

- **Service worker** — no offline story needed; static Astro site on
  Vercel edge is already cacheable. Not mentioned positively in any
  research doc; decline by default.
- **Separate m-dot site** — 04 §2 already rules this out; codify.
- **Webfonts** — 02 §4 and 03 §4 discuss hygiene, 05 §1 argues against.
  System stack (Arial / Helvetica / Courier) is the spine. Decline.
- **View Transitions as a core feature** — 06 §3 walks through cost
  (~3 KB + rebinding overhead); 06 §5 flags "probably not worth it for
  a mostly-static site." Ship zero-JS baseline first; revisit only if
  there's a specific transition the design needs.
- **PWA manifest, apple-touch-icon set, `theme-color`, `mobile-web-app-capable`
  meta** — 06 §8 lists them as "tags mobile pass should consider." A
  reading site is not an installable app. Decline the PWA path;
  `color-scheme: light` or `light dark` is the one exception (one line,
  avoids dark-mode flash).
- **Dark mode** — 02 §8 explores three options. User has not asked for
  one. The retro-academic aesthetic is explicitly white-paper + black-ink
  (05 §4.1). Decline; let browser reader-mode handle the minority case.
- **Container queries (`@container`)** — 04 §4 presents them as a modern
  primitive. Overkill for a single-column reading site with a few
  grid-heavy index pages. Use `@media` + `auto-fit` `minmax()` grids.
- **Complex breakpoint system** — 04 §4 warns against device-driven
  thinking. A 10-page portfolio does not need five breakpoints. One or
  three is enough.
- **JS-driven nav / mobile menu with drawer animations** — the site has
  no framework; adding Preact/Svelte for a hamburger drawer would add
  more weight than every existing overlay combined. Static `<details>`/
  `<summary>` or a CSS-only hamburger is sufficient if a menu is needed.
- **Pull-to-refresh handler** — 01 §3.3 confirms PTR is free browser
  behavior; a static site benefits from "reload for free" and needs no
  page-level handler. Don't disable it either.
- **Custom gestures (swipe-to-dismiss, long-press menus, drag-to-reorder)**
  — 01 §3.2 notes every custom gesture costs discoverability. A
  read-only portfolio needs none.
- **Catalog filter UI** — 01 §7 researched a `/catalog` that doesn't exist.
- **Webring / linkroll widget** — 05 §6 explored patterns. Not requested;
  per §6.3 embeddable widgets regress mobile. If added, plain `<ul>`.
- **Lighthouse CI / axe-core gating on every PR** — 03 §10.4 proposes
  Performance/A11y/Best-Practices/SEO ≥ 95 gates. Defensible on larger
  sites; for a 10-page portfolio, run Lighthouse locally before shipping
  and before bumping. Don't block PRs on a 3-run median.
- **Bottom tab bar** — 01 §2 discusses; a 10-project portfolio with 5
  spine sections does not benefit from an app-style persistent tab bar
  (and the retro spine actively fights it per 05 §5 and §8.6). Decline.
- **Mobile-only content collections / `showOnMobile` schema fields** —
  06 §1 describes the patterns. 10 projects don't warrant author-
  curated mobile trimming. Shared collection, render all, let CSS hide
  if anything.
- **`client:media` islands / framework adoption** — 06 §4 describes
  them neutrally. Zero framework today; the SNN-panel gating need can
  be solved with a `matchMedia` early-return inside the existing IIFE
  (06 §9), no framework required.
- **Print stylesheet** — 04 §9 lands on "probably (b) minimal per-entry,"
  but the cheapest print story (04 §9.3) is "make reader-mode work
  well." Defer entirely; add only if someone asks.

If any of these turns out to be needed later, reopen the specific
decision rather than re-reading the whole research set.

---

*End of 07-overview.md. Next: decisions phase per §7.*
