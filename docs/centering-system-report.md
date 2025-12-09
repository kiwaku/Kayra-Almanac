# Centering System Analysis

## Current Behavior

The website appears **visually off-center** after adding the InstrumentPanel because the centering system doesn't account for fixed-position elements.

## How Centering Works

### Root Container (`src/styles/theme.css:18-30`)
```css
html, body {
  margin: 0 auto;          /* Centers the entire page */
  max-width: 880px;        /* Maximum content width */
  padding: 0 10px;         /* Small breathing room */
}
```

This creates:
```
[Left whitespace] [880px centered content] [Right whitespace]
```

### Shell Layout (`src/styles/theme.css:145-150`)
```css
.shell {
  display: grid;
  grid-template-columns: 200px 1fr;  /* Left nav: 200px, Content: remaining */
  gap: 16px;                          /* Gap between columns */
}
```

Actual layout within the 880px:
```
[LeftNav: 200px] [16px gap] [Content: 664px]
```

## The Problem

**InstrumentPanel uses `position: fixed`** and is positioned OUTSIDE the normal document flow:
- It anchors to `.content` column's right edge
- It sits in the right margin/whitespace area
- The root centering (`margin: 0 auto`) doesn't know about it

Visual result on wide viewports:
```
[LARGE left space] [LeftNav] [Content] [Panel →] [small right space]
                   ←──── 880px ────→
```

The 880px container is still centered, but the panel makes it LOOK off-center.

## Why This Happens

1. Root `html/body` centers using `margin: 0 auto` with `max-width: 880px`
2. InstrumentPanel has `position: fixed` (not in document flow)
3. Panel positioning is calculated from `.content` edge (inside the 880px)
4. Panel "overflows" into the right margin
5. Visual asymmetry: big left margin, small right margin

## Potential Solutions

### Option A: Offset the entire page to the left
- Adjust `html/body` left margin to compensate for panel width
- Shifts the 880px container left by ~half the panel's footprint
- Creates visual balance

### Option B: Make panel part of the layout
- Remove `position: fixed`, use grid or flexbox
- Include panel in the max-width calculation
- Increases total layout width (e.g., 880px → 1180px)

### Option C: Dynamic centering with JS
- Calculate panel width + padding
- Adjust body margin dynamically to balance visual weight
- Responsive to viewport changes

## Recommended Approach

**Option C - Dynamic Auto-Adjustment** is the most elegant:
- Measures actual panel width + padding via JavaScript
- Automatically calculates offset needed for visual balance
- Re-runs on resize/orientationchange
- Future-proof: works regardless of what you add to the right side

### Implementation Strategy

1. **Measure the right-side footprint**
   ```javascript
   const content = document.querySelector('.shell > .content');
   const panel = document.querySelector('#instrument-panel');
   const rect = content.getBoundingClientRect();
   const panelFootprint = (panel.offsetWidth + 80); // panel width + padding
   ```

2. **Calculate the shift amount**
   ```javascript
   // We want to shift left by half the panel footprint to create balance
   const shift = panelFootprint / 2;
   ```

3. **Apply to body margins**
   ```javascript
   const body = document.body;
   const currentMaxWidth = 880; // from CSS
   const halfMax = currentMaxWidth / 2;

   body.style.marginLeft = `calc(50% - ${halfMax}px - ${shift}px)`;
   body.style.marginRight = `calc(50% - ${halfMax}px + ${shift}px)`;
   ```

4. **Wire to existing positioning function**
   - Add to `positionInstrumentPanel()` in InstrumentPanel.astro
   - Automatically runs on load, resize, orientationchange
   - Single source of truth for all right-side positioning

### Benefits
- ✅ Auto-adjusts if you add more right-side elements
- ✅ Responds to panel width/padding changes
- ✅ No magic numbers or manual calculations
- ✅ Uses existing event handlers (resize, orientationchange)
- ✅ Works on any viewport size

---

**Files involved:**
- Layout: `src/layouts/BaseLayout.astro:31-39`
- Styles: `src/styles/theme.css:18-30, 145-150`
- Panel: `src/components/InstrumentPanel.astro`
