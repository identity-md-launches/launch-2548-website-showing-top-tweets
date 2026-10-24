import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

// All preview work runs in this foreground process; server and browser close in finally.
// Pass a different Playwright installation as the first argument on another machine.
const { chromium, webkit } = await import(process.argv[2] || '/opt/imd-tools/playwright-mcp/node_modules/playwright/index.mjs');
const root = resolve('dist');
const output = 'test/scratch/validation';
const results = [];
const limitations = [];
const consoleErrors = [];
const resourceErrors = [];
const outsideRequests = [];
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/preview/swamp/')) { res.writeHead(404).end(); return; }
    const path = decodeURIComponent(url.pathname.slice('/preview/swamp/'.length)) || 'index.html';
    const file = resolve(root, path);
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    res.setHeader('content-type', mime[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = `${origin}/preview/swamp/`;
await mkdir(output, { recursive: true });
let browser;
async function check(name, action) {
  try { await action(); results.push({ name, passed: true }); }
  catch (error) { results.push({ name, passed: false, error: String(error) }); }
}
async function count(page, n) { await page.waitForFunction(n => document.querySelectorAll('.post-card').length === n, n); }
async function firstId(page) { return page.locator('.post-card').first().getAttribute('data-post-id'); }
async function overflow(page) { return page.evaluate(() => document.documentElement.scrollWidth > innerWidth); }
async function hookPage(page) {
  page.on('pageerror', error => consoleErrors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) resourceErrors.push(`${response.status()} ${response.url()}`); });
  await page.route('**/*', route => { const req = route.request().url(); if (req.startsWith(origin) || req.startsWith('data:')) return route.continue(); outsideRequests.push(req); return route.abort(); });
}
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  await hookPage(page);
  await page.goto(url, { waitUntil: 'networkidle' });
  await check('Production export loads under a nested static subpath', async () => { await count(page, 8); assert.equal(await page.title(), 'The Swamp • Top identity.md posts'); });
  await check('Top sorts by likes', async () => { assert.equal(await firstId(page), '2113665568414773675'); });
  await check('Local font and runtime images load', async () => { assert(await page.evaluate(() => document.fonts.check('14px "DM Sans Variable"') && [...document.images].every(i => i.complete && i.naturalWidth > 0))); });
  await check('Search matches text, case-insensitively', async () => { await page.getByRole('searchbox').fill('IDENtitymd.eth'); await count(page, 1); });
  await check('Search clear restores results', async () => { await page.getByRole('button', { name: 'Clear search', exact: true }).click(); await count(page, 8); });
  await check('Search matches author handles', async () => { await page.getByRole('searchbox').fill('imdradar'); await count(page, 4); });
  await check('Topic and search combine', async () => { await page.getByRole('button', { name: 'Builders', exact: true }).click(); await count(page, 2); });
  await check('Empty search has a recovery action', async () => { await page.getByRole('searchbox').fill('nothere-xyz'); await count(page, 0); assert(await page.getByRole('heading', { name: 'No posts found' }).isVisible()); await page.getByRole('button', { name: 'Clear filters', exact: true }).click(); await count(page, 8); });
  for (const topic of ['Protocol', 'Builders', 'Culture', 'Community']) await check(`${topic} topic filter shows two posts`, async () => { await page.getByRole('button', { name: topic, exact: true }).click(); await count(page, 2); assert(await page.getByRole('button', { name: topic, exact: true }).getAttribute('aria-pressed') === 'true'); });
  await page.getByRole('button', { name: 'All posts', exact: true }).click();
  await check('Latest sorts by publication time', async () => { await page.getByRole('button', { name: 'Latest', exact: true }).click(); assert.equal(await firstId(page), '2113709593788379329'); });
  await check('Top restores the like ranking', async () => { await page.getByRole('button', { name: 'Top', exact: true }).click(); assert.equal(await firstId(page), '2113665568414773675'); });
  await check('Empty saved view explains how to save', async () => { await page.getByRole('button', { name: 'Saved 0', exact: true }).click(); await count(page, 0); assert(await page.getByRole('heading', { name: 'Keep the good ones.' }).isVisible()); await page.getByRole('button', { name: 'Explore posts', exact: true }).click(); await count(page, 8); });
  await check('Bookmark saves with visible pressed state', async () => { const button = page.getByRole('button', { name: 'Save we back', exact: true }); await button.click(); assert(await page.getByRole('button', { name: 'Unsave we back', exact: true }).getAttribute('aria-pressed') === 'true'); assert(await page.getByText('Post saved in this browser.', { exact: true }).isVisible()); });
  await check('Bookmark persists across reload', async () => { await page.reload({ waitUntil: 'networkidle' }); assert(await page.getByRole('button', { name: 'Unsave we back', exact: true }).isVisible()); });
  await check('Saved view contains only saved posts', async () => { await page.getByRole('button', { name: 'Saved 1', exact: true }).click(); await count(page, 1); assert.equal(await firstId(page), '2113665568414773675'); });
  await check('Unsave updates the saved view and count', async () => { await page.getByRole('button', { name: 'Unsave we back', exact: true }).click(); await count(page, 0); assert(await page.getByRole('button', { name: 'Saved 0', exact: true }).isVisible()); });
  await page.getByRole('button', { name: 'Explore posts', exact: true }).click();
  await check('Copy link writes the original post URL', async () => { await page.getByRole('button', { name: 'Copy link to we back', exact: true }).click(); assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'https://x.com/surfcoderepeat/status/2113665568414773675'); });
  await page.getByRole('button', { name: 'Dismiss notification' }).click();
  await check('About opens a real modal with snapshot disclosure', async () => { await page.getByRole('button', { name: 'About', exact: true }).click(); assert(await page.getByRole('dialog').isVisible()); assert(await page.getByText(/not a complete ranking of X or a live feed/).isVisible()); });
  await check('Native modal prevents focus reaching background controls', async () => { for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); assert(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement.closest('dialog'))); } assert(await page.evaluate(() => { const background = document.querySelector('.main-nav button'); background.focus(); return document.activeElement !== background; })); });
  await check('Escape closes modal and restores focus', async () => { await page.keyboard.press('Escape'); assert.equal(await page.locator('dialog:modal').count(), 0); assert.equal(await page.evaluate(() => document.activeElement.textContent), 'About'); });
  await check('Slash shortcut focuses search', async () => { await page.keyboard.press('/'); assert.equal(await page.locator(':focus').getAttribute('type'), 'search'); });
  await check('Keyboard can save a post', async () => { await page.getByRole('button', { name: 'Save we back', exact: true }).focus(); await page.keyboard.press('Space'); assert(await page.getByRole('button', { name: 'Unsave we back', exact: true }).getAttribute('aria-pressed') === 'true'); await page.screenshot({ path: `${output}/keyboard-focus.png` }); });
  await check('All original post links are valid X status destinations', async () => { const links = await page.locator('.read-post').evaluateAll(links => links.map(a => a.href)); assert.equal(links.length, 8); assert(links.every(link => /^https:\/\/x\.com\/\w+\/status\/\d+$/.test(link))); });
  await check('External links protect the opener', async () => { assert(await page.locator('a[target="_blank"]').evaluateAll(links => links.every(link => link.rel.includes('noopener') && link.rel.includes('noreferrer')))); });
  await check('Sidebar topic navigation filters the feed', async () => { await page.getByRole('button', { name: /01 AI agents 2 posts/ }).click(); await count(page, 2); });
  await page.getByRole('button', { name: 'All posts', exact: true }).click();
  await page.getByRole('button', { name: 'Dismiss notification' }).click();
  await page.evaluate(() => scrollTo(0, 0));
  for (const width of [320, 390, 600, 800, 1120, 1440]) {
    await check(`No horizontal overflow at ${width}px`, async () => { await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 }); assert.equal(await overflow(page), false); });
    if (width === 390 || width === 1440) { await page.screenshot({ path: `${output}/${width}.png`, fullPage: true }); }
  }
  await check('Phone first screen exposes the product and search', async () => { await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => scrollTo(0, 0)); const boxes = await page.evaluate(() => ({ search: document.querySelector('input[type=search]').getBoundingClientRect().bottom, post: document.querySelector('.post-card').getBoundingClientRect().top, quote: document.querySelector('blockquote').getBoundingClientRect().bottom })); assert(boxes.search < 844 && boxes.post < 844 && boxes.quote < 844); await page.screenshot({ path: `${output}/390-first-screen.png` }); });
  await check('Copy failure offers a selectable URL', async () => { await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('denied')) } })); await page.getByRole('button', { name: 'Copy link to we back', exact: true }).click(); assert(await page.getByRole('dialog', { name: 'Copy this post link' }).isVisible()); assert.equal(await page.getByRole('textbox', { name: 'Post link' }).inputValue(), 'https://x.com/surfcoderepeat/status/2113665568414773675'); await page.getByRole('button', { name: 'Done', exact: true }).click(); });
  await check('Storage failure retains a bookmark for the visit', async () => { await page.evaluate(() => Storage.prototype.setItem = () => { throw new Error('disabled'); }); await page.getByRole('button', { name: 'Unsave we back', exact: true }).click(); await page.getByRole('button', { name: 'Save we back', exact: true }).click(); assert(await page.getByText('Post saved for this visit. Browser storage is unavailable.', { exact: true }).isVisible()); });
  await page.getByRole('button', { name: 'Dismiss notification' }).click();
  await check('Reduced motion has no running animations', async () => { await page.emulateMedia({ reducedMotion: 'reduce' }); assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), 0); });
  await check('Forced colors retains the controls and selection cues', async () => { await page.emulateMedia({ forcedColors: 'active' }); assert.equal(await overflow(page), false); const outline = await page.locator('.topic-filters [aria-pressed="true"]').evaluate(el => getComputedStyle(el).outlineWidth); assert.equal(outline, '2px'); await page.screenshot({ path: `${output}/forced-colors.png` }); await page.emulateMedia({ forcedColors: 'none' }); });
  await check('200% text sizing reflows without horizontal overflow', async () => { await page.addStyleTag({ content: 'html { font-size: 200%; }' }); await page.screenshot({ path: `${output}/text-200-percent.png`, fullPage: true }); await page.screenshot({ path: `${output}/text-200-percent-top.png` }); const escaped = await page.locator('body *').evaluateAll(els => els.filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && !el.closest('.hero, .sr-only, .skip-link, dialog'); }).slice(0, 12).map(el => `${el.tagName}.${el.className}`)); assert.equal(await overflow(page), false, `Escaping elements: ${escaped.join(', ')}`); });
  await check('No browser console errors or missing local resources', async () => { assert.deepEqual(consoleErrors, []); assert.deepEqual(resourceErrors, []); });
  await check('Feed makes no third-party runtime requests', async () => { assert.deepEqual(outsideRequests, []); });
  await context.close();
  const damaged = await browser.newContext();
  await damaged.addInitScript(() => localStorage.setItem('swamp:saved:v1', '{broken-json'));
  const damagedPage = await damaged.newPage(); await hookPage(damagedPage);
  await check('Malformed stored bookmarks do not break the feed', async () => { await damagedPage.goto(url, { waitUntil: 'networkidle' }); await count(damagedPage, 8); });
  await damaged.close();
  const safari = await webkit.launch({ headless: true }).catch(error => { limitations.push(`WebKit unavailable: ${String(error).split('\n').filter(Boolean).slice(0, 4).join(' ')}`); return null; });
  if (safari) {
    try {
      await check('WebKit primary search and bookmark flow', async () => {
        const p = await safari.newPage({ viewport: { width: 390, height: 844 } });
        await hookPage(p); await p.goto(url); await count(p, 8);
        await p.getByRole('searchbox').fill('imdradar'); await count(p, 4);
        await p.getByRole('button', { name: 'Clear search' }).click();
        await p.getByRole('button', { name: 'Save we back', exact: true }).click();
        await p.getByRole('button', { name: 'Saved 1', exact: true }).click(); await count(p, 1);
        assert.equal(await overflow(p), false);
      });
    } finally { await safari.close(); }
  }
} finally { if (browser) await browser.close(); await new Promise(done => server.close(done)); }
const report = { passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results, limitations, consoleErrors, resourceErrors, outsideRequests };
await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (report.failed) process.exitCode = 1;
