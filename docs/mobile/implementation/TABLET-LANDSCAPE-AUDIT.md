# Tablet Portrait + Phone Landscape — Audit

Purpose: settle whether the single mobile breakpoint at 768 CSS px (decision 02 §1) still holds after the polish pass, by testing the two viewport shapes the MVP suite deliberately does not exercise: iPad portrait (768×1024, at the desktop side of the boundary) and iPhone 12 landscape (844×390, desktop composition on a short viewport).

No code change is proposed in this doc — this is audit + recommendation only, per the task brief.

## Method

`astro build` → `astro preview` → headless-Chromium screenshots on three representative routes × three viewports. The mobile-polish CSS changes are already in effect.

- Home: `/`
- Project page: `/projects/crest-snn`
- Logbook entry: `/logbook/2025-10-04-du99d4-memory-init`

Viewports:

| Label | Size | Composition | Notes |
|---|---|---|---|
| Phone (reference) | 375×812 | mobile | Baseline the polish pass already validated |
| iPad portrait | 768×1024 | **desktop** (at the boundary) | `(max-width: 767.98px)` does not match; desktop rules apply |
| iPhone landscape | 844×390 | **desktop** (width ≥ 768) | Short vertical budget |

Screenshots in `screenshots/{mobile,tablet-768,landscape-844}-{home,project,logbook}.png`.

## Findings

### Phone 375×812 (reference)

Clean. The polish pass is working: no debug toggle, no stranded beads, no shortcuts line, 44 px tap targets. This is the target state for mobile. (`screenshots/mobile-home.png`.)

### iPad portrait 768×1024

Desktop composition renders at the breakpoint boundary. Two real problems surface:

1. **InstrumentPanel overlaps reading content.** At 1280×800 the panel sits in the ~400 px of horizontal slack between the 880 px body measure and the viewport edge. At 768 the viewport is *narrower than* the body measure + LeftNav column, so `positionInstrumentPanel()` lands the HUD *on top of* body text. Visible on `screenshots/tablet-768-home.png` (CREST-SNN card) and `screenshots/tablet-768-project.png` (problem-statement paragraph). This is not a new regression — it was true pre-polish — but it is where the 768-as-desktop decision bites hardest.
2. **LeftNav eats ~200 px of horizontal budget.** The `grid-template-columns: 200px 1fr` in `theme.css:166–171` plus 16 px gutter gives the content column ≈ 552 px at 768 viewport width. Prose reads but the measure is visibly short of the 880 px desktop ideal; the "Three flagship builds" bullet list wraps more aggressively than it should.

Debug toggle and shortcuts line are still visible (desktop rules apply). Neither is a regression from the polish pass — they always were desktop-visible — but seeing them at iPad portrait reinforces that 768 is a hybrid size where "desktop" is true by the breakpoint but not by the lived experience.

### iPhone landscape 844×390

Desktop composition works reasonably well horizontally. LeftNav + body measure fit without content overlap, and the InstrumentPanel lands at the right edge without clobbering prose (the 844 − 200 − 16 = 628 px content column gives the panel more room than 768 does). The constraint is **vertical**: only ~390 px of height minus ≈ 100 px of header/proof strip leaves ≈ 290 px of reading viewport — most of a card is scrolled into. Screenshots `landscape-844-*.png` show the first viewport shows the card title + 2–3 bullets before overflow.

Vertical shortness is inherent to landscape phones; neither desktop nor mobile composition fixes it. The mobile composition would actually *lose* ground here: single-column 100 % measure + 44 px tap targets would consume more vertical space per link, not less.

## Recommendation: **A — keep as-is**

**Rationale.** Of the three viewports audited, only iPad portrait reveals a real defect (InstrumentPanel overlap + cramped measure), and that defect has a local, better-scoped fix than a breakpoint carve-out: gate the InstrumentPanel to `min-width: 900px` or ≥1024 px so it only renders where there's real horizontal slack. That is a one-file, one-breakpoint-value change, not a layout-mode switch, and it does not require re-running the whole mobile composition on a device that genuinely has 768 CSS px of width and 1024 px of height. iPhone landscape (844×390) is short-vertical, not narrow — forcing mobile composition there would make the problem *worse* (taller tap targets eat more of the 390 px budget). Readers who flip a phone landscape expect desktop-ish behavior; readers on an iPad portrait are sitting at a reading posture and do not benefit from being dropped into a narrow-phone CSS path. Option B's "force mobile on short-and-wide" heuristic punishes the landscape case; option C's middle tablet breakpoint introduces a third composition that has to be designed, tested, and maintained for ~one device class (iPad portrait). Both are heavier than the underlying defect warrants.

**What the audit asked us to rule out.** The 768 breakpoint is still the right choice; the MVP contract holds. If the user later wants to act on the iPad-portrait overlap, the minimal move is to widen the InstrumentPanel's own render gate (e.g., add `(min-width: 900px)` to its scoped CSS or the surrounding `{#if}`), not to introduce a new media query.

**Follow-ups that are in scope for a later, separate task — not this one:**

- InstrumentPanel render-gate at ≥ 900 px (self-contained; does not touch `theme.css`).
- LeftNav collapse on tablet portrait only, if the cramped measure reads worse than acceptable on real-device review.

Neither is implemented here per the task instruction: "If A is the recommendation, this task ends with the audit doc + screenshots."

## Screenshots

All in `docs/mobile/implementation/screenshots/`:

- `mobile-home.png`, `mobile-project.png`, `mobile-logbook.png` — 375×812
- `tablet-768-home.png`, `tablet-768-project.png`, `tablet-768-logbook.png` — 768×1024
- `landscape-844-home.png`, `landscape-844-project.png`, `landscape-844-logbook.png` — 844×390
