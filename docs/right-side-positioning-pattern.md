# Right-Side Positioning Pattern

## Standard Pattern for Elements Placed to the Right of Main Content

When adding UI elements to the right side of the screen (diagnostics, panels, widgets, etc.), use this positioning logic:

### 1. Target Selector
```javascript
const content = document.querySelector('.shell > .content');
const panel = document.querySelector('#your-panel-id');
```

### 2. Measure Available Space
```javascript
const rect = content.getBoundingClientRect();
const spaceRight = window.innerWidth - rect.right;
const padding = 32; // gap between content and panel (adjust as needed)
```

### 3. Conditional Positioning Logic
```javascript
if (spaceRight >= panel.offsetWidth + padding) {
  // Enough room: position to the right of content
  panel.style.position = 'fixed';
  panel.style.left = `${rect.right + padding}px`;
  panel.style.right = 'auto';

  // Vertical positioning (20% down from content top, clamped)
  const y = rect.top + rect.height * 0.2;
  panel.style.top = `${Math.max(40, y)}px`;

  panel.classList.remove('is-overlay');
} else {
  // Not enough room: fallback overlay position
  panel.style.position = 'fixed';
  panel.style.left = 'auto';
  panel.style.right = '10px';
  panel.style.top = '60%';

  panel.classList.add('is-overlay');
}
```

### 4. Event Handlers
Run positioning on:
- Initial load: `DOMContentLoaded` or immediate if DOM ready
- `resize` events
- `orientationchange` events

### 5. CSS Requirements
- Use `position: fixed` in CSS (no default left/right/top values)
- Let JavaScript fully control positioning
- No hard-coded page widths (880px, etc.)

### Key Principles
- **Dynamic anchoring**: Position relative to `.content` column, not viewport
- **No magic numbers**: Calculate everything from actual layout
- **Graceful fallback**: Overlay mode when viewport is too narrow
- **Responsive**: Reposition on resize and orientation changes

### Typical Padding Values
- `16px`: Minimal gap (feels close but acceptable)
- `32px`: Comfortable breathing room (recommended)
- `48px`: Generous spacing (for larger viewports)

---

**Reference Implementation**: `src/components/InstrumentPanel.astro` (lines 363-397)
