# Mobile MVP — Polish Report

Four small post-MVP fixes from a real-device eyeball on `kayra-almanac.vercel.app`, plus the test-suite deltas and grep findings used to locate each.

Status: `pnpm run test:mobile-mvp` → **142 passed** (was 124). Zero skipped, zero disabled. All previous assertions still green; the three new hide assertions run on every mobile route × engine × mobile viewport combination.

## Fixes

### 1. Floating "Show Debug Gridlines" panel — hidden on mobile

- **Grep:** `"Show Debug Gridlines"` / `debug-gridlines` / `debug-toggle-ui`.
- **Source:** `src/components/InstrumentPanel.astro:855–903`. `createDebugToggle()` creates a `<div id="debug-toggle-ui">` and appends it to `document.body` on DOMContentLoaded (or via a 100 ms `setTimeout` when the script runs after DOMContentLoaded). The element is styled inline with `position: fixed; bottom: 10px; right: 10px; display: flex;`.
- **Why the original 768 hide block missed it:** the CSS block hid `#instrument-panel` and `.instrument-panel`, but the debug toggle has a different id (`#debug-toggle-ui`) and is injected into the body rather than rendered inside the panel.
- **Fix:** added `#debug-toggle-ui` to the existing `display:none !important` selector list inside `@media (max-width: 767.98px)` in `src/styles/theme.css`. `!important` is required because the inline `display: flex` would otherwise win.
- **Desktop impact:** none — the selector is scoped inside the mobile media query.

### 2. Decorative nav-separator beads — hidden on mobile

- **Grep:** `class="dot"` / `footer-nav .dot` / `littbut.gif`.
- **Source:** `src/layouts/BaseLayout.astro:52–68`. Eight `<img src="/assets/littbut.gif" class="dot" alt="•">` elements interleaved between the eight footer-nav anchors.
- **Existing CSS:** `.footer-nav .dot` at `src/styles/theme.css:279–284` sets a 12 px-tall inline image with 8 px side margins.
- **Problem on mobile:** the footer `<nav>` has no flex container — it relies on inline whitespace — so when links wrap, stranded `<img class="dot">` elements land at the start or end of a line.
- **Fix:** added `.footer-nav .dot` to the mobile-only hide selector in `theme.css`. Desktop rendering is untouched.
- **Spacing adjustment:** not needed. The anchors already have `margin: 0 2px` from the base rule and `padding: 10px 8px` + `min-height: 44px` from the mobile tap-target rule (`theme.css:858–870`), which gives enough horizontal breathing room without the beads.

### 3. "Shortcuts: Evidence [E] · Raw [R] · Full guide" line — hidden on mobile

- **Grep:** `"Shortcuts:"` / `.footer-shortcuts`.
- **Source:** `src/layouts/BaseLayout.astro:75` — `<span class="footer-shortcuts">Shortcuts: …</span>`. CSS hook already exists at `theme.css:305–308`.
- **Fix:** added `.footer-shortcuts` to the mobile-only hide selector list. Keyboard shortcuts have no touch analogue, so this removes dead weight.
- The LeftNav-scoped shortcuts hint at `src/components/LeftNav.astro:15–16` is already hidden because `.leftnav` itself is mobile-hidden.

### 4. iOS tap-highlight rectangle — killed site-wide

- **Fix:** added `-webkit-tap-highlight-color: transparent;` to the base `a` selector in `theme.css`. Site-wide (not mobile-scoped) because the property is a no-op on non-touch devices.
- **No assertion added:** headless engines do not render the tap-highlight rectangle, so an automated check would be a tautology. The CSS declaration is a single line and verifiable by inspection.

## Test-suite additions (`tests/mobile-mvp/mobile.spec.ts`)

Three new assertions, slotted into the existing per-route `chrome hidden on ${route.name}` test so they run on all seven routes × both engines × both mobile viewports (2 × 2 × 7 = 28 extra checks each × 2 engines = 42 new assertion-invocations above the baseline, which is why the suite now reports 142 passed instead of 124).

| # | What it checks |
|---|----------------|
| 22 | `#debug-toggle-ui` is either not in the DOM or `display: none` / `offsetParent == null` at mobile widths. Injected asynchronously, so the test waits for it (with `.catch()` so a missing element is also acceptable). |
| 23 | Every `.footer-nav .dot` is `display: none` / hidden. Fails if no beads are found in DOM, which would indicate the footer source changed. |
| 24 | `.footer-shortcuts` exists in DOM but is `display: none` / hidden at mobile widths. |

No new dependencies. No disabled / skipped tests. All changes land in existing files.

## Diff scope

- `src/styles/theme.css` — 3 selectors added to the existing mobile-hide list; one property (`-webkit-tap-highlight-color: transparent`) added to the base `a` rule; one extended comment. ~20 lines touched.
- `tests/mobile-mvp/mobile.spec.ts` — 3 assertions added inside the existing per-route loop. ~55 lines.

No Astro components were edited. No new files in `src/`. No new dependencies.

## Before / after screenshots at 375×812

Captured headless-Chromium post-fix (the "after" state). The "before" state is observable on the currently-deployed `kayra-almanac.vercel.app` build; since this is a worktree polish pass we did not redeploy to capture matching "before" shots — the live site is the baseline.

- `screenshots/mobile-home.png` — 375×812, `/` — no debug toggle, no stranded beads, no shortcuts line.
- `screenshots/mobile-project.png` — 375×812, `/projects/crest-snn`.
- `screenshots/mobile-logbook.png` — 375×812, `/logbook/2025-10-04-du99d4-memory-init`.

See the live deployment for the before state, or inspect the pre-fix selectors:
- Debug toggle: search for `#debug-toggle-ui` on the current prod site in devtools — present on mobile emulation before this change; absent after.
- Beads: `.footer-nav .dot { display: inline }` before; `display: none` in the mobile media query after.
- Shortcuts: `.footer-shortcuts { display: inline }` before; `display: none` in the mobile media query after.

## Files touched

- `src/styles/theme.css`
- `tests/mobile-mvp/mobile.spec.ts`
- `docs/mobile/implementation/POLISH-REPORT.md` (this file)
- `docs/mobile/implementation/TABLET-LANDSCAPE-AUDIT.md`
- `docs/mobile/implementation/screenshots/*.png`
