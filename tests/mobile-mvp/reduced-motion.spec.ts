import { test, expect } from './fixtures';
import { VIEWPORTS } from './routes';

// Assertion 19 — reduced-motion emulation.
// We open an explicit newContext with reducedMotion: 'reduce' rather than
// relying on test.use() so the emulation is unambiguous.

test('home with prefers-reduced-motion:reduce', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: VIEWPORTS.mobile,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.route(/cdn\.jsdelivr\.net\/.*katex/i, (route) => route.abort());

  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForFunction(
    () => document.readyState === 'complete' || document.readyState === 'interactive',
    null,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(500);

  const probe = await page.evaluate(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = document.createElement('div');
    el.style.animation = 'spin 10s linear infinite';
    document.body.appendChild(el);
    const cs = getComputedStyle(el);
    const duration = cs.animationDuration;
    const durSeconds = parseFloat(duration) * (duration.endsWith('ms') ? 0.001 : 1);
    document.body.removeChild(el);
    return { media, duration, durSeconds };
  });

  expect(probe.media, 'reduced-motion media query should match').toBe(true);
  expect(
    probe.durSeconds,
    `animation-duration should be suppressed; got ${probe.duration}`,
  ).toBeLessThan(0.01);

  const real = errors.filter((e) => !/favicon|og-default|Failed to load resource|katex/i.test(e));
  expect(real, `unexpected errors: ${real.join('; ')}`).toEqual([]);

  await context.close();
});
