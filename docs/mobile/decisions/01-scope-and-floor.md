# 01 — Scope, Accessibility Floor, and the Durable "No" List

Purpose: commit the shape of the mobile MVP before any CSS is written.
This doc answers *what counts as done*, *what minimum we're holding to*,
and *what we are explicitly not building*. It is decision doc 1 of 3 per
`07-overview.md` §7. Docs 02 (layout & chrome) and 03 (typography &
color) depend on the floor set here.

Framing: the user has stated they need to eyeball a mobile MVP on a real
phone before making concrete suggestions. That means this doc picks
sensible defaults where research gives multiple viable options, and
defers anything requiring a live feel. Iteration happens from a working
build, not from more documents.

---

## 1. Scope statement

"Done" for the mobile MVP means: every existing page of `kayra-almanac`
— home index, the ~10 project pages, logbook, notebooks, any
single-entry detail page — opens on a phone and is comfortably readable
and navigable without pinch-zoom, without horizontal scroll at 320 CSS
px, and without the desktop chrome (SNN overlay, InstrumentPanel,
LeftNav rail, 880px measure) leaking into a narrow viewport. The
early-2000s academic personality — Arial italic-bold heads, Courier
labels, `#0000EE`/`#551A8B` links, white paper + black ink, pixelated
figures, one signature GIF — survives intact. The mobile pass is a CSS
reshape plus a small handful of component-level decisions about what
each piece of desktop chrome does at narrow widths. It is **not** a
rebuild, framework migration, content overhaul, design-system rollout,
or re-platform. Per 07 §2.

---

## 2. Target devices and reflow floor

**Decision:** minimum supported viewport is **320 CSS px** wide. iPhone
SE 1st gen is the canonical narrow test target. No lower breakpoint is
supported; no `maximum-scale` or `user-scalable=no` on the viewport
meta; pinch-zoom stays available at all widths.

**Browsers / OS versions targeted for MVP eyeball:**

- iOS Safari on current and previous major iOS (the user's own phone
  sets the bar; anything older than iOS 16 is out of scope for MVP).
- Chrome on Android, current stable, on a mid-tier device class (the
  "Moto G-ish" tier — not flagship, not bargain-bin).
- Desktop Firefox, Chrome, and Safari at their devtools-simulated
  narrow widths for development iteration.

Not targeted: IE, pre-Chromium Edge, UC Browser, KaiOS, Opera Mini,
iOS <16, Android WebView embedded in third-party apps. If it works
there, fine; nothing is engineered to hit it.

**Rationale:**

- WCAG 2.2 §1.4.10 Reflow mandates content reflow at 320 CSS px without
  horizontal scroll, with the "essential 2D content" exception (code
  listings, wide tables, complex diagrams) — those must isolate the
  horizontal scroll to the block, not the page. Cite: 04 §10.
- 320 is the concrete test number the research converged on; higher
  floors (360, 375) leave iPhone SE 1 users with a broken page.
- Current viewport meta is already correct per 04 §6 and 06 §8; no
  change needed for MVP. `viewport-fit=cover` is deferred to decision
  doc 02 since it depends on whether any chrome goes edge-to-edge.

**Opens:** whether individual logbook tables and notebook code blocks
need `overflow-x: auto` wrappers is an implementation audit, not a
decision. 04 §11 open-question #9.

---

## 3. Accessibility floor

**Decision:** **WCAG 2.2 Level AA is the floor** for all mobile-pass
work. Level AAA is adopted opportunistically where it is free or
near-free — i.e., where choosing AAA costs no visual or retro
concession relative to AA. Per 01 §10 open-question #10 and 07 §1.

Implications for touch-target sizing (in the abstract; the concrete
pixel number is decision doc 03's job):

- AA gives a floor with a spacing-exception path — dense inline targets
  in prose can stay small if spacing between them meets the exception.
- AAA gives a higher floor with no spacing exception and is usually
  free for standalone controls.
- The site has two target classes: standalone chrome (nav links,
  disclosure toggles, signature GIF affordance) and inline prose links
  (linkrolls, citations, inline `<a>` in body copy). Decision doc 03
  picks the pixel number for each and whether the visual-vs-hit-area
  decoupling from 01 §5.3 is used.

Cross-cutting AA obligations this MVP must meet:

- §1.4.10 Reflow at 320 CSS px (see §2 above).
- §1.4.4 Resize Text: no blocking of browser zoom up to 200%.
- §1.4.12 Text Spacing: user-overridden line-height / letter-spacing
  must not break layout.
- §2.4.7 Focus Visible: focus ring required on every interactive
  element (decision doc 03 picks the visual treatment).
- §1.4.3 Contrast: the current `#0000EE`/`#551A8B`/`#000000` on white
  palette already clears AA and AAA per 02 §5 — nothing to do here.
- §2.5.8 Target Size (Minimum): sizing decision deferred to doc 03.

No Lighthouse CI or axe-core gate on every PR — see §5. The floor is a
commitment, not a pipeline.

---

## 4. Decisions 12–16

### Decision 12 — Webfonts

**Decision:** No webfonts. System stack (Arial / Helvetica / Courier)
stays.

**Alternatives considered:**

- Self-hosted WOFF2 (Arial lookalike, monospace lookalike) with
  `font-display: swap`, subsetting, preload.
- Google Fonts / Bunny Fonts CDN.
- Webfont only for Courier substitute (the most divergent
  cross-platform glyph per 02 §6).

**Rationale:**

- 05 §1 (mfw / Bear Blog / brutalist-web lineage) argues shipping no
  webfont is the superior retro-modern position.
- 02 §9 leans toward "default should stay system"; webfont hygiene
  from 02 §4 becomes archival reference.
- Zero network tax, zero FOUT/FOIT/FOFT, zero subsetting maintenance.
- The identity is *which* system fonts and *how they are composed*
  (italic-bold Arial heads, Courier labels) — not custom letterforms.

**Opens:** Courier fragility (iOS SF Mono fallback, Android Roboto Mono
divergence, 11px legibility per 02 §6 and 02 §9) is a reconciliation
for decision doc 03 — it does not reopen the webfont question. The
answer there is a system-stack tweak (bump Courier size on mobile,
or scope Courier away from body), not a webfont ship.

### Decision 13 — Dark mode

**Decision:** No dark mode. Site ships light-only.

**Alternatives considered:**

- Full dark-mode palette (02 §8 option C).
- `prefers-color-scheme: dark` media query flipping only a few tokens
  (02 §8 option B).
- `color-scheme: light` meta only (no dark palette, but declares
  intent).

**Rationale:**

- The retro-academic aesthetic is explicitly white-paper + black-ink
  per 05 §4.1; inverting to dark loses the "printed page" signal that
  defines the site.
- User has not asked for dark mode; per 07 §8, adding it here is
  scope creep.
- Readers who need dark can use their browser's reader mode or OS-level
  inversion; we do not need to ship a second palette.
- Declaring `color-scheme: light` (one line in the `<head>`) is the
  one concession — it prevents the brief dark-UA-chrome flash on iOS
  Safari and is not itself "dark mode." 07 §8 allows this.

**Opens:** the `color-scheme: light` declaration is an implementation
detail for decision doc 02 or the implementation PR; it is not a
second decision.

### Decision 14 — View Transitions

**Decision:** No View Transitions API for the MVP. Ship a zero-JS
baseline.

**Alternatives considered:**

- Astro `<ClientRouter />` with default transitions (~3 KB runtime
  plus rebinding overhead per 06 §3).
- Native CSS View Transitions for specific elements only.
- Custom CSS `@keyframes` on page-swap events.

**Rationale:**

- 06 §5 already concludes "probably not worth 3 KB for a mostly-static
  site."
- 06 §4 notes the repo currently ships zero framework JS; 3 KB is small
  in absolute terms but infinite against that baseline.
- 07 §8 lists this as pre-ruled-out for MVP.
- If a specific transition turns out to be needed after shipping, it
  can be added as a targeted CSS View Transition, not a router swap.

**Opens:** revisit only if the design-eyeball phase surfaces a specific
transition the user wants. Not a per-component decision now.

### Decision 16 — prefers-reduced-motion policy

**Decision:** **Universal honoring.** Every continuously moving or
auto-playing element on the site must either stop, freeze, or degrade
to a static representation when `prefers-reduced-motion: reduce` is
matched. No per-component opt-in; the policy is site-wide.

**Alternatives considered:**

- Explicit / opt-in: each component author decides whether its motion
  honors the media query.
- Hybrid: honor it for "large" motion (full-viewport animations) but
  not "ambient" motion (tiny loops, cursor blinks).

**Rationale:**

- The site has three motion surfaces that all need an answer: the
  signature GIF (05 §5.1, §5.4 argues it is the likely personality
  survivor), the flag GIFs on project pages, and the SNN canvas
  animation in `BaseLayout.astro` (06 §9).
- A universal policy means a new motion element added later inherits
  the contract for free; an explicit policy means every new element
  needs a per-case review.
- 03 §8.5 and 06 §3 both argue for discipline across all continuous
  animation — universal is the spirit of both.
- The concrete degradation strategy per surface (GIF → static first
  frame, GIF → `<video>` with `preload=none`, SNN → skip IIFE entirely
  via `matchMedia` early-return) is decision doc 02's domain.

**Opens:** whether the signature GIF ships as GIF + reduced-motion
static, as `<video>` with a poster, or as an unconditional static is
decision doc 02 (chrome fate). This doc only commits that *whatever*
form it ships in, the reduced-motion preference is honored.

---

## 5. The pre-ruled-out list — what we are NOT building

Each item below is declined for the MVP. If one becomes necessary
later, reopen the specific decision; do not re-litigate the whole set.
Per 07 §8.

- **Service worker.** No offline story needed; Vercel edge already
  caches the static build. Cite: 07 §8 bullet 1.
- **Separate m-dot site (`m.kayra-almanac…`).** One URL, one codebase,
  responsive-by-default. Cite: 04 §2, 07 §8 bullet 2.
- **PWA manifest, `apple-touch-icon` set, `theme-color` meta,
  `mobile-web-app-capable` meta.** A reading site is not an
  installable app. `color-scheme: light` is the single exception
  (see Decision 13). Cite: 06 §8, 07 §8 bullet 5.
- **Container queries (`@container`).** Overkill for a single-column
  reading site; existing `@media` + `auto-fit minmax()` grids suffice.
  Cite: 04 §4, 07 §8 bullet 7.
- **Complex breakpoint system (>3 breakpoints).** The decisions doc
  02 will pick 0, 1, or up to 3. More than 3 is pre-declined. Cite:
  04 §4, 07 §8 bullet 8.
- **JS-driven nav drawer with animated hamburger.** Adding a framework
  (Preact/Svelte) for a menu outweighs every existing overlay combined.
  Plain `<details>`/`<summary>` or CSS-only is the ceiling if a menu is
  even needed. Cite: 07 §8 bullet 9. The nav pattern itself is decision
  doc 02.
- **Custom gestures (swipe-to-dismiss, long-press menus,
  drag-to-reorder).** A read-only portfolio needs none, and every
  custom gesture costs discoverability. Cite: 01 §3.2, 07 §8 bullet 11.
- **Pull-to-refresh handler.** PTR is a free browser behavior; don't
  add a page-level handler, don't disable it either. Cite: 01 §3.3,
  07 §8 bullet 10.
- **Catalog filter UI.** The `/catalog` page 01 §7 researched does not
  exist on this site. Cite: 07 §8 bullet 12.
- **Webring / linkroll widget.** Not requested; embeddable widgets
  regress mobile. If link groups appear, they are a plain `<ul>`. Cite:
  05 §6, 07 §8 bullet 13.
- **Lighthouse CI / axe-core gating on every PR.** Run locally before
  shipping and before dependency bumps; do not block PRs on a 3-run
  median. Cite: 03 §10.4, 07 §8 bullet 14.
- **Bottom tab bar.** A 10-project portfolio with 5 spine sections
  does not benefit from an app-style persistent tab bar, and the retro
  spine actively fights it. Cite: 01 §2, 05 §5, 05 §8.6, 07 §8 bullet
  15.
- **Mobile-only content collections / `showOnMobile` schema fields.**
  10 projects don't warrant author-curated mobile trimming. Shared
  collection, render all, let CSS hide if anything. Cite: 06 §1, 07 §8
  bullet 16.
- **`client:media` islands / framework adoption for the SNN panel.**
  Zero framework today; SNN-panel gating is solved with a `matchMedia`
  early-return inside the existing IIFE (per 06 §9), not framework
  adoption. Cite: 06 §4, 07 §8 bullet 17. The SNN fate itself
  (hide / gate / remove) is decision doc 02.
- **Print stylesheet.** Deferred entirely; the cheapest print story is
  "make reader-mode work well" per 04 §9.3. Add only if someone asks.
  Cite: 04 §9, 07 §8 bullet 18.

If any item above becomes unavoidable mid-implementation, that is a
signal to pause and reopen it explicitly in its own decision record —
not to silently re-add it.

---

## 6. Exit criteria — the MVP eyeball checklist

The user will run this checklist on a real phone (iPhone or an Android
in the mid-tier class) after implementation. The MVP is "done" when
every item clears. Items that cannot be verified on hardware are
called out as such.

1. **No horizontal scroll at 320 CSS px** on the home index, any
   project page, the logbook index, any logbook entry, the notebook
   index, any notebook entry. Essential 2D content (wide tables,
   code blocks) may scroll within its own block but must not push the
   page. Cite: §2; WCAG §1.4.10.
2. **Body copy reads without pinch-zoom** at a comfortable viewing
   distance on the user's own phone. Ambient test, not measurement;
   decision doc 03 sets the target size, this step confirms it feels
   right.
3. **Every nav destination the desktop offers is reachable** from the
   mobile layout in ≤ 2 taps from any page. The specific reachability
   pattern (top-of-page collapsed links, disclosure menu, hub page)
   is decision doc 02; this step only verifies the outcome.
4. **LeftNav contents are reachable on mobile** — whatever decision
   doc 02 does with the rail (hide, collapse, disclose), the links
   inside are not stranded.
5. **SNN panel does not leak layout** — no overflow, no fixed element
   covering content, no IIFE console work on mobile beyond the gated
   early-return. Whatever decision doc 02 picks (hide / gate / remove),
   this step verifies nothing escapes.
6. **InstrumentPanel does not leak layout** on pages where it appears;
   same pattern as SNN.
7. **Signature GIF respects `prefers-reduced-motion`** — enable
   reduced-motion in iOS/Android settings, reload, confirm the GIF is
   not animating (static frame, poster, or absent per doc 02's
   choice). Flag GIFs honor the same. Cite: §4 Decision 16.
8. **Tap targets not cramped.** Spot-check inline prose links in a
   logbook entry, standalone chrome in the header/nav, and any project
   card link; no accidental mis-taps on a normal-reading-distance
   attempt. Exact sizing is decision doc 03.
9. **Focus ring is visible** when navigating with an external keyboard
   (rare on mobile but required); verify at least on desktop at narrow
   width as a proxy. Cite: §3.
10. **`#0000EE` and `#551A8B`** visibly render as themselves — no dark
    inversion, no unexpected OS-level recoloring. Readable against
    white. Cite: 02 §5.
11. **Pinch-zoom works** on any page — the viewport meta does not block
    it. (Implicit in §2; this is the regression check.)
12. **No PWA install prompt, no "Add to Home Screen" iconography, no
    theme-color styling the browser chrome.** MVP is a web page, not an
    installable app. Cite: §5.
13. **Page weight sanity check** — home index loads comparably to or
    better than the current desktop build on Slow 4G in devtools. This
    is a rough guardrail, not a budget enforcement; decision doc 02's
    SNN-gating and doc 03's font choices drive the real numbers. The
    baseline measurement itself is an implementation task, per 07
    §3.3 gap-finding.

Items 1, 5, 6, 7, 11, 12 are hard-fail. Items 2, 3, 4, 8, 9, 10, 13
are eyeball/judgment — if the user reports any of them as not-right,
iterate from the working build rather than reopen this doc.

---

## 7. What this doc does *not* decide

Explicitly out of scope here; handed to decision docs 02 and 03:

- Touch-target pixel numbers (→ doc 03).
- Body font size, line-height, measure value (→ doc 03).
- Breakpoint count and values (→ doc 02).
- Nav pattern (hub / hamburger / combo / no-chrome) (→ doc 02).
- LeftNav / SNN / InstrumentPanel fate — hide, collapse, gate, remove
  (→ doc 02).
- Signature GIF delivery form — GIF-with-reduced-motion-static,
  `<video>`, unconditional static (→ doc 02).
- Courier sizing reconciliation (→ doc 03).
- Link tap-pressed visual state (→ doc 03).
- Focus ring visual treatment (→ doc 03).
- `viewport-fit=cover` opt-in (→ doc 02, depends on whether chrome
  goes edge-to-edge).
- `dvh` vs `svh` blanket policy (→ doc 02).

---

*End of 01-scope-and-floor.md. Next: `02-layout-and-chrome.md`.*
