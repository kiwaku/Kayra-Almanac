import { test, expect } from './fixtures';
import { ROUTES, VIEWPORTS } from './routes';

for (const vpName of ['mobile', 'narrow'] as const) {
  const vp = VIEWPORTS[vpName];
  test.describe(`mobile ${vpName} ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    for (const route of ROUTES) {
      test(`chrome hidden on ${route.name} (${route.path})`, async ({ page }) => {
        await page.goto(route.path, { waitUntil: 'commit' });
        // Wait for mobile CSS + SNN IIFE to run (sets __snnRan = false and
        // returns early at mobile viewports because of matchMedia gate).
        await page.waitForFunction(
          () => (window as any).__snnRan === false,
          null,
          { timeout: 15_000 },
        );
        await page.waitForTimeout(200);

        // Assertion 10 — LeftNav hidden
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
        expect(leftNav.exists).toBe(true);
        expect(
          leftNav.display === 'none' || !leftNav.offsetParent,
          `leftnav should be hidden; got display=${leftNav.display} offsetParent=${leftNav.offsetParent}`,
        ).toBe(true);

        // Assertion 11 — InstrumentPanel hidden
        const ip = await page.evaluate(() => {
          const el = document.getElementById('instrument-panel');
          if (!el) return { exists: false };
          const cs = getComputedStyle(el);
          return { exists: true, display: cs.display, offsetParent: el.offsetParent !== null };
        });
        expect(ip.exists).toBe(true);
        expect(
          ip.display === 'none' || !ip.offsetParent,
          `instrument-panel should be hidden; got display=${ip.display}`,
        ).toBe(true);

        // Assertion 12 — SNN panel hidden
        const snn = await page.evaluate(() => {
          const el = document.getElementById('snn-panel');
          if (!el) return { exists: false };
          const cs = getComputedStyle(el);
          return { exists: true, display: cs.display, offsetParent: el.offsetParent !== null };
        });
        expect(snn.exists).toBe(true);
        expect(
          snn.display === 'none' || !snn.offsetParent,
          `snn-panel should be hidden; got display=${snn.display}`,
        ).toBe(true);

        // Assertion 13 — SNN IIFE early-returned
        const snnRan = await page.evaluate(() => (window as any).__snnRan);
        expect(
          snnRan === false || snnRan === undefined,
          `__snnRan should be false/undefined on mobile; got ${snnRan}`,
        ).toBe(true);

        // Assertion 14 — body font-size is 16px
        const fs = await page.evaluate(() => {
          const cs = getComputedStyle(document.body);
          return parseFloat(cs.fontSize);
        });
        expect(fs).toBe(16);

        // Assertion 15 — body line-height ≈ 1.5
        const lh = await page.evaluate(() => {
          const cs = getComputedStyle(document.body);
          const fsize = parseFloat(cs.fontSize);
          const line = parseFloat(cs.lineHeight);
          return line / fsize;
        });
        expect(lh, `mobile line-height ratio=${lh}`).toBeGreaterThan(1.45);
        expect(lh).toBeLessThan(1.55);

        // Assertion 16 — body max-width respects min(880px, 100vw - 32px)
        const measure = await page.evaluate(() => {
          const cs = getComputedStyle(document.body);
          return {
            maxWidth: cs.maxWidth,
            computedMaxWidth: parseFloat(cs.maxWidth),
            innerWidth: window.innerWidth,
          };
        });
        // At 320px → expect 288; at 375px → expect 343
        const expected = Math.min(880, vp.width - 32);
        expect(
          Math.abs(measure.computedMaxWidth - expected),
          `expected max-width=${expected} got ${measure.computedMaxWidth} (raw=${measure.maxWidth})`,
        ).toBeLessThan(2);

        // Assertion 22 — floating "Show Debug Gridlines" panel hidden on mobile.
        // The toggle is injected by InstrumentPanel.astro asynchronously
        // (DOMContentLoaded or a 100 ms setTimeout) — wait for it, then check.
        await page
          .waitForFunction(() => !!document.getElementById('debug-toggle-ui'), null, {
            timeout: 2_000,
          })
          .catch(() => {
            /* panel never appeared — also acceptable (not in DOM ⇒ not visible) */
          });
        const debugToggle = await page.evaluate(() => {
          const el = document.getElementById('debug-toggle-ui');
          if (!el) return { exists: false };
          const cs = getComputedStyle(el);
          return { exists: true, display: cs.display, offsetParent: el.offsetParent !== null };
        });
        expect(
          !debugToggle.exists || debugToggle.display === 'none' || !debugToggle.offsetParent,
          `debug-toggle-ui should be hidden; got ${JSON.stringify(debugToggle)}`,
        ).toBe(true);

        // Assertion 23 — footer nav separator beads (.footer-nav .dot) hidden
        const beads = await page.evaluate(() => {
          const els = Array.from(
            document.querySelectorAll('.footer-nav .dot'),
          ) as HTMLElement[];
          return els.map((el) => ({
            display: getComputedStyle(el).display,
            visible: el.offsetParent !== null,
          }));
        });
        expect(beads.length, 'footer-nav should contain .dot beads in DOM').toBeGreaterThan(0);
        for (const b of beads) {
          expect(
            b.display === 'none' || !b.visible,
            `bead should be hidden; got display=${b.display} visible=${b.visible}`,
          ).toBe(true);
        }

        // Assertion 24 — "Shortcuts: …" footer line hidden on mobile
        const shortcuts = await page.evaluate(() => {
          const el = document.querySelector('.footer-shortcuts') as HTMLElement | null;
          if (!el) return { exists: false };
          const cs = getComputedStyle(el);
          return { exists: true, display: cs.display, visible: el.offsetParent !== null };
        });
        expect(shortcuts.exists, '.footer-shortcuts should exist in DOM').toBe(true);
        expect(
          shortcuts.display === 'none' || !shortcuts.visible,
          `footer-shortcuts should be hidden; got ${JSON.stringify(shortcuts)}`,
        ).toBe(true);
      });
    }

    test(`standalone tap targets ≥44x44 on mobile (home)`, async ({ page }) => {
      await page.goto('/', { waitUntil: 'commit' });
      await page.waitForFunction(
        () => document.readyState === 'complete' || document.readyState === 'interactive',
        null,
        { timeout: 15_000 },
      );
      await page.waitForTimeout(300);

      // Assertion 17 — footer-nav standalone links should have ≥44 tap area
      const sizes = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('.footer-nav a')) as HTMLElement[];
        return anchors.map((a) => {
          const rect = a.getBoundingClientRect();
          return {
            href: a.getAttribute('href'),
            width: rect.width,
            height: rect.height,
            text: a.textContent?.trim() ?? '',
          };
        });
      });
      expect(sizes.length, 'footer-nav should have links').toBeGreaterThan(0);
      for (const s of sizes) {
        expect(s.height, `${s.href} (${s.text}) height=${s.height}`).toBeGreaterThanOrEqual(44);
        expect(s.width, `${s.href} (${s.text}) width=${s.width}`).toBeGreaterThanOrEqual(44);
      }

      // Brand/logo link is also standalone
      const brand = await page.evaluate(() => {
        const el = document.querySelector('.brand a') as HTMLElement | null;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height };
      });
      expect(brand).not.toBeNull();
      expect(brand!.height, `brand link height=${brand!.height}`).toBeGreaterThanOrEqual(44);
      expect(brand!.width, `brand link width=${brand!.width}`).toBeGreaterThanOrEqual(44);
    });
  });
}
