# 03 — Mobile Performance (Research)

Scope: the performance option space for the kayra-almanac redesign on mobile.
Static Astro 5 SSG portfolio. Target device profile: mid-tier Android on a
3G-ish network. This document is *research only* — no measurement of the
current site, no commits, no changes. See `00-tooling.md` for the tooling
decisions referenced here.

Citations inline as `[source]` with canonical URLs at the end of each section
or inline where a single source is used. All claims should be traceable to
one of: web.dev, Google's RAIL material, Addy Osmani, Jake Archibald, MDN,
W3C / WHATWG specs, or the Astro 5 docs.

---

## Contents

1. Core Web Vitals on mobile
2. JavaScript budget
3. Image budget
4. Font budget
5. CSS budget
6. Network assumptions
7. Measurement methodology
8. Anti-patterns
9. Astro 5 specific
10. Performance budget checklist
11. Open questions

---

## 1. Core Web Vitals on mobile

Core Web Vitals (CWV) are the user-centric performance metrics Google treats
as the current baseline for page experience. As of March 2024, INP replaced
FID as the responsiveness metric.

### 1.1 The three metrics and thresholds

web.dev publishes the "good / needs improvement / poor" thresholds. Field
data (CrUX) is the authoritative ground truth; lab data (Lighthouse)
approximates it.

| Metric | Measures | Good (p75) | Needs improvement | Poor |
|---|---|---|---|---|
| **LCP** | Time to render the largest in-viewport content element (image, video poster, or block-level text). | ≤ 2.5 s | ≤ 4.0 s | > 4.0 s |
| **INP** | The worst interaction latency (input → next paint) observed during the visit, at p98-ish. Replaced FID on 2024-03-12. | ≤ 200 ms | ≤ 500 ms | > 500 ms |
| **CLS** | Sum of the largest burst of unexpected layout shifts during the lifetime of the page. Dimensionless. | ≤ 0.1 | ≤ 0.25 | > 0.25 |

Sources:
- Overview & thresholds: <https://web.dev/articles/vitals>
- LCP: <https://web.dev/articles/lcp>
- INP: <https://web.dev/articles/inp>
- FID → INP transition: <https://web.dev/blog/inp-cwv-march-12>
- CLS: <https://web.dev/articles/cls>

### 1.2 Why mobile budgets are stricter than desktop

- CrUX and Search Console split mobile/desktop. A site can pass
  desktop CWV, fail mobile, and be deprioritized in mobile search.
- Mobile CPU is roughly 1/3 to 1/6 of a mid-range laptop (Moto G4 is
  2–4× slower than iPhone 8 in Osmani's benchmarks). This inflates
  TBT and LCP script-render delay.
  <https://v8.dev/blog/cost-of-javascript-2019>
- Mobile radios add 100–600 ms RTT vs. 20–40 ms on wired broadband.
  TTFB and every blocking resource chain are amplified. RAIL's "5 s
  to interactive on mid-tier hardware + 3G" target is mobile-first.
  <https://web.dev/articles/rail>
- The LCP window is narrow on mobile — a single hero image or prose
  block. Any render-blocker eats it directly.

### 1.3 Implications for this site

- LCP candidate on mobile is likely the H1 or first decorative image
  per page (InstrumentPanel on `/`, signature GIF on `/about`, hero on
  project pages). Must be discoverable from initial HTML without JS.
- INP surface: raw-markdown toggles, ProofStrip, LeftNav expand/collapse,
  SNN canvas. Light today, but candidates to watch when reworked.
- CLS hot spots: flag/signature GIFs without `width`/`height`,
  late-loading webfonts with mismatched metrics, InstrumentPanel if it
  paints after layout settles.

---

## 2. JavaScript budget

> "Byte-for-byte, JavaScript is still the most expensive resource we send to
> mobile phones." — Addy Osmani, *The Cost of JavaScript*
> <https://v8.dev/blog/cost-of-javascript-2019>

### 2.1 The "every KB costs" argument

JavaScript cost is not linear in bytes — it is dominated by parse, compile,
and main-thread execution on weak CPUs. A 300 KB bundle is not "2× worse"
than 150 KB on a Moto G-class phone; it is closer to 3–4× worse once V8's
optimizing compiler kicks in.

- Network cost: bytes × RTT × compression ratio.
- Parse cost: V8 parses ~0.5–1 MB/s of JS on a mid-tier Android
  (historical 2018–2019 figure; newer chips are faster but the ratio to
  desktop has not changed dramatically). <https://v8.dev/blog/cost-of-javascript-2019>
- Execute cost: main-thread blocking; contributes directly to TBT in
  Lighthouse and to INP in the field if the script runs during interaction.

### 2.2 Historical reference numbers

- Addy Osmani has argued for a ceiling around **170 KB of JavaScript
  (minified + gzipped) on mobile** as a starting point, below which most
  sites can hit CWV targets on mid-tier devices.
  <https://addyosmani.com/blog/script-evaluation-scale/> and the same
  figure recurs in the V8 blog post cited above.
- web.dev's guidance has since shifted toward *outcomes* (CWV thresholds)
  rather than a byte count, but the 170 KB figure remains a widely-used
  back-of-the-envelope target. <https://web.dev/articles/reduce-javascript-payloads-with-code-splitting>

### 2.3 Parse/execute budget on mid-tier Android

Rough order-of-magnitude figures, drawn from Osmani's benchmarks and V8's
own numbers. Treat as "good enough to budget with", not as measurements.

| Device tier | JS parse+compile, 170 KB gzipped | Comment |
|---|---|---|
| Desktop / iPhone 14 | ~0.5 s | Barely perceptible. |
| iPhone 8 | ~1–1.5 s | Still within INP budget if idle. |
| Moto G4 / mid-tier Android 2019-ish | ~5–8 s | Dominates LCP budget. |
| Low-end Android <$100 | 10 s+ | Outside our target profile, but represents 512kb-club's "worst-case user". |

Sources (for orders of magnitude, not exact numbers):
- <https://v8.dev/blog/cost-of-javascript-2019>
- <https://addyosmani.com/blog/the-cost-of-javascript-in-2023/>

### 2.4 Implications for this site

- Astro islands are the primary lever: every island ships JS; default
  output is zero-JS.
- The SNN canvas is the one real JS cost today. Options on mobile:
  (a) don't ship below some breakpoint, (b) `client:visible` not
  `client:load`, (c) simpler deterministic animation. Decision for
  implementation phase.
- Raw-markdown toggles are almost certainly `<details>` + CSS with
  zero JS. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details>

---

## 3. Image budget

> "Images account for the majority of bytes on the typical page, so they're
> typically the biggest opportunity to speed things up." — web.dev,
> *Choose the right image format*
> <https://web.dev/articles/choose-the-right-image-format>

### 3.1 Format choice

| Format | Lossy / lossless | Typical use | Notes |
|---|---|---|---|
| **AVIF** | Lossy + lossless | Photos, hero images. | ~50% smaller than JPEG at comparable quality; ~20% smaller than WebP. Encoder slower; decode acceptable on modern mobile. <https://web.dev/articles/compress-images-avif> |
| **WebP** | Lossy + lossless + animation | General replacement for JPEG/PNG/GIF. | Universally supported (Safari 14+, all Chromium, Firefox). ~25–35% smaller than JPEG. <https://web.dev/articles/serve-images-webp> |
| **JPEG** | Lossy | Fallback when neither AVIF nor WebP is available. | Progressive JPEG renders early, good LCP behavior. |
| **PNG** | Lossless | UI chrome, screenshots where colors matter exactly. | Large; usually beaten by lossless WebP. |
| **SVG** | Vector | Icons, diagrams, line art. | Infinitely scalable; avoid if path complexity makes it heavier than an equivalent raster. |
| **GIF** | Lossy (palette) + animation | Legacy — *do not use for new content*. | See §3.5. |

### 3.2 Responsive images

Two mechanisms, both in HTML, both solved problems. <https://web.dev/articles/serve-responsive-images>

- **`srcset` + `sizes` on `<img>`** — for resolution switching when the
  image content is the same but you need different pixel dimensions.
  The browser picks the right source based on viewport width and DPR.
  <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#srcset>
- **`<picture>` with `<source>` media/type** — for art direction (crop
  differently on mobile vs. desktop) *and* for format negotiation (try
  AVIF, fall back to WebP, fall back to JPEG).
  <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture>

Jake Archibald's canonical breakdown of when to use which:
<https://jakearchibald.com/2015/anatomy-of-responsive-images/>

### 3.3 Lazy loading

- `<img loading="lazy">` and `<iframe loading="lazy">` are native;
  browser-level, no JS.
  <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading>
  <https://web.dev/articles/browser-level-image-lazy-loading>
- **Do not lazy-load the LCP image.** Lazy-loading the hero image
  measurably worsens LCP because the browser waits until layout to know
  whether it's in the viewport. web.dev explicitly calls this out.
  <https://web.dev/articles/lcp-lazy-loading>
- Add `fetchpriority="high"` on the LCP image to signal it to the
  preloader. <https://web.dev/articles/fetch-priority>

### 3.4 Dimension hints prevent CLS

- Always set `width` and `height` attributes on `<img>` (and
  `<video poster>`). Modern browsers use the ratio to reserve layout
  space before the image has loaded. This is the single cheapest CLS
  win on any content-driven site.
  <https://web.dev/articles/optimize-cls#images-without-dimensions>
- `aspect-ratio` CSS on containers is the equivalent for arbitrary
  blocks. <https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio>

### 3.5 The cost of GIFs

Animated GIF is an abysmal format for modern mobile.

- **8-bit palette, LZW only** — a 3-second loop can be 2–5 MB where
  WebM/MP4 of the same frames is 50–200 KB. web.dev recommends
  replacing animated GIFs with video.
  <https://web.dev/articles/replace-animated-gifs-with-video>
- **Decodes on main thread** — unlike `<video>`, GIF decoding lands
  in the rendering path.
- **Lazy loading ≠ free** — a scrolled-in GIF still costs its full
  weight.
- **Autoplay video works** — `muted playsinline autoplay loop` on
  `<video>` is allowed on iOS Safari + Android Chrome without
  gesture. <https://developer.apple.com/documentation/webkit/safari_release_notes/safari_10_release_notes#autoplay-policies>

Implication: signature + flag GIFs are candidates for
`<video autoplay muted loop playsinline>` with WebM + MP4 sources, or
static images. Savings are typically 10×+.

### 3.6 `image-rendering: pixelated`

The CSS `image-rendering: pixelated` / `crisp-edges` instruction is a
*rendering hint*, not a format. It does not change bytes on the wire. If
the source is an unnecessarily large PNG upscaled from a small pixel
grid, savings come from shipping the small grid and letting CSS scale it.
<https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering>

---

## 4. Font budget

See `02-typography.md` for the design-side decisions. This section is
about bytes and RTTs only.

### 4.1 The cost of a webfont

A typical webfont request chain looks like:

1. HTML arrives, browser parses CSS, discovers `@font-face`.
2. Browser requests the font file (WOFF2) — new TCP + TLS + HTTP/2 (or
   /3) stream.
3. Browser paints either FOIT (blank — browser waits) or FOUT
   (fallback, then swap) depending on `font-display`.
4. On swap, the layout is recomputed for every glyph run using that
   family, which can cause CLS if the fallback and webfont have very
   different metrics.

Sources:
- <https://web.dev/articles/reduce-webfont-size>
- <https://web.dev/articles/font-best-practices>
- `font-display`: <https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display>

### 4.2 System-font stack

A `system-ui` / platform-font stack ships *zero bytes* for the font
itself and has no RTT, no FOIT, no FOUT, no metric-induced CLS. On
mobile this is a meaningful saving — often 30–100 KB per family-weight
combo avoided. CSS-Tricks has a canonical cheat sheet for the stack:
<https://css-tricks.com/snippets/css/system-font-stack/>

### 4.3 Reducing webfont cost when you must ship one

- **WOFF2 only.** Smallest widely-supported; nothing else needed.
  <https://caniuse.com/woff2>
- **Subset** via `unicode-range` on `@font-face` — strip CJK, symbol
  blocks you never use.
  <https://web.dev/articles/reduce-webfont-size#unicode-range_subsetting>
- **Preload the critical font** with `<link rel="preload" as="font"
  type="font/woff2" crossorigin>`. Read Archibald first — preload is
  easy to misuse. <https://jakearchibald.com/2016/link-in-body/>
- **`font-display: swap`** avoids FOIT; `optional` is right when
  you'd rather ship the fallback than flash the webfont on slow nets.
- **`size-adjust` / `ascent-override`** match fallback + webfont
  metrics, eliminating swap-time CLS.
  <https://web.dev/articles/css-size-adjust>

### 4.4 Variable fonts

One variable font file can cover the equivalent of 6–12 static weight/style
files. Usually a net win *if you need more than 1–2 weights*; a net loss if
you only need regular + bold. <https://web.dev/articles/variable-fonts>

---

## 5. CSS budget

### 5.1 Render-blocking CSS

- CSS in `<link rel="stylesheet">` in the `<head>` is render-blocking
  by default. The browser parses all of it before first paint.
  <https://web.dev/articles/render-blocking-resources>
- The practical upper bound on render-blocking bytes before CWV
  suffers depends on network and device, but every KB of render-blocking
  CSS adds directly to the FCP/LCP critical path.

### 5.2 Critical CSS

- Critical CSS = above-the-fold CSS inlined in `<head>`, rest loaded
  async via `<link rel="preload" as="style" onload="…">`.
  <https://web.dev/articles/extract-critical-css>
- Tradeoffs: inlining bloats HTML (hurts caching); the split needs a
  build step; a bad split causes FOUC below the fold on slow nets.
- For a small SSG site, a single <14 KB CSS file (the initial TCP
  congestion window on HTTP/1.1) is often simpler and fast enough.
  <https://hpbn.co/>

### 5.3 Unused CSS

- Lighthouse surfaces unused CSS under "Reduce unused CSS". It's a
  proxy for "your stylesheet is larger than this page needs".
  <https://developer.chrome.com/docs/lighthouse/performance/unused-css-rules>
- On a component-scoped system like Astro's scoped styles, the issue
  is usually (a) a global stylesheet with rules nobody uses, and
  (b) transitive CSS from framework islands. On an Astro SSG with
  minimal islands this is usually small.

### 5.4 The 512kb club argument

- 512kb.club catalogues sites whose total *uncompressed resource size*
  (HTML + CSS + JS + fonts + images on first page load) is ≤ 512 KB.
  Sub-tiers at 250 KB ("green") and 100 KB ("blue"). It is a community
  not a standard, but it frames a useful discipline.
  <https://512kb.club/>
- The argument: every byte is a tax on the slowest user; a static
  portfolio has no business being 2+ MB.
- Tradeoff: 512kb budgets are hostile to high-quality imagery. A
  portfolio with photography or generative visuals may choose to
  "pay" on image weight while staying lean on JS/CSS/fonts, which is
  a more defensible budget than blanket 512 KB.

---

## 6. Network assumptions

### 6.1 The RAIL model

RAIL is Google's user-centric performance model. Four letters, four budgets:

| Letter | Target | Window |
|---|---|---|
| **R**esponse | < 100 ms from input to visual feedback | Per interaction. |
| **A**nimation | 10 ms per frame of animation work (budget of 16 ms/frame minus browser overhead) | Continuous. |
| **I**dle | Work in ≤ 50 ms idle chunks to stay responsive | Continuous. |
| **L**oad | Interactive in ≤ 5 s on mid-tier hardware + 3G | First visit. |

Source: <https://web.dev/articles/rail>

INP aligns with R; CLS partly with A (layout shifts ≠ animation but share
the paint budget); LCP is the modern equivalent of the L target.

### 6.2 3G / 4G reference numbers

WebPageTest and Chrome DevTools "Network Throttling" use canonical
profiles. Lighthouse's "Slow 4G" is what Lighthouse uses for mobile
runs by default.

| Profile | Downlink | Uplink | RTT | Notes |
|---|---|---|---|---|
| **Slow 3G** | 400 Kbps | 400 Kbps | 400 ms | WPT "Slow 3G" / Chrome DevTools. Extreme stress case. |
| **Fast 3G** / regular 3G | 1.6 Mbps | 750 Kbps | 300 ms | Lighthouse pre-v6 default; still a useful worst-case. |
| **Slow 4G** | ~1.6 Mbps effective | 750 Kbps | 150 ms | Lighthouse 6+ mobile default. |
| **4G / LTE** | 9 Mbps | 9 Mbps | 170 ms | Chrome DevTools "Fast 4G". |

Sources:
- Chrome DevTools throttling docs: <https://developer.chrome.com/docs/devtools/network/#throttle>
- Lighthouse throttling methodology: <https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md>
- Jake Archibald on "what 3G actually feels like":
  <https://jakearchibald.com/2017/netinfo-api/>

Implication: budget as if the mobile user is on Slow 4G (150 ms RTT,
effective ~1.6 Mbps). The first HTML response needs to be small and not
chain through many origins.

### 6.3 Vercel edge and TTFB

Site is on Vercel SSG, served from the edge network.

- **TTFB** for cached static served from a nearby edge POP is
  typically 30–150 ms, dominated by mobile RTT.
  <https://vercel.com/docs/edge-network/overview>
- **HTTP/2 + Brotli** on by default. No origin hop for SSG → no
  cold-start.
- **Vercel Speed Insights** provides real-user CWV per path,
  supplementing CrUX. <https://vercel.com/docs/speed-insights>

The edge removes the server-side portion of LCP as a variable. The
remaining LCP budget is in content weight, render-blocking
resources, and main-thread work.

---

## 7. Measurement methodology

### 7.1 Lighthouse

- Lab tool built into Chrome DevTools and available as a CLI
  (`npx lighthouse <url>`). Simulates a mid-tier mobile device on Slow
  4G by default for the "mobile" profile.
  <https://developer.chrome.com/docs/lighthouse/overview>
- Returns scores for Performance, Accessibility, Best Practices, SEO,
  PWA. Performance is a weighted combination of FCP, LCP, TBT, CLS, SI.
- **Variance**: Lighthouse scores fluctuate ±5–10 points run-to-run
  due to simulated throttling noise. Always run 3+ times and take the
  median. <https://developer.chrome.com/docs/lighthouse/performance/performance-scoring>
- **Lab ≠ field**: Lighthouse TBT is a *proxy* for INP, not INP itself.
  A page can pass TBT and still fail INP in the field if interactions
  happen to land on main-thread work Lighthouse didn't exercise.
  <https://web.dev/articles/tbt>

### 7.2 PageSpeed Insights

- Web UI that combines a Lighthouse lab run with CrUX field data for
  the URL (if the URL has enough traffic in CrUX).
  <https://pagespeed.web.dev/>
- Field data is the authoritative CWV signal. Lab data is what you
  iterate against when field data is sparse (which is likely for a
  personal portfolio).

### 7.3 CrUX

- Chrome User Experience Report: aggregated RUM data from opted-in
  Chrome users, per-origin and per-URL. Quarterly public dataset;
  monthly via BigQuery.
  <https://developer.chrome.com/docs/crux>
- For a low-traffic site, origin-level CrUX may exist while URL-level
  does not. Origin-level is still useful for trend tracking.

### 7.4 WebPageTest

- Runs on real devices at real locations with configurable throttling.
  Gives filmstrips, waterfalls, and a "Speed Index" visual metric.
  <https://www.webpagetest.org/>
- For mobile, WPT's Moto G-class real-device testing is closer to
  ground truth than Lighthouse's simulated throttling, at the cost of
  being slower and needing a paid plan for sustained use.
- Waterfalls are the single best tool for diagnosing render-blocking
  chains and unnecessary preloads.

### 7.5 Simulated vs real-device throttling

- **Simulated** (Lighthouse default): full-speed run, timings
  mathematically re-projected onto a "Moto G4 on Slow 4G" curve. Cheap,
  repeatable, approximate — especially for main-thread work.
- **Applied throttling** (DevTools, WPT): actual CPU + network
  throttling. Slower, closer to real.
- **Real-device** (WPT, BrowserStack): actual hardware. Gold standard.

Lighthouse throttling docs:
<https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md>

### 7.6 What to use when

| Question | Tool |
|---|---|
| "Is this PR making things worse in the lab?" | Lighthouse CI on a reference URL. |
| "Are real users having a good time?" | CrUX / Vercel Speed Insights. |
| "Why is LCP slow?" | WebPageTest waterfall, then DevTools Performance panel. |
| "Did I regress INP?" | Field data (CrUX/RUM) or DevTools Performance panel with forced interactions. |
| "Did I regress CLS?" | Lighthouse CLS score + DevTools "Layout Shift Regions". |

---

## 8. Anti-patterns to avoid introducing

The current site does not ship any of the below. This section is a
"do not introduce" list for the redesign.

### 8.1 Blocking third-party scripts

- Every extra origin = DNS + TCP + TLS + HTTP round trip on a cold
  connection. Two or three head-blocking third-parties can double LCP
  on 3G. <https://web.dev/articles/third-party-javascript>
- For a portfolio: prefer Vercel Web Analytics or Plausible (small,
  async) over GTM/GA4; use a static screenshot link instead of an
  embed iframe.
- If a third-party must ship: `async`/`defer` only, plus `preconnect`.
  <https://web.dev/articles/preconnect-and-dns-prefetch>

### 8.2 Webfonts for minor text

Shipping a 40 KB WOFF2 for a 20-character footer label is a bad trade.
If the design demands a webfont, scope it to the elements that truly
need it and keep the rest on the system stack.

### 8.3 Large CSS-in-JS runtimes

- Runtime CSS-in-JS libraries (styled-components, Emotion at runtime)
  ship a parser, cache, and stylesheet-injection runtime to the client
  — typically 10–25 KB gzipped *before* your styles, and they serialize
  styles at runtime on the main thread.
- In the Astro + scoped CSS / Tailwind world this is not a concern,
  but if a contributor wires up a React island with runtime
  styled-components, that cost lands on mobile INP.
  <https://web.dev/articles/css-runtime-performance>
- Build-time CSS-in-JS (vanilla-extract, Linaria, zero-runtime
  styled-components) is fine — output is static CSS.

### 8.4 Large hero images shipped unresized

The single most common portfolio perf regression: dropping a 4000×3000
px JPEG from a phone camera into the hero and letting CSS resize it.
Fix is always the same: `<picture>` + responsive `srcset` + AVIF/WebP
via Astro's Image component (§9).

### 8.5 Animations that run forever

- Continuous `requestAnimationFrame` (SNN canvas is the current
  example) consumes CPU session-long: drains battery and holds main
  thread during interactions, pushing INP.
- Defensive patterns: pause on `visibilitychange: hidden`, use
  `IntersectionObserver` to pause off-screen, respect
  `prefers-reduced-motion`.
  <https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame>
  <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>

### 8.6 Preload abuse

- `<link rel="preload">` forces the browser to fetch a resource at high
  priority before it's discovered. Wrong preload = double download +
  priority inversion on the actual LCP resource.
- Jake Archibald's canonical guide is the single best source before
  adding *any* preload: <https://jakearchibald.com/2016/link-in-body/>
- Rule of thumb: only preload (a) the LCP image, (b) the critical
  webfont, (c) a critical render-blocking resource that's discovered
  late (rare).

---

## 9. Astro 5 specific

### 9.1 `astro:assets` and the Image component

- `astro:assets` is Astro's built-in image optimization pipeline.
  `<Image />` (from `astro:assets`) applies at build time for SSG
  targets: format conversion, responsive variants, dimension
  inference, and automatic `loading="lazy"` / `decoding="async"`
  defaults.
  <https://docs.astro.build/en/guides/images/>
- Defaults relevant to mobile:
  - `loading="lazy"` by default (override on the LCP image with
    `loading="eager"` + `fetchpriority="high"`).
  - `decoding="async"` by default.
  - `width` and `height` attributes are set from the source image's
    intrinsic dimensions — this is the CLS-prevention default you
    want.
  - Default service is Sharp; emits WebP by default for supported
    browsers, falls back to original.
  - `<Picture />` companion component emits a full `<picture>` with
    AVIF + WebP + fallback sources, per `formats` config.
- `getImage()` is the escape hatch for when you need to hand-roll
  the markup but keep the optimization pipeline.

### 9.2 View Transitions weight

- `<ClientRouter />` (formerly `<ViewTransitions />`) does
  same-origin SPA-style nav via the View Transitions API where
  supported. <https://docs.astro.build/en/guides/view-transitions/>
- Wire cost: a few-KB JS module on every opted-in page.
- Runtime: intercepts nav, fetches next page HTML, swaps `<body>`.
  Improves perceived perf but adds JS to a zero-JS baseline.
- Mobile tradeoff: on a low-JS site those few KB are a measurable
  fraction of the JS budget. Worth it for project-detail nav;
  probably not for a mostly-static portfolio.

### 9.3 Other Astro 5 levers

- **Zero-JS by default.** The baseline Astro page ships 0 bytes of
  JS. Every island is a conscious decision.
- **`client:` directives.**
  - `client:load` — worst for perf (JS on every load).
  - `client:idle` — better (wait for `requestIdleCallback`).
  - `client:visible` — best for below-fold islands (wait for
    `IntersectionObserver`).
  - `client:media="(min-width: 768px)"` — *do not ship this island
    on mobile at all* — the single highest-leverage directive for
    mobile perf.
  - `client:only` — SSR is skipped; use sparingly.
  - <https://docs.astro.build/en/reference/directives-reference/#client-directives>
- **`<Content />` for MDX/Markdown** — rendered at build, zero JS
  unless a component inside is an island.
- **`prefetch`** — Astro can inject `<link rel="prefetch">` on visible
  internal links, or use the Speculation Rules API.
  <https://docs.astro.build/en/guides/prefetch/>

---

## 10. Performance budget checklist

Draft budgets for the mobile redesign. Each row is a target, not a
measured value. "Source" is the reasoning anchor, not a hard SLA.

### 10.1 Field-metric budgets (p75 on mobile)

| Metric | Target | Hard fail | Source |
|---|---|---|---|
| LCP | ≤ 2.0 s | > 2.5 s | web.dev "good" threshold, with 500 ms headroom for variance. <https://web.dev/articles/lcp> |
| INP | ≤ 150 ms | > 200 ms | web.dev "good" threshold with headroom. <https://web.dev/articles/inp> |
| CLS | ≤ 0.05 | > 0.1 | web.dev "good" threshold with headroom. <https://web.dev/articles/cls> |
| TTFB | ≤ 200 ms | > 600 ms | web.dev TTFB guidance for "good". <https://web.dev/articles/ttfb> |

### 10.2 Resource-weight budgets (first-page load)

| Resource | Target | Hard fail | Source |
|---|---|---|---|
| JS (gzipped) | ≤ 50 KB | > 170 KB | 170 KB = Addy Osmani's historical mobile ceiling; 50 KB is a realistic target for an Astro SSG. |
| CSS (gzipped) | ≤ 20 KB | > 50 KB | Fits inside the ~14 KB first-response window after HTML. <https://hpbn.co/> |
| Fonts (per family, WOFF2) | ≤ 30 KB subsetted | > 100 KB | web.dev font best practices. <https://web.dev/articles/reduce-webfont-size> |
| LCP image | ≤ 100 KB AVIF / ≤ 200 KB WebP | > 500 KB | Scales with image format and viewport. |
| Total page weight | ≤ 500 KB | > 1 MB | 512kb.club "standard" tier. <https://512kb.club/> |

### 10.3 Request-count budgets

| Class | Target | Hard fail | Source |
|---|---|---|---|
| Third-party origins | 0 on critical path | > 2 | web.dev third-party. <https://web.dev/articles/third-party-javascript> |
| Render-blocking resources | ≤ 2 (HTML + CSS) | > 4 | web.dev render-blocking. <https://web.dev/articles/render-blocking-resources> |
| Fonts total | ≤ 2 files on first load | > 4 | Font best practices. |

### 10.4 Build-time gates (Lighthouse CI thresholds)

| Lighthouse category | Target | Hard fail |
|---|---|---|
| Performance (mobile) | ≥ 95 | < 90 |
| Accessibility | ≥ 95 | < 90 (ties to task 04/05) |
| Best Practices | ≥ 95 | < 90 |
| SEO | ≥ 95 | < 90 |

Lighthouse variance (§7.1) means these should be enforced on a
3-run median, not a single run.

### 10.5 Conventions to enforce

- Every `<img>` and `<video>` has `width` and `height`. (CLS.)
- LCP image has `loading="eager"` + `fetchpriority="high"`;
  everything else is lazy.
- No GIFs. Use `<video autoplay muted loop playsinline>` with
  WebM + MP4 sources, or a static image.
- No webfont without `font-display: swap` (or `optional`) and a
  size-matched fallback.
- No island above `client:visible` priority without justification.
- No island shipped to mobile (`client:media` gate or `<MobileSimple>`
  swap) unless required for the interaction.
- No third-party script on the critical path.

---

## 11. Open questions

Questions that need answers during implementation or validation, not in
this research doc.

1. **Is the SNN canvas worth shipping on mobile at all?**
   Options: (a) keep it, with `client:visible` + reduced-motion pause;
   (b) replace with a static SVG on mobile via `client:media`;
   (c) remove entirely below a breakpoint. Decision needs a measured
   JS + per-frame cost number from the implementation phase.

2. **Is the InstrumentPanel decoration the LCP candidate or is it
   beaten by an image/H1?** Depends on final mobile layout. If it is
   the LCP candidate at 27 KB, it should be inlined SVG (not a PNG
   sprite).

3. **Should signature + flag GIFs become `<video>` or become static?**
   `<video>` preserves motion but adds a tag class and
   `prefers-reduced-motion` handling. Static images drop to ~5 KB and
   zero CPU. Decide per asset.

4. **Adopt `<ClientRouter />` or not?**
   Pays off for project-detail nav; adds JS on every page. Needs a
   measurement in the validation phase before committing.

5. **Analytics choice.**
   Vercel Speed Insights is the cheapest path to field CWV data. Is
   the privacy tradeoff acceptable? If not, is Plausible worth the
   ~1 KB async script?

6. **Hosting constant: are all routes SSG, or will any be SSR
   (Astro 5's `output: "server"` per route)?** Affects TTFB budget
   (§10.1) — SSR on Vercel is typically +50–200 ms vs. static edge.

7. **Preload scope.** Is there a single webfont weight worth
   preloading site-wide, or does it vary per page (blog vs.
   project vs. home)? Jake Archibald's guidance (§4.3) says "only
   preload discovered-late critical resources" — most of our CSS and
   webfont is discovered in the initial HTML, so preload might buy
   nothing.

8. **Budget enforcement.** Lighthouse CI on every PR via GitHub
   Actions, or a one-shot validation before merge? Lighthouse CI adds
   ~2 min to PR turnaround.

9. **CrUX baseline.** Does the site have enough traffic for
   URL-level CrUX data? If not, origin-level only, and the budget
   is lab-only until traffic catches up.

---

*End of 03-performance.md. Next: 04 — Responsive foundations.*
