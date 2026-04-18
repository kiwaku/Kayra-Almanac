import { test, expect } from './fixtures';
import { VIEWPORTS } from './routes';

// Assertion 18 — breakpoint transition test

test('at 768x1024 desktop rules apply', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.tabletBoundary);
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForFunction(() => (window as any).__snnRan === true, null, { timeout: 15_000 });

  const leftDisplay = await page.evaluate(() => {
    const el = document.querySelector('.leftnav') as HTMLElement | null;
    return el ? getComputedStyle(el).display : null;
  });
  expect(leftDisplay, 'leftnav should be visible at 768').not.toBe('none');

  const snnDisplay = await page.evaluate(() => {
    const el = document.getElementById('snn-panel');
    return el ? getComputedStyle(el).display : null;
  });
  expect(snnDisplay, 'snn-panel should be visible at 768').not.toBe('none');

  const snnRan = await page.evaluate(() => (window as any).__snnRan);
  expect(snnRan, '__snnRan should be true at 768').toBe(true);
});

test('at 767x1024 mobile rules apply', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.tabletBelow);
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForFunction(() => (window as any).__snnRan === false, null, { timeout: 15_000 });

  const leftDisplay = await page.evaluate(() => {
    const el = document.querySelector('.leftnav') as HTMLElement | null;
    return el ? getComputedStyle(el).display : null;
  });
  expect(leftDisplay, 'leftnav should be hidden at 767').toBe('none');

  const snnDisplay = await page.evaluate(() => {
    const el = document.getElementById('snn-panel');
    return el ? getComputedStyle(el).display : null;
  });
  expect(snnDisplay, 'snn-panel should be hidden at 767').toBe('none');

  const snnRan = await page.evaluate(() => (window as any).__snnRan);
  expect(
    snnRan === false || snnRan === undefined,
    `__snnRan should be false/undefined at 767; got ${snnRan}`,
  ).toBe(true);
});
