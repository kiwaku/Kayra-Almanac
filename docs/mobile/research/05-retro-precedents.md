# 05 — Retro / Minimalist Web Precedents (Research)

Scope: document retro, academic-minimalist, and brutalist web precedents that
share DNA with `kayra-almanac` — early-2000s typography, fixed measure,
pixelated figures, Courier/Arial stacks, `#0000EE` links, decorative overlays
(ProofStrip / LeftNav / InstrumentPanel / SNN). The aim is to catalogue what
these sites do on mobile and what tradeoffs they accept, not to pick this
site's mobile aesthetic.

Companion to `00-tooling.md` (tooling reference); sits alongside `01` (UI
conventions), `02` (typography), `03` (performance), `04` (responsive
foundations). Decisions happen after research — this doc stays descriptive.

Sources fetched with WebFetch / WebSearch April 2026. URLs cited inline; see
also the trailing "References" list.

---

## 1. Canonical minimalist sites

### 1.1 The "motherfucking website" lineage

A four-site satirical chain escalating from raw HTML to modest CSS. Each
iteration is itself a mini-essay on what minimum viable web design looks like.

**motherfuckingwebsite.com** <https://motherfuckingwebsite.com/>

- Pure HTML; no CSS; default `serif`. Reflows to any width because nothing
  prevents it. Stated stance (quoted): *"it responds to whatever
  motherfucking screensize it's viewed on."* Real responsiveness as a
  property of unstyled HTML, not media queries.
- Explicit framing — *"Yes, this is fucking satire, you fuck."* — but the
  earnest point (defaults work; dev adds problems) stands.
- **Mobile wins:** zero layout bugs at any width; no font-loading; survives
  Reader mode; scales with text-size preferences; works on 2G.
- **Mobile losses:** no measure constraint runs text to edge on phones; line
  lengths get uncomfortably long on landscape tablets. Chains of adjacent
  inline links fail the 44×44 HIG rule.

**bettermotherfuckingwebsite.com** <http://bettermotherfuckingwebsite.com/>

- Adds five CSS rules. Canonical quoted recipe (paraphrased from secondhand
  citation — direct fetch refused during research):
  - `margin: 40px auto; max-width: 650px;`
  - `line-height: 1.6;`
  - `font-size: 18px;`
  - `color: #444;`
  - `padding: 0 10px;`
- Arguments: generous line-height is the single biggest readability lever;
  `max-width` fixes measure; `#444` softens the contrast of pure black.
- **Mobile wins:** the `padding: 0 10px` is an explicit mobile concession —
  keeps text off the edge on phones. `max-width: 650px` degrades gracefully
  (no overflow) because it's a ceiling, not a floor.
- **Mobile losses:** `18px` hard-coded in pixels ignores user font-size
  preferences. `color: #444` on default white still hits ~8:1 contrast
  (fine), but aggregate choices (pixel units, no rem scale) leak into sites
  that copy-paste the rules without re-examining them.

**evenbettermotherfucking.website** <https://evenbettermotherfucking.website/>

- Adds `line-height: 1.8` (from 1.4/1.6) and `background: #f2f2f2` for softer
  contrast ("How often do you see black on white in real life?").
- No mobile-specific media queries. The changes are universal.
- **Mobile relevance:** 1.8 line-height is at the upper end of readable body
  copy; on a 375px phone with 18px body, it produces a very airy rhythm that
  pushes above-the-fold content count down sharply.

**thebestmotherfucking.website** <https://thebestmotherfucking.website/>

- ~35KB without images, ~63KB total. HTTPS, HTTP/2, cache headers, SVG over
  raster. Custom link color (off default blue/purple), `#454545` text.
  Explicit claim: *"fits on your iPhone 1st gen."*
- **Mobile losses:** moving off default `#0000EE` / `#551A8B` *removes* a
  convention affordance. Relevant to this site, which intentionally keeps
  `#0000EE`.

**Takeaway for kayra-almanac:** the "mfw" chain is the purest articulation of
the modern-retro stance — *responsiveness by default, not by design*. The
650px measure on `bettermfw` is within the same family as kayra-almanac's
880px (both pre-modern, both character-count-driven). The lineage validates
"no breakpoints" as a legitimate mobile strategy for dense, text-first sites.

### 1.2 Tufte CSS

<https://edwardtufte.github.io/tufte-css/>

- ET Book (custom webfont, separate italic/bold files — no synthetic
  transforms). Fallbacks: Palatino, Georgia. Sans option (`sans` class):
  Gill Sans. Monospace: Consolas → Courier.
- Off-white background `#fffff8`, off-black text `#111`. No `#0000EE` — Tufte
  himself declared "Blue text, while also a widely recognizable clickable-
  text indicator, is crass and distracting." Body-colored underlined links
  instead.
- Heading hierarchy: H1, `p.subtitle`, H2, H3. Explicitly discourages H4+
  ("redesign instead").
- **Mobile behavior — sidenotes:** on small viewports, marginal elements
  are **hidden by default** and toggled in via a `:checked` CSS trick on an
  invisible checkbox next to a numbered marker. Tap superscript → sidenote
  expands inline. No JS, no media-query rearrangement — *disclosure*, not
  *reflow*.
- **Mobile losses:** sidenotes discoverable *only* by tapping a small
  superscript — a 16px tap target fails HIG 44pt / Material 48dp. A reader
  who never taps never sees the notes. `fullwidth` figures downscale but
  can fall below readable resolution on 320px phones.

**Takeaway:** Tufte's precedent says *hide decorative/marginal affordances on
mobile rather than rearrange them*. Directly relevant to the SNN panel
question.

### 1.3 Bear Blog

<https://bearblog.dev/>

- Stated stance: *"No trackers, no javascript, no stylesheets. Just your
  words."* Pages ~2.7KB. Default blog template is system-serif or system-
  sans, single column, full-device width with modest padding.
- Default bear-blog CSS uses `max-width: 80ch`, system font stack,
  `line-height: 1.4`. No explicit breakpoints — the `ch` unit handles
  reflow since `ch` scales with font size, which scales with viewport
  preferences.
- **Mobile wins:** `max-width: 80ch` + no fixed pixels = the cleanest
  modern-retro fluid pattern that exists in active hosting today. Default
  link color is platform blue (varies by browser) — underlined, obvious.
- **Mobile losses:** because the theme is classless, any decorative element
  a blog author adds (banners, ASCII art, wide preformatted code) has to be
  handled per-post. No framework help.

**Takeaway:** `80ch` is the modern analogue of the fixed-pixel measure. If
kayra-almanac's 880px measure were re-expressed in `ch`, it would land
somewhere around 90–100ch at current body size — too wide. The `ch`-based
reformulation is worth noting as a responsive escape hatch that's still
"retro-compatible."

### 1.4 512KB Club

<https://512kb.club/>

- Rules: genuine content (not just links) + uncompressed web resources ≤
  512KB. Tiers:
  - **Green** < 100KB
  - **Orange** 100–250KB
  - **Blue** 250–512KB
- 800+ member sites. Smallest: `ctrl-c.club` (2.02KB). Reference green-tier:
  `seirdy.one` (20.6KB), `simplecss.org` (22.5KB). Blue ceiling examples:
  `healthchecks.io` (511KB).
- No mobile-specific rules — the weight budget applies uniformly.
- **Mobile relevance (indirect):** a 512KB budget on 3G means a
  first-contentful-paint within ~2.5s on typical mobile networks, which is
  where retro precedent and modern perf budgets (task 03) meet.
- **Decorative-element cost check:** The kayra-almanac ProofStrip +
  InstrumentPanel + animated signature already push toward Orange tier.
  512kb club membership is a feasible perf gate for the mobile pass if
  decorative assets stay in SVG/CSS rather than GIF/PNG.

**Takeaway:** 512kb club isn't a design spec, it's a weight ceiling. Relevant
to task 03 but cited here because most of its members *are* retro-minimalist,
so it's the de facto registry of current-day precedents.

### 1.5 Simple.css

<https://simplecss.org/>

- Classless CSS framework, ~10KB minified. System sans-serif local font
  stack. Fully responsive, automatic dark-mode flip, sensible defaults for
  all semantic elements.
- Explicit contrast: *"Bootstrap minified is 144KB, Simple.css is ~10KB."*
- No named breakpoints published, but the responsive behavior is built from
  `max-width` + percentage padding rather than media queries.
- **Mobile wins:** functions as a drop-in classless reset that works on any
  screen without author-written breakpoints.
- **Mobile losses:** zero personality — landing on a Simple.css site on
  mobile, you could not tell it apart from 100 others. Relevant because
  kayra-almanac's *personality* is the asset; a Simple.css-style mobile pass
  would destroy it.

---

## 2. Academic-web lineage

### 2.1 Tufte's principles carried to web

Tufte's print principles — high data-ink ratio, minimize chartjunk, use
small multiples, sidenotes over footnotes — map unevenly to web, and even
more unevenly to mobile.

- **High data-ink ratio** → translates cleanly. Less chrome = more content.
  Works at any viewport.
- **Sidenotes** → Tufte CSS's tap-to-disclose mechanism is the accepted web
  solution. Mobile degrades to disclosure, which is a *loss of peripheral
  context* — readers on mobile get a more linear read than readers on
  desktop. Not necessarily bad, but an asymmetry to be conscious of.
- **Small multiples** → notoriously bad on mobile. A grid of 4+ small charts
  either becomes unreadable (if preserved at scale) or becomes a vertical
  stack (if reflowed), which defeats the comparative-visualization purpose.
  No clean retrofit.
- **Measure / column width** → Tufte's preferred print measure (45–75ch) is
  roughly what modern responsive text-first CSS lands on naturally.

### 2.2 Content-is-king blogs (mobile retrofit survival)

- **Derek Sivers — <https://sive.rs/>:** plain text, unstyled links, deep
  density on one scrolling homepage. Mobile: scales fluidly; density
  survives because nothing was rearranged — already linear.
- **Dan Luu — <https://danluu.com/>:** deliberate austerity. Post list is a
  flat `<ul>`. Works perfectly on mobile because no layout was ever
  depended on. The austere endpoint — and zero personality, which is the
  tradeoff kayra-almanac is trying *not* to make.
- **Paul Graham — <https://paulgraham.com/articles.html>:** table-less HTML,
  spacer GIFs, no explicit width, no meta viewport, default browser-blue
  links. On mobile iOS Safari shows it at tiny default scale; users zoom
  or rely on Reader mode. Didn't retrofit — content is the draw; the form
  is aggressively uncorrected.

**Observation:** the three range from "fluid from day one" (Sivers, Luu) to
"never adapted, reader tools paper over it" (Graham). Survival pattern:
*either embrace flow from the start, or preserve the artifact and accept
reader mode as the mobile affordance.* Halfway retrofits age worst.

### 2.3 Early W3C vs current W3C

Early-2000s `w3.org` had the canonical "standards doc" aesthetic — Times
body, fixed narrow measure, blue-violet links, nested `<dl>` navigation.
Similar DNA to kayra-almanac. Current w3.org is fully modernized (system
sans, card layouts, responsive grids, "Skip to content", mobile-first);
zero early-2000s residue on the landing page. Spec pages (e.g.,
`www.w3.org/TR/WCAG22/`) retain the older typography because the spec
template is older — and those pages age best because they're read on
desktop by a narrow audience. W3C chose the clean break.

### 2.4 Academic faculty pages (.edu)

- Hallmarks: minimal/zero CSS, `<h1>` + `<ul>` of links, `<hr>` or `***`
  dividers, dated "last updated" footer, occasional surviving `<center>`
  or `<font>` tag.
- **Sedgewick** (`cs.princeton.edu/~rs/` → `sedgewick.io`): migrated to a
  modern CMS with hamburger nav. Retained module-per-book structure; lost
  raw-HTML feel.
- **MIT-hosted essays** (`mit.edu/~jcb/tact.html`): still default-browser-
  rendered. Reflows to viewport; readable but measure is uncomfortably
  long on 414px phones.

**Takeaway:** academic-page aesthetic survives when left alone (defaults +
text-first = adaptive) or migrated wholesale. Partial modernization ages
worst. kayra-almanac is already past "leave alone" (880px max-width,
explicit stacks, decorative panels) — a deliberate mobile plan is needed.

---

## 3. Terminal / monospace aesthetic on mobile

Monospace body type at small sizes is the single most fragile part of the
retro aesthetic on mobile. Relevant because kayra-almanac uses Courier for
mono elements and Arial for body.

### 3.1 Readability constraints

- Monospace fonts have fixed advance width per glyph, so measure expressed
  in characters is also measure expressed in pixels. At 14px mono on a
  375px phone, 1ch ≈ 8.4px, so max measure ≈ 44 characters before wrap.
  That's tight but workable for code blocks.
- At 12px (common on 2000s sites), 1ch ≈ 7.2px → ~52 characters at 375px.
  Readable for fluent English; fatiguing for long stretches.
- Terminal sites commonly use 13–14px mono at 640px+ viewport and fall to
  unusable readability at 320px without either scaling or overflow-x.

### 3.2 Terminal-themed sites on touch

- **`cli.club`** (512kb orange): monospace throughout, simulates a terminal
  prompt. Mobile falls back to single column, preserves mono, accepts
  lower density. Tap targets adequate because content is read-only prose.
- **`tilde.club`, `sdf.org`:** partially terminal-themed. On mobile mixed
  — some pages scale, others overflow horizontally. Users are self-
  selected technical; this is tolerated.
- **Neocities `<pre>` art:** usually desktop-sized. On mobile, either
  shrunk via `font-size: 2vw` (breaks at extremes) or allowed to overflow
  with `overflow-x: auto`.

### 3.3 Touch-specific concerns

- Monospace dense linkrolls produce tightly packed tap targets. WCAG 2.5.8
  (24×24) is achievable; HIG 44pt is not without line-height > 1.4.
- `<pre>` horizontal scroll works functionally but is discoverability-bad
  — users don't always realize a nested element can scroll.

### 3.4 Current-day references

- **`seirdy.one`** mixes mono and serif; both legible at small viewports.
  Uses system mono stack (`ui-monospace, SFMono-Regular, …`) rather than
  webfont Courier — much cleaner on iOS.
- **`gwern.net`** uses monospace for sidenote numbers and captions only,
  never body. At 320px, mono collapses but body serif remains — a
  practical compromise.

**Takeaway for kayra-almanac:** Courier is a stronger personality signal
than any other single font choice on the site. Preserving it on mobile
means either accepting the legibility hit (and increasing line-height to
compensate) or restricting Courier to non-body contexts (nav, captions,
timestamps, ProofStrip).

---

## 4. Brutalist / retro-academic revival

### 4.1 The `brutalist-web.design` manifesto

<https://brutalist-web.design/>

Seven principles, quoted:

1. **"Content is readable on all reasonable screens and devices."**
2. **"Only hyperlinks and buttons respond to clicks."**
3. **"Hyperlinks are underlined and buttons look like buttons."**
4. **"The back button works as expected."**
5. **"View content by scrolling."**
6. **"Decoration when needed and no unrelated content."**
7. **"Performance is a feature."**

- Explicit mobile stance: *"designing for a small screen by default."* The
  manifesto argues raw semantic HTML is the foundation; styling is what can
  go wrong, not what makes it work.
- The site itself uses system fonts (Helvetica headings, Calisto body), no
  webfonts, no JS. It's the living demo of its own rules.
- Principle 3 (underlined hyperlinks) is explicitly aligned with
  kayra-almanac's `#0000EE` choice — *convention over novelty*.
- Principle 6 is the critical one for decorative elements: *"decoration
  when needed"* leaves room for personality, but *"no unrelated content"*
  pushes against pure ornament.

### 4.2 `brutalistwebsites.com` curated examples

<https://brutalistwebsites.com/>

Curated directory. Example sites visible at time of research:

- RAW Magazine, Logic Magazine (`logicmag.io`), Dissentient, Nelson
  Heinemann, NWEB Club, Stedelijk Museum Amsterdam (`stedelijk.nl`),
  Supreme New York (`supremenewyork.com`), Aphex Twin (`aphextwin.warp.net`).
- Common traits: monochrome or limited palette, dense typography,
  asymmetric layouts, deliberate "unfinished" feel.
- **Mobile patterns observed in the curation:** minimal evidence of
  responsive optimization. Most prioritize desktop. Several use a single
  column that scales, but densely-packed grid-heavy brutalist layouts often
  overflow or compress below legibility on phones.

This is a key data point: the brutalist movement *does not have a solved
answer for mobile*. It either:
  - uses raw HTML that degrades fluidly (the "brutalist-web.design" end), or
  - declares itself desktop-first and accepts mobile breakage (the
    `brutalistwebsites.com` gallery end).

The middle ground — ornate brutalism + good mobile — is rare.

### 4.3 Y2K / early-2000s revival

From WebSearch synthesis (HubSpot, Framer, Colorlib, HTMLBurger, Awwwards):

- Revival aesthetic: pixel art, vintage type, oversized sans, clashing
  colors, `<table>` / `<marquee>` references, animated GIFs.
- Modern revivals pair visual retro with *modern mobile engineering* —
  responsive grids, webfonts, view transitions. Look retro, pipeline not.
- "Console UI" portfolios (keyboard-driven grids) are particularly bad on
  mobile — no keyboard, no hover.
- Common degradation: at narrow viewports, decorative chrome is replaced
  with a vertically-stacked plain view — the opposite of the desktop
  experience, its own failure (personality erased).

### 4.4 Neocities revival

<https://neocities.org/> hosts a large community of modern-retro sites.
Patterns:

- `<table>`-based layouts still widespread (see §6 on webrings).
- Many sites are *explicitly* not mobile-friendly and advertise this
  ("best viewed on desktop"). The community treats this as a feature,
  not a bug — mobile use is a compromise the author chooses not to make.
- A minority of Neocities authors do engineer for mobile; these tend to
  use CSS grid on a base of retro typography, keeping the aesthetic while
  restoring reflow.

---

## 5. Decorative elements on mobile

The site-specific question: what does precedent say about keeping
ProofStrip, LeftNav, InstrumentPanel, SNN, canvas traces, and the signature
GIF when stripping for mobile?

### 5.1 GIF signatures, animated marks

- **Preserve (precedent):** animated GIFs are load-cheap and carry strong
  personality. Survive at natural size on mobile if authored ≤200px wide.
- **Drop (precedent):** desktop-width GIFs (400px+) compete with body
  content in a vertical single column. Most revivals *resize down*, not
  drop.
- **Tufte `fullwidth` pattern:** figures scale; still appear, smaller.
  Defensible mobile treatment — preserve presence, downscale resolution.
- **Performance:** animated GIFs are the worst asset-per-KB type (no
  compression, no keyframe reuse). 50KB signature OK; a page of them not.
  512kb budget implies ≤2 GIFs/page.

### 5.2 Canvas traces

- Rare in retro-academic precedents (modern JS affordance). Where present
  (e.g. `bruno-simon.com`), mobile support ranges from "disabled below
  breakpoint" to "reduced-quality render."
- Touch/battery: continuous repaint drains battery, triggers iOS low-
  power throttling. Mitigation: `prefers-reduced-motion` + explicit
  disable under viewport threshold.
- No strong retro-precedent for canvas on mobile — retro-faithful move
  is likely to disable.

### 5.3 Panel overlays (LeftNav, InstrumentPanel, SNN)

- **Tufte sidenotes:** cleanest precedent for marginal decoration on
  mobile. Convert to disclosure, not reflow.
- **Terminal-panel sites** (`cli.club` etc.) disable/flatten panels on
  mobile; personality concentrates in typography and color palette.
- **Supreme / Stedelijk brutalism:** keep desktop panels intact, accept
  mobile compromise (tolerated for brand reasons).
- **Academic PDF-facsimile sites:** preserve "paper margin" framing on
  mobile — 2–4px border + inner padding evoking a page edge. Much
  cheaper than a full panel.

**SNN panel specifically:** already flagged desktop-only. Precedent
supports that — consistent with Tufte sidenotes and `cli.club` /
`nelsonheinemann.com`. Open question: does the personality it carried
*transfer* to another element (ProofStrip, typography) on mobile, or is
it simply absent?

### 5.4 The personality-preservation problem

Wholesale stripping produces a Simple.css clone. Precedents for stripping
without erasure:

- **Concentrate personality in typography.** Sivers, Luu, Bear Blog have
  no decoration; personality lives in voice + baseline type.
  kayra-almanac's Arial-italic-bold headers, Courier mono, and pixelated
  `image-rendering` survive mobile trivially.
- **Concentrate personality in color.** `#0000EE` links alone carry
  substantial 2001-ness at any viewport.
- **Concentrate personality in microcopy / structure.** ProofStrip-style
  header tags, Courier "last-edited" dates, "cite" boxes — cheap, read
  well at narrow widths.
- **Keep one signature decorative element.** The animated signature GIF
  is the likely survivor. Cf. Donald Knuth's page — a single cartoon at
  top, otherwise plain.

---

## 6. Linkroll / webring patterns

### 6.1 Lineage

- Webrings invented 1994; circular network of sites with "previous/next/
  random" navigation. Hallmark 2000s affordance for topical communities.
- Linkrolls (sidebar blocks of "sites I read") predate RSS and survived
  into the early blogosphere. Resurgent now as part of IndieWeb.

### 6.2 Modern revival

- **IndieWebRing** — <https://xn--sr8hvo.ws/> (aka <https://🕸💍.ws/>),
  maintained by Marty McGuire. Members embed a small widget that navigates
  to the previous/next/random site in the ring.
- **Onionring.js / Garlic Garden** — the most common embeddable widget.
  Default styling uses `<table>` layout.
- Active in Neocities, personal static-blog circles, Bear Blog community,
  and the broader "small web" scene.

### 6.3 Mobile handling — where the pattern breaks

The cited "Open Letter to the Indie-web" (<https://ironminer888.neocities.org
/writing/articles/open_letter_to_indieweb/>) documents the core issue:

- Many webring widgets use fixed-pixel `<table>` layouts. On small
  screens, the table does not reflow — elements flow offscreen and get
  cut off.
- *"The layout becomes unusable on smaller screens. Content fails to wrap
  or scale appropriately. High zoom factors (needed by vision-impaired
  users) cause further overflow."*
- Screen readers also misinterpret `<table>` layouts as data tables
  unless ARIA metadata is added, which most widgets don't.
- Proposed fix: switch to `<div>` + CSS Grid/Flexbox, use relative units
  (vw, vh, rem, ch), add media queries.

### 6.4 Patterns that survive mobile

- **Text-only linkroll** (bullet list of site names with short
  descriptions) — degrades to a single column cleanly. No widget code
  needed, no JS. Closest to the original 2001 `<ul>` in a sidebar.
- **Single-line navigation widget** (← prev | random | next →) — at 44px
  minimum tap height, renders fine on 320px viewport. Most IndieWeb
  widgets do this; the failure mode above is for *decorated* widgets
  that also include banner imagery.
- **Separate /links or /blogroll page** rather than sidebar embed —
  avoids the widget-on-every-page layout cost entirely. Dan Luu does
  this implicitly (no blogroll at all).

**Takeaway:** if kayra-almanac adds a webring/blogroll affordance as part
of the retro treatment, the safe precedent is a plain `<ul>` of links on
a dedicated page, not an embedded desktop-sized table widget.

---

## 7. Density preservation at 320–428px

Retro sites are information-dense. Mobile viewports, by modern convention,
are information-sparse. How do the cited precedents resolve this?

### 7.1 Strategies observed

- **Embrace single-column density.** Sivers, Luu, Graham: dense content,
  no layout to lose. Limit: line length gets long on landscape tablet
  without a max-width.
- **Constrain measure in `ch` not `px`.** Bear Blog `max-width: 80ch`;
  Tufte mixes `em` + percentage. Readable at any font-scaling factor.
- **Reduce baseline line-height below modern defaults.** Modern
  (Material/iOS): 1.5 body. Retro-academic: 1.25–1.4. Dropping to 1.3 at
  375px/16px preserves more content per scroll at small legibility cost.
- **Keep secondary info inline, not boxed.** 2000s academic sites inline
  citations, dates, meta ("last edited Apr 2026") in prose or at line
  end. Modern convention cards them — expensive vertically.
- **Drop to a denser type scale on mobile.** Material 3 / HIG recommend
  *larger* body (17pt). Retro precedents often go *smaller* (14px). The
  core conflict from §8.

### 7.2 The ProofStrip / LeftNav question

These panels *carry information*, not just ornament. Precedent for
info-carrying chrome on mobile:

- **Collapse to inline summary** — LeftNav becomes a sentence of links.
- **Promote to a dedicated page** — nav becomes `/nav` or `/index`.
- **Disclosure (Tufte)** — a small marker at top that expands.

---

## 8. Cross-references to 01 / 02 / 04

Conflict points where retro precedent pulls against modern UI convention.
Not resolved here — flagged for `docs/mobile/decisions/` to pick up.

### 8.1 Link underline & color

- **Retro (`brutalist-web.design`, kayra-almanac current):** `#0000EE`
  underlined — convention signal > novelty.
- **Modern (Material 3, iOS):** primary-color, optionally underlined,
  sometimes only on hover.
- **Conflict:** `#0000EE` on `#fffff8` is ~8:1 — passes WCAG AA, low
  "brand-feel" affordance. Dense inline-link paragraphs produce visually
  noisy links on small screens; adding line-height to give underlines
  room conflicts with density (§7).

### 8.2 Touch target on dense link lists

- WCAG 2.2 §2.5.8: 24×24 CSS px (AA). HIG: 44×44 pt. Material: 48×48 dp.
- Retro (linkrolls, Tufte sidenote markers, webring widgets): 12–16px
  targets embedded in prose.
- Conflict: retro inline linkroll is WCAG-24 compliant but fails HIG/
  Material. Precedent splits — Tufte accepts failure; webring retrofits
  accept the 44px minimum.

### 8.3 Body font size

- Retro: 12–14px Arial/Times; ~18px "better mfw" line.
- HIG: 17pt minimum preferred. Material: body-large 16sp. iOS Dynamic
  Type: respect user scaling.
- Conflict: literal 14px retro body fails every modern baseline; 18px
  compromises the density signature of the desktop look.

### 8.4 Measure

- Retro: 650–880px fixed (kayra-almanac: 880). Modern responsive: 65–80ch
  or full-viewport minus padding.
- Fixed px ≥ 376 overflows on phone. Retro precedent implicitly accepts
  this (pre-responsive era); modern revivals shift to `ch`.
- Conflict: preserving 880px as a signature while avoiding overflow needs
  `max-width: min(880px, 100vw - 32px)` — the site stops being "880px"
  and becomes "whatever fits."

### 8.5 Hover-dependent affordances

- Retro: hover states, `title=` tooltips, hover-toggled sidenotes.
- Mobile: no hover. Tufte builds sidenotes on `:checked` tap-toggle,
  accepting hover is unreliable. Many brutalist sites don't handle it.

### 8.6 Decorative elements as affordances

- Retro: decoration carries identity; heavy ornament is a feature.
- Modern (HIG, Material): strip ornament on small viewports; cognitive
  load is the enemy.
- Conflict: kayra-almanac's ProofStrip/InstrumentPanel/SNN are *identity-
  critical ornament*. Tufte's disclosure pattern is the nearest middle.

### 8.7 Content density vs. whitespace

- Retro: density is a feature, info per screen high.
- Modern: whitespace is a feature, info per screen low, scroll
  compensates.
- Conflict: retro's "high" clashes with modern mobile reading posture
  (short bursts, low focus).

---

## 9. Open questions

Questions this research doc surfaces but doesn't answer. For
`docs/mobile/decisions/`:

1. Does the site target 512kb club Green (≤100KB) or Orange (≤250KB) on
   mobile? Decorative-asset budget follows directly from this.
2. Which decorative element, if any, is the "signature survivor" on mobile?
   Precedent suggests one survives; the choice is Art.
3. Does the measure stay in `px` (consistent with desktop), move to `ch`
   (Bear Blog pattern), or become viewport-clamped (`min(880px, 100vw -
   32px)`)?
4. Does Courier survive as body type anywhere on mobile, or retreat to
   nav/caption/timestamp?
5. Is the SNN panel's personality migrated to another element or simply
   absent on mobile? (Related: do other decorative panels also migrate
   personality rather than vanish?)
6. What is the target body font size — 14px (retro), 16px (compromise),
   17–18px (modern HIG/Material)?
7. Does the mobile pass implement Tufte-style disclosure for marginal
   content, or a flatter inline approach?
8. Link color: hold `#0000EE` unconditionally, or allow a derived
   accessible-contrast variant on specific backgrounds?
9. Is there a webring/linkroll affordance planned? If yes, plain `<ul>`
   on a dedicated page or embedded widget?
10. Does the site accept "degraded on mobile, best on desktop" framing
    (Neocities stance), or must every personality signal survive?

---

## 10. Conflicts with modern conventions — explicit list

1. `#0000EE` links vs. brand-color link conventions in modern design
   systems.
2. 12–14px body vs. 16–17pt mobile body minimums (HIG/Material).
3. Fixed-px measure (880px) vs. responsive `ch` or percentage measure.
4. Dense inline tap targets vs. HIG 44pt / Material 48dp minimums.
5. Decorative panels (ProofStrip / LeftNav / InstrumentPanel / SNN) vs.
   mobile convention to strip ornament.
6. Courier body type vs. system mono or sans on mobile for legibility.
7. Hover-dependent sidenotes/tooltips vs. touch-first affordances.
8. Pixelated `image-rendering` vs. high-DPR phone screens where pixelation
   reads as low-quality rather than intentional.
9. Italic-bold headers vs. modern mobile heading patterns (larger,
   lighter-weight sans).
10. Density-per-viewport vs. whitespace-per-viewport reading conventions.
11. Browser-default reflow (mfw stance) vs. engineered mobile breakpoints
    (modern responsive design).
12. Animated GIF signatures vs. `prefers-reduced-motion` / battery /
    perf-budget constraints on mobile.
13. `<table>`-layout webring widgets vs. WCAG reflow and screen-reader
    conventions.
14. Academic-web side-margins-as-design vs. phone edge-to-edge layouts.
15. "Content is king, design minimal" (mfw, brutalist-web.design) vs.
    "preserve personality" (this site's spine) — both are retro, but
    they point different directions for what to keep.

---

## References

- <https://motherfuckingwebsite.com/>
- <http://bettermotherfuckingwebsite.com/>
- <https://evenbettermotherfucking.website/>
- <https://thebestmotherfucking.website/>
- <https://edwardtufte.github.io/tufte-css/>
- <https://bearblog.dev/>
- <https://512kb.club/>
- <https://simplecss.org/>
- <https://brutalist-web.design/>
- <https://brutalistwebsites.com/>
- <https://sive.rs/>
- <https://danluu.com/>
- <https://paulgraham.com/articles.html>
- <https://sedgewick.io/>
- <https://www.w3.org/>
- <https://www.w3.org/TR/WCAG22/>
- <https://xn--sr8hvo.ws/>
- <https://indieweb.org/webring>
- <https://ironminer888.neocities.org/writing/articles/open_letter_to_indieweb/>
- <https://www.webdesignmuseum.org/gallery/year-2000>
- <https://seirdy.one/>
- <https://neocities.org/>
- Curation/synthesis sources: HubSpot, Webflow, Framer, Awwwards "retro",
  Colorlib, HTMLBurger (all via WebSearch, April 2026).
