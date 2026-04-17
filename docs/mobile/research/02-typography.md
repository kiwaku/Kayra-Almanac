# 02 — Typography (Mobile Redesign Research Track)

Scope: survey the option space for mobile typography on `kayra-almanac`. This
doc does **not** pick the final scale, measure, or palette — it lays out the
constraints, the canonical sources behind them, and the tradeoffs so the
*Decision* step later can be made with full context.

Current state (for grounding only — see `src/styles/theme.css`):

- Body: `Arial, Helvetica, sans-serif`, 16px, line-height 1.35, color `#111`
  on `#fff` (or near-white).
- Headings: italic + bold, 18/20/24px, line-height 1.2–1.25.
- Mono: Courier-family (via `--mono`), 11–13px, used for labels, timestamps,
  kbd, code.
- Links: `#0000EE` (unvisited), `#0000CC` (hover), `#551A8B` (visited).
- Measure: desktop content column ~880px. No mobile-specific overrides yet
  beyond generic `max-width` behaviour.
- Font smoothing: `-webkit-font-smoothing: none` (deliberate — reinforces
  early-2000s rendering, but has mobile implications, see §6).

Spine: modern-retro hybrid. "Academic 2003" is the aesthetic target; "readable
on a 2024 phone" is the functional floor. This doc is the bridge.

---

## 1. Readable font size on mobile

### Platform minimums

| Platform / spec | Recommended min body size | Notes |
|---|---|---|
| Apple HIG (iOS) | 17pt default body; 11pt absolute floor for secondary text | HIG "Typography" §Dynamic Type — sizes in pt, 1pt ≈ 1.333 CSS px on standard density. 17pt ≈ 22–23 CSS px at `@3x`, but in CSS terms iOS system body resolves to ~17px. |
| Material 3 (Android) | `body-large` 16sp, `body-medium` 14sp, `body-small` 12sp | sp respects user font-scale. 12sp is for metadata only. |
| WCAG 2.2 | No fixed px minimum. §1.4.4 Resize Text (AA) requires 200% zoom without loss of content/function; §1.4.12 Text Spacing (AA) requires survival under author-applied spacing changes. | WCAG deliberately avoids a numeric minimum — but the resize/spacing rules implicitly reward larger baselines. |
| NN/g guidance | 16px is the practical floor for sustained reading on mobile. | "Legibility, Readability, and Comprehension" — NN/g repeatedly flags sub-16px body as the #1 mobile usability regression. |
| iOS Safari auto-zoom | If any form `<input>` font-size is <16px, Safari auto-zooms on focus. | MDN notes this; it's a hard behavioural constraint for forms. |

### When 16px is enough

- Primary running prose on a well-proportioned column with `line-height ≥ 1.4`
  on a clean sans (Arial, system-ui, SF, Roboto).
- When the user's browser/OS font-scale is untouched (true for the majority
  but not all visitors — dynamic type users may scale 120–200%).
- Short reading sessions — a gallery label, a caption, a nav item.

### When 16px is *not* enough

- Extended reading (>500 words / page) on a 4.7" phone held at 35 cm — NN/g
  notes comprehension drops vs 17–18px in longitudinal reading tests.
- When the typeface has a small x-height (Courier, some grotesks) — the
  *apparent* size is smaller than the em size suggests. Bringhurst's
  *Elements* §3.1 makes this point: the eye reads x-height, not cap-height
  or em.
- Italic-heavy display (current headings are italic + bold) — italic Arial
  on a 320px viewport at 16px is measurably harder to parse than upright.
- Outdoors / low-light — iOS Dynamic Type exists because users *already*
  scale up in those conditions. Clamping the user's scale (via `viewport`
  `maximum-scale` or non-rem units) blocks that coping strategy.

### Unit choice

- `px` — predictable, ignores user default-size preference. Accessibility
  regression risk if used for body.
- `rem` — scales with the user's browser-root font size (default 16px, but
  users can change it). Preferred for body per MDN & WCAG community
  consensus.
- `em` — scales with parent; useful for component-internal proportions,
  dangerous for global scale (compounding).
- `sp` (Android-only token) — not a CSS unit. Mentioned for cross-platform
  literacy; the web analog is `rem` + `text-size-adjust`.

### `-webkit-text-size-adjust`

- Chrome/iOS Safari apply an auto-inflation to text on sites that *look*
  unresponsive (no viewport meta, or small fixed layouts). Setting
  `-webkit-text-size-adjust: 100%` disables this — desirable when the site
  *is* responsive.
- `none` is an accessibility footgun: blocks iOS dynamic-type. MDN warns
  against it explicitly.

### Sources

- Apple HIG — Typography: <https://developer.apple.com/design/human-interface-guidelines/typography>
- Material 3 type scale: <https://m3.material.io/styles/typography/type-scale-tokens>
- WCAG 2.2 §1.4.4 Resize Text: <https://www.w3.org/TR/WCAG22/#resize-text>
- WCAG 2.2 §1.4.12 Text Spacing: <https://www.w3.org/TR/WCAG22/#text-spacing>
- NN/g, "Legibility, Readability, and Comprehension": <https://www.nngroup.com/articles/legibility-readability-comprehension/>
- MDN, `font-size`: <https://developer.mozilla.org/en-US/docs/Web/CSS/font-size>
- MDN, `-webkit-text-size-adjust`: <https://developer.mozilla.org/en-US/docs/Web/CSS/text-size-adjust>
- Bringhurst, *The Elements of Typographic Style* (4e), §3 "Harmony & Counterpoint" — x-height and apparent size.

---

## 2. Line length and measure

### The canonical numbers

| Source | Recommendation | Unit |
|---|---|---|
| Bringhurst, *Elements* §2.1.2 | 66 characters "is widely regarded as ideal", 45–75 acceptable for single-column, 40–50 for multi-column | characters including spaces |
| Tufte (by practice, not quote) | ~65 CPL at reading distance, with generous margins for side-notes | characters |
| web.dev "Line length" | 45–75 CPL; use `ch` unit or `max-inline-size` | characters |
| NN/g "Line Length" | 50–75 CPL preferred; explicit finding that extremely short lines (<40) hurt as much as long (>90) by breaking rhythm | characters |
| Material 3 | "Text blocks ≤ 120 characters on large screens; ≤ 40 on small screens" — note the lower mobile bound | characters |
| WCAG 2.2 | No direct CPL minimum, but §1.4.8 Visual Presentation (AAA) caps **width at 80 characters (40 for CJK)** and forbids full-justification | characters |

### The narrow-viewport problem

- A 320px viewport (iPhone SE) with 16px Arial body and default letter-spacing
  fits roughly **30–40 CPL** before side padding. That's already *below*
  Bringhurst's floor.
- A 428px viewport (iPhone Pro Max, landscape-ish phones) fits ~45–55 CPL —
  comfortably inside the 45–75 band.
- Shrinking the font to increase CPL is the wrong lever on mobile; the
  correct lever is accepting a narrower CPL and compensating with generous
  line-height + paragraph rhythm.
- Hyphenation (`hyphens: auto` + `lang` attr on `<html>`) buys back CPL
  stability on narrow viewports by eliminating the long-word ragged tail.

### Mapping 880px desktop → mobile

Current desktop measure is ~880px, which at 16px Arial is ≈ 105–110 CPL —
already *above* Bringhurst's ceiling. The desktop measure is therefore the
first thing to re-examine, regardless of mobile.

| Viewport | Target CPL | Implied column width at 16px Arial |
|---|---|---|
| 320px | 35–45 | full width minus ~16–24px side padding |
| 375px | 40–50 | ~330–350px column |
| 428px | 50–60 | ~380–400px column |
| 768px (tablet) | 55–70 | ~560–620px column |
| 1024px+ | 60–75 | ~640–720px column (narrower than current 880px) |

### Mechanisms

- `max-inline-size: 65ch` — logical-property version of `max-width`, uses the
  `0` glyph width of the element's font. Modern, RTL-safe, recommended by
  MDN for prose.
- `max-width: 40rem` — font-agnostic, scales with root. Less tied to glyph
  width.
- Fluid container queries — size the measure to the container, not the
  viewport. Overkill for a mostly single-column SSG site but relevant if
  sidebars return.

### Justification & alignment

- Left-align (ragged right) is the web default and NN/g's recommendation on
  mobile. Full-justification on narrow columns opens "rivers" of whitespace,
  especially without hyphenation, and WCAG 2.2 §1.4.8 forbids it at AAA.
- Centered body prose is rare for a reason: the ragged *left* edge slows
  eye return-sweep. Fine for 1–3 line display text; bad for paragraphs.

### Sources

- Bringhurst, *Elements* §2.1.2 "Choose a comfortable measure".
- web.dev, "Line length": <https://web.dev/learn/design/typography/#line-length>
- NN/g, "Line Length Redux": <https://www.nngroup.com/articles/line-length-readability/>
- Material 3, type overview: <https://m3.material.io/styles/typography/overview>
- WCAG 2.2 §1.4.8 Visual Presentation (AAA): <https://www.w3.org/TR/WCAG22/#visual-presentation>
- MDN, `max-inline-size`: <https://developer.mozilla.org/en-US/docs/Web/CSS/max-inline-size>
- MDN, `hyphens`: <https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens>
- Tufte CSS (reference implementation): <https://edwardtufte.github.io/tufte-css/>

---

## 3. Line-height and vertical rhythm

### The 1.4–1.6 band

- web.dev typography course recommends **1.5** as the default body
  line-height; sharpens to 1.2–1.3 for display sizes.
- WCAG 2.2 §1.4.12 Text Spacing requires that text remains readable when a
  user applies **line-height at least 1.5× font-size** via their own CSS /
  reader mode. Authors must not break under that override — but the default
  need not be 1.5.
- Bringhurst §2.2.1 "Choose a basic leading" recommends leading **proportional
  to measure and x-height**. Long measures (wide columns) *need* more
  leading; narrow measures need less.
- NN/g consistently reports 1.5 ± 0.1 as the comfort band for mobile body.

### Why the site's current 1.35 is aggressive for mobile

- 1.35 is a "newspaper-dense" leading — appropriate for short desktop
  columns at 880px, less comfortable at 320px with italic headings and
  variable line-ending rag.
- Arial at 16px has a taller x-height than, say, Georgia at the same em,
  which actually *increases* the need for leading — taller lowercase = more
  vertical ink per line.

### Vertical rhythm

- Traditional "every element aligns to a baseline grid" rhythm (Robert
  Simmons, 24 Ways) is hard on the web and loses value on mobile where
  reflow constantly disrupts it.
- Softer rhythm: pick a **base leading** (e.g., body line-height ≈ 1.5),
  make every vertical spacing token (margin, heading top-space) a multiple
  of the base. Doesn't require pixel-grid alignment, but preserves the
  "settled" feel.

### Heading leading

- Display sizes need tighter line-height than body — Material 3, Apple HIG,
  and Bringhurst agree. Current 1.2–1.25 for h1–h3 is consistent with best
  practice.
- Italic-bold headings at 1.25 on 2+ line wraps (likely on narrow
  viewports) can clash with descender overlap; test at 320px with long
  titles.

### Paragraph spacing vs indent

- Two classic patterns for paragraph separation: **blank line** (web default,
  `margin-block`) or **first-line indent** (print tradition; Tufte uses it).
- Tufte CSS uses indent + no margin; that reads as "literary". Bringhurst
  §2.3.4 prefers indent over blank line for continuous prose; blank line
  for "fragmentary" text. The retro-academic spine arguably calls for
  indent, *but*:
  - First-line indent on mobile with ragged-right paragraphs can look
    accidental on very short paragraphs.
  - Screen readers and copy-paste don't care either way.

### Sources

- web.dev "Line height": <https://web.dev/learn/design/typography/#line-height>
- WCAG 2.2 §1.4.12: <https://www.w3.org/TR/WCAG22/#text-spacing>
- Bringhurst §2.2 "Rhythm and Proportion".
- NN/g "Line Spacing": <https://www.nngroup.com/articles/text-scannability/>
- MDN `line-height`: <https://developer.mozilla.org/en-US/docs/Web/CSS/line-height>

---

## 4. Font loading

### System fonts vs webfonts

| Approach | Pros | Cons |
|---|---|---|
| System stacks (`-apple-system`, `system-ui`, `Segoe UI`, Roboto, etc.) | Zero bytes, zero FOUT/FOIT, native Dynamic Type support, consistent with OS. | Different shapes per OS — cannot guarantee exact look. "Modern" feel, harder to hit "2003 academic". |
| Named system stacks with `Arial, Helvetica, sans-serif` (current approach) | Still zero bytes. Arial/Helvetica on iOS and Android both resolve to Arial or close equivalent — very consistent. Matches the 2003 aesthetic. | Boring on purpose; no distinctive character. Fine if boring is the point. |
| Self-hosted webfont (subsetted, `.woff2`) | Full control over personality. Can hit specific retro revivals. | Bytes (typically 15–40 KB per weight subsetted). FOUT/FOIT risk. Needs CDN or build pipeline. |
| Google Fonts / provider-hosted | Fast CDN, caching. | Third-party request; privacy concerns; no longer shared-cache across origins (modern browsers partition cache). |

Given the "512 KB club" adjacency and the fact that the site's current spine
is Arial / Courier, the **default should stay system**, with any webfont
decision needing a specific justification (e.g., a single retro heading
face).

### FOUT / FOIT / FOFT

- **FOIT** (Flash of Invisible Text) — browsers waiting up to 3 s for a
  webfont and rendering nothing. Chrome's default was FOIT-then-swap for
  years; now generally 3 s invisible → swap to fallback.
- **FOUT** (Flash of Unstyled Text) — fallback renders immediately, then
  swaps to the webfont when loaded. Preferred on mobile because the user
  can *start reading*.
- **FOFT** (Flash of Faux Text) — load a Roman webfont first, defer bold/
  italic; faux-style them in the interim. Optimisation only worth it for
  multi-weight webfont sites.

### `font-display`

| Value | Behaviour | Best for |
|---|---|---|
| `auto` | UA-defined. Usually FOIT-like. | Avoid — unpredictable. |
| `block` | Short block period (~3 s), then swap. Most FOIT-like. | Branded hero text where fallback is unacceptable. |
| `swap` | Fallback immediately; swap when webfont loads. | Body text on slow networks (mobile default recommendation). |
| `fallback` | Very short block (~100 ms), short swap window (~3 s), then give up. | Compromise between `block` and `swap`. |
| `optional` | Very short block (~100 ms). If not loaded, use fallback for the rest of the page load. Webfont used on *next* navigation. | Self-hosted webfonts on unknown networks — best-effort delivery. |

### Subsetting & preloading

- Subset to Latin-1 or even tighter (ASCII + needed punctuation) unless the
  content includes extended sets. A full webfont is often 80–200 KB; a
  Latin-1 subset, 20–40 KB; an ASCII subset, 8–15 KB.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` — moves
  the webfont fetch up in the waterfall. Only preload the single most
  above-the-fold face; preloading everything negates the benefit.
- `unicode-range` on `@font-face` lets the browser skip downloading a face
  if no glyphs from that range are used on the current page.

### Mobile-network reality

- P75 mobile networks globally are still sub-5 Mbps with >200 ms RTT on
  cold cache. Every webfont face is an additional render-blocking or
  swap-causing asset.
- web.dev's "Optimize web fonts" guide: prefer `font-display: swap` +
  preload + subset. Set a **`size-adjust`, `ascent-override`,
  `descent-override`** on the fallback `@font-face` to minimise CLS when
  the swap happens.

### Font smoothing

- `-webkit-font-smoothing: none` (current setting) turns off subpixel
  antialiasing on macOS/iOS Safari. Deliberate retro effect; **does not
  affect Android/Chrome** (which ignores the property). This means iOS
  visitors see chunky aliased text, Android visitors see normal
  antialiased text — rendering already diverges by platform.
- At 16px Arial, `none` is legible on Retina displays but noticeably
  spikier than default; at 11–13px mono, it gets pixelated enough that
  NN/g's "legibility floor" concerns kick in.
- Revisit whether `none` is applied globally or scoped (e.g., only to
  headings) as part of the retro-modern balance.

### Sources

- web.dev "Optimize web fonts": <https://web.dev/articles/optimize-webfont-loading>
- web.dev "Reduce web font size": <https://web.dev/articles/reduce-webfont-size>
- MDN `font-display`: <https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display>
- MDN `@font-face` `unicode-range`: <https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range>
- MDN `size-adjust` / fallback metrics: <https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust>
- MDN `-webkit-font-smoothing`: <https://developer.mozilla.org/en-US/docs/Web/CSS/font-smooth>
- Smashing Magazine "A Guide to font-display": canonical community reference.

---

## 5. Color & contrast

### WCAG thresholds

| Level | Text type | Min contrast ratio |
|---|---|---|
| AA | Normal (<18pt or <14pt bold) | 4.5:1 |
| AA | Large (≥18pt or ≥14pt bold) | 3.0:1 |
| AA | UI components & graphical objects (§1.4.11) | 3.0:1 |
| AAA | Normal text | 7.0:1 |
| AAA | Large text | 4.5:1 |

"18pt" in CSS terms is ~24px; "14pt bold" is ~18.66px bold. Body at 16px is
firmly "normal text".

### The site's current palette, checked

| Pair | Approx. ratio | AA normal (4.5) | AA large (3.0) | AAA (7.0) |
|---|---|---|---|---|
| `#111` on `#fff` | ~19.3:1 | ✅ | ✅ | ✅ |
| `#0000EE` on `#fff` | ~8.6–9.4:1 (blue-blue, low-luminance) | ✅ | ✅ | ✅ |
| `#0000CC` (hover) on `#fff` | ~10–11:1 | ✅ | ✅ | ✅ |
| `#551A8B` on `#fff` | ~9.3–9.8:1 | ✅ | ✅ | ✅ |
| `#0000EE` on `#551A8B` (link next to visited link, *unlikely pairing*) | ~1.1:1 | ❌ | ❌ | ❌ |
| `#444` muted on `#fff` | ~9.7:1 | ✅ | ✅ | ✅ |
| `#2f8f2f` ok-green on `#fff` | ~3.8:1 | ❌ (normal) | ✅ | ❌ |
| `#b33a3a` err-red on `#fff` | ~5.1:1 | ✅ | ✅ | ❌ |

Values above are approximate — **verify with axe-core or the Chrome
DevTools contrast picker in the validation phase**, because:

- Actual background is rarely pure white on mobile (OS dark-mode filters,
  user OS contrast settings, glare).
- Sub-pixel rendering changes perceived contrast on OLED.

Takeaways:

- The Netscape-era link palette (`#0000EE` / `#551A8B` on white) is
  **contrast-rich by accident** — the blues and purples used in 1995 were
  chosen for CRT legibility and they happen to pass AA and AAA today.
- The status colors (`#2f8f2f`, `#b33a3a`) sit closer to the AA line and
  should be audited when they appear on body-size text.

### Link differentiation

- WCAG §1.4.1 Use of Color (A) requires that link state isn't communicated
  **by color alone**. Underline (current behaviour, browser default) is
  the canonical additional cue.
- Visited vs unvisited: preserving the classic differentiation (blue vs
  purple) is historically meaningful for a "2003 academic" feel **and**
  improves wayfinding on content-heavy sites (NN/g has cited this in
  multiple studies).
- Hover/focus states must meet §1.4.11 Non-text Contrast (3:1) relative to
  the resting state. Going from `#0000EE` to `#0000CC` gives ~1.2:1 change
  — **visually too subtle as the sole cue**. Pair with underline weight,
  background, or a focus ring.

### Touch-target-adjacent colors

- WCAG 2.2 §2.5.8 Target Size (Minimum) requires 24×24 CSS px for most
  controls. This is physical geometry, not color, but the common mobile
  pattern of "dense inline links inside flowing prose" can violate the
  spacing exception.
- Color-wise, the concern is that a tapped link's pressed state must
  remain AA against its background. On iOS, system tap highlight is a
  semi-transparent gray; overriding it with `-webkit-tap-highlight-color`
  to a brand color is fine *as long as* the text remains readable during
  the flash.

### Sources

- WCAG 2.2 §1.4.3 Contrast (Minimum): <https://www.w3.org/TR/WCAG22/#contrast-minimum>
- WCAG 2.2 §1.4.6 Contrast (Enhanced): <https://www.w3.org/TR/WCAG22/#contrast-enhanced>
- WCAG 2.2 §1.4.11 Non-text Contrast: <https://www.w3.org/TR/WCAG22/#non-text-contrast>
- WCAG 2.2 §1.4.1 Use of Color: <https://www.w3.org/TR/WCAG22/#use-of-color>
- WCAG 2.2 §2.5.8 Target Size (Minimum): <https://www.w3.org/TR/WCAG22/#target-size-minimum>
- MDN `-webkit-tap-highlight-color`: <https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-tap-highlight-color>
- NN/g "Guidelines for Visualising Links": <https://www.nngroup.com/articles/guidelines-for-visualizing-links/>
- WebAIM contrast checker: <https://webaim.org/resources/contrastchecker/>

---

## 6. Monospace use

### Why Courier on mobile is non-trivial

- iOS Safari resolves `Courier` → **Courier** (Adobe's original) or
  **Courier New** depending on version. Android resolves `Courier` →
  often nothing, falls through to **Droid Sans Mono** or **Roboto Mono**,
  which have very different proportions and x-height.
- `monospace` as a generic family renders as **Menlo** (iOS),
  **Droid Sans Mono / Roboto Mono** (Android), depending on version.
- The visible result: an 11px "Courier" label can render ~15% wider on iOS
  than Android because of glyph-width differences. Alignment in tabular
  data breaks.

### Stack options

| Stack | Rationale |
|---|---|
| `Courier, "Courier New", monospace` (current) | Prioritises 2003 fidelity. Android fallback to `monospace` produces visual drift. |
| `ui-monospace, Menlo, "Cascadia Mono", "Roboto Mono", Courier, monospace` | System-first modern stack. Looks current, consistent across platforms, loses "IBM Selectric typewriter" flavour. |
| `"Courier New", Courier, "Nimbus Mono", monospace` | Cross-platform Courier-family biasing. Still inconsistent vs. a self-hosted Courier subset. |
| Self-hosted Courier revival (e.g., IBM Plex Mono, JetBrains Mono, Space Mono) + `monospace` fallback | Pixel-consistent. Adds a webfont request — see §4 tradeoffs. |

### Size

- Mono glyphs are typically narrower *per character* but **visually heavier**
  due to uniform stem weight. A 13px mono feels like a 14–15px sans at
  comparable density.
- Dropping to 11px for chrome-level labels (timestamps, filenames) is
  legible on Retina but *dangerously small* on lower-DPI Android devices.
  iPhone SE (old) / budget Android are the worst case.

### Rendering

- Monospace at 11px with `-webkit-font-smoothing: none` produces visibly
  aliased output. Fine for retro chrome; bad for body-context code.
- Android ignores `-webkit-font-smoothing` entirely, so the same style
  rule produces different rendering per platform. Not a bug, but a
  design decision to surface.

### Use cases to disambiguate

| Context | Readability requirement | Notes |
|---|---|---|
| Inline `<code>` in prose | Must match surrounding body x-height and leading. | Size-adjusting mono `font-size: 0.9em` is common. |
| Code blocks (`<pre><code>`) | Needs horizontal scroll on narrow viewports; wrap vs scroll is a choice. | `overflow-x: auto` is standard; `white-space: pre-wrap` breaks long tokens. |
| UI labels (timestamps, IDs, kbd) | Usually small caps-style; OK at 11–13px if high-contrast. | This is the current site's dominant mono usage. |
| Numeric tabular data | Needs `font-variant-numeric: tabular-nums` to align columns. | Works with most mono fonts; also works with *some* proportional fonts. |

### Sources

- MDN `font-family` generic values (incl. `ui-monospace`): <https://developer.mozilla.org/en-US/docs/Web/CSS/font-family>
- MDN `font-variant-numeric`: <https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric>
- Apple HIG — System Fonts: <https://developer.apple.com/design/human-interface-guidelines/typography#System-fonts>
- Material 3 "code" role (informal): <https://m3.material.io/styles/typography/type-scale-tokens>

---

## 7. Fluid typography

### `clamp()` as the workhorse

- `clamp(MIN, PREFERRED, MAX)` resolves to `PREFERRED`, capped at `MIN`
  and `MAX`. The preferred value usually mixes `rem` and `vw`:
  `font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);`.
- Produces a linear curve between two viewport widths; the `MIN`/`MAX`
  clamp prevents unreadable extremes.
- Supported in all modern browsers (Chrome 79+, Safari 13.1+, Firefox 75+).
  No polyfill needed in 2024–2026.

### Viewport units alone: don't

- `font-size: 4vw` on its own scales linearly with viewport width. On
  320px it's 12.8px (too small); on 1920px it's 76.8px (absurd).
- Worse: pure `vw` sizes **ignore the user's browser zoom** in some
  browsers, breaking WCAG §1.4.4 Resize Text (AA). This is the classic
  fluid-type accessibility regression.
- The fix is `clamp(rem, rem + vw, rem)` — the `rem` components respect
  zoom, the `vw` only *modulates* the scale.

### Accessibility pitfalls

- **Zoom behaviour** — `clamp()` with rem/vw respects zoom correctly in
  modern Safari/Chrome/Firefox, but historical bugs mean testing at 200%
  zoom is non-optional.
- **User font-scale on iOS** — Dynamic Type scaling applies to `rem`-based
  sizes only if the site opts in (`@media (prefers-reduced-motion)` has
  no direct equivalent; `font` shorthand with `-apple-system-body` is
  the iOS-only route).
- **Reflow §1.4.10** — at 400% zoom on a 320px viewport (i.e., ~1280 CSS
  px of content in a 320 window), content must reflow without horizontal
  scroll. Fluid type helps; `vw` caps help more.
- Not every token should be fluid. Display headings benefit; body text
  usually wants a **fixed `rem` value** with only the measure adapting.

### Type scale strategies

| Strategy | Summary | Tradeoff |
|---|---|---|
| Static scale | Pick sizes at each breakpoint; discrete. | Predictable; lots of media queries. |
| Fluid per token | Every size is `clamp()`. | Smooth; can drift out of rhythm. |
| Hybrid | Body fixed, headings fluid. | Body ranks readability first; headings get expressiveness. |
| Modular scale (1.25× "Major Third", 1.333× "Perfect Fourth") | Multiplier-based tokens. | Consistent proportion; can feel rigid. |

web.dev's typography course and Utopia.fyi both recommend hybrid — fluid
display + static body — as the sweet spot for editorial/content sites.

### Example (illustrative, not to ship)

```css
/* Body: fixed for readability */
body { font-size: 1rem; line-height: 1.5; }

/* Heading: fluid between 320px (1.5rem) and 1200px (2.25rem) */
h1 {
  font-size: clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem);
  line-height: 1.2;
}
```

### Sources

- MDN `clamp()`: <https://developer.mozilla.org/en-US/docs/Web/CSS/clamp>
- web.dev "Fluid typography": <https://web.dev/articles/css-clamp-fluid-typography>
- WCAG 2.2 §1.4.10 Reflow: <https://www.w3.org/TR/WCAG22/#reflow>
- WCAG 2.2 §1.4.4 Resize Text: <https://www.w3.org/TR/WCAG22/#resize-text>
- Utopia.fyi (fluid type calculator / philosophy): <https://utopia.fyi/>
- Adrian Bece, "Modern fluid typography editor" (Smashing): canonical walkthrough.

---

## 8. Dark mode

### Should the 2003-academic look even have one?

Arguments for **no dark mode**:

- The aesthetic is `white paper + black ink + underlined blue links`.
  That's *the entire reference*. A dark skin negates the conceit.
- Netscape/Mosaic/early-2000s academic pages simply did not have dark
  modes. Offering one is a modernism leak.
- Less surface area to test, fewer WCAG pairs to verify.

Arguments for **yes dark mode**:

- `prefers-color-scheme` is a user accessibility + battery preference.
  Some users (OLED phone owners, vestibular / light-sensitive users) rely
  on it. iOS auto-applies it at sunset by default for many setups.
- NN/g: dark mode is a comfort preference; forcing light can cause eye
  strain in low-light environments on mobile.
- Astro SSG makes dual-palette output cheap; the cost is mostly design,
  not code.

Arguments for **conditional dark mode**:

- Honor `prefers-color-scheme: dark` with a reduced-fidelity "reader"
  skin rather than a full re-theme. Keep the retro-academic daytime look
  canonical; the dark skin is a grudging concession.
- Alternative: leave it to the browser's built-in reader mode. Safari
  Reader, Firefox Reader View, and Chrome's "auto dark mode for web
  content" will produce a serviceable dark skin without any author
  intervention.

### What retro-academic dark mode could look like

- **Amber-on-black / green-on-black** (DEC VT / Wyse terminal) — extreme
  retro, anachronistic (pre-web), legible. Contrast easily >15:1.
- **Warm cream on near-black** (`#e8dfc7` on `#1a1815`) — "old library
  after hours"; evokes aged paper under low light. Needs contrast
  verification (a warm off-white on a warm near-black can drop below AA
  if not chosen carefully).
- **System dark** (`#fff` on `#000`, or `#ccc` on `#111`) — safe,
  boring; hard to look "intentional".
- **Inverted with hue shift** — invert lightness but keep the 2003
  Netscape blues and purples for links, retaining the identity. The
  link colors `#0000EE` and `#551A8B` both have low luminance and
  therefore *fail* AA on dark backgrounds — they'd need lighter
  analogues (e.g., `#8ab4f8` for unvisited, `#c58af9` for visited;
  Chrome's own dark-mode link defaults point this way).

### Implementation vectors

| Vector | Pros | Cons |
|---|---|---|
| CSS custom properties + `prefers-color-scheme` media query | Zero JS, automatic. | No user override UI without JS. |
| `color-scheme` CSS property | Browser applies native dark scrollbar / form controls. | Doesn't re-theme your tokens. |
| `light-dark(lightVal, darkVal)` CSS function (2024+) | Clean token definitions. | Safari/Firefox support still catching up. Check Baseline status before shipping. |
| JS toggle + `data-theme` attribute | User override, respects system default. | Hydration / FOUC risk on SSG. |

### Contrast flips

The main body pair (`#111` on `#fff`) inverts cleanly to `#eee` on `#111`
and retains ~17:1 contrast. The link pair (`#0000EE`) does **not** invert
cleanly — it becomes near-unreadable on dark. Any dark mode must re-map
the link palette, not just swap body colors.

### Sources

- MDN `prefers-color-scheme`: <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme>
- MDN `color-scheme`: <https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme>
- MDN `light-dark()`: <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark>
- web.dev "Prefers color scheme": <https://web.dev/articles/prefers-color-scheme>
- NN/g "Dark Mode vs Light Mode": <https://www.nngroup.com/articles/dark-mode/>
- Chrome "Auto Dark Theme": <https://developer.chrome.com/blog/auto-dark-theme/>

---

## 9. Cross-cutting observations

- **The retro palette is already AA-compliant by historical accident** —
  the biggest palette risks are the status colors (green/red), not the
  link colors.
- **The biggest mobile reading risk is the 1.35 body line-height**, not
  the 16px body size — 16px is defensible; 1.35 on a 320px viewport with
  italic-bold headings will *feel* cramped even if measurements are fine.
- **The biggest mobile layout risk is the 880px desktop measure bleeding
  into narrower viewports as a fixed `max-width`** without an explicit
  mobile clamp; at 320px the current tokens produce ~30–40 CPL, which is
  *under* Bringhurst's 45 floor.
- **`-webkit-font-smoothing: none` creates iOS/Android rendering
  divergence** that the retro aesthetic may or may not want to own.
- **Mono at 11px is the most fragile token** on the site for mobile —
  Android rendering differs from iOS, and 11px + `font-smoothing: none`
  is near the NN/g legibility floor on non-Retina displays.

---

## Open questions

These are for the *Decision* step of the mobile redesign, not for this
research doc to answer:

1. **Is 16px body right, or should mobile bump to 17–18px?** Bringhurst
   would lean slightly larger for sustained reading on a narrow measure;
   Arial in particular has enough x-height that 16px is defensible.
2. **Keep the 1.35 body line-height, or relax to 1.5 on mobile only?**
   WCAG survives either; comfort favours 1.5. Does the academic-density
   feel survive a 1.5 leading, or does it start reading as a blog?
3. **What is the correct mobile measure?** 40–60 CPL maps to roughly
   320–420 CSS px of column on 16px Arial. The desktop 880px is already
   above Bringhurst's 75-CPL ceiling and may deserve its own revisit.
4. **Do we keep Arial as the body face, or is the retro-academic spine
   better served by Times/Georgia (serif academic) or a revival webfont
   (Computer Modern, Charter, Source Serif)?** Body-face change is the
   single largest lever; every other decision trails it.
5. **Keep `-webkit-font-smoothing: none` globally, scope it to headings,
   or remove it?** Global is aggressive on iOS; scoped preserves the
   retro flavour on display text without hurting body legibility.
6. **Italic-bold headings — keep on mobile?** Current h1–h3 are all
   italic + bold. Italic + bold + narrow viewport + long titles is the
   worst-case legibility scenario; options are (a) keep, accept the
   hit; (b) drop italic on mobile-only; (c) drop bold, keep italic for
   a more "handset to the typesetter" feel.
7. **Courier for labels: keep current stack, switch to modern `ui-monospace`
   stack, or self-host a retro revival?** The rendering drift between
   iOS Courier and Android monospace fallback is real and visible.
8. **Should mono labels at 11px stay at 11px, or mobile-bump to 12–13px?**
   NN/g legibility floor vs. dense information-chrome aesthetic.
9. **Any fluid scale at all, or a static mobile/desktop scale?** A site
   this small can probably get away with two static tiers and a single
   media query — simpler, easier to reason about, lower regression
   surface. Fluid helps between breakpoints but adds mental overhead.
10. **Dark mode: none, reader-only, or full dual theme?** If dual, the
    link palette must be remapped (classic Netscape blues fail AA on
    dark). If none, document the decision so it doesn't get re-litigated
    each time a user asks.
11. **Link hover-state color delta** — `#0000EE → #0000CC` is visually
    near-identical. Is a 4% lightness shift the intended signal, or is
    underline-weight / background the real cue?
12. **What about `font-variant-numeric: tabular-nums` on the
    dashboard-style data columns** (timestamps, frame indices, status
    codes)? Currently mono handles this incidentally; a proportional
    face with `tabular-nums` could free up that slot.
13. **Hyphenation (`hyphens: auto`) on mobile only?** On 320px viewports
    with long technical vocabulary, hyphenation meaningfully improves CPL
    stability. The cost is aesthetic — print-era hyphens read
    "typeset", which is on-spine, or "fussy", which is not.
14. **Does the site want an editorial serif tier at all** (e.g., for the
    almanac / long-form posts) distinct from the sans-serif UI tier?
    The current spine collapses both into Arial. A hybrid could keep
    Arial for chrome and introduce a serif for body prose, at the cost
    of one webfont.
