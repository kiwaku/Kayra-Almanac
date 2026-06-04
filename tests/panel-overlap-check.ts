/**
 * One-shot panel overlap check.
 * Run: npx tsx tests/panel-overlap-check.ts
 *
 * Starts a preview server, opens the about page at 1440×835,
 * waits for JS positioning to settle, then reports exact pixel
 * positions and whether the panel overlaps the shell.
 */

import { chromium } from '@playwright/test';
import { execSync, spawn } from 'child_process';
import { createServer } from 'net';

const PORT = 4399;
const BASE = `http://127.0.0.1:${PORT}`;

async function portFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const s = createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => { s.close(); resolve(true); });
    s.listen(port);
  });
}

(async () => {
  // Build
  console.log('Building...');
  execSync('npx astro build', { stdio: 'inherit', cwd: process.cwd() });

  // Start preview server
  console.log(`Starting preview on port ${PORT}...`);
  const server = spawn(
    'npx', ['astro', 'preview', '--host', '127.0.0.1', '--port', String(PORT)],
    { stdio: 'ignore', detached: false }
  );

  // Wait for port
  let attempts = 0;
  while (await portFree(PORT)) {
    if (++attempts > 40) { console.error('Server never started'); process.exit(1); }
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('Server ready.');

  const browser = await chromium.launch();
  const VIEWPORTS = [
    { width: 1440, height: 835, label: '1440×835 (user default)' },
    { width: 1200, height: 800, label: '1200×800' },
    { width: 1100, height: 800, label: '1100×800 (near threshold)' },
    { width: 1000, height: 800, label: '1000×800 (below threshold)' },
  ];

  let anyFail = false;

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.route(/cdn\.jsdelivr\.net\/.*katex/i, r => r.abort());
    await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded' });

    // Wait for JS positioning to settle (100ms delay + RAF)
    await page.waitForTimeout(600);

    const data = await page.evaluate(() => {
      const panel = document.getElementById('instrument-panel');
      const shell = document.querySelector('.shell') as HTMLElement | null;
      if (!panel || !shell) return null;
      const pr = panel.getBoundingClientRect();
      const sr = shell.getBoundingClientRect();
      const sm = parseFloat(shell.style.marginLeft) || 0;
      return {
        panel: { left: Math.round(pr.left), right: Math.round(pr.right), top: Math.round(pr.top) },
        shell: { left: Math.round(sr.left), right: Math.round(sr.right) },
        shellMarginLeft: Math.round(sm),
        vw: window.innerWidth,
        panelDisplay: window.getComputedStyle(panel).display,
      };
    });

    if (!data) {
      console.log(`[${vp.label}] Could not read elements`);
      await ctx.close();
      continue;
    }

    const gap = data.panel.left - data.shell.right;
    const overlaps = gap < 0;
    const status = overlaps ? '❌ OVERLAP' : '✅ OK';
    console.log(
      `[${vp.label}] ${status}\n` +
      `  shell: ${data.shell.left}–${data.shell.right}  marginLeft:${data.shellMarginLeft}\n` +
      `  panel: ${data.panel.left}–${data.panel.right}  top:${data.panel.top}\n` +
      `  gap:   ${gap}px\n`
    );
    if (overlaps) anyFail = true;

    await ctx.close();
  }

  await browser.close();
  server.kill();
  process.exit(anyFail ? 1 : 0);
})();
