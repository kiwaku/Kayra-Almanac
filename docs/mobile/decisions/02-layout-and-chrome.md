# 02 — Layout and Chrome (Decisions)

Scope: the page-level skeleton and the fate of each piece of existing desktop
chrome at narrow viewports. Consumes research docs 01–06 and synthesis 07.
Picks, in order: breakpoints, viewport meta, measure policy, mobile nav
pattern, LeftNav, SNN panel, InstrumentPanel, signature/flag GIFs.

Audience: whoever opens the first implementation PR against
`src/layouts/BaseLayout.astro`, `src/styles/theme.css`, and the three
overlay components. The goal is a shippable MVP that the user can hold in
a browser on a phone and react to — not a pre-optimized final state. Every
decision below defaults to the simplest option the research supports,
because iteration is cheaper than deliberation once there is a working
mobile build to look at.

Out of scope for this doc (decided elsewhere):

- Touch-target pixel floor, body font size, body line-height, focus ring
  visual, link hover/tap state → `03-typography-and-color.md`.
- Webfonts, dark mode, View Transitions, `prefers-reduced-motion` policy,
  PWA, service worker, and the full pre-ruled-out list → `01-scope-and-floor.md`.

---

### Decision 1 — Breakpoints

**Decision:** one mobile threshold at **`768px`**; CSS below that is the
mobile composition, CSS at/above is the current desktop composition.

**Alternatives considered:**

- Zero breakpoints — reflow-only, mfw lineage. Clean but does not handle
  the fixed overlays (SNN, InstrumentPanel, LeftNav) without a separate
  hide rule, which by definition introduces a breakpoint.
- 3-step set (sm 480 / md 768 / lg 1024) — standard Tailwind-shaped ladder.
  Over-engineered for a 10-page portfolio; each breakpoint is a testing
  matrix row with no content-driven justification today.
- Keep the three already-in-tree thresholds (768 / 800 / 900) — drift, not
  a decision. They landed piecemeal and the 100 px spread has no content
  rationale.

**Rationale:**

- The existing `theme.css` already uses `@media (max-width: 768px)` as its
  sole page-level breakpoint; 07 §3.4 and 04 preamble flag 768/800/900 as
  the site's current breakpoint surface. Consolidating on 768 is a no-op
  for `theme.css` and a one-line change each for the two outlier
  components.
- Content-driven: 768 px is where the 880 px desktop measure plus the
  LeftNav rail stop fitting on one row (04 §4). Below that, the layout is
  single-column regardless; above, the desktop composition works.
- 04 §4 "Breakpoint count: how many is enough" — fewer is easier to
  maintain, three-to-five is the typical ceiling, 07 §8 explicitly warns
  against "complex breakpoint system" for this site. One is the floor
  that still lets the fixed overlays get a mobile behavior.
- 07 §6 lists "one mobile threshold, a small 3-step set, or zero" as the
  pickable options; we pick one.

**Opens:**

- If a grid page (notebooks index, projects grid) visibly breaks at a
  width other than 768 during implementation, add a second breakpoint
  scoped to that component — do not retrofit a global ladder.
- Confirm during implementation that the existing `auto-fit` + `minmax()`
  grids collapse cleanly from multi-column to single-column without a
  second media query (04 §5.1 suggests they should).

---

### Decision 2 — Viewport meta

**Decision:** keep the current string exactly as-is —
`<meta name="viewport" content="width=device-width, initial-scale=1">`.

**Alternatives considered:**

- Add `viewport-fit=cover` — required only for `env(safe-area-inset-*)`
  to report real values and for edge-to-edge layouts on notched iOS.
- Refine with `interactive-widget=resizes-content` — relevant only for
  virtual-keyboard interaction, which does not exist on this site.

**Rationale:**

- 04 §6 and 06 §8 both confirm the current string is the correct safe
  baseline; no `maximum-scale`, no `user-scalable=no` (would fail WCAG
  §1.4.4 — 04 §6).
- The MVP mobile layout does not introduce any edge-touching chrome (no
  bottom-fixed nav, no sticky top bar) — so `viewport-fit=cover` has
  nothing to gate (04 §7, "No `viewport-fit=cover` today. No uses of
  `env(safe-area-inset-*)`. Consequence: …only matters if the mobile
  redesign introduces a fixed bottom nav or a sticky header").
- 07 §6 lists this as decision #2 and the research narrows it to "keep
  current or add `viewport-fit=cover`"; with the nav decision below
  choosing a non-fixed pattern, the precondition for cover disappears.

**Opens:**

- Revisit if a later iteration adds a fixed bottom "back to index" bar or
  a full-screen image lightbox that should bleed into the notch area. At
  that point add `viewport-fit=cover` and `env(safe-area-inset-*)` padding
  in the same PR as the element that needs them.

---

### Decision 6 — Measure policy for body prose

**Decision:** single site-wide rule —
**`max-width: min(880px, 100vw - 32px)`** applied on the existing body-
prose container (the selector that today caps `880px` in `theme.css`).

**Alternatives considered:**

- `ch`-based clamp (e.g., `max-width: 72ch`) — Bear Blog pattern (05 §7.1);
  cleaner typographically but changes the visible measure on desktop away
  from the signature 880 px, which is a design change, not a mobile fix.
- Per-breakpoint values (e.g., 100% on mobile, 880 px on desktop) — works
  but requires two rules and a media query for something one `min()` does
  inline.

**Rationale:**

- 05 §8.4 names this exact rule by name as the reconciliation:
  *"preserving 880px as a signature while avoiding overflow needs
  `max-width: min(880px, 100vw - 32px)`"*. The decision doc's job here is
  to accept the research's already-named pattern, not to invent another.
- 04 §10 (WCAG §1.4.10 Reflow, 320 CSS px floor) is the binding constraint
  — a fixed 880 px `max-width` alone overflows at every phone width.
  `min(880, 100vw - 32)` leaves a 16 px gutter on each side at 320 px,
  which satisfies reflow without horizontal scroll.
- 05 §8.4 flags the tradeoff explicitly: *"the site stops being 880 px and
  becomes whatever fits"* — accepted; on desktop the measure is visually
  identical.
- 32 px of combined gutter matches bettermotherfuckingwebsite.com's
  `padding: 0 10px` logic (05 §1.1) — small horizontal breathing room on
  phones that isn't large enough to look like padding on desktop.

**Opens:**

- Does the 32 px total (16 px each side) still feel right on a 320 px
  iPhone SE once real body type is rendered? If cramped, widen to 48 px
  total in the same rule.
- One follow-up PR should grep `theme.css` for any other `max-width:
  880px` occurrences and either route them through this rule or confirm
  they are in contexts (images, code blocks) where the bleed is intended.

---

### Decision 7 — Mobile nav pattern

**Decision:** **hub homepage + in-content back-links** — no persistent
mobile chrome. The index page (`/`) is the menu; leaf pages carry a
plain-text "back to index" link at top and bottom of the content block.

**Why:** 07 §4 (contradiction #6) is explicit that the site's identity is
decorative-chrome-as-affordance; adding a hamburger or a sticky top bar
to compensate for hidden desktop chrome is strictly worse than accepting
the NN/g discoverability penalty (01 §2.2) on a 10-page static portfolio
where a session is overwhelmingly "pick one, read it, leave" (01 §2.2,
Hub row).

**Alternatives considered:**

- Hamburger / drawer — NN/g: hidden nav engages 57% of tasks vs 86%
  combo (01 §2.1); also requires either JS or a CSS-only `:checked` hack,
  both of which add surface area the MVP doesn't need (07 §8).
- Combo (top bar + overflow menu) — highest engagement in NN/g, but two
  pieces of chrome, and fights the retro spine (05 §8.6).
- No-chrome scroller (nav inline in content with no "back" at all) —
  same effect as the hub pattern but without a visible return path;
  worse wayfinding for identical cost.

**Rationale:**

- 01 §2.2 "Hub" row: *"competitive for a 10-project portfolio where a
  session is usually 'pick one project, read it, leave.'"* That's
  precisely this site's session shape.
- 05 §7.2 lists "collapse to inline summary" and "promote to a dedicated
  page (nav becomes `/nav` or `/index`)" as precedent-approved patterns
  for info-carrying chrome on mobile. We already have `/` as that index;
  no new route needed.
- 07 §8 "JS-driven nav / mobile menu with drawer animations" is
  pre-ruled-out: *"adding Preact/Svelte for a hamburger drawer would add
  more weight than every existing overlay combined."*
- Zero-JS, zero-chrome is the cheapest shippable mobile nav and the
  simplest thing to iterate away from if it tests poorly once the user
  has the MVP on a phone.

**Opens:**

- Where does the "back to index" link live visually on a leaf page — a
  top-of-content `<p><a>…</a></p>` line, a footer, or both? Defer to
  the implementation PR; both cost the same.
- If the user decides after the MVP that wayfinding is too weak, the
  fallback is a `<details><summary>Menu</summary><ul>…</ul></details>`
  block at the top of `BaseLayout.astro` — one DOM addition, zero JS.

---

### Decision 8 — LeftNav fate

**Decision:** **hide on mobile via CSS** — `@media (max-width: 768px)
{ … LeftNav selector … { display: none } }` in `theme.css`. The hub
homepage (Decision 7) carries the navigation; the LeftNav component
itself stays in the DOM for desktop.

**Alternatives considered:**

- Collapse to top-of-page link row — requires restyling LeftNav's list
  markup into a horizontal inline group on mobile; more CSS, same
  navigation outcome as the hub pattern because the homepage already
  exposes the same links.
- `<details>/<summary>` disclosure at top of every page — zero-JS
  disclosure is real (05 §1.2 Tufte sidenotes pattern), but it is a
  second pattern alongside the hub and duplicates discoverability that
  the home index already provides.
- Keep visible on mobile — LeftNav is desktop-first fixed-rail chrome
  that has no mobile behavior (04 §5 "Fixed-position overlay … doesn't
  'collapse' — needs a mobile strategy").

**Rationale:**

- 07 §8 and 01 §2.2 both land on "hub pattern carries the nav burden on
  a 10-page site"; with Decision 7 accepted, the LeftNav on mobile is
  redundant with the home index.
- Hiding the component via CSS keeps the desktop behavior untouched —
  no Astro component rewrite, no prop threading for "show/hide on
  mobile." This matches 07 §8 "Mobile-only content collections /
  `showOnMobile` schema fields" pre-ruling-out: *"let CSS hide if
  anything."*
- Hidden-via-CSS still sends the markup and CSS to mobile clients — the
  bytes are small (LeftNav is an `<aside>` with a short link list) and
  the overhead is negligible compared to the canvas IIFE decision #9
  addresses.

**Opens:**

- Does LeftNav include any links that do **not** appear on the home
  index? If yes, either add them to the home page or accept that those
  destinations are desktop-only for MVP and surface that gap in the
  first post-MVP iteration.
- Confirm the LeftNav selector currently used in `theme.css` is
  specific enough that the `display: none` rule lands without touching
  the surrounding `.content-wrapper` grid.

---

### Decision 9 — SNN panel fate

**Decision:** **keep the CSS hide at the 768 px breakpoint AND add a
`matchMedia('(min-width: 768px)').matches` early-return at the top of
the ~500-line IIFE in `BaseLayout.astro`**. Two changes, both small; no
framework adoption, no island migration.

**Alternatives considered:**

- CSS-hide only (current state) — the `is:inline` IIFE still parses and
  executes on every mobile pageload while painting nothing (06 §9, 07
  §3.6). Visible symptom: INP tax on mid-tier Android for zero visual
  benefit.
- Promote to a `client:media="(min-width: 768px)"` island — **pre-ruled-
  out** by 07 §8: *"`client:media` islands / framework adoption: Zero
  framework today; the SNN-panel gating need can be solved with a
  `matchMedia` early-return inside the existing IIFE (06 §9), no
  framework required."* That narrows the choice to CSS-hide vs
  matchMedia-gate vs remove.
- Remove entirely from mobile DOM — loses the desktop feature as a side
  effect; the overlay panel is identity chrome on desktop (05 §8.6).
  Rejected: the decision here is about *mobile* behavior, not about
  deleting the panel.

**Rationale:**

- 06 §9 names the exact pattern: *"for desktop-only behaviour, prefer a
  `matchMedia('(min-width:901px)').matches` early return inside the
  script — cheap and works with either mode."* We use 768 instead of
  901 to match Decision 1, but the mechanism is verbatim from research.
- 07 §3.6 flags the SNN IIFE as *"the most actionable finding in any
  research doc."* The research repeatedly calls this out as the highest
  ROI mobile performance win; the MVP doesn't get to punt it.
- Keeping the CSS hide alongside the JS guard is defense-in-depth — if
  `matchMedia` is disabled, polyfilled, or misreports during an iOS
  address-bar transition, the panel stays visually hidden anyway.
- Zero new dependencies, zero new patterns, one `if` at the top of the
  IIFE plus no change to the existing CSS. This is the smallest
  possible change that actually stops the script from running on phones.

**Opens:**

- 07 §3.3 flags a missing baseline measurement: *"the doc says '500-line
  IIFE parses on every page' but doesn't report an actual byte count,
  parse-time on a mid-tier Android, or an LCP impact."* The
  implementation PR should capture before/after INP on a throttled
  mid-tier Android so the decision has a number, not a direction.
- The IIFE currently lives in `BaseLayout.astro`. Should the
  matchMedia-gate PR also extract it to `src/scripts/snn.ts` per 06 §9's
  "500-line IIFE → bundled script" recommendation? Probably yes as a
  follow-up; not required for the gate itself. Keep the MVP to the
  matchMedia addition.

---

### Decision 10 — InstrumentPanel fate

**Decision:** **hide on mobile via CSS** — add `display: none` under the
`@media (max-width: 768px)` block for the InstrumentPanel selector in
either `theme.css` or `InstrumentPanel.astro`'s scoped styles.

**Alternatives considered:**

- Inline below content on mobile — requires repositioning the decoration
  into the flow, which is a design change (the panel is a desktop
  ornament, not content). 04 §5.1 overlay-panel row lists "inline below
  content" as an option but notes it *"loses the 'floating instrument'
  metaphor."*
- Tap-to-expand (disclosure) — adds an affordance that users would have
  to discover; the panel is decorative, not informational, so the cost
  buys nothing.

**Rationale:**

- 07 §1 summary names InstrumentPanel in the "fixed overlays that don't
  have a mobile behavior" bucket alongside SNN and LeftNav. The MVP
  policy is the same: hide, don't migrate.
- InstrumentPanel is a ~27 KB decoration (per task-prompt context). 03
  §3 and 03 §10.2 budgets treat decorative assets that aren't seen as
  pure waste; hiding via CSS keeps the desktop behavior untouched.
- The component already gates at `max-width: 800px` per 04 preamble.
  This decision moves that threshold to 768 (Decision 1) and keeps the
  same mechanism — a one-value change, not a rewrite.
- No JS attached to InstrumentPanel that needs a matchMedia gate (06 §9
  lists only portal, lightbox, and SNN as the JS-bearing `is:inline`
  blocks); CSS hide is sufficient.

**Opens:**

- The 27 KB asset still downloads when hidden via `display: none` (the
  browser fetches the image regardless of layout visibility). Post-MVP,
  consider gating the `<img>` / `<source>` itself behind a `<picture>`
  with a `(min-width: 768px)` `<source>` so mobile doesn't pay the
  bytes. Out of scope for the hide decision; flag for the next PR.

---

### Decision 11 — Signature GIF (and `/about` flag GIFs)

**Decision:** **keep animated, unchanged, for MVP**. Same treatment for
the flag GIFs in `src/pages/about.astro` — they are not reencoded, not
replaced with static, not swapped to `<video>` in the first mobile PR.

**Alternatives considered:**

- Static under `prefers-reduced-motion` — principled, one extra CSS rule
  + one static alternate asset. Deferred because the reduced-motion
  policy is owned by `01-scope-and-floor.md` (07 §7); this doc should
  not preempt that decision.
- Replace with `<video autoplay muted loop playsinline>` — 03 §3.5
  argues ~10× savings (2–5 MB GIF → 50–200 KB WebM/MP4). Real win, but
  an asset-pipeline change (re-encode, emit `<picture>` / `<video>` in
  Astro, test autoplay on iOS); wrong shape for the MVP.
- Replace with static unconditionally — loses the signature motion that
  05 §5.4 names the single retained personality survivor.

**Rationale:**

- 05 §5.4 and 05 §8.6 both argue exactly one signature animation should
  survive on mobile as the carrier of retro personality. The signature
  GIF in `BaseLayout.astro:26` (`/black_sign.gif`) is that survivor;
  killing it on MVP is a bigger design change than anything else in
  this doc.
- 07 §1 frames the mobile pass as *"a reading-posture concession, not
  a redesign."* Re-encoding assets is a redesign; keeping the existing
  asset and fixing the layout around it is the concession.
- 03 §3.5 is correct that GIFs are wasteful; that doesn't make the
  fix *urgent* for the MVP. The signature is a single small file; the
  flag GIFs on `/about` are per-country thumbnails (~a few KB each).
  The INP/LCP problem on mobile is the SNN IIFE (Decision 9) and the
  27 KB InstrumentPanel (Decision 10), not these GIFs.
- Flag GIFs get the same treatment because (a) they are the same asset
  class, (b) they are small, and (c) decorating the `/about` list with
  country flags is itself a stylistic signal that fits the retro spine.
  07 §6 item 11 names "signature GIF fate" as one decision and the
  flags fall under the same umbrella unless a divergent argument
  surfaces; none does.

**Opens:**

- The reduced-motion branch (static alternate under
  `prefers-reduced-motion: reduce`) is cheap and should be re-opened as
  soon as `01-scope-and-floor.md` lands its reduced-motion policy.
- Asset-pipeline PR (GIF → `<video>` or AVIF-animated) is a post-MVP
  follow-up scoped under 03 §3.5. Do not bundle it with the layout pass.
- The `littbut.gif` dots in `BaseLayout.astro:54–66` (LeftNav bullets)
  are hidden-on-mobile by Decision 8 and do not need a separate
  decision.

---

## MVP implementation notes

One bullet per decision, naming the file(s) that change. Pointers only;
no code.

- **Decision 1 (breakpoints):** `src/styles/theme.css` — consolidate the
  existing three breakpoints (768 / 800 / 900) onto 768. Touches the
  scoped styles in `src/components/InstrumentPanel.astro` (the 800 px
  rule) and `src/layouts/BaseLayout.astro` (the 900 px rule).
- **Decision 2 (viewport meta):** no change. Confirm no edit is needed
  to `src/layouts/BaseLayout.astro` head or `src/pages/content-rated.astro`.
- **Decision 6 (measure):** `src/styles/theme.css` — change the
  existing `max-width: 880px` on the body-prose container to
  `max-width: min(880px, 100vw - 32px)`. Grep `theme.css` for other
  `max-width: 880px` occurrences and apply the same substitution where
  the selector targets prose.
- **Decision 7 (nav):** `src/layouts/BaseLayout.astro` — confirm the
  existing header logo / home link is reachable from leaf pages.
  `src/layouts/SectionLayout.astro` or the relevant page templates —
  add a plain-text "back to index" link at the top of the content
  block on leaf pages if one is not already present.
- **Decision 8 (LeftNav):** `src/styles/theme.css` (or
  `src/components/LeftNav.astro` scoped styles) — add `display: none`
  for the LeftNav container inside `@media (max-width: 768px)`.
- **Decision 9 (SNN):** `src/layouts/BaseLayout.astro` — add a
  `matchMedia('(min-width: 768px)').matches` early-return at the top of
  the `<script is:inline>` block that contains the SNN IIFE. Keep the
  existing CSS hide rule (update its breakpoint to 768 per Decision 1).
- **Decision 10 (InstrumentPanel):** `src/components/InstrumentPanel.astro`
  scoped styles (or `src/styles/theme.css`) — move the existing hide
  rule from `max-width: 800px` to `max-width: 768px` to match Decision
  1.
- **Decision 11 (GIFs):** no change. `public/black_sign.gif`,
  `public/assets/littbut.gif`, and `src/pages/about.astro` flag
  `<img>` references at lines 78, 97, 116, 135, 149, 181 all ship
  as-is.

Total file-touch surface for the MVP: **`src/styles/theme.css`** (most
changes), **`src/layouts/BaseLayout.astro`** (matchMedia gate + nav
confirmation), **`src/components/InstrumentPanel.astro`** (breakpoint
value), **`src/components/LeftNav.astro`** (optional — only if the
hide rule lives in its scoped styles), and one leaf-page template for
the "back to index" link if absent. No new files, no new dependencies,
no framework islands, no re-encoded assets.

---

*End of 02-layout-and-chrome.md. Sibling decisions docs:
`01-scope-and-floor.md`, `03-typography-and-color.md`.*
