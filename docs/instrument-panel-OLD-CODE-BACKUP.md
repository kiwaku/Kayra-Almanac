# InstrumentPanel - Old Code Backup (Pre-Shell Refactor)

## Old positionInstrumentPanel() function

Use this to rollback if the new .shell-based approach doesn't work.

Replace lines 752-830 in `src/components/InstrumentPanel.astro` with:

```javascript
  function positionInstrumentPanel() {
    const panel = document.getElementById('instrument-panel');
    const content = document.querySelector('.shell > .content');

    if (!panel || !content) {
      console.warn('InstrumentPanel: positioning elements not found');
      return;
    }

    const rect = content.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    const padding = 80; // gap between content and panel (was 16, then 32, then 48, now 80 for wider breathing room)

    // Check if there's enough room to the right
    if (spaceRight >= panel.offsetWidth + padding) {
      // Position to the right of content
      panel.style.position = 'fixed';
      panel.style.left = `${rect.right + padding}px`;
      panel.style.right = 'auto';

      // 20% down from top of content, clamped away from the top
      const y = rect.top + rect.height * 0.2;
      panel.style.top = `${Math.max(40, y)}px`;

      panel.classList.remove('is-overlay');

      // ============================================================
      // AUTO-CENTERING: Balance main content by shifting left
      // ROLLBACK: Comment out this entire block to disable
      // ============================================================
      const shell = document.querySelector('.shell');
      const header = document.querySelector('.header');

      if (shell) {
        const panelFootprint = panel.offsetWidth + padding;
        const shift = panelFootprint / 2;

        // Shift main content and header left to balance the panel
        // Footer remains centered
        shell.style.marginLeft = `-${shift}px`;
        if (header) {
          header.style.marginLeft = `-${shift}px`;
        }
      }
      // ============================================================
      // END AUTO-CENTERING
      // ============================================================
    } else {
      // Fallback overlay position
      panel.style.position = 'fixed';
      panel.style.left = 'auto';
      panel.style.right = '10px';
      panel.style.top = '60%';

      panel.classList.add('is-overlay');

      // ============================================================
      // AUTO-CENTERING: Reset margins when panel is in overlay mode
      // ROLLBACK: Comment out this block if you commented out the above
      // ============================================================
      const shell = document.querySelector('.shell');
      const header = document.querySelector('.header');

      if (shell) {
        shell.style.marginLeft = '0';
      }
      if (header) {
        header.style.marginLeft = '0';
      }
      // ============================================================
      // END AUTO-CENTERING RESET
      // ============================================================
    }
  }
```
