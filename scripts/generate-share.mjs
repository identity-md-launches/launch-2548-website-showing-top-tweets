import { readFile } from 'node:fs/promises';

// Regenerate only when the visual identity changes; the PNG is a committed runtime asset.
const { chromium } = await import(process.argv[2] || '/opt/imd-tools/playwright-mcp/node_modules/playwright/index.mjs');
const illustration = await readFile(new URL('../public/assets/pepe-squad.svg', import.meta.url), 'utf8');
const image = `data:image/svg+xml;base64,${Buffer.from(illustration).toString('base64')}`;
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:#09150f;color:#edf1e8;font-family:Arial,sans-serif"><main style="box-sizing:border-box;width:1200px;height:630px;padding:70px;position:relative;overflow:hidden"><div style="position:absolute;inset:28px;border:1px solid #345039;border-radius:24px;background:#172e20;z-index:-1"></div><div style="font-size:24px;font-weight:bold;letter-spacing:-1px;color:#b9ed7c">the swamp.</div><h1 style="font-size:76px;line-height:1.03;letter-spacing:-5px;margin:56px 0 24px">Signal from<br>the <span style="color:#b9ed7c">swamp.</span></h1><p style="font-size:23px;line-height:1.5;color:#c0cfb9">The identity.md conversation,<br>in one place.</p><img alt="" src="${image}" style="position:absolute;right:-74px;bottom:30px;width:780px"><div style="position:absolute;left:70px;bottom:58px;font-size:18px;color:#a1b0a1">Big ideas. Frogs armed with AI.</div></main></body></html>`);
  await page.screenshot({ path: new URL('../public/assets/share.png', import.meta.url).pathname });
  console.log('Generated public/assets/share.png (1200 × 630).');
} finally { await browser.close(); }
