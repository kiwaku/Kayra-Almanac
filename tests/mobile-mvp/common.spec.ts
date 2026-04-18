import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { ROUTES, VIEWPORTS } from './routes';

type ConsoleMessage = { type: string; text: string; url: string };

function captureConsole(page: Page): ConsoleMessage[] {
  const errors: ConsoleMessage[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({ type: msg.type(), text: msg.text(), url: page.url() });
    }
  });
  page.on('pageerror', (err) => {
    errors.push({ type: 'pageerror', text: err.message, url: page.url() });
  });
  return errors;
}

function isBenign(msg: ConsoleMessage): boolean {
  // Preview server 404s for /favicon.ico / og-default.jpg etc are not site bugs.
  const benignPatterns = [
    /Failed to load resource/i,
    /favicon/i,
    /og-default/i,
    /katex\.min\.css/i,
    /sri|subresource integrity/i,
  ];
  return benignPatterns.some((p) => p.test(msg.text));
}

for (const vpName of ['desktop', 'tabletBoundary', 'tabletBelow', 'mobile', 'narrow'] as const) {
  const vp = VIEWPORTS[vpName];
  // Assertion 3 (no horizontal scroll) is a WCAG 1.4.10 reflow guarantee at
  // 320 CSS px — the decisions docs explicitly allow "essential 2D content"
  // (wide tables, code blocks, KaTeX math) to page-scroll at desktop
  // compositions (see 01 §2 WCAG 2.2 exception, 02 §6 measure policy). We
  // only enforce the assertion at the mobile composition (< 768 px).
  const enforceNoScroll = vp.width < 768;

  test.describe(`viewport ${vpName} ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    for (const route of ROUTES) {
      test(`${route.name} ${route.path}`, async ({ page }) => {
        const errors = captureConsole(page);
        const response = await page.goto(route.path, { waitUntil: 'commit' });

        // Assertion 1 — HTTP 200
        expect(response?.status(), `expected 200 for ${route.path}`).toBe(200);

        // Wait for layout/CSS/JS to settle. Using waitForFunction rather than
        // waitUntil:'load' because webkit intermittently hangs on 'load' even
        // when DOM has parsed (verified via trace — all resources return 200).
        await page.waitForFunction(
          () => document.readyState === 'complete' || document.readyState === 'interactive',
          null,
          { timeout: 15_000 },
        );
        await page.waitForTimeout(300);

        // Assertion 4 — <title> and <main>
        await expect(page).toHaveTitle(/.+/);
        const mainCount = await page.locator('main').count();
        expect(mainCount, 'main element should exist').toBeGreaterThan(0);

        // Assertion 3 — no horizontal scroll (mobile-only per note above)
        if (enforceNoScroll) {
          const overflow = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
          }));
          expect(
            overflow.scrollWidth,
            `horizontal scroll: scrollWidth=${overflow.scrollWidth} innerWidth=${overflow.innerWidth}`,
          ).toBeLessThanOrEqual(overflow.innerWidth);
        }

        // Assertion 2 — no JS console errors (after settle)
        const real = errors.filter((e) => !isBenign(e));
        expect(real, `unexpected console errors: ${JSON.stringify(real)}`).toEqual([]);
      });
    }
  });
}
