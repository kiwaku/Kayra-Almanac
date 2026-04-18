# 03 — Typography & Color (Mobile Redesign Decisions)

Scope: pick the typographic and color behaviors that apply to text rendered
inside the mobile measure. The measure itself is decided in doc 02
(`02-layout-and-chrome.md`); this doc only decides what the text inside that
measure looks like. Decisions 12 (webfont), 13 (dark mode), 14 (View
Transitions), and 16 (reduced-motion) live in doc 01. Breakpoints, viewport
meta, and chrome fates live in doc 02.

Inputs (research, already on main):

- `research/07-overview.md` §6 (the 16-item decision list) and §7 (this doc's
  scope: items 3, 4, 5, 15 plus contradictions #10 and #11).
- `research/02-typography.md` in full — the primary input. Current values
  cited at the top of 02 (body Arial 16px / 1.35 / `#111` on `#fff`;
  headings italic-bold 18/20/24px / 1.2–1.25; mono Courier 11–13px; links
  `#0000EE` / `#0000CC` / `#551A8B`; measure 880px;
  `-webkit-font-smoothing: none`).
- `research/01-ui-conventions.md` §1 (touch-target trio: 24 AA / 44 AAA /
  44 HIG / 48 Material), §4.5 (`:focus-visible` vs `:focus`), §5.3 (visual
  density decoupled from hit area).
- `research/05-retro-precedents.md` §2 (academic lineage), §7
  (density-preservation levers), §8 (conflicts with modern conventions).
- `research/04-responsive-foundations.md` §4 (fluid rules via `clamp()`).

Framing (from the user): *"I'll anyway need to see a mobile MVP before
making any concrete suggestions."* Every pick below optimizes for
MVP-simplest-viable. Knobs the MVP doesn't need are left at their current
value and flagged in **Opens**, not in the Decision line.

---

## Decision 3 — Touch-target floor

**Decision:** Hybrid. Inline links that flow inside prose meet the **WCAG
2.2 AA minimum of 24 × 24 CSS px** via the §2.5.8 inline / spacing
exception (they inherit line-height, and the rule says inline targets are
exempt from the 24 floor when constrained by surrounding line-height).
Every **standalone tap target** — nav items, buttons, icon-only affordances,
disclosure triggers, `<summary>` elements, "back to index" chips — meets
**44 × 44 CSS px** (HIG / WCAG 2.2 AAA).

**Alternatives considered:**

- **AA everywhere (24 px).** Retains maximum density but leaves standalone
  chrome uncomfortably small on first-time use.
- **AAA / HIG everywhere (44 px).** Simplest rule; fights retro density in
  inline linkrolls and ProofStrip-style runs (`05 §8.2` flags this as the
  unresolved conflict).
- **Material 3 everywhere (48 dp).** No advantage over 44 px for a static
  reading site; transitive over-compliance.

**Rationale:**

- `01 §1.3` and `01 §5.3` establish that visual density and hit area are
  independent — a small visible glyph can sit inside a padded 44 px hit
  region. That is what "standalone" targets get here.
- `01 §1.3` also cites the `§2.5.8` inline exception explicitly ("target
  is in a sentence or its size is otherwise constrained by the line-height
  of non-target text"). Inline prose links fall under it. No extra padding
  needed as long as line-height ≥ 1.4 on the paragraph they sit in
  (Decision 5 provides that on mobile).
- `05 §8.2` frames AAA-everywhere as a direct density fight and notes that
  the hybrid split is the reconciliation the literature already points at.
- `07 §6` item 3 lists exactly these three options; the hybrid is the only
  one that keeps both the retro linkroll and the modern standalone chrome
  within their respective literatures.

**Opens:**

- Which components actually qualify as "standalone" on mobile — the
  component inventory lives in doc 02. Any chrome piece that survives there
  inherits the 44 px rule from here.
- Whether to extend the 44 px rule to `ProofStrip` tokens or leave them at
  24-with-spacing. Deferred until the MVP shows whether ProofStrip is
  tappable on mobile at all.

---

## Decision 4 — Mobile body font size

**Decision:** **16 px, global.** Body stays at `1rem` (the root stays at
the browser default, i.e., 16 px). No mobile-only override. No bump to 17
or 18 px yet.

**Alternatives considered:**

- **Bump to 17–18 px on mobile only.** More comfortable for sustained
  reading per NN/g (`02 §1`, "16 px is the practical floor for sustained
  reading"). Rejected for MVP — splits rules across viewports with no
  evidence this site's posts are read for long stretches on a phone.
- **Bump to 17–18 px globally.** Simplifies the rule but rewrites the
  desktop look that is already defensible (`02 §1`).
- **Drop to 14 px (retro-faithful).** `05 §8.3` flags this as failing every
  modern baseline. Declined.

**Rationale:**

- `02 §1` — Arial has a tall x-height; 16 px Arial is defensible as
  "primary running prose" when line-height ≥ 1.4. Decision 5 provides
  that on mobile.
- `02 §9` explicitly says the biggest mobile reading risk is the 1.35
  line-height, not the 16 px size. Fix the leading (Decision 5); leave
  the em size.
- MVP framing: pick the smallest safe value that needs no future rollback.
  Bumping to 17–18 px is a one-line change if the phone test says so;
  pre-bumping before the user has seen a real phone is speculative.
- The root stays at `1rem = 16 px` so that any author who uses `rem`-based
  spacing inherits a mobile-sane scale without extra rules.

**Opens:**

- After the MVP lands on a real phone: does Arial 16 px at 320 px feel
  tight for long posts? If yes, bump body only (`html { font-size: 16px; }
  body { font-size: 1.0625rem; }` → 17 px) — one line, one place.
- Whether to add `font-size-adjust` (CSS) to normalize x-height across the
  Arial → Helvetica → fallback chain. Not needed for MVP; opens a
  rendering-consistency question the research didn't probe.

---

## Decision 5 — Mobile body line-height

**Decision:** Relax body line-height to **1.5 on mobile only**, scoped via
a single `@media (max-width: [mobile-threshold])` rule where
`[mobile-threshold]` is whatever doc 02 picks for its narrow-viewport
breakpoint. Desktop keeps its current **1.35** body leading. Headings keep
their **1.2–1.25**.

**Alternatives considered:**

- **Keep 1.35 site-wide.** Maximum density preservation. `02 §9` calls
  this "the single biggest mobile reading risk" on a 320 px viewport with
  italic-bold headings. Declined on comfort grounds.
- **Relax to 1.5 globally.** Simpler rule; changes the desktop rhythm the
  current site already reads well at. Overcorrects.
- **Middle value (~1.45) site-wide.** Splits the difference but neither
  preserves desktop density nor hits NN/g's mobile comfort band. Declined.

**Rationale:**

- `02 §3` — web.dev recommends 1.5 as the default body leading. NN/g's
  comfort band for mobile body is 1.5 ± 0.1.
- `02 §9` flags 1.35 on 320 px with italic-bold headings as the single
  largest mobile reading risk — the decision that moves the comfort
  needle the most for the smallest code change.
- `05 §7.1` prefers 1.25–1.4 as a density-preservation lever, but does
  so for desktop retro. Keeping 1.35 on desktop honors that; relaxing
  to 1.5 on mobile honors `02 §3`. No conflict once scoped by viewport.
- `02 §3` "Vertical rhythm" also notes that every vertical-spacing token
  should remain a multiple of the base leading. Because the rule is
  scoped to `@media`, the multiples stay intact per-context.

**Opens:**

- Whether to also relax `<li>` and `<blockquote>` leading to 1.5 on
  mobile, or inherit from body. Default: inherit. Revisit if MVP shows
  lists reading tight.
- Whether the italic-bold headings want their own mobile-only leading
  bump (current 1.25 can clash on 2-line wraps per `02 §3` "Heading
  leading"). Deferred — test at 320 px first.

---

## Decision 15 — Focus ring visual treatment

**Decision:** Use `:focus-visible` (not `:focus`) with a custom ring in
the retro link color:

```
:focus-visible { outline: 2px solid #0000EE; outline-offset: 2px; }
```

Apply globally to all focusable elements. Explicitly do **not** remove the
focus ring on `:focus` for non-keyboard interactions — rely on the UA's
`:focus-visible` heuristics (per `01 §4.5`) to skip the ring on tap.

**Alternatives considered:**

- **Browser default.** Varies per UA; on mobile Safari the default is
  subtle enough that WCAG 2.2 `§2.4.11` "Focus Not Obscured" + `§2.4.13`
  "Focus Appearance" audits are hard to pass. Declined.
- **`:focus { outline: none }` + no replacement.** `01 §4.5` explicitly
  rules this out — it's a WCAG regression and a common accessibility
  failure mode.
- **`box-shadow`-based ring.** More design flexibility, but shifts layout
  expectations and interacts with z-index on overlays. `outline` +
  `outline-offset` is cheaper and doesn't trigger reflow.

**Rationale:**

- `01 §4.5` — `:focus-visible` is the correct idiom: keyboard → ring,
  mouse/touch → no ring. Avoids the "why is the button still highlighted
  after I tapped it?" regression.
- The `#0000EE` outline reuses the site's existing identity color (02
  cites it throughout §5) rather than importing a "focus blue" from a
  design system. Keeps the palette count at three (blue / visited /
  body).
- `2 px solid` + `2 px offset` gives enough contrast against the white
  page for WCAG `§2.4.13`, stays visually tight enough to not break the
  dense retro spine. Bigger rings (4 px) compete with underlines on
  adjacent links.
- Because `outline-offset` reserves space outside the element, the ring
  does not cause layout shift when focus arrives — important for the
  INP budget discussed in `01 §4.6`.

**Opens:**

- Whether to add a matching `:focus-visible` rule on `<summary>` inside
  `<details>` disclosures — UA defaults sometimes suppress outlines on
  disclosure triangles. Handle case-by-case during implementation.
- Whether to pair the outline with an underline-weight change on links,
  as `02 §5` suggests (going from resting `#0000EE` to hover `#0000CC`
  is "visually too subtle as the sole cue"). Deferred — the outline is
  the primary signal; underline weight is a secondary nicety the MVP
  doesn't need.

---

## Courier strategy (resolves research contradiction #10)

**Decision:**

- **Keep Courier (current stack: `Courier, "Courier New", monospace`) on
  mobile.** No stack change, no system-mono fallback promotion, no
  self-hosted revival.
- **Courier appears in non-body contexts only.** Labels, timestamps,
  `<kbd>`, inline `<code>`, `<pre><code>` blocks, ProofStrip-style tokens.
  No paragraphs of Courier body text on mobile.
- **Minimum Courier size on mobile: 12 px.** Any token that renders at
  11 px on desktop bumps to 12 px under the same mobile media query that
  Decision 5 uses. Tokens already at 12–13 px stay at 12–13 px.
- **Keep `-webkit-font-smoothing: none` as currently scoped** (see
  research `02 §4` "Font smoothing" — it is currently global and only
  affects iOS). No change for MVP.

**Alternatives considered:**

- **Keep Courier at 11 px.** `02 §6` and `02 §9` flag 11 px Courier as
  the single most fragile mobile token (Android/iOS rendering divergence,
  near the NN/g legibility floor on non-Retina Android). Declined.
- **Promote to `ui-monospace, Menlo, "Cascadia Mono", Courier, monospace`
  on mobile.** More consistent rendering across iOS/Android per `02 §6`,
  but loses the Selectric-typewriter personality that `05 §3` identifies
  as the strongest single signal on the site.
- **Self-host a Courier revival (Courier Prime, IBM Plex Mono, etc.).**
  Adds a webfont fetch that Decision 12 (doc 01) declines.

**Rationale:**

- `05 §3` — Courier is the strongest personality signal on the site;
  losing it would erase more than any other single change.
- `02 §6` — the 11 px → 12 px bump is the minimum legibility fix; a
  single token can carry personality without dragging the legibility
  floor down.
- `02 §9` — rendering divergence between iOS and Android under
  `-webkit-font-smoothing: none` is real but is a *property of the
  retro aesthetic*, not a bug to fix. Keeping it scoped current-way
  preserves intent.
- Restricting Courier to non-body contexts honors both `02 §6` (code
  blocks need their own scroll/wrap behavior anyway) and `05 §8.3`
  (12–14 px body Courier fails every modern baseline).

**Opens:**

- Should `<pre><code>` blocks on mobile use `overflow-x: auto` (scroll)
  or `white-space: pre-wrap` (wrap)? `02 §6` lists both. Defer to
  implementation; no decision needed here.
- Should numeric-column contexts (timestamps, frame indices) use a
  proportional face + `font-variant-numeric: tabular-nums` instead of
  mono? `02 §12` surfaces this as a future lever. Not MVP.
- Whether to revisit `-webkit-font-smoothing: none` scoping (global vs
  heading-only) after seeing the MVP on iOS. `02 §9` flags the divergence;
  this decision explicitly punts it.

---

## Link hover / tap state (resolves research contradiction #11)

**Decision:** Style three states: **`:link`/`:visited` resting**,
**`:active` (pressed)**, and **`:focus-visible`** (see Decision 15). Drop
the `:hover` rule entirely on mobile — scope any hover-only color delta
behind `@media (hover: hover) and (pointer: fine)` so touch devices don't
get a half-working state.

- Resting link: `#0000EE` underlined (current).
- Visited: `#551A8B` underlined (current).
- Active (pressed): **`#0000CC`** (promote the current hover color to
  active). Applies on both desktop and mobile.
- Focus-visible: outline per Decision 15.
- Hover (desktop only): **keep** `#0000CC` on `@media (hover: hover)`;
  otherwise suppress.
- `-webkit-tap-highlight-color`: **leave at the UA default** for MVP.
  The active-state color change is the explicit signal; a custom tap
  highlight is a nicety that can be added later if the UA default
  flashes inconsistently.

**Alternatives considered:**

- **Rely on `:visited` and `:active` only; drop hover styling everywhere.**
  Simpler but costs the desktop hover affordance the current site ships.
- **Add a custom `-webkit-tap-highlight-color: rgba(0,0,238,0.15)` for a
  retro-tinted tap flash.** Reasonable but speculative — the UA default
  is not broken and MVP can skip it.
- **Underline-weight change on active.** `02 §5` suggests pairing color
  with underline weight; deferred — outline + color shift already meets
  WCAG `§1.4.11` 3:1 non-text contrast against resting state.

**Rationale:**

- `02 §5` — the `#0000EE → #0000CC` delta is "visually too subtle as the
  sole cue." On desktop it pairs with the cursor change; on touch there
  is no cursor, so the color delta needs to *fire on press*, not on
  hover. Promoting it to `:active` is the fix.
- `01 §3.1` + `05 §8.5` — touch has no reliable hover. Leaving a
  hover-only color rule in the global stylesheet causes the hover state
  to fire on tap, stick until the next tap, and then clear — the exact
  "why is it still highlighted" bug `:focus-visible` is designed around
  (`01 §4.5`).
- `@media (hover: hover) and (pointer: fine)` is the canonical gate for
  hover-dependent styling; browsers that report "no hover" (phones,
  most tablets) skip the rule cleanly.
- Keeping `:visited` untouched preserves wayfinding on content-heavy
  pages (`02 §5` cites NN/g studies on this). The visited purple
  already meets AA/AAA per `02 §5`.

**Opens:**

- Whether the `:active` color should be different on `:visited` links
  (pressed visited) or share `#0000CC`. Default: share. Revisit only
  if a reader complains the state is ambiguous.
- Whether to add `transition: color 80ms ease` so the active flash
  isn't instantaneous. Defer — transitions on link color risk falling
  afoul of `prefers-reduced-motion` audits in doc 01.
- Whether `-webkit-tap-highlight-color` eventually gets a custom value;
  note that `02 §5` says "overriding it with `-webkit-tap-highlight-color`
  to a brand color is fine *as long as* the text remains readable during
  the flash."

---

## Retro-palette confirmation (durable note, not a decision)

The link palette stays site-wide, including on mobile: **`#0000EE` for
unvisited, `#551A8B` for visited, `#0000CC` for `:active` (and for
`:hover` on pointer-fine devices), `#111` body on `#fff` page**. There is
nothing to decide — `02 §5`'s contrast audit confirms that `#0000EE` on
`#fff` (≈ 8.6–9.4:1), `#551A8B` on `#fff` (≈ 9.3–9.8:1), `#0000CC` on
`#fff` (≈ 10–11:1), and `#111` on `#fff` (≈ 19.3:1) all pass **WCAG 2.2
AA (4.5:1 normal)** and **AAA (7.0:1 normal)**. `02 §9` names this as a
historical accident: the Netscape-era choices made for CRT legibility in
1995 happen to meet the 2024 AAA bar on modern displays. Because every
pair already clears AAA, there is no contrast-driven reason to touch the
palette on mobile, and every aesthetic reason to leave it — `05 §8.1` and
`05 §10` both treat `#0000EE` as an identity marker. The status colors
(`#2f8f2f` green, `#b33a3a` red) sit closer to the AA line per `02 §5`
and should be audited when they appear at body size, but that audit is
not blocked by this doc and belongs to implementation.

---

## Summary

| # | Topic | Value |
|---|---|---|
| 3 | Touch-target floor | 24 px AA for inline prose links; 44 px for standalone targets |
| 4 | Body font size (mobile) | 16 px, global, unchanged |
| 5 | Body line-height (mobile) | 1.5 on mobile only; desktop stays 1.35 |
| 15 | Focus ring | `:focus-visible { outline: 2px solid #0000EE; outline-offset: 2px }` |
| — | Courier (contradiction #10) | Keep Courier stack; non-body contexts only; min 12 px on mobile |
| — | Link hover/tap (contradiction #11) | Style `:link`/`:visited`/`:active`/`:focus-visible`; gate `:hover` behind `@media (hover: hover) and (pointer: fine)` |
| — | Palette (note) | Unchanged site-wide; `#0000EE` / `#551A8B` / `#0000CC` / `#111` on `#fff` all pass WCAG 2.2 AAA per `02 §5` |

All **Opens** entries above are explicitly deferred to after the MVP
lands on a real phone, per the user's framing that concrete suggestions
follow a real-device view.

*End of 03-typography-and-color.md.*
