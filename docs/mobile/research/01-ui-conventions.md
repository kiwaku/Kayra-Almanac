# 01 — Mobile UI Conventions (Research)

Scope: document the conventions and evidence that a mobile redesign of
kayra-almanac should be aware of. This is *research*, not *decisions*. The
decisions phase consumes this and picks what applies to a modern-retro
Astro 5 SSG portfolio whose spine is early-2000s typography/density on top
of post-2010 mobile affordances.

No CSS, no Astro code, no pronouncements about what the site will do.
Every non-obvious claim cites a canonical source. Where two sources
conflict, both are kept — the reconciliation happens in the decisions doc.

Tooling for this track: see `docs/mobile/research/00-tooling.md`.

---

## 1. Touch targets

Three authorities give three numbers. They are not in conflict once you
read the preconditions carefully, but they are not interchangeable.

### 1.1 The three canonical numbers

| Authority | Minimum | Unit | Level / status | Applies to |
|---|---|---|---|---|
| Apple HIG | **44 × 44** | **points (pt)** | Required for App Store review feedback; universally treated as the iOS floor | All hit targets on iOS/iPadOS/visionOS |
| Material 3 | **48 × 48** | **dp** | Design-system guideline; enforced by Android accessibility scanner | All touch targets on Android |
| WCAG 2.2 §2.5.8 | **24 × 24** | **CSS pixels** | Level **AA** (Target Size Minimum) | All pointer targets on the web |
| WCAG 2.2 §2.5.5 | **44 × 44** | **CSS pixels** | Level **AAA** (Target Size Enhanced) | All pointer targets on the web |

Sources:
- Apple HIG — Layout / tappable controls: <https://developer.apple.com/design/human-interface-guidelines/layout>
- Apple design tips — "44pt x 44pt comfortable tappable area": <https://developer.apple.com/design/tips/>
- Material 3 — Accessibility / structure: <https://m3.material.io/foundations/designing/structure>
- Material (Android) — Touch target size: <https://support.google.com/accessibility/android/answer/7101858>
- WCAG 2.2 §2.5.8 Target Size (Minimum): <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>
- WCAG 2.2 §2.5.5 Target Size (Enhanced): <https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html>

### 1.2 What "pt / dp / CSS px" actually mean on a phone

All three are *logical* units designed to stay visually stable across
device pixel densities. They are not the same size.

- **pt (iOS point)** — Apple's device-independent unit. On a 1× device
  (original iPhone) 1pt = 1 device pixel; on 2× Retina 1pt = 2 device
  pixels; on 3× (iPhone Pro) 1pt = 3 device pixels. **1 iOS pt ≈ 1 CSS
  px** at the default `<meta name="viewport" content="width=device-width">`
  setting, because Mobile Safari reports the logical width in CSS pixels
  matching the device's point width. (Note: CSS also has a `pt` unit —
  1/72 of an inch — which is unrelated to Apple's pt. The number
  coincidence confuses a lot of prose online.)
- **dp (Android density-independent pixel)** — defined so that 1dp =
  1px on a 160dpi ("mdpi") reference device, and scales with the bucket
  thereafter. **1dp ≈ 1 CSS px** for the same reason: Chrome on Android
  sizes the CSS pixel to match dp under `width=device-width`.
- **CSS px (W3C reference pixel)** — "the visual angle of about 0.0213
  degrees" at arm's length per CSS Values spec. Not a physical pixel;
  browsers map it to device pixels via the device-pixel-ratio (`dpr`).

Practical upshot for a web build: **under `width=device-width`, 1 CSS px
≈ 1 iOS pt ≈ 1 Android dp**. Numbers from HIG and Material can be used
directly as CSS pixel sizes without conversion math, with one caveat —
the *exact* mapping varies by browser and zoom; treat it as "within a
few percent" rather than exact.

Source on the CSS reference-pixel definition: CSS Values and Units
Module §5.2 — <https://www.w3.org/TR/css-values-4/#absolute-lengths>.

### 1.3 Reconciling the three

- **24 CSS px is the web floor** (WCAG 2.2 AA, in force today). A site
  that meets this is legally compliant for target size in most
  jurisdictions that adopt WCAG 2.2.
- **44 CSS px is the web ceiling** (WCAG 2.2 AAA). Also Apple's
  baseline. A site that meets this meets HIG.
- **48 CSS px satisfies Material 3** and therefore also satisfies HIG
  (44) and WCAG AAA (44) transitively.
- WCAG's 24-px rule has an important **spacing escape hatch**: a target
  smaller than 24 × 24 still passes if "a 24 CSS pixel diameter circle
  centered on [each] target's bounding box doesn't intersect another
  target" (§2.5.8, Spacing exception). This lets genuinely small
  visual affordances (tag chips, dense tables) remain compliant by
  leaving padding around them.
- WCAG §2.5.8 also exempts **inline** targets ("target is in a sentence
  or its size is otherwise constrained by the line-height of non-target
  text") and **user-agent controls** (native form controls sized by the
  browser). This is how hyperlinks in body text can stay at the normal
  text size without failing AA.

NN/g's mobile UX synthesis agrees on the direction: "the target size
required to optimize the reaching time and minimize errors is
considerably larger for touch than for mouse" —
<https://www.nngroup.com/articles/mobile-ux/>.

### 1.4 Spacing between targets

- Material 3: touch targets "separated by 8dp of space or more" —
  <https://m3.material.io/foundations/designing/structure>.
- WCAG §2.5.8 Spacing exception: 24 CSS px center-to-center clearance
  when a target itself is under 24 × 24.
- Apple HIG does not publish a spacing minimum beyond "allow ample
  space between tappable elements" — <https://developer.apple.com/design/tips/>.

### 1.5 What counts as a "target"

WCAG defines target as the region responding to the pointer — which may
be larger than the visible affordance. Material explicitly endorses
this split: "Google allows the visual icon to be as small as 24×24 dp,
but the touch target must still extend to 48×48 dp through transparent
padding" (Material 3 guidance summary). This means **a retro, tight
visual density is compatible with modern touch targets** provided the
*hit area* (padding + element) expands to spec.

---

## 2. Navigation patterns

The candidate patterns on mobile are:

1. **Bottom tab bar** (iOS Tab Bar, Material Navigation Bar)
2. **Hamburger / drawer** (off-canvas menu behind a ☰ icon)
3. **Sticky top nav** (desktop-style horizontal bar, pinned)
4. **No-chrome scroller** (all navigation inline in content; no
   persistent chrome)
5. **Hub / homepage-as-index** (return to home to reach each section)
6. **Hybrid / "combo"** (visible primary + overflow behind a menu)

### 2.1 Evidence base

| Source | Finding (paraphrased) |
|---|---|
| NN/g, *Tabs vs. Hamburger Menus* | On smartphones, users engaged with *hidden* navigation in **57% of tasks**, vs **86%** with combo navigation (visible + overflow). Hidden nav produced 15% longer task completion. n=179. <https://www.nngroup.com/articles/tabs-vs-hamburger-menus/> |
| NN/g, *Hamburger Menus* | "The navigation menu makes the navigation options least discoverable and is best suited for content-heavy, browse-mostly sites." Users may forget to open the menu even after discovering it. <https://www.nngroup.com/articles/hamburger-menus/> |
| NN/g, *Mobile Navigation Patterns* | "Tab bars and navigation bars are well suited for sites with relatively few navigation options." Beyond 5 items touch targets shrink below the comfortable threshold. <https://www.nngroup.com/articles/mobile-navigation-patterns/> |
| Material 3 *Navigation Bar* | 3–5 top-level destinations; persistent; thumb-accessible. <https://m3.material.io/components/navigation-bar/guidelines> |
| Apple HIG *Tab Bars* | Bottom tab bar for switching between top-level sections of an app; recommend 3–5 tabs on iPhone. <https://developer.apple.com/design/human-interface-guidelines/tab-bars> |
| Luke Wroblewski, *Responsive Navigation* | "The common pattern here is comfortable touch surfaces toward the bottom of the screen." <https://www.lukew.com/ff/entry.asp?1649> |

### 2.2 Pros/cons for a portfolio with ~10 projects + ~5 spine sections

The current site uses a left nav (desktop). The mobile equivalents
tradeoff like this:

| Pattern | Pros | Cons | Fit for this site |
|---|---|---|---|
| **Bottom tab bar** | Persistent, thumb-reachable, high discoverability (NN/g: 86% engagement with visible nav). Familiar from native apps. | Capped at ~5 destinations; 10 projects won't fit. Costs ~56pt of vertical space permanently. Feels app-like — may clash with "document-y" retro spine. | Works for the 5 top-level sections; projects would need a sub-level. |
| **Hamburger** | Handles arbitrary depth. Cheap screen real estate. | "Out of sight, out of mind" — NN/g finds ~30-point engagement drop. Hides the information architecture from first-time visitors. | Tolerable if the IA is already advertised elsewhere (e.g., a homepage hub) but drives discovery down on any page deeper than root. |
| **Sticky top nav** | Matches desktop mental model; IA is visible. | Top of the screen is the hardest thumb zone (Wroblewski). Address bar collision on iOS Safari can push it off-screen during scroll. | Works only with very few items; 10 projects will overflow or truncate. |
| **No-chrome scroller** | Maximum content density; honors retro "long document" feel. | Navigation only via in-content links or returning to the top. Breaks "persistent orientation" expectation. | Viable *specifically* for a portfolio with strong cross-linking and a clear hub, at the cost of wayfinding on deep pages. |
| **Hub (homepage-as-index)** | Simplest possible structure; every page is a leaf. | Round-trips through home on every navigation; poor for session exploration. | Competitive for a 10-project portfolio where a session is usually "pick one project, read it, leave." NN/g notes hub works when users "accomplish only one task during a single session." |
| **Hybrid (combo)** | Highest engagement in NN/g study (86%). Shows priorities + keeps a safety-valve menu. | Two pieces of chrome to maintain; harder to get right visually. | Strongest for a site that has both a short top-level spine and a long tail. |

### 2.3 Specific question: 10 projects, 5 spine sections

No single pattern covers "a 10-project list" on a bar. Realistic
combinations the decisions phase must pick from:

- Bottom tab bar for the spine (4–5 sections) + in-page list for
  projects.
- Hub homepage + sticky minimal top bar (logo, back) on leaf pages.
- Hamburger that opens a full-screen sheet listing all 15 destinations
  (high discoverability *inside* the sheet, low discoverability
  *before* opening).
- No-chrome scroller for project pages (anchors/links) + a persistent
  "back to index" affordance.

NN/g's finding that hidden nav cuts engagement ~30 points is the main
penalty against the hamburger-only option. NN/g's finding that combos
beat both tabs and hamburgers is the main argument for a hybrid.

### 2.4 Side constraint: iOS Safari address-bar collapse

Bottom-docked nav interacts with the Safari bottom bar. When the bar
retracts on scroll, a `position: fixed; bottom: 0` element can end up
overlapping the reappearing chrome or sitting under the home indicator.
This is solvable (`env(safe-area-inset-bottom)` + `100dvh`, see §4),
but it is a permanent maintenance tax that top nav / no-chrome does not
pay. MDN safe-area:
<https://developer.mozilla.org/en-US/docs/Web/CSS/env>.

---

## 3. Gestures

Gestures split into *system-standard* (users expect them; breaking them
is surprising) and *custom* (users don't expect them; they need
discoverability cues).

### 3.1 System-standard on mobile web

| Gesture | Expected to do | Source of the expectation |
|---|---|---|
| **Tap** | Activate link/button | Universal |
| **Scroll (drag up/down)** | Scroll page/region | Universal |
| **Pinch-zoom** | Zoom content | WCAG 2.2 §1.4.4 *Resize Text* — authors must not disable; `user-scalable=no` in the viewport meta tag fails AA <https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html> |
| **Edge swipe (left → right)** | Back, on iOS Safari and Chrome Android | iOS HIG navigation patterns; Chrome gesture nav |
| **Swipe down from the top of a sheet** | Dismiss sheet | Apple HIG *Sheets* <https://developer.apple.com/design/human-interface-guidelines/sheets> |
| **Pull-to-refresh** | Reload page / refresh feed | Chrome Android default; iOS Safari reloads in some contexts |
| **Long-press on a link** | Open context menu (preview, copy URL) | Both iOS Safari and Chrome Android |
| **Long-press on a native element** | Context menu | Apple HIG *Gestures* <https://developer.apple.com/design/human-interface-guidelines/gestures> |
| **Two-finger scroll inside a scrollable region** | Scrolls that region only | Universal |

Breaking any of these is a *surprise gesture* — users notice. Example:
`touch-action: none` on the body disables pinch-zoom and breaks WCAG.
`overscroll-behavior: none` disables pull-to-refresh, which may be
acceptable (see §4) but costs a familiar affordance.

### 3.2 Custom gestures (surprise category)

- Horizontal swipe on a card to delete, archive, or reveal actions.
- Long-press to enter "select" mode on a list.
- Two-finger swipe for custom actions.
- Drag-to-reorder.

Apple HIG on discoverability: custom gestures "don't have the same
immediacy as buttons and icons" — users "need to understand them
intuitively or be guided." Long-press in particular is inconsistent
across apps; users often "don't know how long to press"
(<https://developer.apple.com/design/human-interface-guidelines/gestures>).

Design implication: custom gestures require at least one of
- a visible affordance (chevron, drag handle, peeking edge),
- an onboarding cue (first-run coachmark),
- a redundant non-gesture path (button that does the same thing).

For a read-mostly portfolio, custom gestures probably have no role.
The conventional gestures above cover every behavior a static site
needs.

### 3.3 Pull-to-refresh specifically

On Chrome Android, pull-to-refresh is browser chrome, not a page
feature — the page cannot opt-in to a custom handler on the web, and
the default behavior is "reload." For a static portfolio, this is a
free feature (users get reload for free) that costs nothing unless a
page uses PTR-style affordances for something else (infinite scroll
anchor, say).

Disabling it via `overscroll-behavior-y: contain` on `html` is
appropriate when overscroll would scroll a modal's backdrop (MDN:
<https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior>).

---

## 4. Scroll, focus, and viewport

### 4.1 The `100vh` trap

On iOS Safari and Chrome Android, the browser chrome (address bar,
bottom toolbar) expands and collapses during scroll. `100vh` resolves
to the **largest** viewport (chrome retracted), so an element sized at
`100vh` overflows the initial viewport — the classic "full-height hero
has its bottom hidden behind the address bar."

The fix is the CSS viewport unit family added in 2022:

| Unit | Meaning |
|---|---|
| `svh` / `svw` | **Small** viewport: sizes as if the UA chrome is fully expanded |
| `lvh` / `lvw` | **Large** viewport: sizes as if the UA chrome is fully retracted |
| `dvh` / `dvw` | **Dynamic** viewport: clamped between `svh` and `lvh`, updates in real time |

Source: web.dev *The large, small, and dynamic viewport units* —
<https://web.dev/blog/viewport-units>. Browser support: Chrome 108+,
Firefox 101+, Safari 15.4+.

For a full-height element a mobile user can see entirely on load:
`svh` or `dvh`, not `vh`. For a below-the-fold element that should
fill visible space once scrolled into view: `dvh` updates smoothly; a
static `lvh` leaves extra space when chrome is expanded.

### 4.2 `safe-area-inset-*`

On devices with a home indicator or notch, `env(safe-area-inset-top |
right | bottom | left)` returns the inset the UA reserves. A bottom
tab bar needs `padding-bottom: env(safe-area-inset-bottom)` to avoid
the home indicator; a top chrome-adjacent element needs
`env(safe-area-inset-top)` (though most top-of-page content is
handled by the browser automatically). Required viewport meta hint:
`viewport-fit=cover` so the viewport extends under the insets. MDN:
<https://developer.mozilla.org/en-US/docs/Web/CSS/env>.

### 4.3 Overscroll behavior

Default mobile behavior: elastic bounce on iOS, pull-to-refresh on
Android Chrome, and *scroll chaining* — a modal's backdrop scrolls the
underlying page once the modal's content runs out.

Control with `overscroll-behavior` (MDN
<https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior>):

| Value | Effect |
|---|---|
| `auto` | default chaining + bounce + PTR |
| `contain` | no chaining; native bounce/PTR inside element still work |
| `none` | no chaining, no bounce, no PTR |

Typical use: `overscroll-behavior-y: contain` on a modal sheet so its
scroll doesn't leak into the page.

### 4.4 Scroll anchoring

Default browser behavior since Chrome 56 / Firefox 66: if content
loads *above* the current scroll position (e.g., a lazy-loaded image),
the browser shifts the scroll position to keep the user's viewport
content stable. This is on by default and almost always desirable.
Opt out with `overflow-anchor: none` — only do so when you have a
specific reason (e.g., an infinite scroll implementation that handles
it manually). MDN:
<https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_anchoring/Scroll_anchoring>.

Note: Safari did not support scroll anchoring until Safari 18
(mid-2024). Older iOS will jump on late-arriving above-the-fold
content — a reason to reserve space for images (width/height attrs,
`aspect-ratio`) rather than relying on anchoring alone.

### 4.5 Focus ring expectations on touch

`:focus` fires on tap on most browsers — which historically caused
"why does the button stay highlighted after I tapped it?" The modern
answer is `:focus-visible`: the UA applies focus-visible styling only
when its heuristics say the user is navigating with the keyboard (or
equivalent), not when they tapped.

- Keyboard → focus ring shown.
- Mouse click → ring typically *not* shown.
- Touch → ring typically *not* shown.

MDN: <https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible>.

Accessibility corollary: **never remove all focus indication**. Use
`:focus-visible { outline: … }` rather than `:focus { outline: none }`
globally. WCAG 2.2 adds §2.4.11 *Focus Not Obscured (Minimum)* at AA
and §2.4.13 *Focus Appearance* at AAA — a visible ring must exist and
must not be occluded by a sticky element. WCAG §2.4.11:
<https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html>.

### 4.6 Responsiveness budget: INP

Interaction to Next Paint replaced First Input Delay as a Core Web
Vital in March 2024. Thresholds (75th percentile, same on mobile and
desktop) per web.dev <https://web.dev/articles/inp>:

- Good: **≤ 200ms**
- Needs improvement: 200–500ms
- Poor: **> 500ms**

Relevance here: heavy-handed scroll listeners, custom gesture handlers,
or layout-thrashing transitions on tap can blow the budget quickly on
mid-tier Android. Static sites with minimal JS typically pass
trivially; islands/hydration-heavy islands do not.

---

## 5. Content density

The retro 2000s aesthetic favors dense pages — many items visible,
small margins, short line heights. Modern mobile guidelines favor the
opposite direction. The two can coexist; the constraints to respect
are:

### 5.1 Line length

web.dev (citing Bringhurst, *Elements of Typographic Style*):

> "Anything from 45 to 75 characters is widely regarded as a
> satisfactory line length for a single-column page set in a serifed
> text face in a text size. The 66-character line (counting both
> letters and spaces) is widely regarded as ideal. For multiple column
> work, a better average is 40 to 50 characters."

— <https://web.dev/learn/design/typography/>

Practical implication: at a phone's ~375 CSS px width, body copy at
16px/1em font size will hit ~40–55 characters per line without
intervention. That is already at or inside the recommended range. The
retro impulse to shrink text to 12–14px pushes you *past* 75cpl, which
degrades readability. Dense != small; dense == *many items per
screen*.

### 5.2 Thumb zones (Wroblewski)

Wroblewski's touch-zone diagrams identify three reachability regions
for one-handed phone use:

- **Natural** — center-bottom of the screen.
- **Stretch** — top corners, especially the opposite-hand top corner.
- **Hard** — top center on tall phones; far corner on large handsets.

"The area toward the bottom of the screen is easy, whereas the upper
corners are a bit of stretch." —
<https://www.lukew.com/ff/entry.asp?1649>

Implication: primary actions live at the bottom; destructive or
rarely-used actions can live at the top. Top-of-screen nav pays a
reach tax that bottom-of-screen nav avoids. (See also §2.)

### 5.3 Spacing without violating hit targets

The "dense page" feeling comes from:

- Narrow margins between content blocks.
- Small inter-line leading.
- Tight paragraph spacing.
- Many items visible at once.

None of these require shrinking the *hit target*. A link can look
visually tight while its hit area — padding + element — remains 44 px.
Material explicitly blesses this: "the visual icon … as small as 24×24
dp, but the touch target must still extend to 48×48 dp through
transparent padding"
(<https://m3.material.io/foundations/designing/structure>). The same
split lets a dense list with small visual separators still pass WCAG
2.5.8.

Recipe the decisions phase can consider:

- Keep visual density by reducing *non-interactive* whitespace.
- Expand *interactive* padding to meet 44 (AAA) or 24 (AA-with-spacing).
- Use the WCAG §2.5.8 spacing exception for inline prose links —
  they're exempt from the 24-px floor.

### 5.4 Content-to-chrome ratio

NN/g: "downplay UI elements to prioritize essential content" and
maintain a "high content-to-chrome ratio"
(<https://www.nngroup.com/articles/mobile-ux/>). A bottom tab bar that
permanently occupies 56–80 px of a 667-px-tall viewport is 8–12% of
the screen for chrome. A site whose chrome is almost all content
(no-chrome scroller or very minimal top bar) scores highest on this
metric but pays discoverability cost (§2).

---

## 6. Lightbox / modal / overlay

### 6.1 Native conventions the web should not surprise

iOS (Apple HIG — *Sheets*
<https://developer.apple.com/design/human-interface-guidelines/sheets>):

- **Page sheet** — card from bottom, ~90% height on iPhone; backdrop
  visible. Dismissed by drag-down.
- **Form sheet** — centered card on iPad; behaves like page sheet on
  iPhone in compact width.
- **Full-screen sheet** — covers the whole screen; used when the task
  is committing and needs full attention.
- Dismissal: drag-down is the default; authors can set
  `isModalInPresentation` to disable it for unsaved-work scenarios.

Material 3 — *Bottom Sheets*
(<https://m3.material.io/components/bottom-sheets/guidelines>, text is
JS-rendered; widely-cited specs):

- **Standard bottom sheet** — persistent, pushes content up; no scrim.
- **Modal bottom sheet** — temporary, covers a scrim; dismissed by
  drag-down, scrim tap, or system back.
- Drag handle (4dp tall, centered) is the affordance for "this can be
  dragged."

### 6.2 Full-screen sheet vs floating modal on mobile

| Scenario | Full-screen sheet | Floating modal |
|---|---|---|
| Image viewed at full resolution | Native expectation (lightbox) | Feels half-hearted on phone |
| Short confirmation ("Delete?") | Overkill | Native expectation |
| Form with 4+ fields | Full-screen avoids scroll-within-scroll | Floating modal traps scroll |
| Information panel > ~50% viewport height | Full-screen or near-full sheet | Feels cramped |

For a portfolio, the relevant overlays are probably:
- **Image lightbox** — full-screen is conventional; pinch-zoom expected
  inside.
- **Short prompt** — rarely needed on a read-only site.

### 6.3 Dismissal routes (union of conventions)

Users expect one or more of:

- **Swipe down** (iOS sheet, Android modal bottom sheet).
- **Backdrop tap** (Material modal; common on web libraries).
- **Close button** (usually ✕ top-right or top-left on iOS; left on
  Material, right in common web patterns).
- **Hardware / gesture back** (Android: back gesture; iOS: edge-swipe
  from left may or may not close depending on presentation).
- **Escape key** (keyboard users — required by WCAG).

WCAG 2.1 §2.1.2 *No Keyboard Trap*: a modal must be escapable via
keyboard
(<https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html>).
A mobile-only dismissal (swipe) is insufficient on its own; a visible
close button is the reliable path.

### 6.4 Scroll behavior inside overlays

A modal that is taller than the viewport must have its own scroll
container, and that container should set `overscroll-behavior: contain`
so the page underneath doesn't scroll when the user overscrolls the
modal (§4.3). This is a pure modern-web concern and has no retro
analogue.

---

## 7. Inputs and forms (scoped to /catalog filters)

Site is mostly read-only. The one input surface is catalog filters.
Mobile input conventions that matter even for light filter UIs:

### 7.1 `inputmode` and `type`

web.dev *Learn Forms*
<https://web.dev/learn/forms/> and MDN
<https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input>:

- `type="search"` — triggers the search-styled on-screen keyboard
  with a "Search" or "Go" action key.
- `type="email"`, `type="tel"`, `type="url"`, `type="number"` — each
  summons the appropriate keyboard. Pure `type="number"` has known
  usability issues for things that are strings of digits (phone, zip),
  for which `type="text" inputmode="numeric"` is better.
- `inputmode="search"`, `inputmode="numeric"`, `inputmode="decimal"`,
  `inputmode="text"` — overrides without changing form semantics.

### 7.2 `autocomplete`

Essential for any field that has a conventional autofill mapping
(`name`, `email`, `street-address`, etc.). Less relevant for a free-form
catalog filter; set `autocomplete="off"` only with reason.

### 7.3 Controls that typically break on mobile

- Native `<select>` with many options — full-screen picker on iOS is
  fine, but custom JS replacements usually regress.
- `<input type="range">` — touch-friendly but invisible value; needs a
  displayed numeric readout.
- Checkbox + label — make the entire label the click target. Apple
  explicitly calls this out
  (<https://developer.apple.com/design/tips/>).

### 7.4 Touch keyboard overlay

The soft keyboard overlays the viewport. Sticky-bottom submit buttons
disappear under it unless the author uses `interactiveWidget=resizes-content`
in the viewport meta, or the Visual Viewport API's
`visualViewport.height` to reposition chrome.

Source: CSSWG Viewport API
<https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API>.

### 7.5 WCAG §1.4.10 Reflow constraint

The filter UI, like any other content, must remain usable at 320 CSS
pixels wide without horizontal scroll ("Content can be presented
without loss of information or functionality, and without requiring
scrolling in two dimensions for: Vertical scrolling content at a width
equivalent to 320 CSS pixels." —
<https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>). Multi-column
filter bars often fail this if not given a wrap/stack behavior at
≤ 320 px.

---

## 8. Cross-cutting: modern-retro tension

The retro move is visual; the modern move is ergonomic. They collide
in a handful of places, and in each case the literature already
provides a reconciliation path.

| Tension | Retro impulse | Modern constraint | Reconciliation in the literature |
|---|---|---|---|
| Dense typography | Small font, tight leading | 45–75 cpl at mobile zoom | Density via margins/leading; hold body ~16px |
| Inline links in prose | Text links everywhere | 24×24 min targets | WCAG §2.5.8 *Inline* exemption |
| Minimal chrome | Page-is-everything | NN/g discoverability penalty | Hub + strong cross-linking |
| Small icon affordances | 12×12 glyph | 44×44 hit area | Visible icon small; hit area expanded via padding |
| `100vh` hero | "Fits one screen" | Address-bar collapse | `dvh` / `svh` |

---

## 9. Summary matrix

The space of options, compressed:

| Dimension | Safe default | Adventurous option | Constraint floor |
|---|---|---|---|
| Touch target size | 44 CSS px (HIG, WCAG AAA) | 24 CSS px with spacing (WCAG AA) | 24 × 24 non-overlap |
| Nav pattern | Bottom tab bar (3–5 items) | No-chrome scroller + hub | Must not violate WCAG 2.4.5 *Multiple Ways* |
| Gestures | Tap + scroll + native | Add swipe-to-dismiss on sheets | Don't disable pinch-zoom |
| Viewport unit | `dvh` | `svh` for "guaranteed visible" | Don't use raw `vh` for full-screen |
| Focus ring | `:focus-visible` + high-contrast outline | Skip on touch via heuristics | Never remove entirely |
| Overlays | Full-screen sheet | Floating modal | Dismissable by close button + Escape |
| Line length | 45–75 cpl at ~16px | Longer with Tufte-style sidenotes | Must reflow at 320px (WCAG 1.4.10) |
| Responsiveness | Pass INP < 200ms | Any | Must not exceed 500ms |

---

## 10. Open questions for the decisions phase

The research above does *not* decide; these are the questions the
decisions doc must answer. Ordered by blocking-ness.

1. **Which navigation pattern?** Combo (bottom tabs for spine + hub
   for project list), pure hub, no-chrome, or hamburger? NN/g gives
   combo the engagement edge but at the cost of two pieces of chrome
   and a visual complication of the retro aesthetic. The choice
   depends on whether "wayfinding" or "atmosphere" is the priority.

2. **Target size: AAA (44) or AA-with-spacing (24)?** Going to AAA is
   simple but pushes every button/link into a chunkier visual box,
   which fights the retro density. AA-with-spacing preserves tightness
   but needs careful spacing audits. Which is chosen sets a constant
   for every subsequent component.

3. **Persistent chrome at all?** A no-chrome reading experience is the
   purest retro expression. It also takes the largest NN/g penalty on
   discoverability. Acceptable only if a strong hub page + consistent
   in-content back links compensate.

4. **Image lightbox: full-screen sheet or inline expander?** A static
   portfolio has many images. Full-screen is conventional on phone,
   but an inline expander stays "on the page" and reads more like a
   document. Both work; pick one.

5. **`dvh` baseline vs `svh` safety belt?** `dvh` updates smoothly and
   is the natural choice, but a layout that *must* fit in the
   small-viewport should use `svh` to guarantee it. A blanket policy
   avoids per-component arbitration.

6. **Pull-to-refresh on or off?** The default is "on" (Chrome Android
   reloads). For a static site, reload is free. Disable only if a
   modal's overscroll needs to not chain — in which case
   `overscroll-behavior: contain` on the modal is sufficient; no need
   for a site-wide disable.

7. **Gestures in the design?** None, one (swipe-to-dismiss on
   lightbox), or more? Custom gestures always cost discoverability.
   For a read-only site the most defensible answer is "only native
   browser gestures."

8. **Filter UI on /catalog: inline chips, full-screen sheet, or
   collapsing panel?** The only input surface; worth a decision before
   componentry starts.

9. **What does the focus ring look like?** Required by WCAG, not
   optional. The visual treatment (outline color, offset, shape) is a
   retro-aesthetic question the decisions phase must answer; this
   research only establishes that it must exist and be visible.

10. **How much of this is a11y floor vs target?** WCAG 2.2 **AA** is
    the common floor for web content. WCAG 2.2 **AAA** is ambitious
    for all criteria but easy for §2.5.5 on a greenfield redesign.
    Policy decision: AA floor everywhere, opportunistic AAA where
    cheap.

---

## Appendix — Source index

Primary sources cited above, grouped by body:

**Apple Human Interface Guidelines**
- Layout — <https://developer.apple.com/design/human-interface-guidelines/layout>
- Gestures — <https://developer.apple.com/design/human-interface-guidelines/gestures>
- Sheets — <https://developer.apple.com/design/human-interface-guidelines/sheets>
- Tab bars — <https://developer.apple.com/design/human-interface-guidelines/tab-bars>
- Design tips — <https://developer.apple.com/design/tips/>

**Material Design 3**
- Accessibility / structure — <https://m3.material.io/foundations/designing/structure>
- Navigation bar — <https://m3.material.io/components/navigation-bar/guidelines>
- Bottom sheets — <https://m3.material.io/components/bottom-sheets/guidelines>
- Android touch targets — <https://support.google.com/accessibility/android/answer/7101858>

**WCAG 2.2 (W3C)**
- §2.5.5 Target Size (Enhanced) — <https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html>
- §2.5.8 Target Size (Minimum) — <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>
- §1.4.10 Reflow — <https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>
- §1.4.4 Resize Text — <https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html>
- §2.1.2 No Keyboard Trap — <https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html>
- §2.4.11 Focus Not Obscured (Minimum) — <https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html>

**Nielsen Norman Group**
- Tabs vs Hamburger Menus — <https://www.nngroup.com/articles/tabs-vs-hamburger-menus/>
- Hamburger Menus — <https://www.nngroup.com/articles/hamburger-menus/>
- Mobile Navigation Patterns — <https://www.nngroup.com/articles/mobile-navigation-patterns/>
- Mobile UX — <https://www.nngroup.com/articles/mobile-ux/>

**web.dev / Chrome**
- Viewport units — <https://web.dev/blog/viewport-units>
- Learn / Typography — <https://web.dev/learn/design/typography/>
- Learn / Forms — <https://web.dev/learn/forms/>
- INP — <https://web.dev/articles/inp>

**MDN / W3C specs**
- CSS Values (reference pixel) — <https://www.w3.org/TR/css-values-4/#absolute-lengths>
- `overscroll-behavior` — <https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior>
- Scroll anchoring — <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_anchoring/Scroll_anchoring>
- `:focus-visible` — <https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible>
- `env()` / safe-area — <https://developer.mozilla.org/en-US/docs/Web/CSS/env>
- Visual Viewport API — <https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API>

**Other** — Luke Wroblewski, *Responsive Navigation* (thumb zones): <https://www.lukew.com/ff/entry.asp?1649>
