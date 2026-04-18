# Mobile MVP — Pre-Flight Audit

Captured before any code change. Purpose: confirm the decisions docs' assumptions match the actual repo state.

## Viewport meta

`src/layouts/BaseLayout.astro:12`:

```
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Matches decision 02 §2 verbatim. No edit needed.

## Existing `@media` queries

Three locations, three different breakpoints (as decision 02 §1 warned):

- `src/styles/theme.css:766` — `@media (max-width:768px)` — adjusts `body` padding, collapses `.shell` grid to single column, shrinks `.gallery` minmax, tweaks `.numlist .block`. **Does NOT** currently hide `.left` / `.leftnav`.
- `src/layouts/BaseLayout.astro:129` — `@media (max-width: 900px) { .snn-panel { display: none; } }` — scoped inside the SNN `<style>` block.
- `src/components/InstrumentPanel.astro:134` — `@media (max-width: 800px) { .instrument-panel { display: none; } }` — scoped inside the component's `<style>` block.

Consolidation target per decision 02 §1: all three should be `768px`.

## `max-width: 880px` occurrences

`theme.css`: exactly one body-prose cap at line 21 (applied to `html, body`). All other `max-width:` uses in the file are `100%`, `92vw`, or `none` (lightbox, code blocks, project badges) — none of them are prose measures.

Decision 02 §6 target: change line 21 to `max-width: min(880px, 100vw - 32px)`.

## SNN IIFE location + size

The SNN implementation lives in a single `<script is:inline>` IIFE in `src/layouts/BaseLayout.astro`:

- Opening: line 318 (`<script is:inline>` + header comment).
- IIFE start: line 323 (`(function() {`).
- IIFE end: line 880 (`})();`).
- Closing `</script>`: line 881.

That is **~560 lines of inline JS**, not "~500 lines." Decision 02 §9 cited it as "the ~500-line IIFE"; the real count is larger, which strengthens the case for the matchMedia early-return.

The IIFE is the third inline script block in the file, after the portal handler (212–222) and the lightbox handler (224–316). Only the SNN block needs the gate; the lightbox and portal handlers are already trivial and should stay global.

## Selectors for each chrome piece

- **LeftNav** — `src/components/LeftNav.astro` renders `<nav class="leftnav">` wrapped by the `<aside class="left">` in `BaseLayout.astro:34`. Either selector is reachable from `theme.css` (component markup is not scoped; only `<style>` blocks are). Simplest hide target: `.left` on mobile (hides the whole aside, including its padding).
- **InstrumentPanel** — `<div id="instrument-panel" class="instrument-panel">` (see `InstrumentPanel.astro:7`). Scoped `<style>` already targets `.instrument-panel` at `max-width: 800px`.
- **SNN panel** — `<div id="snn-panel" class="snn-panel">` at `BaseLayout.astro:87`. Scoped `<style>` in the same file targets `.snn-panel`.

## Existing back-link affordance (decision 7)

Non-root pages already have **two** paths back to `/` without the LeftNav:

1. `BaseLayout.astro:25-27` — the header logo is a `<a href="/">` wrapping the signature GIF. Visible on every page, desktop and mobile.
2. `BaseLayout.astro:48-50` — on any path other than `/`, the footer renders `<div class="back-to-index"><small>↑ <a href="/">Back to index</a></small></div>`.

Per decision 02 §7 Opens ("both cost the same"), no new back-link markup is needed. The existing header-logo + footer-back-to-index pair satisfies the requirement. This audit confirms we can skip adding new `<a href="/">← back to index</a>` elements to SectionLayout / page templates.

## Existing focus / hover / reduced-motion rules

- `theme.css:45-48` — `:focus { outline: 1px dotted #000; outline-offset: 2px; }`. Uses `:focus`, not `:focus-visible`; wrong selector per decision 15. Also the color is black-dotted, not `#0000EE` solid.
- `theme.css:37-39` — `a:hover { color: var(--link-hover); }` is **unconditional**, not gated behind `@media (hover: hover)`. Contradiction-11 fix required.
- `theme.css` — grep shows **zero** `prefers-reduced-motion` rules. Decision 01 §4 requires a universal rule.
- `theme.css` — no mobile-only `font-size` or `line-height` rule for body. Decision 03 §5 requires `line-height: 1.5` under the mobile media query.

## Existing test scripts + dev deps

`package.json`:

```
"scripts": {
  "dev": "astro dev",
  "start": "astro dev",
  "build": "astro check && astro build",
  "preview": "astro preview",
  "astro": "astro"
}
"devDependencies": {
  "@astrojs/check": "^0.9.0",
  "typescript": "^5.6.0"
}
```

No Playwright, no vitest, no mobile-specific test harness. `astro check` is present (bundled inside `build`). **Must install Playwright + browsers + write a fresh suite.**

Lockfile is `pnpm-lock.yaml` — this repo uses pnpm, not npm. Test scripts should still be runnable via `npm run`, but install should use `pnpm add -D` to keep the lockfile coherent.

## Routes (for the Playwright matrix)

- `/` — `src/pages/index.astro`
- `/about` — `src/pages/about.astro`
- `/catalog` — `src/pages/catalog.astro`
- `/logbook` — index + `src/pages/logbook/[slug].astro`
- `/notebooks` — index + `src/pages/notebooks/[slug].astro`
- `/projects/[slug]` — dynamic, **no index page at `/projects`**; slug is `data.id` from the collection
- `/hardware` — single page, aggregates the `hardware` collection; **no `/hardware/[slug]` route**
- `/gallery`, `/shrine`, `/start-here`, `/about`, `/content-rated`, `/404`

Slugs confirmed by content dir:

- `src/content/projects/` → `crest-snn.mdx`, `ferrum-i.mdx`, `ferrum-ii.mdx`, `hephaestus.mdx`, `himorogi.mdx` (frontmatter `id` is the slug; use `crest-snn` for the test pick).
- `src/content/logbook/` → e.g. `2025-10-04-du99d4-memory-init.mdx`.
- `src/content/notebooks/` → e.g. `hephaestus-hardware.mdx`.

The task prompt listed `/hardware/<slug>` as conditional ("if route exists"). It doesn't — skip.

## Divergences from the decisions docs

1. **Decision 02 §9 cites "~500-line IIFE"; actual count is ~560 lines.** Doesn't change the fix (matchMedia early-return); the gate still lands at the top of the IIFE.
2. **Decision 02 §10 says the InstrumentPanel rule uses `max-width: 800px`; confirmed — `InstrumentPanel.astro:134`.** Not a divergence, recording for completeness.
3. **Decision 02 implementation notes point at `src/components/LeftNav.astro` scoped styles "or `theme.css`".** `LeftNav.astro` currently has **no `<style>` block**; landing the hide rule in `theme.css` is simpler and keeps all mobile rules in one place.
4. **Back-link (decision 7)** already satisfied by two existing affordances (see above). Implementation scope shrinks by one file.
5. **Package manager**: repo uses pnpm (`pnpm-lock.yaml`), not npm. Use `pnpm add -D` for install; `npm run` still works for scripts.

## Exit

Assumptions confirmed. Proceeding with implementation under the scope locked in 01/02/03 decision docs, plus the two minor divergences above (no new back-link file; pnpm not npm for install).
