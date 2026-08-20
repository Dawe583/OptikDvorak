// Vyexportuje inzeráty z inzeraty.html do PNG (300 DPI) a tiskového PDF.
// Spuštění:  node inzerce/trojka/render.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'export');
fs.mkdirSync(outDir, { recursive: true });

const DPI = 300;
const SCALE = DPI / 96; // 3.125 → 1 mm = 11.811 px = přesně 300 DPI

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: SCALE, viewport: { width: 1400, height: 1400 } });
const page = await ctx.newPage();
await page.emulateMedia({ media: 'screen' });
await page.goto('file://' + path.join(here, 'inzeraty.html'));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

const ads = await page.$$('.ad');
for (const ad of ads) {
  const name = await ad.getAttribute('data-name');
  const over = await ad.evaluate((el) => {
    const inner = el.querySelector('.inner') || el;
    return inner.scrollHeight - inner.clientHeight;
  });
  if (over > 1) console.warn(`  !! ${name}: obsah přetéká o ${over} px`);
}

// PDF – každý inzerát na vlastní stránce o přesném čistém formátu
for (let i = 0; i < ads.length; i++) {
  const { name, w, h } = await page.evaluate((idx) => {
    const list = [...document.querySelectorAll('.ad')];
    list.forEach((el, j) => { el.style.display = j === idx ? '' : 'none'; });
    document.body.style.cssText = 'margin:0;padding:0;background:#fff;display:block;';
    const el = list[idx];
    const px2mm = 25.4 / 96;
    const r = el.getBoundingClientRect();
    return { name: el.dataset.name, w: r.width * px2mm, h: r.height * px2mm };
  }, i);
  await page.pdf({
    path: path.join(outDir, `${name}.pdf`),
    width: `${w.toFixed(3)}mm`,
    height: `${h.toFixed(3)}mm`,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    pageRanges: '1',
  });
  console.log('PDF  ', name, `${w.toFixed(1)}×${h.toFixed(1)} mm`);
}

await browser.close();
