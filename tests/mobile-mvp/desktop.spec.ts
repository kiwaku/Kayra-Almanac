import { test, expect } from './fixtures';
import { ROUTES, VIEWPORTS } from './routes';

test.use({ viewport: VIEWPORTS.desktop });

for (const route of ROUTES) {
  test(`desktop chrome visible on ${route.name} (${route.path})`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: 'commit' });
    // Wait for DOM to parse and SNN IIFE to have set __snnRan = true
    // (IIFE runs at end of BaseLayout body, then setTimeout(init, 500) on DCL).
    await page.waitForFunction(() => (window as any).__snnRan === true, null, { timeout: 15_000 });

    // Assertion 5 — LeftNav visible
    const leftNav = await page.evaluate(() => {
      const el = document.querySelector('.leftnav') as HTMLElement | null;
      if (!el) return { exists: false };
      const cs = getComputedStyle(el);
      return {
        exists: true,
        display: cs.display,
        offsetParent: el.offsetParent !== null,
      };
    });
    expect(leftNav.exists, 'leftnav element should exist').toBe(true);
    expect(leftNav.display, 'leftnav display should not be none').not.toBe('none');
    expect(leftNav.offsetParent, 'leftnav should be in render tree').toBe(true);

    // Assertion 6 — InstrumentPanel visible
    const ip = await page.evaluate(() => {
      const el = document.getElementById('instrument-panel');
      if (!el) return { exists: false };
      const cs = getComputedStyle(el);
      return { exists: true, display: cs.display, offsetParent: el.offsetParent !== null };
    });
    expect(ip.exists, 'instrument-panel should exist').toBe(true);
    expect(ip.display, 'instrument-panel display should not be none').not.toBe('none');

    // Assertion 7 — SNN panel visible (not display:none)
    const snn = await page.evaluate(() => {
      const el = document.getElementById('snn-panel');
      if (!el) return { exists: false };
      const cs = getComputedStyle(el);
      return { exists: true, display: cs.display };
    });
    expect(snn.exists, 'snn-panel should exist').toBe(true);
    expect(snn.display, 'snn-panel should not be display:none on desktop').not.toBe('none');

    // Assertion 8 — SNN IIFE ran
    const snnRan = await page.evaluate(() => (window as any).__snnRan);
    expect(snnRan, '__snnRan should be true on desktop').toBe(true);

    // Assertion 9 — body line-height ≈ 1.35
    const lh = await page.evaluate(() => {
      const body = document.body;
      const cs = getComputedStyle(body);
      const fs = parseFloat(cs.fontSize);
      const line = parseFloat(cs.lineHeight);
      return { fontSize: fs, lineHeight: line, ratio: line / fs };
    });
    expect(lh.ratio, `desktop line-height ratio=${lh.ratio}`).toBeGreaterThan(1.3);
    expect(lh.ratio).toBeLessThan(1.4);
  });
}
