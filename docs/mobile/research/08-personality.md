# 08 — Restoring Visual Personality on Mobile (Research)

Scope: after the mobile MVP shipped (per `docs/mobile/implementation/MVP-TEST-REPORT.md`)
the site's owner verdict was that the stripped-down mobile composition "looks
very poorly made and unintentional." The MVP is legible and technically
correct — WCAG 1.4.10 reflow, 44 px standalone tap targets, `__snnRan=false`
on mobile, 16 px/1.5 body, `min(880px, 100vw − 32px)` measure — but a lot of
the visual signalling that made the desktop site feel deliberate was removed
with the chrome. This doc catalogues what personality elements the desktop
site carries, what actually survives into a 375 × 812 phone today, and what
patterns could put intentionality back without reintroducing anything from
the decision-01 don't-build list.

Research only. No CSS, no Astro code beyond single-line illustration. The
follow-up decisions doc picks what ships.

Companion to: `05-retro-precedents.md` (primary input), `07-overview.md`
§3.5 (flagged the unresolved question), `01-ui-conventions.md` §5,
`02-typography.md` §6, `03-performance.md` §3–§5, and the decision in
`docs/mobile/decisions/01-scope-and-floor.md`.

---

## 1. Inventory of current desktop personality elements

Each row: *element · what it signals · mobile state today · cost*.

### 1.1 Layered chrome (fixed-position overlays)

| Element | Signals | Mobile today | Cost |
|---|---|---|---|
| **SNN panel** (`#snn-panel`, `BaseLayout.astro:87-114`, canvas + SVG LIF network) | computation-adjacent; live-instrumentation ("we measure things on this site"); craft (5 file read via `/assets/neural_graph.svg`); academic-era "lab apparatus" | `display:none` in the mobile `@media` block (theme.css:799-806); the IIFE early-returns via `matchMedia('(min-width: 768px)')` (BaseLayout.astro:326) and `window.__snnRan=false` | Desktop: ~500 lines inline JS, 1 SVG fetch, `requestAnimationFrame` loop. Mobile: zero (correctly gated per 06 §9). |
| **InstrumentPanel** (`#instrument-panel`, Courier 11 px readout of cursor/scroll/CPU/DPR/UA/velocity sparkline) | diagnostic-HUD; "this page is alive and reporting its own state"; Courier-as-voice | `display:none` on mobile via component-scoped `@media` (InstrumentPanel.astro:134-138) | Desktop: `rAF` loop, `mousemove`/`scroll` listeners, canvas per frame, ~930 lines Astro incl. debug gridline toggle. Mobile: none. |
| **LeftNav** (`aside.left`, `.leftnav` uppercase link rail, signature GIF badge) | academic/lab navigation; a *rail* rather than a *menu*; Courier shortcuts line (`E`, `R`) reinforces keyboard-era | `display:none` on mobile (theme.css:799-806); shell collapses to single column | Desktop: negligible HTML. Mobile: absent. |
| **Nav-separator beads** (`/assets/littbut.gif` between footer links, `BaseLayout.astro:54-66`) | 1999 web-ornament vocabulary (ARJ/anipoke beads); hand-coded feel | Currently visible between each footer nav entry on mobile — but the parallel polish task is removing them to satisfy 44×44 standalone tap targets without the beads cramping the line | Desktop: 7 × littbut.gif (cacheable, tiny). Mobile: same. |
| **Keyboard-shortcut line** (`.footer-shortcuts` "Shortcuts: Evidence [E] · Raw [R]") | keyboard-era academic UX | Visible on mobile but referents (`E`/`R` keys) don't exist on touch — being stripped by the polish task | Zero bytes. |
| **Raw-markdown `<details>` toggle** (`details.raw`, BaseLayout.astro:39-42) | plain-text-first academic honesty ("here is the source"); retro-web "view source" spirit | Still present on mobile; summary is a tap target (44 px via theme.css:862) | Small. Renders only when opened. |

### 1.2 Typographic / color identity

| Element | Signals | Mobile today | Cost |
|---|---|---|---|
| **Body: Arial 16 px / line-height 1.35 (desktop) or 1.5 (mobile)** | early-2000s Arial default ("undesigned" on purpose); paper-and-ink voice | Mobile: 16 px / 1.5 (per MVP test #14, #15) | Zero. |
| **Italic-bold H1/H2/H3 Arial** (`theme.css:72-92`, 24/20/18 px) | academic-paper subhead ("Results", "Methods"); most characteristic typographic move | Intact on mobile | Zero. |
| **Courier mono** for: ProofStrip, `.badges`, `.tag`, `.loglist .meta`, `.back-to-index`, `.leftnav-shortcuts`, `.footer-shortcuts`, `details.raw pre`, `diagram-section` hint, KaTeX fallbacks | terminal / lab notebook / computation-adjacent; strongest single personality signal per 05 §3 and 05 §5.4 | Mostly intact on mobile wherever the host element survives (ProofStrip yes, `.badges` yes, `.loglist .meta` yes, `.leftnav-shortcuts` no because LeftNav hidden, `.footer-shortcuts` line being stripped) | Zero network. Courier fragility per 02 §6 / 02 §9 (iOS SF Mono vs Android Roboto Mono divergence). |
| **`#0000EE` / `#551A8B` / `#0000CC` link palette** (theme.css:6-8) | convention-over-novelty; 2001 browser-default; badge of retro (`brutalist-web.design` principle 3 per 05 §4.1) | Intact; passes AA/AAA per 02 §5 | Zero. |
| **`.badges .active` green `#2f8f2f`, `.archived` red `#b33a3a`, `.paused` amber `#b08900`** | single-word status tokens ("active" in green Courier next to a project title); lab-instrument coloring | Intact wherever badges render | Zero. |
| **`image-rendering: pixelated`** on body + `.leftnav-badge img` + `.footer-badges img` | "these are 1:1 pixel artworks, not anti-aliased photos"; deliberate low-DPI on 3× screens | Applied universally via `body` rule (theme.css:29); legitimately visible on the signature GIF and footer badges | Zero. Note 05 §10 bullet 8 flagged reading-as-low-quality on high-DPR phones — unresolved. |
| **Numeric leading-zero `.numlist .block::before`** (`counters(sec, "", decimal-leading-zero)` at theme.css:601) | academic/print numbering (`01 02 03`); drop-shadow filter gives a faint embossed feel | Present on any page that uses `.numlist` | Zero. |
| **Diamond markers `.diamondlist ::before { content: "◆" }`** (theme.css:629-637) | index.astro home page featured list marker; a single-glyph personality hit | Present on `/` | Zero. |

### 1.3 Image-based identity

| Element | Signals | Mobile today | Cost |
|---|---|---|---|
| **Signature GIF** (`/black_sign.gif` in `.brand`, BaseLayout.astro:26, 32 px tall) | handmade; author presence; "this site was built by a person"; closest equivalent to Knuth's cartoon per 05 §5.4 | Intact; pixelated rendering preserved | A single GIF request; no `prefers-reduced-motion` handling yet (doc 01 decision 16 says universal honoring but the current markup ships an animated `<img>` with no static fallback). |
| **Flag GIFs** on `/about` (SG, TH, KH, JP, DE, GB — `/assets/flags/*.gif`, about.astro:78-181) | travel-log / field-work academic; period-correct web-vocabulary | Intact on mobile about page | Each ~1 KB; multiple per page. |
| **Project imagery** (up to 21 PNGs on image-heavy project pages, e.g. `/projects/crest-snn`) | evidence-first / density; "we show our work" | All render on mobile, constrained by `.content img { max-width:100%; max-height:60vh }` (theme.css:737-745) | Per-page weight varies; no mobile-specific srcset. |
| **Footer badges** (`.footer-badges img`, pixelated) | 2000s "I support…" / webring-like sigils | Present on mobile; `display:flex` with `flex-wrap:wrap` (theme.css:317-329) | Small, cacheable. |

### 1.4 Structural identity

| Element | Signals | Mobile today | Cost |
|---|---|---|---|
| **The 880 px measure** (`max-width: min(880px, 100vw − 32px)` on `html, body`) | pre-modern fixed measure, narrower than 1000-px-era full-width; Bringhurst-compatible per 02 §2 | On mobile reduces to `100vw − 32px` (≈ 288 px at 320, 343 at 375 per MVP test #16) — still signals "reader" but the *880 specifically* is invisible below 880 | Zero. |
| **ARJ-style footer** (`.nav-footer` — centered, italic-bold-underlined link row, metadata line, copyright line, credits line, shortcuts line, site-by-name line) | 1999 shareware "about / support / visit site" format; dense, multi-line; explicitly kept rather than deleted | Intact on mobile; link row wraps | Zero. |
| **ProofStrip tape** (`components/ProofStrip.astro` — Courier 13 px `[OK] N projects · 12 shipped tools · N OS builds · last update: YYYY-MM-DD`) | CI-pipeline / lab-status "this is in a running state"; single-line hard-edge under the header | Visible at top of every page on mobile (no media query hides it) | Zero. |
| **`<details>` Raw Markdown toggle** | source-honesty; "the prose and its raw form are the same thing" | Present on mobile | Small. |
| **Pixelated hover-zoom diagrams** (`.diagram-section` pattern, theme.css:373-415) | lab-figure treatment; hover-reveal zoom hint uses Courier 11 px | Partial — hover-only affordance doesn't fire on touch (theme.css:398-414), but the border + label still read as a figure | `background: #f9f9f9; border: 1px solid #ddd` per figure. |

### 1.5 Where each desktop element "speaks" the identity

Synthesising — the desktop identity is carried by **six overlapping
registers** that currently all fire in chorus:

1. **Instrumentation voice** — SNN panel + InstrumentPanel + ProofStrip
   together say "this is a lab/workshop site." Two of the three are hidden
   on mobile; ProofStrip alone survives.
2. **Typographic voice** — italic-bold Arial heads, Courier labels, 16 px
   Arial body. Survives on mobile largely intact.
3. **Chromatic voice** — `#0000EE`/`#551A8B` links, `#2f8f2f`/`#b33a3a`/
   `#b08900` status colours, `#111` on white. Survives.
4. **Ornamental voice** — littbut.gif beads, diamond glyphs, numeric leading
   zeros, pixelated rendering, the signature GIF. About half survives
   (ornamental beads being stripped by polish; diamonds/numbers only where
   the containing list appears).
5. **Structural voice** — 880 px measure, fixed-pos overlays, LeftNav rail,
   ARJ-style footer. Measure is mathematically different below 880; two
   overlays gone; LeftNav gone; ARJ footer present.
6. **Signature voice** — the animated GIF at the top, the flag GIFs on
   `/about`. Both present, both undegraded.

---

## 2. Inventory of current mobile personality elements (375 × 812, home)

Opening `/` on a 375 × 812 device today, a reader sees, in scroll order:

1. **Signature GIF** (`/black_sign.gif`, 32 px tall) at top-left — animated
   unless `prefers-reduced-motion` emulation catches the universal
   duration-clamp rule in theme.css:877-887 (that rule affects CSS
   `animation-duration` / `transition-duration`, not animated-GIF frame
   advance — so the signature GIF *does not currently honor* reduced-motion
   despite decision 01 §4 §16 saying it should; flagged under §8 below).
2. **ProofStrip tape** — one line of Courier 13 px: `[OK]` in green,
   then `N projects · 12 shipped tools · N OS builds · last update: …`
   with interpunct separators. Background `#f8f8f8`. This is the only
   overtly "instrumentation-voice" element left on mobile.
3. **Index kicker** — "Three flagship builds. *Full list in* CATALOG" —
   italic-muted prose plus a small-caps-ish link at 13 px. Arial only.
4. **`.diamondlist` with three featured projects** — each `◆` marker,
   italic-bold title, `(2024)` muted year, optional project-badge image,
   body summary, artifact row of project-asset links, then a Courier
   badges line (`LOC 18500 · GPU 12h · BOOT 4s · active`) where
   `active` is green Courier.
5. **`<h3>` "Latest Logbook"** — italic-bold 18 px Arial.
6. **`.loglist`** — five entries; each is a `<a>` with date then em-dash
   then title, in body copy.
7. **ARJ-style footer** — centered italic-bold-underlined link row
   (Index, About, Catalog, Logbook, Hardware, Notebooks, Gallery, Shrine)
   with (as of today, pre-polish-PR) littbut.gif beads between each;
   copyright line, PGP fingerprint in italic small, "Site by Kayra Arai
   · Updated: October, 2025", "Served statically with Astro · Built
   without frameworks", Courier shortcuts line.

What is **missing** versus desktop:

- No SNN canvas, no InstrumentPanel, no LeftNav rail (correctly removed).
- No LeftNav signature "powered by" badge.
- No LeftNav shortcuts line.
- No 880 px "paper" feel — the measure is 343 px, which is comfortable
  but gives up the strong "narrow column on a wide page" identity cue.
- No hover-reveal on diagrams (not applicable on touch).
- After the polish PR: no littbut.gif beads in the footer; no keyboard
  shortcuts line.

What survives as personality:

- Courier in ProofStrip (one line).
- Courier in `.badges` under featured projects (four tokens).
- Courier in `.loglist .meta` if the list renders meta.
- Green/red/amber status words.
- `#0000EE`/`#551A8B` links, underlined.
- Italic-bold Arial heads.
- Animated signature GIF (one).
- Diamond markers (three, only on home).
- ARJ footer structure and italic-bold-underlined link style.

That is: personality now concentrates in **typography + color + one GIF +
a single Courier status line**. Cf. 05 §5.4's "concentrate personality
in typography / color / microcopy / one signature decorative element"
pattern — this is exactly that pattern, but executed *without any
intentional additions to compensate* for what was removed. The result
reads as "a Bear Blog clone with a signature GIF at the top," not as
kayra-almanac.

---

## 3. The gap

A desktop reader opens the site and sees a composed page: fixed overlay on
the right is updating a velocity sparkline; below it a small SVG neural
graph is flashing spikes; left of the content column, an uppercase rail of
section links with a Courier `Shortcuts: E R` reminder and an 88 × 31
"powered-by" GIF; at the top, an animated signature, then a Courier status
tape; and below, an 880-px reading column framed by decorative margin. The
mobile reader, per §2, sees a signature GIF, a Courier status tape, and
then undifferentiated Arial 16/1.5 prose down to an italic-bold-underlined
link row in a plain-centered footer. Everything that said "this page was
built with deliberate craft" on desktop is either hidden or was never
specifically designed for a narrow viewport, so mobile doesn't carry the
intentionality signal — it reads as what 05 §1.5 calls a "Simple.css
clone," landing on which you "could not tell it apart from 100 others."
The site's voice is still there in typography and palette, but there is no
single decorative *choice* on mobile that reads as intentional — only
*absences*.

---

## 4. Candidate personality elements that work on narrow viewports

Each candidate: brief description, precedent cite, rough cost. Not ranked
yet — §6 does that.

### 4.1 Monochrome decorative rules

Hair-weight (`1px solid #000` or `#ccc`) single or double rules between
sections, plus optional all-dashes / all-dots / box-drawing variants
rendered as CSS `::before { content: "──────" }` or `border-top`.

- **Precedent:** Tufte CSS uses double horizontal rules between major
  sections (`<hr>` styled as a pair of 1-px lines, per 05 §1.2). Academic
  `.edu` faculty pages (05 §2.4) routinely use `<hr>` or `***` as
  dividers. `brutalist-web.design` uses hair rules liberally.
- **Relevance:** theme.css currently does `hr, .divider { display:none
  !important; }` (theme.css:113-115). Reintroducing one restrained rule
  between content sections (not anywhere it cues "chapter break") would
  be a near-zero-cost intentionality marker.
- **Cost:** 0 bytes, 0 a11y risk (decorative; `role="presentation"` if
  drawn in CSS).

### 4.2 Typographic ornaments — pilcrow / section / interpunct / dinkus

Inline or standalone `¶`, `§`, `·`, `‖`, `※`, `❦`, the dinkus `* * *`,
the asterism `⁂`, or the figure dash `‒`.

- **Precedent:** Bringhurst (cited in 02 §2) endorses the dinkus and
  asterism for section breaks. Tufte CSS (05 §1.2) uses section marks
  for structural hierarchy. 05 §7.1's "keep secondary info inline, not
  boxed" pattern fits single-glyph separators between e.g. a date and a
  title in a linkroll.
- **Cost:** 0 bytes. a11y neutral if purely decorative; if used as a
  semantic separator, give the containing element a suitable role or
  wrap in `<span aria-hidden="true">`.

### 4.3 Drop caps / small caps on leading paragraphs

CSS `::first-letter { font-size: 2.6em; float: left; … }` or a more
restrained `.kicker { font-variant: small-caps; letter-spacing: .04em; }`
on the first line.

- **Precedent:** Tufte CSS explicitly supports `span.newthought`
  small-caps for an "opening phrase" look (05 §1.2). Academic journal
  lineage; early-2000s blogs (Kottke.org late-2000s era) used drop
  caps.
- **Tradeoffs:** a genuine drop cap fights narrow measure — at 343 px a
  3-line drop cap occupies ~30% of the first line-group. Small-caps on
  the index-kicker is lower-risk.
- **Cost:** 0 bytes. Screen readers announce the first letter
  normally; no a11y cost. Note `font-variant: small-caps` synthesises
  on system Arial because Arial has no native small-caps glyph —
  synthetic small-caps are slightly uneven but period-correct.

### 4.4 Marginalia / sidenotes collapsing to inline on mobile

The Tufte CSS sidenote pattern (05 §1.2, §5.3): a numbered marker in
prose, a checkbox-gated inline disclosure on mobile, a margin-positioned
note on desktop.

- **Precedent:** `edwardtufte.github.io/tufte-css` (05 §1.2); `gwern.net`
  uses the same pattern (05 §3.4).
- **Relevance:** this is the research's cleanest cross-viewport pattern
  — it was explicitly flagged as the closest precedent for mobile
  marginal decoration (05 §5.3, 05 §8.6). The cost on mobile is a
  superscript number (small visible affordance) and a disclosure.
- **Tradeoffs:** 05 §1.2 warns the 16 px tap target of a superscript
  fails HIG 44 pt; fixable with 01 §5.3 decoupling (invisible 44 px hit
  area around a 16 px visible marker). Requires content to exist —
  many kayra-almanac pages have no marginal notes to promote.
- **Cost:** 0 JS (pure `:checked` + `+ sibling` CSS). One invisible
  `<input type="checkbox">` per note.

### 4.5 Courier-mono ornament strings

Short Courier strings used decoratively rather than informatively —
e.g. `[···]`, `/// status: active`, `>> continue`, `===` block headers,
timestamp prefixes, `··· end ···`.

- **Precedent:** `cli.club` (05 §3.2), `tilde.club`, `sdf.org` use
  Courier ornaments pervasively. `brutalistwebsites.com` curated
  examples (05 §4.2) frequently include Courier runs. The site itself
  already has Courier ProofStrip / badges / meta.
- **Relevance:** 05 §3 — "Courier is the single strongest personality
  signal"; 05 §5.4 — "concentrate personality in microcopy /
  structure. ProofStrip-style header tags, Courier last-edited dates,
  cite boxes — cheap, read well at narrow widths."
- **Tradeoffs:** Courier at <12 px fails 02 §9; use ≥12 px on mobile.
  Overuse turns into pastiche.
- **Cost:** 0.

### 4.6 ASCII-art / Unicode-art footers and dividers

Box-drawing characters (`─ ┌ ┐ └ ┘ │ ═ ║ ╔ ╗`), hash rules
(`###################`), banner-style ASCII (`[ § LATEST § ]`,
`·─· fin ·─·`).

- **Precedent:** BBS / IRC / `sdf.org` / Neocities (05 §4.4) lineage.
  Tilde sites and text-mode aesthetic blogs use them in footers.
  `brutalist-web.design` uses spare hash-rule dividers.
- **Relevance:** most "intentional" looking per byte. Strong typographic
  signature.
- **Tradeoffs:** box-drawing glyphs rely on system mono having them;
  all three mono stacks do, but line up only in mono contexts.
  Screen-reader a11y: wrap in `aria-hidden="true"` so a VoiceOver user
  doesn't hear "box drawings light horizontal box drawings light
  horizontal…". Overuse reads as LARP; used once at section break or
  in a footer, reads as signature.
- **Cost:** 0 bytes.

### 4.7 Text-based status indicators

Standalone Courier tokens: `[online]`, `[building…]`, `[live]`,
`▲ latest`, `✱ new`, per-entry timestamps like `2026-04-18 14:02 —`.

- **Precedent:** ProofStrip is already an instance (`[OK]`). `cli.club`
  uses `[status: online]`. The current `.badges .active` in green
  Courier is this pattern already.
- **Relevance:** extends an on-spine element rather than importing a
  new vocabulary. Cheap to add to the loglist / project list.
- **Cost:** 0 bytes.

### 4.8 Retro loader / boot sequence

A once-on-first-paint printout (`> mounting…`, `> OK`, `> ready`) that
animates a ~1 s sequence and settles.

- **Precedent:** `tilde.club`-adjacent sites, some Neocities pages.
- **Evaluation:** requires JS (which is fine for ornament, but the
  decision-01 don't-build list bars "JS-driven" nav/drawer; a
  boot-sequence is JS-driven and should be examined). Also fights
  reading posture — readers open the page to read, not to wait.
- **Cost:** minimum ~50 LOC JS even if tasteful; conflicts with
  "no JS" direction of the MVP. Candidate for §5 reject list.

### 4.9 Faux terminal prompt

`kayra@almanac:~$` rendered once at top of each page, or at section
boundaries.

- **Precedent:** `cli.club`, `brutalistwebsites.com` examples,
  thousands of Neocities terminal-themed pages.
- **Relevance:** strong signature; no JS required (pure Courier).
- **Tradeoffs:** leans heavy on "is this a terminal?" metaphor that
  might not fit an academic-workshop site; might compete with the
  academic-paper voice of italic-bold heads.
- **Cost:** 0.

### 4.10 Sigils / single-character glyphs next to entry titles

One glyph per entry in a list — `§` before logbook dates, `¶` before
notebook titles, `◇` before hardware entries.

- **Precedent:** already in use on desktop (`◆` diamonds on `/`);
  Tufte CSS and academic journal lineage (05 §1.2).
- **Relevance:** cheap, semantic-feeling, scales down perfectly.
  Would promote the logbook/notebook lists from "plain `<ul>`" to
  "indexed sequence."
- **Cost:** 0 bytes. Each is `::before { content: "§"; margin-right:
  .4em }`. Wrap in `aria-hidden` if purely decorative.

### 4.11 Proof-strip variant for narrow viewports

Current ProofStrip is a single-line interpunct-joined run. A narrow
variant could split to two Courier lines, pad slightly, and add one
status bead (`[OK]` already exists) — essentially a mobile-specific
reflow rather than a removal.

- **Precedent:** on-spine. Doesn't need external citation.
- **Relevance:** the ProofStrip is the one surviving
  instrumentation-voice element. A mobile-specific composition (line 1:
  `[OK]` + project count + last-update; line 2: tool-count + OS-build
  count) could turn it from "afterthought that happens to fit" into
  "designed-for-mobile tape."
- **Cost:** 0.

### 4.12 Pseudo-element ornaments via CSS `::before` / `::after`

E.g. `h2::before { content: "§ " }`, `.loglist li::after { content:
" ┘" }`, `.footer::before { content: "═══"; display: block; … }`.

- **Precedent:** Tufte CSS heavy user; `simplecss.org` moderate; most
  classless stylesheets avoid (they want the content to be untouched).
- **Relevance:** the engine of many of the candidates above; called out
  as its own candidate because it is the vehicle.
- **Cost:** 0.

### 4.13 Static SVG ornaments

Hand-drawn rules, decorative flourishes, or small field-notebook marks
(inkline, hand-drawn arrows) inlined as SVG.

- **Precedent:** Tufte CSS ships such figures; `gwern.net` uses small
  inline SVGs for section breaks (05 §3.4).
- **Relevance:** strongest "homemade" signal. One shared inline SVG
  (e.g. a hand-drawn divider) in `BaseLayout` referenced via `<use>`
  would cost a few hundred bytes and land unmistakably period-correct
  and personal.
- **Cost:** ~300 bytes inline; zero network request. A11y: decorative,
  `aria-hidden="true"`.

### 4.14 Monospace metadata run

A per-page Courier line of date, tags, word-count, git-hash, last-edit
date under each `<h1>` or at the foot of each logbook entry.

- **Precedent:** ProofStrip is again the template. `gwern.net` uses a
  very similar metadata header.
- **Relevance:** re-asserts instrumentation voice on pages that don't
  currently display it (logbook entries, notebook entries, project
  pages).
- **Cost:** 0; metadata already exists in content-collection
  frontmatter.

### 4.15 Signature GIF repositioned on mobile

Currently the signature is a block-level header at the top-left. Could
be inline with the brand text, smaller, or moved into the footer
`.footer-credits` line (cf. Knuth-page "single cartoon at top").
Independently, honour `prefers-reduced-motion` by swapping to a
pre-rendered static first-frame PNG (`<picture>` with a
`(prefers-reduced-motion: reduce)` source).

- **Precedent:** 05 §5.1 — animated GIFs survive mobile if ≤ ~200 px
  wide; 05 §5.4 names this as the likely "signature survivor." Decision
  01 §4 §16 already commits to universal `prefers-reduced-motion`
  honoring.
- **Relevance:** executing the decision that was already made; one of
  the few places mobile-specific personality can be *added* by
  finishing an item that was already agreed.
- **Cost:** one PNG asset + a `<picture>` swap. ~300 bytes. No JS.

### 4.16 Other candidates briefly considered

- **Bordered "page" on mobile** (`1px solid #ddd` + 8 px inner padding
  evoking paper-margin framing, per 05 §5.3). Cost 0; reads academic;
  risk of looking like a card.
- **`<fieldset>`/`<legend>`-style section framing** for logbook or
  featured project. Period-correct; fights density slightly.
- **Datestamped log-entry prefix** (`2026-04-18 · §` before every
  logbook item). Overlaps 4.10 + 4.14.
- **Two-column key-value captions** under images (Courier label :
  value rows). Tufte-esque; only works where content provides the
  data.

---

## 5. Candidates to explicitly reject

All of these would restore personality but violate decisions already
made, don't-build items, or the MVP budget. They are listed here so
the decisions doc doesn't relitigate them.

- **Reinstate SNN panel on mobile in any form.** Contradicts decision
  01 §4 §16 (reduced-motion policy would neuter it anyway),
  decision 02's SNN fate (hide + IIFE gate), and the no-framework /
  no-`client:media` line in decision 01 §5. The whole 500-line IIFE
  is the single largest mobile perf tax the MVP removed. Do not
  revisit.
- **A second, mobile-specific canvas ornament.** Same argument as
  SNN. Canvas + `rAF` on a phone costs battery (05 §5.2) and
  trips reduced-motion policy.
- **Custom webfont to get a "weirder" typeface.** Pre-ruled-out in
  decision 01 §4 decision 12 and in 05 §1 lineage argument. The
  don't-build list is explicit.
- **A JS-driven retro boot sequence / type-on effect / Matrix-rain
  header.** Decision 01 §5 bars JS-driven nav-drawer animation and
  framework adoption; same principle applies to JS-driven ornament.
  Pure-CSS equivalents (4.1, 4.12) cover the intent.
- **PWA / manifest / theme-color retro styling of the browser chrome.**
  Pre-ruled-out, decision 01 §5 bullet 3. Personality must live in
  the page.
- **Hamburger with animated drawer / custom gesture.** Decision 01 §5
  bullet 6/7.
- **Auto-typed "current time / cursor position / CPU" retro HUD at the
  top of mobile pages** (i.e., a flattened InstrumentPanel). Same
  policy argument as SNN; `rAF` + listener cost on mobile is exactly
  what the MVP removed.
- **Reintroduce the LeftNav as a full-width top bar with uppercase
  Courier link rail.** Decision 02 §8 hides LeftNav on mobile; doing
  this pulls desktop chrome back in conflict with that decision.
  (Note: a *different* ornament element that happens to live at the
  top of the page is fine; duplicating the LeftNav is not.)
- **Marquee / blink / scrolling-text periodicities.** Reduced-motion
  policy bars continuous motion (decision 01 §4 §16). Even without
  the policy, these violate the "academic" side of the academic-retro
  hybrid.
- **On-mobile SVG canvas animation for the signature** (keep the
  signature *moving* by converting GIF → inline-SVG-with-SMIL). Looks
  clever; trips reduced-motion policy exactly the same way GIFs do;
  replaces a solved delivery (`<picture>` with reduced-motion PNG
  source) with a harder one.
- **Reading-page widgets (TOC floater, "reading progress" bar,
  share-to-social strip).** All cost bytes for zero retro signal, and
  03 §8 anti-pattern list argues against them. Not requested.

---

## 6. Shortlist

Ranked by personality-per-byte × coherence × a11y × implementation
effort. Ordering is opinionated; 1 is "most obvious ship" and 7 is
"defensible but needs picking." The decisions doc picks some subset
and doesn't have to take them in order.

| # | Candidate | From | Personality/byte | Coherence | A11y | Effort |
|---|---|---|---|---|---|---|
| 1 | **Signature GIF reduced-motion completion** (static PNG under `<picture>` + possibly a smaller mobile composition, maybe inline with brand) | §4.15 | high — finishes a signal already on the page | ✅ extends existing | ✅ fulfils decision 01 §4 §16 | low — one PNG, one `<picture>` swap |
| 2 | **Courier metadata run under each entry / page title** (date · tags · word-count / last-edited) | §4.14 + §4.7 | high — re-asserts instrumentation voice on pages with none | ✅ extends ProofStrip grammar | ✅ text, WCAG-fine at 12–13 px | low — data already in frontmatter |
| 3 | **Section-break ornament** — one chosen glyph (`§`, `¶`, dinkus `* * *`, or box-drawing `═══`) used consistently at subsection boundaries | §4.1 + §4.2 + §4.6 + §4.12 | high — single choice, high signature density | ✅ fits academic-paper voice | ✅ `aria-hidden` on decorative glyphs | low — one `::before` rule or one component |
| 4 | **Per-entry sigil in logbook/notebook lists** (`§` before date, `◇` before notebook title) | §4.10 | high — extends the already-shipping `◆` diamondlist vocabulary | ✅ extends existing | ✅ decorative | low — one `::before` rule |
| 5 | **Mobile-composed ProofStrip** (two-line Courier tape designed for narrow widths) | §4.11 | medium-high — upgrades a currently-undesigned element | ✅ on-spine | ✅ static text | low-medium — `@media` composition |
| 6 | **Tufte-style sidenote pattern** (checkbox-gated marginalia, inline on mobile) | §4.4 | medium — highest "craft" signal on a single piece | ✅ academic lineage | ⚠️ requires 44 px decoupled hit area (01 §5.3); content must exist | medium — MDX/component support |
| 7 | **Small-caps "newthought" leading-line** in kickers / opening paragraphs | §4.3 | medium — subtle but reads academic-journal immediately | ✅ fits italic-bold vocabulary | ✅ visual-only | low — one utility class |

Runners-up (considered, not shortlisted): retro loader (§4.8 — rejects
JS constraint), faux terminal prompt (§4.9 — voice-mismatch risk),
static SVG flourish (§4.13 — high reward but needs an asset the user
would need to draw).

---

## 7. How each shortlisted candidate maps to existing site slots

Concrete placement so the decisions doc can skip the "where does this
live?" question. Selectors are the ones present in the current tree
(theme.css + BaseLayout.astro + component files inspected).

### 7.1 Signature GIF reduced-motion completion (§6.1)

- **Location:** `src/layouts/BaseLayout.astro:24-28` — swap the bare
  `<img src="/black_sign.gif">` for a `<picture>` with a
  `<source media="(prefers-reduced-motion: reduce)" srcset="/black_sign_static.png">`
  and the current `<img>` as fallback.
- **Asset:** one new PNG rendered from the GIF's first frame (author
  supplies; ~2 KB).
- **Optional mobile-specific composition:** under `@media (max-width:
  767.98px)` consider reducing the logo to 24 px and moving it inline
  with a text "Kayra — Workshop Almanac" span, so the top of mobile
  pages reads as a signature+title line rather than a GIF-then-ProofStrip.
  Low priority next to the reduced-motion fix.
- **Desktop impact:** none if only the mobile composition changes.
  Reduced-motion `<picture>` swap applies on desktop too (correctly).

### 7.2 Courier metadata run (§6.2)

- **Location:** at the top of each single-entry page (logbook, notebook,
  project detail). Rendered inside the `SectionLayout.astro` or per-
  collection template.
- **Shape:** one Courier 12 px line such as
  `2026-04-18 · tags: qut, unsloth · ≈ 1 400 words · last-edited 2026-04-17`.
  Data already in frontmatter.
- **CSS:** a single `.entry-meta` class using `var(--mono)` and 12 px;
  margin 4 px under the `<h1>`.
- **Desktop impact:** additive — reinforces the existing ProofStrip
  voice across interior pages. No conflict with LeftNav/InstrumentPanel
  because it lives in the content column.

### 7.3 Section-break ornament (§6.3)

- **Location:** between major `<h2>` subsections inside long pages
  (logbook entries, notebook entries, about). Could be emitted by a
  shared Astro component (`<Break glyph="§" />`) or by a utility class.
- **Shape:** centred 14–16 px single glyph, 16–24 px vertical margin
  above and below. Alternative: `::before` rule targeting `h2 + h2`
  or `article > h2` placed inside the content column only (not inside
  `.footer-nav` or `.proof`).
- **Desktop impact:** visible on desktop too — this is the intended
  outcome (makes the break *consistent* across viewports rather than a
  mobile-only gimmick). If the owner wants it mobile-only, gate under
  the `(max-width: 767.98px)` block already in theme.css.

### 7.4 Per-entry sigil (§6.4)

- **Location:** in the `.loglist li` rule (`src/styles/theme.css:463-467`)
  and in the notebook / hardware index lists.
- **Shape:** `::before { content: "§"; margin-right: .45em; color:
  var(--muted); font-family: var(--mono) }`. The diamondlist (`/`) is
  already at theme.css:619-637 — pick a *different* glyph for logbook
  so the vocabulary reads as a system (`◆` flagships, `§` logbook,
  `◇` notebooks, `▲` hardware).
- **Desktop impact:** intentionally the same — this is a sitewide
  sigil system, not mobile-only.

### 7.5 Mobile-composed ProofStrip (§6.5)

- **Location:** `src/components/ProofStrip.astro`. Current shape is a
  one-liner with `·` separators.
- **Shape:** under the mobile `@media` block, use `display: grid` or a
  two-line layout: line 1 `[OK] 12 projects · last-edit 2026-04-18`,
  line 2 `12 shipped tools · 3 OS builds`. Maintain Courier 13 px and
  `#f8f8f8` background.
- **Desktop impact:** unchanged (single line preserved).

### 7.6 Tufte-style sidenote pattern (§6.6)

- **Location:** new Astro component `<Sidenote>…</Sidenote>` usable
  inside MDX (`src/content/logbook/*.mdx`, `src/content/notebooks/*.mdx`).
- **Shape:** `:checked`-driven CSS-only disclosure; one invisible
  `<input type="checkbox">` per sidenote; on mobile the note renders
  inline on tap, on desktop it could float into a margin (requires
  loosening the measure or creating a parallel column, which fights
  decision 02's single-column choice — so practically the *mobile*
  behavior is what ships, and desktop renders the same inline
  disclosure).
- **Desktop impact:** because decision 02 kept a single-column measure
  at 880 px, the desktop sidenote would be an inline disclosure too
  unless the decisions doc loosens the measure. Flagged under §8.

### 7.7 Small-caps newthought (§6.7)

- **Location:** `src/pages/index.astro:30-33` (index-kicker) and/or the
  first `<p>` of each logbook entry. A single utility class
  `.newthought { font-variant: small-caps; letter-spacing: .04em; }`
  applied as needed.
- **Desktop impact:** identical; reads tastefully on both compositions
  because it's a type-level change, not a chrome change.

---

## 8. What the decisions phase will need to resolve

A follow-up decisions doc (likely `docs/mobile/decisions/04-personality.md`
or a section grafted onto the existing `03-typography-and-color.md`) will
need to commit the following. Each decidable in one sentence.

1. **Which 2–4 shortlist items ship now** versus deferred. Recommend
   2–3 for a first pass: the research does not support shipping all
   seven at once (risks pastiche).
2. **Whether ornaments appear on desktop too or only on mobile.** 05
   §1.5 / 05 §4.1 argues the retro stance is "responsive by default"
   — i.e., the same decorative vocabulary on all widths. Separately, 
   the owner may want ornaments *only* on mobile because desktop has
   SNN + InstrumentPanel + LeftNav carrying the load. The decision
   sets the scope of every CSS rule written to implement the shortlist.
3. **Whether the section-break glyph (§6.3) replaces the currently-
   `display:none` `<hr>` rule** (theme.css:113-115) or is a separate
   component. Replacing simplifies the content model; the separate
   component gives more control.
4. **Sigil alphabet** — which single glyph per collection
   (`◆` flagships, `§` logbook, `◇` notebooks, `▲` hardware, or any
   other set). Needs the owner's taste.
5. **Signature GIF fate at the reduced-motion branch** — static
   first-frame PNG, static "K." monogram SVG, or a pre-rendered MP4 via
   `<video>`. Decision 01 §4 §16 already requires *some* static
   degradation; the form is open.
6. **Whether the signature GIF is repositioned on mobile** (inline
   with brand text at 24 px) or left as-is (block-level at 32 px).
7. **Whether ProofStrip gets a mobile-specific composition** (§6.5)
   or stays one-line and reflows naturally. If the one-liner already
   fits at 320 px, the mobile composition is cosmetic rather than
   structural.
8. **Whether any asset needs authoring** — specifically, the signature
   static-frame PNG (§6.1) and optionally a hand-drawn SVG flourish
   (§4.13) if the runners-up promote. The owner draws; research
   doesn't.
9. **Whether sidenotes (§6.6) are adopted as a general MDX affordance**
   or deferred. Adopting them commits to a component API and content-
   migration cost for existing logbook / notebook entries.
10. **Whether the Courier metadata run (§6.2) appears on home-page
    `.loglist` entries** or only on single-entry pages. Showing on
    the home list costs density; hiding it leaves home feeling
    lighter than interior pages (which may be desired).
11. **A11y detail: which ornaments get `aria-hidden="true"`** — every
    purely decorative glyph should; the decision doc is where the
    blanket rule lands.
12. **Failure mode for missing glyphs** — box-drawing characters
    (`═ ─ ┘`) sometimes render as `.notdef` boxes in fallback stacks;
    if box-drawing is picked, mono stack becomes load-bearing and the
    decision interacts with Courier strategy in `decisions/03`.

Cross-reference: once the decisions doc lands, the polish PR and this
research together form the input to an implementation PR that writes
a small number of CSS rules and (maybe) one or two new components
inside the existing BaseLayout / SectionLayout / ProofStrip surface.
No new pages, no new assets beyond what the decision specifically
calls for.

---

## 9. Notes on how this doc interacts with earlier research

- **05 §5.4** already named this problem: "wholesale stripping produces
  a Simple.css clone." This doc is that paragraph expanded into an
  inventory + candidate list.
- **07 §3.5** flagged retro-aesthetic preservation on mobile as
  unresolved. This doc is one of the two things that resolves it;
  the other is the decisions-doc commitment.
- **02 §9** identified typography as the biggest personality vehicle
  that survives mobile trivially. Shortlist items 1, 2, 3, 4, 7 above
  all lean on that finding.
- **01 §5.3** — visual-vs-hit-area decoupling — is what makes candidate
  §6.6 (sidenote tap targets) feasible under the 44 px policy without
  ballooning the visible glyph.
- **03 §3** / §4 — weight budget — confirms every shortlist item is
  effectively free (single PNG + a few `::before` rules + one metadata
  line is < 5 KB uncompressed).
- **Decision 01 §4 §16** universal-reduced-motion means the signature
  GIF work is already a committed task; this doc makes it a
  personality-restoration rather than just a compliance task.

No contradictions introduced.

---

*End of 08-personality.md. Next: decisions doc that consumes §6 + §8.*
