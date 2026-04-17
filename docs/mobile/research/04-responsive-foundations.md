# 04 — Responsive Foundations (Mobile Redesign Research Track)

Scope: the canonical decision space behind making a desktop-first Astro site
work on phones. This is research — it catalogs the arguments, primitives, and
tradeoffs. It does **not** pick breakpoints, viewport strategy, or print
stylesheet policy for this site. Those decisions happen after tasks 01–06 are
synthesized.

Spine: modern-retro hybrid on Astro 5 SSG. Current site is desktop-first,
880px measure, grid-heavy pages, a fixed-position SNN overlay panel, and a
LeftNav rail. Three breakpoints exist today (768px in `theme.css`, 800px in
`InstrumentPanel.astro`, 900px in `BaseLayout.astro`). No container queries,
no `env(safe-area-inset-*)`, no print stylesheet, no logical properties, no
subgrid usage. Viewport meta is `width=device-width, initial-scale=1` (no
`maximum-scale`, no `user-scalable` — good default).

Audience: future-me synthesizing task 04 with tasks 01 (UI conventions), 02
(typography), 03 (performance), 05 (retro precedents), and 06 (Astro
patterns) before deciding the mobile architecture.

---

## 1. Marcotte — Responsive Web Design (the canonical argument)

Ethan Marcotte, *A List Apart* #306, "Responsive Web Design"
(2010-05-25). <https://alistapart.com/article/responsive-web-design/>
Expanded into the A Book Apart title of the same name (2011, revised 2014).

### The three ingredients

- **Fluid grids** — layout widths in percentages (or modern equivalents:
  `fr`, `%`, `minmax()`), not fixed pixels. Marcotte's formula:
  `target ÷ context = result` — target element width divided by its parent
  container width gives a proportional percentage.
- **Flexible media** — images and embeds that don't overflow their
  container. The classic `img { max-width: 100%; height: auto; }` rule.
  Modern equivalents: `<picture>`, `srcset`/`sizes`, CSS `aspect-ratio`,
  `object-fit`.
- **Media queries** — CSS3 `@media` predicates to branch layout on viewport
  properties. Marcotte framed them as "inflection points" where the fluid
  grid's proportions stop working and need re-composition.

### Why this still beats an m-dot (m.example.com) site

- **One URL per resource.** Google's own guidance makes this the preferred
  pattern for indexing, link-equity consolidation, and canonical handling.
  Separate mobile sites require `rel="alternate"` ↔ `rel="canonical"`
  pairing and create two surfaces to maintain.
  <https://developers.google.com/search/mobile-sites/mobile-seo>
- **One codebase.** No fork of templates, styles, or content pipelines. For
  an Astro SSG portfolio, an m-dot would mean either a second Astro project
  or a second output target — both multiply build complexity.
- **Device-agnostic.** Marcotte's original argument predates the current
  diversity (foldables, desktop class tablets, ultrawide monitors, watches
  rendering web content). Breakpoint-on-viewport scales to devices nobody
  has yet shipped; device sniffing does not.
- **Source-order accessibility.** One DOM, one reading order, one
  focus-order. Assistive tech doesn't branch on User-Agent.
- **URL sharing.** A link sent from mobile to desktop resolves to the same
  content at a usable layout. m-dot links often dead-end on desktop or
  redirect through a UA sniff that misfires on tablets.

### What Marcotte got right, what the industry refined

| Original claim | How it held up |
|---|---|
| Fluid grid from percentages | Superseded by CSS Grid `fr` units and `minmax()`; same spirit, better primitives. |
| `img { max-width: 100% }` | Still correct, now joined by `srcset`/`sizes` for resolution-appropriate delivery and `aspect-ratio` to reserve space pre-load. |
| Media queries as inflection points | Correct but incomplete — container queries (2023+) solved the component-vs-page mismatch Marcotte couldn't address in 2010. |
| "Responsive" as the default | Google and WCAG reflow (§1.4.10) now codify this as effectively mandatory. |

Marcotte's 2010 framing survives because the principles (proportional
layout, flexible media, conditional composition) are device-independent.
The primitives (percentages, `@media`) got better replacements (Grid, `fr`,
container queries), but the architecture is unchanged.

---

## 2. Responsive vs adaptive vs separate mobile site

### Definitions

- **Responsive** — one codebase, one URL, CSS adapts fluidly across
  viewports. Layout is continuous between breakpoints.
- **Adaptive** — one codebase (sometimes one URL), server or client branches
  on viewport or UA to swap discrete layouts. Layout is stepwise — usually
  3–6 fixed compositions.
- **Separate mobile site (m-dot)** — two codebases or two output targets at
  different URLs (typically `m.example.com`), linked via
  `rel="alternate"`/`rel="canonical"`. UA-sniffing redirects users.

### Google's stance

- Responsive is the **recommended** configuration.
  <https://developers.google.com/search/mobile-sites/mobile-seo/responsive-design>
- Dynamic serving (adaptive at the server) and separate URLs are supported
  but carry extra configuration burden (correct `Vary: User-Agent`,
  `rel="alternate"`/`rel="canonical"` pairing, canonical handling).
  <https://developers.google.com/search/mobile-sites/mobile-seo/dynamic-serving>
  <https://developers.google.com/search/mobile-sites/mobile-seo/separate-urls>
- Google has been **mobile-first indexing** since 2019 (fully rolled out by
  2023). The mobile version is the primary source of truth for the index;
  desktop-only content is effectively invisible to Googlebot-mobile.
  <https://developers.google.com/search/mobile-sites/mobile-first-indexing>

### SEO and maintenance implications

| Aspect | Responsive | Adaptive | m-dot |
|---|---|---|---|
| URLs | 1 | 1 (dynamic serving) or 1-per-layout | 2 (desktop + m-dot) |
| Canonical tags | Not needed | Not needed | Required (alternate ↔ canonical) |
| `Vary` header | No | `Vary: User-Agent` on dynamic serving | Typically yes on m-dot |
| Index consolidation | Automatic | Automatic | Requires correct linking |
| Template count | 1 | 1 with branches | 2 |
| Content pipeline | Single | Single | Duplicated or forked |
| UA sniffing | Avoided | Required | Required |
| Risk of drift | Low | Medium | High |
| Analytics | Single property | Single property | Usually two, reconciled later |

### When a separate site is defensible

- **Radically different task surfaces.** Mobile users perform a task set
  the desktop site doesn't expose (e.g., in-store scanner, field
  dispatch). The overlap is small enough that one codebase would carry more
  dead weight than two.
- **Performance budget impossible otherwise.** Legacy desktop bundle is
  unremovable and the mobile team needs a clean slate. Usually an admission
  that responsive refactor is politically blocked, not a technical
  necessity.
- **Native-shell embedding.** The "mobile site" is actually a webview
  inside a native app with its own chrome.
- **Accessibility-first alternate view** (rare) — e.g., a text-only or
  low-bandwidth alternative. Even this is usually better served by
  progressive enhancement.

None of these apply to a personal portfolio. Responsive wins by default.

### The third option: responsive with adaptive pockets

Not a separate strategy — a responsive baseline where a few specific
components branch harder (e.g., a data table that becomes a card list under
a threshold, or a navigation that swaps from inline links to a sheet).
Container queries (§4) make this cleaner than it was in 2014.

---

## 3. Mobile-first (Wroblewski)

Luke Wroblewski, *Mobile First* (A Book Apart, 2011).
<https://www.abookapart.com/products/mobile-first>
Earlier blog posts: <https://www.lukew.com/ff/entry.asp?933> ("Mobile
First"), <https://www.lukew.com/ff/entry.asp?1117> ("Data Monday: Mobile
Growth Stats").

### The constraint-first argument

- **Focus.** Phone screens force prioritization. Anything that doesn't
  earn its spot on ~360×640 CSS px doesn't deserve priority on desktop
  either. The constraint surfaces what the page is *for*.
- **Capabilities, not just constraints.** Phones add sensors, touch,
  location, camera, offline — features desktops often lack. Designing
  mobile-first means these are first-class, not afterthoughts.
- **Growth.** Wroblewski's 2011 argument (mobile traffic overtaking
  desktop) played out. Global web traffic has been majority-mobile since
  ~2017. For a portfolio, recruiters and HN readers frequently land on
  phones first.
- **Progressive enhancement alignment.** Mobile-first CSS (base rules +
  `min-width` queries that *add* complexity for larger viewports) matches
  the progressive-enhancement grain: start with the lowest-capability
  experience and layer up. Desktop-first CSS (`max-width` queries that
  *remove* complexity for smaller viewports) inverts this and tends to
  strand mobile with leftover desktop assumptions.

### Retrofitting a desktop-first codebase (this site)

The pure mobile-first doctrine assumes greenfield. Retrofitting has
different economics:

- **Sunk cost is real.** 880px measure, LeftNav rail, SNN overlay panel,
  grid-heavy pages — these work and the user likes them on desktop. A
  mobile-first rewrite from scratch trades known-good desktop for
  speculative mobile gain.
- **Breakpoint direction.** A desktop-first CSS file (`@media
  (max-width: 768px)`) can be mobile-first-ified by inverting — move
  base rules to mobile defaults and gate desktop additions behind
  `@media (min-width: ...)`. This is mechanical but touches every file
  that has a media query; the current code has three.
- **Incremental path.** Start new mobile-specific work mobile-first,
  leave desktop-first rules in place for now, let the two converge as
  components are touched. Avoids a big-bang rewrite.
- **Selective primitives.** Introduce container queries for new
  components (§4) so they don't inherit page-level breakpoint baggage.
  Old viewport queries stay until their component is touched.
- **The actual constraint for this site** isn't mobile-first
  evangelism — it's whether the grid-heavy and overlay-panel patterns
  survive a narrow viewport without a rewrite. Task 06 (Astro patterns)
  will touch this.

### Honest tradeoffs of mobile-first

- Harder to predict final desktop composition from mobile wireframes —
  risk of a desktop that feels like "blown-up mobile."
- Content-heavy pages (long-form articles, the logbook) benefit less
  from mobile-first than app-like surfaces; the linear reading flow
  already works on mobile without explicit mobile-first framing.
- Requires discipline — it's easy to draft mobile screens then bolt
  desktop extras on top and end up with an adaptive sandwich instead of
  a continuous responsive experience.

---

## 4. Breakpoint strategy

### Content-driven vs device-driven

- **Device-driven:** pick breakpoints from named device classes —
  "iPhone 14 portrait is 390px, iPad portrait is 768px, laptop is
  1280px, so breakpoints are 390/768/1280." Tempting because it feels
  concrete.
- **Content-driven:** pick breakpoints where the *content layout
  breaks* — the measure gets too long, the grid goes from 3-up to
  2-up, the nav can't fit inline. The viewport is treated as
  continuous; breakpoints are inflection points discovered by resizing
  the browser.

web.dev summarizes the content-driven approach under "Learn Responsive
Design" → "Macro layouts" and "Breakpoints" units.
<https://web.dev/learn/design/breakpoints>
<https://web.dev/learn/design/macro-layouts>

### Why content-driven beats device-driven

- **Device sizes are a moving target.** iPhone CSS-px widths from
  launch-era devices: iPhone 3 (320), iPhone 5 (320), iPhone 6 (375),
  iPhone 6 Plus (414), iPhone X (375), iPhone 12/13/14 (390), iPhone 14
  Pro Max (430), iPhone 16 Pro (~402). Android ranges roughly 360–412
  in portrait. Tablets: iPad Mini 768, iPad Air 820, iPad Pro 11" 834,
  iPad Pro 12.9" 1024. Foldables (Galaxy Z Fold 6 inner) ~673 unfolded.
  Any breakpoint tied to a specific device is obsolete by the next
  hardware cycle.
- **Content has a natural measure.** A paragraph wants 45–75
  characters for readability (§02 typography will confirm). A three-up
  card grid wants ~300px per card minimum. These are the real
  inflection points, not the width of a particular phone.
- **Resilience to future devices.** Content-driven breakpoints keep
  working when a device lands at 402 or 430 px that didn't exist when
  the CSS was written.

### Common device-size clusters (reference only, not prescriptive)

| Cluster | Typical CSS-px widths | Devices in this range |
|---|---|---|
| Small phone | 320–360 | iPhone SE 1/2, older Android |
| Typical phone | 375–414 | iPhone 12–16, most Android flagships |
| Large phone | 414–430 | iPhone Plus/Pro Max, large Android |
| Phablet / small tablet | 600–768 | Unfolded Fold, iPad Mini |
| Tablet portrait | 768–834 | iPad portrait |
| Tablet landscape / small laptop | 1024–1280 | iPad landscape, MacBook Air base |
| Desktop | 1280–1920 | Typical laptops and desktops |
| Wide | 1920+ | External monitors, ultrawide |

Treat these as **the geography of the problem, not the solution.**
Pick breakpoints from content, then sanity-check they don't land
pathologically inside a popular cluster.

### Viewport queries vs container queries

MDN: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries>
web.dev: <https://web.dev/blog/new-responsive>

| Query type | Condition | Use case |
|---|---|---|
| `@media` | Viewport width/height/etc. | Page-level composition (number of columns, nav placement). |
| `@container` | Nearest ancestor with `container-type` | Component-level adaptation — a card that renders horizontally in a wide slot and vertically in a narrow one, regardless of viewport. |
| `@media (orientation: ...)` | Viewport aspect | Orientation-specific tweaks (§8). |
| `@media (hover: hover)`, `(pointer: fine)` | Input capability | Touch-vs-mouse affordances without UA sniff. |
| `@media (prefers-reduced-motion)` etc. | User prefs | Accessibility and user-preference branching. |
| `@media (dynamic-range: high)` | Display capability | HDR-aware media. |

Container queries unblock patterns that `@media` alone can't express
cleanly — the same component in a sidebar, a main column, and a modal
needs different layouts per slot, not per viewport. Browser support is
Baseline Widely Available (Safari 16+, Chrome 105+, Firefox 110+) — no
polyfill needed for current traffic.

### Breakpoint count: how many is enough

- **Fewer is easier to maintain.** Each breakpoint is a testing matrix
  row. Three to five is typical; seven+ is usually a sign of
  device-driven thinking.
- **The "major" set.** A common content-driven skeleton is three
  breakpoints: small (phone), medium (tablet / small laptop), large
  (desktop). Plus maybe a "xl" for ultrawide and a "xs" for tiny
  phones if content genuinely breaks there.
- **Micro-adjustments belong in fluid rules.** Use `clamp()`,
  `min()`, `max()`, and `minmax()` to fluidly scale between
  breakpoints instead of stacking close breakpoints.

### Units and the fluid-between-breakpoints idiom

- **`clamp(min, preferred, max)`** — the main tool for fluid
  typography and fluid spacing. Example:
  `font-size: clamp(1rem, 0.875rem + 0.5vw, 1.25rem);`
- **Viewport units** — `vw`, `vh`, plus the newer `svw/svh`, `lvw/lvh`,
  `dvw/dvh` (small / large / dynamic viewport; MDN). `dvh` is the
  practical replacement for `100vh` on mobile, which historically
  broke under iOS toolbar show/hide.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths>
- **Container query units** — `cqw`, `cqh`, `cqi`, `cqb`, `cqmin`,
  `cqmax`. Scale to the nearest container, not the viewport.
- **Relative units for text** — `rem` for layout, `em` for component-
  local scaling. Avoid `px` for font-size (breaks user's root-size
  zoom).

---

## 5. Layout primitives

### CSS Grid

- **Strength:** two-dimensional layouts with explicit track sizing.
  `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` is the
  canonical responsive card grid — no media queries, collapses
  gracefully from N columns to 1 as width shrinks.
- **This site:** grid-heavy pages (project index, logbook, notebooks)
  are the natural home for `auto-fit`/`auto-fill` + `minmax()`.
  Desktop-first grid definitions usually need no mobile-specific
  override if they use `minmax()`.
- **MDN:** <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout>

### Flexbox

- **Strength:** one-dimensional layouts, distributing space along a
  single axis. Nav bars, toolbars, card internals.
- **Wrap behavior:** `flex-wrap: wrap` + `flex: 1 1 <basis>` gives
  content-driven wrapping without media queries.
- **Gotcha:** Flexbox's sizing algorithm is harder to reason about
  than Grid's; use Grid when you have a 2D layout, Flex for 1D.

### Subgrid

- **Purpose:** a nested grid aligns to the parent's tracks. Solves the
  "card title / body / footer align across sibling cards" problem that
  required matched track counts or JS before.
- **Support:** Baseline Newly Available (Firefox 71, Safari 16, Chrome
  117). Safe for 2026 unless the design supports very old Android
  WebViews (Task 03 should set the browser support matrix).
- **MDN:** <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid>

### `aspect-ratio`

- **Purpose:** declare a box's width-to-height ratio without the old
  "padding-bottom hack." Reserves layout space before an image loads
  — prevents CLS.
- **Use with:** `<img>` for hero and card thumbnails, iframes,
  placeholder boxes.
- **Pairs with:** `object-fit: cover | contain` for how content fills
  the reserved box.
- **MDN:** <https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio>

### Logical properties

- **Purpose:** flow-relative replacements for physical directions.
  `margin-inline-start` instead of `margin-left`, `padding-block` for
  top-and-bottom, `inset-inline` for left-and-right positioning, etc.
- **Why now:** works for LTR/RTL without overrides, and aligns with
  the writing-mode axes. Even for an English-only portfolio, logical
  properties document intent ("space along the reading axis") instead
  of direction.
- **Current site:** all physical. Migration is mechanical but
  touch-wide; do it opportunistically when a file is already being
  edited, not as a blocking pass.
- **MDN:** <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values>

### What collapses well from multi-column to single-column

| Pattern | Collapse behavior |
|---|---|
| CSS Grid with `minmax()` + `auto-fit` | Automatic. N cols → 1 col without a media query. **Best.** |
| Flexbox row with `flex-wrap: wrap` | Good, but items may sit at odd widths between wraps. |
| Fixed two-column grid (`grid-template-columns: 1fr 1fr`) | Needs a media query to swap to `1fr`. |
| Sidebar + main using grid | Breakpoint-driven swap to stacked; subgrid helps keep type scale aligned. |
| Fixed-position overlay (the SNN panel) | Doesn't "collapse" — needs a mobile strategy: bottom sheet, full-screen toggle, or hidden-on-small. Task 01 (UI conventions) will settle this. |
| Floating table of contents | Usually collapses to a top-of-page summary or a "jump to" menu on mobile. |
| Data tables | Poor collapse — either horizontal scroll, responsive table plugin, or "cards on mobile" transformation. |
| Multi-column text (CSS columns) | Set `columns: <min-width>` so it drops to one column below threshold automatically. |

### The overlay-panel question (SNN)

The site's SNN panel is `position: fixed`. On desktop it floats. On
mobile the relevant choices are:

- **Bottom sheet** (Material / iOS bottom-sheet pattern) — swipe-up,
  partial peek. Needs JS or the upcoming CSS-only
  `::backdrop` + `<dialog>` approach.
- **Full-screen modal** triggered by a button — simpler, fewer edge
  cases.
- **Inline below content** — move it out of the overlay into normal
  flow under a heading, not shown on desktop. Simplest, loses the
  "floating instrument" metaphor.
- **Hidden on small** with a pointer to the desktop experience —
  worst accessibility outcome; avoid.

Defer the pick to task 01/06.

---

## 6. Viewport meta and zoom

### The correct defaults

```
<meta name="viewport" content="width=device-width, initial-scale=1">
```

- `width=device-width` — use the device's CSS-pixel width as the
  viewport width. Without this, mobile browsers render at the legacy
  ~980px fallback and zoom out.
- `initial-scale=1` — set initial zoom to 1.0 (no auto-zoom-out on
  load).
- MDN reference: <https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag>

The current `BaseLayout.astro` line 12 and `content-rated.astro` line
5 both use exactly this — the safe baseline. No change needed for
task 04 itself.

### Why `maximum-scale=1` is an accessibility footgun

- Setting `maximum-scale=1` (or `user-scalable=no`) prevents the user
  from pinch-zooming. Low-vision users rely on zoom to read.
- **WCAG 2.2 §1.4.4 Resize Text (AA)** requires content to be
  resizable up to 200% without loss of content or function. Disabling
  zoom typically violates this.
  <https://www.w3.org/TR/WCAG22/#resize-text>
- iOS Safari historically ignored `user-scalable=no` because Apple
  categorized it as an a11y regression. Treat its ignorability as an
  implementation detail, not permission to include the attribute.
- Practical rule: **never include `maximum-scale` or `user-scalable`
  in the viewport meta** unless an accessibility audit explicitly
  signs off on a narrowly-scoped exception (rare — usually a
  fixed-size interactive canvas, and even then `touch-action` is a
  better tool).

### When to touch the viewport meta

- `viewport-fit=cover` (§7) — opt into edge-to-edge layout under
  notches; required for `env(safe-area-inset-*)` to report real
  values on iOS. Adds to the meta string, not a replacement:
  `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- `interactive-widget=resizes-content` (Chrome) — controls whether
  the virtual keyboard resizes the visual viewport, the layout
  viewport, or neither. Relevant only if the site grows a text-entry
  surface.
- Otherwise: leave it alone.

### Auto-zoom on input focus (iOS)

- iOS Safari auto-zooms when a form input with `font-size < 16px`
  receives focus. The fix is content: set input font-size to
  `>= 16px`, not a viewport-meta workaround.
- Task 02 (typography) inherits this constraint for form controls
  if/when the site gains a form.

---

## 7. Safe areas and notches

### iOS

- Since iOS 11 and the iPhone X, the viewport can extend under the
  status bar, the home indicator, and (in landscape) the side
  notches. Apple exposes safe-area insets as CSS `env()` values:
  `env(safe-area-inset-top)`, `-right`, `-bottom`, `-left`.
- **Precondition:** `viewport-fit=cover` on the viewport meta. Without
  it, iOS letterboxes the content and `env()` reports 0.
- **Pattern:** add insets to padding on elements that touch edges —
  fixed headers, bottom nav bars, full-bleed hero sections.
  ```
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  ```
- **With fallback:**
  `padding-bottom: max(1rem, env(safe-area-inset-bottom));`
- Apple HIG — "Layout" and "Designing for iOS."
  <https://developer.apple.com/design/human-interface-guidelines/layout>

### Android

- Pre-Android 15: edge-to-edge was opt-in; status bar and gesture
  navigation area were usually excluded from the web viewport, so
  safe-area issues were mostly an iOS concern.
- Android 15+: apps are edge-to-edge by default. The Chrome web
  viewport behavior depends on the Chrome version's safe-area
  support. `env(safe-area-inset-*)` works on Chrome for Android 69+
  where edge-to-edge applies.
- **Display cutouts (punch holes, notches).** Android exposes cutout
  info to the system; for web content, Chrome maps it to the same
  `env()` tokens as iOS. Site-side code is usually portable — write
  once with `env()`, test on both.
- MDN: <https://developer.mozilla.org/en-US/docs/Web/CSS/env>

### Current site

- No `viewport-fit=cover` today. No uses of `env(safe-area-inset-*)`.
- Consequence: if the mobile redesign introduces a fixed bottom nav
  or a sticky header, those elements currently have nothing defending
  against notches/home-indicator overlap. Add insets before shipping.

---

## 8. Orientation

### WCAG 2.2 §1.3.4 Orientation (AA)

> Content does not restrict its view and operation to a single display
> orientation, such as portrait or landscape, unless a specific
> display orientation is essential.
> <https://www.w3.org/TR/WCAG22/#orientation>

- **Essential** is narrow — check-scanning, piano apps, specific
  instruments. A portfolio site is **not** essential-orientation.
- Locking to portrait (via CSS `@media (orientation: landscape) {
  body { display: none } }` or similar hostile patterns) is a direct
  §1.3.4 violation and also breaks users with mounted devices,
  external keyboards, and landscape-preferring accessibility setups.

### Design-for-both as the default

- **Portrait** — the dominant phone holding position; optimize
  primary flows here.
- **Landscape** — users rotating to read, watch media, or fit a wide
  diagram. Typically less designed-for but **must still function**.
- **Landscape on phones** has a short viewport height; watch for:
  fixed headers that eat the viewport, modals that don't scroll, hero
  sections sized with `vh`.
- Use `@media (orientation: landscape)` sparingly — most orientation
  differences resolve themselves if the layout is already content-
  driven and uses `dvh`/`svh` instead of `vh`.

### Practical rules

- Don't lock orientation.
- Don't hide content in one orientation.
- Test landscape on a short-height phone viewport (iPhone SE
  landscape ≈ 667×375 CSS px) to catch vh-based bugs.
- For a grid page that looks thin in landscape phone, let the
  `auto-fit` grid stretch — one-wide in portrait, two-wide in
  landscape often falls out for free.

---

## 9. Print and reader-mode

### Current site print stylesheet

- Grep of `src/**` for `@media print` — **no matches.** The current
  site ships no print stylesheet.
- Consequence: printing (or "Save as PDF") uses the browser's default
  rendering of the desktop stylesheet. Depending on how fixed
  positioning and grid behave in the print context, the SNN overlay,
  LeftNav, and multi-column layouts may print badly.

### Is a print stylesheet worth preserving / adding

The question for this research doc is whether print is a target worth
designing for. Arguments on each side:

**For adding one:**
- The logbook and notebooks are long-form content that a reader might
  legitimately print or PDF for offline reading, review, or sharing.
- A minimal print CSS (hide nav, hide overlay, widen measure, ensure
  black-on-white, strip background images) is cheap and principled.
- Good print output is a signal of craft that fits the modern-retro
  spine.

**Against:**
- Zero current uptake signal (no complaint about printing because
  nobody is printing).
- Reader-mode browsers handle the "I want clean text" use case
  without a print stylesheet.
- Extra surface to maintain.

### Reader-mode implications

- Firefox Reader View, Safari Reader, Edge Immersive Reader all
  extract article content heuristically. They look for semantic HTML
  (`<article>`, `<main>`, clean heading hierarchy, `<figure>`,
  `<time>`), good text-to-boilerplate ratio, and reasonable
  `<meta>`/OpenGraph.
- A site that's semantic already "works" in reader mode without
  explicit design — reader mode is a free responsive layer.
- Things that break reader mode: content inside `<div>` soup, nav
  links mixed into the content block, inlined chrome that the
  extractor can't separate.
- **The cheapest print story is: make reader-mode work well.** A
  print stylesheet is then almost redundant, because readers who
  want clean text use reader mode, and browsers' "Print" action
  from reader view produces clean output.

### Print-specific CSS primitives (for reference)

- `@media print { … }` — the whole block.
- `page-break-before`, `page-break-after`, `page-break-inside:
  avoid` — control where pages break. Modern names: `break-before`,
  `break-after`, `break-inside`.
- `@page { margin: … }` — control page margins.
- `print-color-adjust: exact` (new) — force dark-mode backgrounds to
  render as designed instead of being stripped. Usually want the
  default (strip) for ink economy.
- MDN: <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/print>
- MDN: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_paged_media>

### Decision deferred

This doc doesn't pick print policy. Candidate positions for task 04
synthesis: (a) no print stylesheet, lean on reader mode; (b) minimal
print stylesheet for logbook/notebook single-entry pages only;
(c) full print stylesheet across the site. All three are defensible;
(b) has the best cost/benefit for a content-heavy portfolio and
aligns with the retro-craft spine.

---

## 10. WCAG 2.2 responsive-adjacent requirements

Beyond §1.3.4 Orientation (§8) and §1.4.4 Resize Text (§6), the main
cross-cutting SC is **§1.4.10 Reflow (AA)**: content must reflow to
**320 CSS px** wide without horizontal scroll, except for essential 2D
content (maps, data tables, code listings, complex diagrams). <https://www.w3.org/TR/WCAG22/#reflow>

- Use iPhone SE 1 (320 CSS px) as the narrowest test target, not the
  latest phone.
- Essential 2D content is exempt but should isolate horizontal
  scroll on the block (code, table), not the page.
- Related: §1.4.12 Text Spacing (Task 02), §2.5.8 / §2.5.5 Target Size (Task 01).

---

## 11. Sources

- Marcotte, "Responsive Web Design," *A List Apart* #306, 2010. <https://alistapart.com/article/responsive-web-design/>
- Wroblewski, *Mobile First*, A Book Apart, 2011. <https://www.abookapart.com/products/mobile-first>
- Google Search Central — Mobile SEO overview, responsive, dynamic serving, separate URLs, mobile-first indexing. <https://developers.google.com/search/mobile-sites/mobile-seo>
- web.dev — Learn Responsive Design (incl. Breakpoints, Macro Layouts), The New Responsive, Viewport Units. <https://web.dev/learn/design/> · <https://web.dev/blog/new-responsive> · <https://web.dev/blog/viewport-units>
- MDN — Viewport Meta, CSS Grid, Subgrid, `aspect-ratio`, Container Queries, Logical Properties, `env()`, `@media/print`, viewport-percentage lengths.
- WCAG 2.2 — §1.3.4 Orientation, §1.4.4 Resize Text, §1.4.10 Reflow, §1.4.12 Text Spacing, §2.5.8 Target Size Minimum. <https://www.w3.org/TR/WCAG22/>
- Apple HIG — Layout. <https://developer.apple.com/design/human-interface-guidelines/layout>


## Open questions

These hand off to task 04 *Decisions* (after 01–06 synthesis) and/or
implementation planning:

1. **Mobile-first conversion strategy.** All-at-once inversion of
   existing `max-width` queries vs opportunistic conversion when a
   file is already being touched. What's the cost of the in-between
   state?
2. **Breakpoint count and values.** Content-driven, discovered by
   resizing the live site — deferred until tasks 01/02/06 confirm
   typography scale, component inventory, and Astro page structure.
   Candidate skeleton: small / medium / large, plus optional
   ultrawide. Concrete numbers: not yet.
3. **Container queries for the SNN overlay and InstrumentPanel.**
   These components live in different page contexts — the overlay is
   fixed to the viewport, the instrument panels are inline. Does
   `@container` buy meaningful simplification over `@media` here, or
   is it ceremony?
4. **SNN overlay mobile strategy.** Bottom sheet vs full-screen
   modal vs inline vs hidden. Blocks task 01 (UI conventions) more
   than task 04.
5. **`viewport-fit=cover` opt-in.** Needed only if the mobile
   redesign introduces edge-touching elements. Otherwise leave the
   current meta untouched.
6. **Print stylesheet policy.** None vs minimal-per-entry vs
   full-site. Lean toward minimal for logbook and notebook single
   pages; confirm with task 02 (typography will dictate print font
   stack and measure).
7. **`vh` → `dvh` migration.** Grep current `vh` uses (expected
   zero based on spot-check of `theme.css`, to confirm during
   implementation). If any, they need `dvh`/`svh`/`lvh` review for
   iOS toolbar behavior.
8. **Logical-properties migration.** Blanket sweep vs opportunistic.
   No functional benefit for English-only portfolio; the benefit is
   intent-documentation and future-proofing. Probably defer.
9. **Reflow at 320 CSS px.** Which current pages fail WCAG §1.4.10
   at 320? Data tables in logbook entries, code blocks in notebooks,
   and the project grid are the likely offenders. Audit belongs in
   implementation, not research.
10. **Landscape phone viewport height.** Does the current fixed
    header / overlay pattern leave enough vertical room in landscape
    on a short phone? Test at iPhone SE landscape (375×667 rotated)
    during implementation.
11. **Orientation change transition.** Should rotating the device
    re-animate layout, or snap? WCAG §1.3.4 says don't lock, but
    doesn't mandate animation behavior. Defer to task 01.
12. **Baseline browser support matrix.** Subgrid, container queries,
    and `dvh` are all Baseline recently. Task 03 (performance /
    browser budget) should fix the support floor before task 04
    commits to these primitives.
