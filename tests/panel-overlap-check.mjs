import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4399';

const VIEWPORTS = [
  { width: 1440, height: 835,  label: '1440×835 (user default)' },
  { width: 1200, height: 800,  label: '1200×800' },
  { width: 1100, height: 800,  label: '1100×800' },
  { width: 1050, height: 800,  label: '1050×800 (near threshold)' },
  { width: 1000, height: 800,  label: '1000×800 (below threshold)' },
];

const browser = await chromium.launch({ headless: true });
let anyFail = false;

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.route(/cdn\.jsdelivr\.net\/.*katex/i, r => r.abort());
  await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  const data = await page.evaluate(() => {
    const panel = document.getElementById('instrument-panel');
    const shell = document.querySelector('.shell');
    const html = document.documentElement;
    const body = document.body;
    if (!panel || !shell) return null;
    const pr = panel.getBoundingClientRect();
    const sr = shell.getBoundingClientRect();
    const hr = html.getBoundingClientRect();
    const br = body.getBoundingClientRect();
    const sm = parseFloat(shell.style.marginLeft) || 0;
    const ps = window.getComputedStyle(panel);

    const panelWidth = panel.offsetWidth;
    const prevMarginLeft = sm;
    const naturalLeft = sr.left - prevMarginLeft;
    const naturalRight = naturalLeft + sr.width;
    const vw = window.innerWidth;
    const padding = Math.min(80, Math.max(16, vw * 0.04));
    const panelComputedLeft = Math.min(naturalRight + padding, vw - panelWidth);

    return {
      vw,
      html: { left: Math.round(hr.left), right: Math.round(hr.right), width: Math.round(hr.width) },
      body: { left: Math.round(br.left), right: Math.round(br.right), width: Math.round(br.width) },
      shell: { left: Math.round(sr.left), right: Math.round(sr.right), width: Math.round(sr.width), marginLeft: Math.round(sm) },
      panel: { left: Math.round(pr.left), right: Math.round(pr.right), width: Math.round(pr.width), top: Math.round(pr.top), cssLeft: ps.left },
      computed: {
        naturalLeft: Math.round(naturalLeft),
        naturalRight: Math.round(naturalRight),
        padding: Math.round(padding),
        panelComputedLeft: Math.round(panelComputedLeft),
      },
    };
  });

  if (!data) { console.log(`[${vp.label}] No data\n`); await ctx.close(); continue; }

  const gap = data.panel.left - data.shell.right;
  const overlaps = gap < 0;
  const status = overlaps ? '❌ OVERLAP' : '✅ OK';
  anyFail = anyFail || overlaps;

  console.log(`[${vp.label}] ${status}   vw=${data.vw}
  html:    left=${data.html.left}  right=${data.html.right}  width=${data.html.width}
  body:    left=${data.body.left}  right=${data.body.right}  width=${data.body.width}
  shell:   left=${data.shell.left}  right=${data.shell.right}  width=${data.shell.width}  marginLeft=${data.shell.marginLeft}
  panel:   left=${data.panel.left}  right=${data.panel.right}  width=${data.panel.width}  top=${data.panel.top}  cssLeft=${data.panel.cssLeft}
  js:      naturalLeft=${data.computed.naturalLeft}  naturalRight=${data.computed.naturalRight}  padding=${data.computed.padding}  computed.left=${data.computed.panelComputedLeft}
  gap:     ${gap}px
`);

  await ctx.close();
}

await browser.close();
process.exit(anyFail ? 1 : 0);
