import { test as base } from '@playwright/test';

// WebKit in headless Playwright intermittently stalls on the cross-origin
// KaTeX CDN stylesheet (https://cdn.jsdelivr.net/npm/katex@0.16.9/...).
// The page DOM parses fine, but the document `load` event never fires, which
// starves Playwright's waitForFunction/waitForLoadState plumbing.
// We stub the request at the network layer so load fires cleanly in all
// engines. This only affects math rendering (absent in our test routes).
export const test = base.extend({
  page: async ({ page }, use) => {
    // Abort (not fulfill) so webkit doesn't attempt SRI integrity validation
    // on a stub payload. The resulting "Failed to load resource" is already
    // in the benign console-filter pattern.
    await page.route(/cdn\.jsdelivr\.net\/.*katex/i, (route) => route.abort());
    await use(page);
  },
});

export { expect } from '@playwright/test';
