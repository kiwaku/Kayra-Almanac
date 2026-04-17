# 06 — Astro Patterns (Mobile Redesign Research)

Scope: research, not decisions. Map the Astro 5 APIs and patterns that a
modern-retro mobile pass on this repo will lean on. Tools per §6 of
`00-tooling.md`: context7 for `/websites/astro_build_en`, MDN via WebFetch
for Web APIs. Current project: Astro **5.x** SSG on Vercel, `@astrojs/mdx`,
`@astrojs/sitemap`, `sharp`, KaTeX, desktop-first CSS with a handful of
`@media (max-width: 900px)` breakpoints and `is:inline` scripts (SNN panel,
lightbox, instrument panel).

Every section pairs *what the API does* with *what it means for the mobile
pass*. No final picks — that work happens in a decision doc after 01–06
are done. Code snippets appear only where the shape of the API isn't
obvious from prose.

---

## 1. Content collections (glob loader, zod, render)

### What Astro 5 provides

- Collections defined via `defineCollection` in `src/content.config.ts`
  (preferred in v5) or the legacy `src/content/config.ts` (still works in
  this repo). Source:
  <https://docs.astro.build/en/guides/content-collections>.
- **Loaders, not folders.** v5 replaced the implicit `type: 'content' |
  'data'` with an explicit `loader`. The built-in `glob()` loader (from
  `astro/loaders`) takes `{ pattern, base }`; a `file()` loader handles
  single JSON/YAML files; custom loaders are possible. Source:
  <https://docs.astro.build/en/guides/upgrade-to/v5>.
- **Schemas** are Zod, via `z` imported from `astro/zod` (or from
  `astro:content` — both are exported). The `SchemaContext` passes an
  `image()` helper for validating local images; see §2.
- **Entry API.** `getCollection('x')`, `getEntry('x', id)`,
  `getEntries([...])`. Entries expose `{ id, slug, data, body, ... }`.
- **Rendering.** In v5+, entries no longer carry a `.render()` method.
  Import `render` from `astro:content` and call
  `const { Content, headings } = await render(entry);`. Source:
  <https://docs.astro.build/en/guides/upgrade-to/v6>.

### Current state in this repo

`src/content/config.ts` uses the legacy shape: `type: 'content'` plus a
`schema`, no `loader`. That still runs on 5.x because Astro keeps the
legacy path alive through v5, but v6 deprecates it. For projects
(`projects`), logbook entries (`logbook`), notebooks (`notebooks`), and
hardware (`hardware`) — four content-first collections with front-matter
schemas covering domains, badges, tags, images.

### Mobile-relevant workflows

| Pattern | What it buys on mobile | What it costs |
|---|---|---|
| **Shared collections, viewport-conditional rendering** (current repo) | One source of truth; desktop and mobile read the same `getCollection` result; zero duplication. | Layout logic has to branch in templates or CSS. |
| **Mobile-only collections** (e.g., `mobile_home_cards`) | Lets content authors hand-pick a shorter mobile homepage without media queries. | Duplication; drift risk; authors have to remember two places. |
| **Schema fields that gate visibility** (e.g., `showOnMobile: boolean`, `mobilePriority: number`) | Keeps one collection; lets authors trim the mobile feed. | Schema bloat; still requires filter at render. |
| **Derived mobile summaries** (use `summary` or a new `mobileSummary`) | Shorter hero text for small screens. | Two strings to maintain; risk of staleness. |
| **Image arrays as ordered slideshow source** | Mobile can show `images[0]` only; desktop shows all. | Author must order intentionally. |

The repo already has optional `summary` on projects — plausible to reuse as
mobile hero copy without a schema change.

### Astro-5-specific considerations

- `type: 'content'` → migrate to `loader: glob({ pattern, base })` before a
  v6 bump; do it alongside any mobile work to avoid double-churn. The
  zod schema stays.
- Rendering loop: any `.astro` page that still calls `entry.render()` must
  switch to `render(entry)`. Grep for `.render()` before touching
  templates for mobile; mixing the two will break typing.
- `getCollection` takes a second filter arg: `getCollection('projects',
  ({ data }) => data.status === 'active' && data.featured)` — cheap way to
  build a mobile-short homepage from existing `featured` booleans.

### Small snippet (shape only)

```ts
// src/content.config.ts  (target shape, v5+)
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
    schema: ({ image }) => z.object({
      title: z.string(),
      cover: image().optional(),
      featured: z.boolean().default(false),
      // ...existing fields
    }),
  }),
};
```

---

## 2. `astro:assets` — Image component, responsive srcset, format, CLS

### API surface

- `Image` (and `Picture`) from `astro:assets`. Image source is either a
  static import (`ImageMetadata`) or a remote URL. Source:
  <https://docs.astro.build/en/guides/images>.
- Responsive generation modes:
  - **`widths` + `sizes`** — explicit control; `widths` produces the
    srcset, `sizes` tells the browser which to pick.
  - **`densities`** — generates `1x`/`2x`/`Nx` variants; incompatible with
    `layout`.
  - **`layout` (5.x)** — `'constrained' | 'fixed' | 'full-width' | 'none'`.
    Astro auto-generates `srcset`, `sizes`, and default CSS styles keyed
    by the chosen layout. Global defaults come from
    `image.layout`/`image.objectFit`/`image.objectPosition`/
    `image.breakpoints` in `astro.config`.
- `getImage({ src, width, format })` — imperative variant when you need to
  emit two `<source>` elements or pass a URL to CSS.
- `image()` helper inside a Zod schema validates and imports a local image
  at content-collection build time, so the resulting `entry.data.cover`
  is an `ImageMetadata` (has `width`, `height`, `src`, `format`).

### CLS and layout hints

- The rendered `<img>` for `layout='constrained'` carries `width` and
  `height` attributes *plus* a CSS `--fit`/`--pos` pair via
  `style="--fit:cover;--pos:center"` so the browser reserves space.
- `loading="lazy"` and `decoding="async"` are defaults. Astro also adds
  `fetchpriority="auto"`; explicitly set `priority` or `loading="eager"`
  for above-the-fold heroes to avoid LCP regressions.
- `image.responsiveStyles: true` in config adds a global stylesheet that
  enforces `max-width:100%; height:auto;` for responsive images. Tiny
  footprint, but it is global — be aware when mixing with retro layouts
  that rely on exact pixel measurements.

### The GIF problem (repo-specific)

- `black_sign.gif` (signature), `littbut.gif` (footer bullet), flag GIFs.
  `astro:assets` currently **does not** re-encode GIFs through `sharp`
  into responsive animated WebP/AVIF — animated formats are passed
  through or flattened to the first frame depending on config. Confirm by
  inspecting a built `dist/` after `astro build` before relying on the
  `Image` component for them.
- Safer pattern for animated GIFs: keep them as plain `<img>` in
  `public/`, let Vercel serve the raw bytes, and set `width`/`height` +
  `image-rendering: pixelated` / `crisp-edges` as needed (§MDN
  `image-rendering`, Baseline widely-available since Jan 2020).
- For the signature specifically: retaining the GIF is a modern-retro
  cue, but consider shipping a static 1x PNG fallback via
  `<picture>` for reduced-motion users (see §3).

### Pixelated rendering rules

| Class | Value | When |
|---|---|---|
| `.pixel` | `image-rendering: pixelated` | Pixel-art thumbnails and icons that are scaled up. Best on modern browsers. |
| `.crisp` | `image-rendering: crisp-edges` | Line art / diagrams; slightly softer than pixelated on Firefox. |
| (none) | `auto`/`smooth` | Photos. Default. |

Note: these are CSS properties, not Astro-specific; they coexist with
`Image` output fine as long as the generated element still gets the class.
Adding a `class` prop to `Image` attaches it to the output `<img>`.

### Responsive image cheatsheet for mobile

- Heroes (project covers, page banners): `layout="constrained"`, explicit
  `width`/`height`, generate WebP, maybe an AVIF via `formats` in global
  config.
- Thumbnails in lists: `layout="fixed"` at the intended rendered size, no
  srcset needed.
- Full-bleed banners: `layout="full-width"` — auto-generates srcset per
  `image.breakpoints`.
- Decorative retro GIFs: raw `<img>` from `public/` with explicit
  dimensions; no `Image` pipeline.

---

## 3. View Transitions

### Astro's `<ClientRouter />` / `<ViewTransitions />`

- Drop `<ClientRouter />` (Astro 5 renamed the component from
  `<ViewTransitions />` — old name still re-exported) in a layout's
  `<head>` to enable MPA cross-document transitions. Astro then
  intercepts same-origin navigations, fetches the next page, and runs the
  browser's View Transitions API DOM-swap animation.
- **Directives** on any element within the transitioning page:
  - `transition:name="hero"` — pairs elements across pages. Must be
    unique per page. Source:
    <https://docs.astro.build/en/guides/view-transitions>.
  - `transition:animate="fade" | "slide" | "initial" | "none"` — per-
    element (or on `<html>` as page default). `fade` is the default in
    v3+.
  - `transition:persist` — keeps a DOM subtree alive across navigations
    (e.g., an audio player, or the SNN panel).
- **Lifecycle events** fire on `document`: `astro:before-preparation`,
  `astro:after-preparation`, `astro:before-swap`, `astro:after-swap`,
  `astro:page-load`. Useful for re-initialising scripts (§9).

### Underlying browser API

- Same-document: `document.startViewTransition(cb)`.
- Cross-document (pure CSS): `@view-transition { navigation: auto; }` +
  `::view-transition-*` pseudo-elements. Baseline support in Chrome and
  Edge; Safari 18.2+ ships same-document; cross-document support is newer
  and partial. Firefox is still behind a flag at time of writing.
  Source: <https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API>.
- Astro's `<ClientRouter />` falls back to an ordinary navigation on
  browsers without View Transitions API — so there's no hard break, just
  no animation.

### Mobile concerns

| Concern | Detail | Mitigation |
|---|---|---|
| **Transition cost** | Each transition captures a snapshot of the current DOM and animates pseudo-elements. On low-end mobile this can push a 16ms frame budget. | Prefer `fade` (cheap) over `slide`; disable on long lists. |
| **`prefers-reduced-motion`** | Astro respects it automatically — all view transitions become a raw DOM swap when the user has Reduce Motion on. | Still test with it on; some custom `@keyframes` in your CSS need manual guards. |
| **Safari quirks** | History navigations and BFCache interact oddly with View Transitions; Safari on iOS may skip transitions after a back-swipe. | Accept and don't animate back-nav specifically. |
| **Paired elements mis-sized** | `transition:name` across pages with different layouts can cause jarring resizes (e.g., desktop card → mobile hero). | Only pair elements that exist at both breakpoints, or skip paired transitions for small screens entirely. |
| **Script re-init** | Scripts bundled by Astro run once per session unless re-bound on `astro:page-load`. `is:inline` scripts re-evaluate automatically. | Bind via `astro:page-load` for canvas init (SNN, instrument panel). |

### Reduced-motion guard (pattern)

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation: none !important; }
}
```

---

## 4. Client islands — directives and cost

### Directive catalogue

| Directive | Fires when | Use |
|---|---|---|
| `client:load` | Page load, immediately. | Critical-path interactive UI (rare on this site). |
| `client:idle` | `requestIdleCallback` resolves; falls back to `load`. | Non-critical widgets; safe for footer things. |
| `client:visible` | Component enters viewport (IntersectionObserver). | Heavy components the user may never scroll to. |
| `client:visible={{ rootMargin: '200px' }}` | Same, with margin. | Start hydration just before viewport entry. |
| `client:media="(min-width: X)"` | Media query matches. | **The mobile lever.** Only hydrate on screens big enough to use the feature. |
| `client:only="framework"` | Never SSR; hydrate client-only. | SSR-unsafe libraries. |

### Cost model on mobile

- Each directive emits a small Astro runtime stub (~1 KB shared) plus the
  framework runtime (React/Svelte/Preact/etc.) and the component bundle.
- **This repo has zero framework components** — everything interactive is
  `is:inline` vanilla JS. So client directives aren't currently part of
  the hydration cost; but if a mobile redesign introduces any framework
  component, the cost kicks in.
- `client:media` is special: the stub stays on the page, but the framework
  bundle *only downloads when the MQ matches*. This is the right lever
  for "desktop-only ornament" islands.

### Applying this to the SNN panel

The SNN panel is the canonical "desktop-only" feature on this site. It
already hides at `max-width:900px` via CSS. But the 500+ line inline
script in `BaseLayout.astro` still evaluates on every page including
mobile — painting nothing, but parsing ~15 KB of JS, mounting
`requestAnimationFrame`, and fetching `/assets/neural_graph.svg`.

Options a mobile-aware refactor could reach for:

- Gate the `<script>` itself behind a media-query condition. `is:inline`
  doesn't support `client:media`, so this means either wrapping the
  script in a JS `matchMedia` check at the top of its IIFE, or promoting
  the panel to a framework component with `client:media="(min-width: 901px)"`.
- Lazy-import the SVG only when `matchMedia('(min-width:901px)').matches`
  is true.
- Split the panel into a tiny trigger (always on) and a heavy body
  (lazy) for a future "tap to expand on mobile" mode — but that is a
  design decision, not a pattern finding.

### Notes

- `client:only` forfeits SSR, so content inside that island is invisible
  to crawlers. Never for primary content.
- Nested islands: a directive on a child does not propagate to siblings.
  Each island is independently hydrated.
- `astro:page-load` in a view-transitioned site fires *after* each
  navigation; use it to rebind listeners inside islands that persist.

---

## 5. Layouts and slots — sharing chrome

### Astro options

- **`<slot />` (default)** and **`<slot name="..." />`** (named). Fallback
  content inside `<slot>` renders when nothing is passed. Children
  without a `slot=` attribute fill the default slot; `<Fragment
  slot="x">...</Fragment>` passes multiple elements into one named slot.
  Source: <https://docs.astro.build/en/basics/astro-components>.
- Nested layouts are just components importing each other; there is no
  special "parent layout" machinery.
- `Astro.props` in a layout lets you parametrise chrome (title, class
  modifiers) without forking the file.

### Strategies for "desktop and mobile share a shell"

| Approach | Fit for this site | Tradeoffs |
|---|---|---|
| **One `BaseLayout.astro`, CSS-only responsive swap** | High — single source of truth; retro elements stay consistent. | CSS-only means both chromes exist in the DOM at all breakpoints; heavier DOM but one network file. |
| **`BaseLayout.astro` with a `mobileNav` prop/slot** | Medium — lets pages override left-nav content for narrow screens. | Adds a convention authors have to remember. |
| **Two layouts (`BaseLayout` + `MobileLayout`)** | Low — but considered for completeness. Would require a selector upstream. | Duplication; drift; you pick one at build time per page, so you can't change at runtime unless you ship both and toggle via CSS/JS. |
| **`<BaseLayout>` that swaps an island via `client:media`** | Medium — cleanest for genuinely heavy chrome (e.g., the SNN panel). | Islands imply JS; wrong fit for the always-on header. |
| **Nested layout: `BaseLayout > MobileChrome` via `<MobileChrome client:media="(max-width: 900px)" />`** | Works, but the chrome is not just interactive; the surrounding ornamentation is SSR-static. | Mixing static SSR and media-gated island requires care. |

The repo's current `BaseLayout.astro` carries three *visible* chromes —
top header/signature, left-nav `<aside>`, footer `<address>` — plus two
*invisible* widgets (instrument panel, SNN panel) injected at body
bottom. A mobile pass has to decide for each:

- Keep + restyle via CSS (the default for header/footer).
- Replace with a mobile-specific variant mounted via slot.
- Hide entirely via CSS (`display:none`) if the feature has no mobile
  equivalent.

### Slot pattern (illustration only)

```astro
---
// BaseLayout.astro
const { title } = Astro.props;
---
<html>
  <head>...</head>
  <body>
    <slot name="header">
      <DefaultHeader />
    </slot>
    <main><slot /></main>
    <slot name="footer">
      <DefaultFooter />
    </slot>
  </body>
</html>
```

Pages that want a mobile-specific header pass `<Fragment slot="header">`.
The default still applies everywhere else.

---

## 6. CSS scoping and the mobile stylesheet

### What scoping Astro gives you

- `<style>` inside an `.astro` component is **scoped by default** via a
  `data-astro-cid-*` attribute. No class-name collisions across
  components. Source: <https://docs.astro.build/en/guides/styling>.
- `<style is:global>` opts out of scoping entirely — useful for
  `src/styles/theme.css` tokens, reset CSS, typography.
- `:global(selector)` inside a scoped block: mix scoped rules with
  selectively global descendants.
- `define:vars={{ foo }}` — pass frontmatter values as CSS variables into
  a scoped `<style>` block. Works for per-component dynamic theming.
- `class:list={[...]}` — conditional class composition.
- `<style is:inline>` — written as-is into the HTML, *not scoped*, not
  processed (no imports). Rare; avoid unless bypassing Vite on purpose.

### No native `@layer` magic

Astro doesn't auto-wrap styles in CSS layers. You can still use `@layer`
in your own CSS — it works in Safari 15.4+, Chrome 99+, Firefox 97+ —
to separate a "mobile" layer that overrides without specificity fights.
Pattern:

```css
@layer base, components, mobile;
@layer base { /* theme.css tokens */ }
@layer components { /* buttons, panels */ }
@layer mobile { @media (max-width: 640px) { /* mobile overrides */ } }
```

### Mobile stylesheet strategies

| Strategy | Pros | Cons |
|---|---|---|
| **Everything in `theme.css` (global)** with `@media` queries inline | Current shape; single source for tokens. | Grows unbounded; mobile rules scattered. |
| **Per-component scoped `<style>` with mobile MQ inside** | Co-located with markup; scoped; easy to trace. | Duplicates MQ boilerplate per file. |
| **Global `mobile.css` included after `theme.css`** | Single place for all mobile overrides; easy to audit & ship late. | Global specificity — use `@layer mobile` or careful selectors to avoid fighting component styles. |
| **Mobile-first theme.css, scoped desktop overrides** | Matches modern best practice; avoids loading extra CSS for small screens. | Big rewrite; existing code is desktop-first. |
| **`is:inline` critical CSS in `<head>` + external mobile CSS** | Lowest LCP on mobile. | Two stylesheets to keep in sync; easy to regress. |

This research note doesn't pick one — that's a 04 / decision task.

---

## 7. Prefetching and speculative loading

### Astro 5 prefetch

- Built into `astro@5` (no separate integration). Enable by setting
  `prefetch: true` in `astro.config`, or configure it:
  `prefetch: { prefetchAll: boolean, defaultStrategy: 'hover' | 'tap' |
  'viewport' | 'load' }`. Source:
  <https://docs.astro.build/en/guides/prefetch>.
- Per-link opt-in/out: `data-astro-prefetch` or
  `data-astro-prefetch="viewport"` / `"hover"` / `"tap"` / `"load"` /
  `"false"`.
- Programmatic: `import { prefetch } from 'astro:prefetch';` — `prefetch(url, { eagerness })`.
- Experimental `clientPrerender: true` — switches prefetch backend to the
  browser's Speculation Rules API, which lets Chromium *prerender* (not
  just fetch) target pages. Bigger speedup, higher RAM cost.

### Strategy matrix for mobile

| Strategy | Mobile cost | When worth it |
|---|---|---|
| `load` | High — fetches every linked page at pageload. | Never on mobile. |
| `viewport` | Medium — fetches when link scrolls into view. | Lists where the next click is predictable (catalog → project page). |
| `hover` | Low on desktop; **on mobile, "hover" = `touchstart`**, firing ~200 ms before tap. | Default for in-page nav links. |
| `tap` | Fires at `touchstart`. Saves ~100–200 ms of TTFB. Wastes bytes on wrong taps. | Primary nav; links with high click probability. |
| Programmatic `prefetch(url, { eagerness: 'moderate' })` | Controllable. | Scripted hints from a search UI. |

### Mobile-network realities

- Users on 3G/4G pay real kilobytes for speculative fetches. Prefetching
  the whole footer nav on viewport entry is a waste; prefetch only the
  2–3 most probable next clicks.
- `clientPrerender` (experimental, Speculation Rules API) is Chromium-
  only at present. Safari ignores it, so no regression for iOS users.
  But it can pre-execute scripts on the target page — double-check any
  JS with side effects.

---

## 8. Head, meta, mobile-specific tags

### Current tags in `BaseLayout.astro`

```html
<meta charset="utf-8" />
<title>{title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="...">
<link rel="icon" href="/favicon-light.png" media="(prefers-color-scheme: light)" />
<link rel="icon" href="/favicon-dark.png" media="(prefers-color-scheme: dark)" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/..." />
<meta property="og:type" content="website">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="/og-default.jpg">
```

Already solid: viewport is correct; dual favicons via `prefers-color-scheme`;
OpenGraph basics.

### Tags mobile pass should consider

| Tag | Purpose | Notes |
|---|---|---|
| `<meta name="theme-color" content="...">` | Colours the Chrome address bar on Android, status bar on iOS Safari (18+). | Can split by `media="(prefers-color-scheme: dark)"`. |
| `<meta name="color-scheme" content="light dark">` | Tells browsers the page supports both themes — avoids flash of white on dark-mode mobile. | Minimal footprint. |
| `<link rel="manifest" href="/site.webmanifest">` | Makes the site installable as a PWA. | Only worth it if installable UX is desired. |
| `<meta name="apple-mobile-web-app-capable" content="yes">` | iOS legacy fullscreen mode when added to Home Screen. | Deprecated in favour of `mobile-web-app-capable`; harmless duplication. |
| `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` | iOS status-bar styling for Home-Screen-launched web apps. | Works only when `apple-mobile-web-app-capable` is set. |
| `<meta name="apple-mobile-web-app-title" content="Almanac">` | Short title for Home Screen icon. | Paired with apple-touch-icon. |
| `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` | 180×180 iOS icon. | Android uses `manifest.json` icons instead. |
| `<meta name="format-detection" content="telephone=no">` | Stops iOS from auto-linking digits as phone numbers (easy to hit with timestamps, version numbers). | Low-cost safety. |
| `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` | Enables `env(safe-area-inset-*)` CSS on iPhone notched devices. | Required for the retro-footer-against-the-home-bar pattern. |

### viewport-fit=cover + safe-area-inset

If the mobile footer or header is meant to extend edge-to-edge on
iPhone (to feel like a native chrome), `viewport-fit=cover` lets CSS
read `env(safe-area-inset-bottom)` and pad to avoid the home indicator.
Same-site as the decision about a "persistent bottom nav" — mentioned,
not decided.

### KaTeX stylesheet

Currently loaded from a CDN. For mobile, consider:

- Self-hosting to avoid a third-party DNS/TLS handshake on slow networks.
- Gating its load to pages that actually render math (logbook entries,
  some project pages) — most pages carry the stylesheet cost for
  nothing.

---

## 9. Scripts — `is:inline` vs bundled

### Two modes

- **Default `<script>`** in an `.astro` file is bundled by Vite. Hoisted
  to the document; deduped across pages; supports `import`, TypeScript,
  tree-shaken. Evaluated once per session (with `<ClientRouter />`, re-
  bound on `astro:page-load` if needed).
- **`<script is:inline>`** passes through as-is. No bundling, no imports,
  no TS. Re-evaluates on every view-transition navigation unless the
  containing layout is persistent. Source:
  <https://docs.astro.build/en/guides/client-side-scripts>.

### Current repo state

`BaseLayout.astro` has five `is:inline` scripts:

1. `/evidence-toggle.js` (static asset, deferred).
2. `/raw-toggle.js` (static asset, deferred).
3. Inline portal handler (~10 lines).
4. Inline lightbox (~90 lines).
5. Inline SNN panel implementation (~500 lines).

Everything runs on every page, desktop and mobile. The instrument panel
and SNN panel already hide at `max-width:900px` via CSS — but the JS
still runs.

### Tradeoffs

| Mode | Bundle savings | Mobile-aware gating |
|---|---|---|
| `is:inline` | None — duplicated per usage, not bundled. | Must self-check inside the script (`matchMedia`). |
| Default bundled script | Deduped, tree-shaken, processed. | Still universal unless inside a `client:media` island. |
| External file via `<script src="..." defer>` | Cacheable across pages. | Page still pays parse cost on fetch. |
| `client:media` on a framework island | Framework bundle only loads on matching media. | Yes — per-MQ. |
| Dynamic `import('./x.js')` behind a `matchMedia` guard | Zero cost on non-matching MQs after the guard. | Yes. |

### Rule-of-thumb (research only)

- Bundle by default; use `is:inline` only when the script must run before
  other scripts (pre-hydration theme flips) or when keeping it as a
  static public asset makes caching better.
- For desktop-only behaviour, prefer a `matchMedia('(min-width:901px)').matches`
  early return inside the script — cheap and works with either mode.
- For 500-line IIFEs: move to `src/scripts/*.ts`, import from a component,
  let Vite bundle and minify. Saves roughly 30–50% after gzip compared to
  the raw inline version.

---

## 10. Build output and bundle inspection

### What Astro 5 produces

- `astro build` writes `dist/` — one `.html` per prerendered route plus a
  `_astro/` directory with hashed JS, CSS, and image assets. With
  `build.assets` you can rename `_astro`.
- Per-route JS footprint depends on islands present. A page with zero
  framework components produces *zero* framework JS; only inline/bundled
  `<script>` blocks contribute.
- Source:
  <https://docs.astro.build/en/recipes/analyze-bundle-size>.

### Inspection tools

| Tool | How | What you see |
|---|---|---|
| `astro build --verbose` | Shell. | Per-file output sizes as the log scrolls; confirms each route emitted. |
| `astro build` + inspect `dist/_astro/*.js` | `ls -lh dist/_astro` (or file explorer). | Raw, pre-gzip size per chunk. |
| `rollup-plugin-visualizer` (add to `vite.config` in `astro.config.mjs`) | Plugin; outputs `stats.html`. | Treemap of which modules are in which chunk. |
| `source-map-explorer` | `npx source-map-explorer dist/_astro/*.js` | Per-chunk source-map breakdown. |
| `npx vite build --mode analyze` with plugin | Alt invocation; Astro wraps Vite. | Same as above. |
| Lighthouse / DevTools Coverage tab | Chrome. | Unused CSS/JS bytes per route — real mobile cost. |
| `npx sharp-cli` or visual diff of `dist/_astro/*.webp` | File-size check. | Verify no GIF blow-up. |

### Relationship to §3 of the research track (performance)

Whatever LCP/INP/CLS budget task 03 lands on becomes the gate:

- **JS budget**: compare sum of `dist/_astro/*.js` after gzip to the
  budget per route. Low-hanging fruit: move inline `<script>` blocks
  to bundled scripts, and gate the SNN panel.
- **CSS budget**: inspect `dist/_astro/*.css`. The KaTeX stylesheet is
  currently external so won't show here — but it still counts against
  the real-world budget.
- **Image budget**: check that `public/` GIFs aren't accidentally
  duplicated by `Image`; confirm `sharp` is emitting WebP for non-GIF
  covers.
- **First-load byte count**: open a page in DevTools *Network* with
  cache off, throttle to Slow 4G, note the byte total. Should be
  measured post-layout-change to compare against 512kb-club style
  budgets from task 03.

### Build flags worth knowing

- `build.inlineStylesheets: 'always' | 'auto' | 'never'` — controls whether
  small CSS chunks get inlined. On mobile, `auto` is the right default;
  `always` can bloat HTML; `never` forces an extra request.
- `build.assetsPrefix` — CDN prefix if assets get pushed elsewhere;
  irrelevant for Vercel default.
- `build.format: 'file' | 'directory'` — trailing-slash and flat-vs-nested
  output; affects how Vercel serves them. Current repo uses default
  (`directory`).

---

## Open questions

1. **GIF pipeline.** Does `astro:assets` on 5.x re-encode animated GIFs
   via `sharp`, or pass through? Must confirm with a build before deciding
   whether to migrate signature/flag GIFs to `Image`. (Quick test:
   `Image src={signatureGif}` and diff `dist/_astro/`.)
2. **View Transition browser support on iOS.** Safari 18+ ships same-
   document; cross-document is evolving. Need a fresh caniuse pull at
   implementation time — spec is Level 2 in active change.
3. **SNN panel — move to island or guard the inline script?** Both have
   the same practical effect on mobile; the choice is about maintenance
   cost of adding a framework dependency for one widget. (Design
   question; surface again in the decision doc.)
4. **Migrate to `loader: glob()` now or after mobile?** Migrating touches
   every collection config — good to do in the same change set as mobile
   schema updates to avoid double-diff, but adds scope.
5. **`<ClientRouter />` or no client-side router at all?** A retro site
   without view transitions is fine; a retro site with a single fade
   transition feels modern-retro. Tradeoff is ~3 KB runtime and the
   `astro:page-load` rebinding pattern for inline scripts.
6. **Critical CSS extraction.** Astro's `build.inlineStylesheets: 'auto'`
   handles small chunks, but no automatic above-the-fold extraction.
   Worth a separate dig if LCP on mobile is painful.
7. **KaTeX cost.** The stylesheet is ~60 KB and currently loads on
   every page. Is per-page gating feasible via frontmatter flag, or is
   global simpler?
8. **Prefetch strategy fit for a catalog site.** `viewport` looks right
   for the catalog/logbook index but will fetch every card on the page
   — need a per-card data-astro-prefetch audit.
9. **Mobile-only collections vs. shared + filter.** No blocker yet; flag
   after task 01 (UI conventions) clarifies what shorter-on-mobile
   actually looks like content-wise.
10. **Safe-area-inset usage.** Only matters if bottom-nav lands; don't
    design against `env(...)` speculatively.

---

## Patterns most likely to change during implementation

These are the items a research doc should flag as "decisions deferred":

- **Loader migration** (`type: 'content'` → `loader: glob()`). Likely
  happens with the first real mobile PR; schemas may gain `mobileSummary`,
  `showOnMobile`, or similar — or stay as-is.
- **Layout strategy** (one `BaseLayout` vs. two, named slots vs. CSS-only).
  The choice emerges from the actual mobile chrome design; §5 listed
  options, none is ruled out.
- **`client:media` adoption.** Zero framework islands today. If the
  mobile nav or accordion needs real JS, introducing Preact or Svelte
  with `client:media` becomes plausible, but the bar is high.
- **SNN panel treatment.** Gate inline, lazy-load SVG, or promote to
  island — each has a different bundle and code-size profile.
- **Prefetch defaults.** Enabling `prefetchAll: true` with a `viewport`
  strategy is cheap on desktop but measurable on 4G; likely to land
  conservatively with per-link `data-astro-prefetch` at first.
- **View Transitions rollout.** Adding `<ClientRouter />` changes
  re-init semantics for every inline script. Expect script rebinding
  regressions during rollout.
- **KaTeX gating.** Moving from CDN to self-hosted to per-page gated
  — three steps that can land independently.
- **Theme/colour-scheme meta.** Once a darker retro palette is drafted
  (task 05), `theme-color`, `apple-mobile-web-app-status-bar-style`, and
  dual favicons all need to be revisited together.
- **Responsive image config defaults.** Setting
  `image.layout: 'constrained'` globally would rewrite every existing
  `<Image>` site-wide. Likely done once, late in the implementation
  arc, behind a careful visual diff.
- **Build output tuning** (`build.inlineStylesheets`, KaTeX gating,
  bundle visualiser). Happens alongside task-03 performance tightening,
  not in the first mobile PR.

---

## Sources

- Astro content collections: <https://docs.astro.build/en/guides/content-collections>
- Astro v5 upgrade (loaders, type removal): <https://docs.astro.build/en/guides/upgrade-to/v5>
- Astro v6 upgrade (render, legacy removal): <https://docs.astro.build/en/guides/upgrade-to/v6>
- `astro:content` module reference: <https://docs.astro.build/en/reference/modules/astro-content>
- `astro:assets` module reference: <https://docs.astro.build/en/reference/modules/astro-assets>
- Images guide: <https://docs.astro.build/en/guides/images>
- View Transitions guide: <https://docs.astro.build/en/guides/view-transitions>
- Client directives reference: <https://docs.astro.build/en/reference/directives-reference>
- Framework components guide: <https://docs.astro.build/en/guides/framework-components>
- Prefetch guide: <https://docs.astro.build/en/guides/prefetch>
- Client prerender experimental flag: <https://docs.astro.build/en/reference/experimental-flags/client-prerender>
- Styling guide: <https://docs.astro.build/en/guides/styling>
- Client-side scripts: <https://docs.astro.build/en/guides/client-side-scripts>
- Analyze bundle size: <https://docs.astro.build/en/recipes/analyze-bundle-size>
- Configuration reference (image.*, build.*): <https://docs.astro.build/en/reference/configuration-reference>
- Astro components (slots, layouts): <https://docs.astro.build/en/basics/astro-components>
- MDN View Transitions API: <https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API>
- MDN `image-rendering`: <https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering>
