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

const EXPECTED_ADS = 10;
const ads = await page.$$('.ad');
if (ads.length !== EXPECTED_ADS)
  console.warn(`  !! v HTML je ${ads.length} inzerátů, čekáno ${EXPECTED_ADS} — rozbité párování tagů?`);

for (const ad of ads) {
  const name = await ad.getAttribute('data-name');
  const { over, chars } = await ad.evaluate((el) => {
    // Co čouhá mimo plochu inzerátu, to se v PDF ořízne. Počítáme jen prvky,
    // které nemají nad sebou ořezávajícího rodiče (fotky s overflow:hidden
    // schválně přetékají). Pokrývá i .card u návrhu D — ta je absolutně
    // pozicovaná, takže scrollHeight rodiče o jejím přetečení neví.
    const box = el.getBoundingClientRect();
    let over = 0;
    for (const node of el.querySelectorAll('*')) {
      if (node.tagName === 'IMG' || node.closest('svg')) continue;
      let clipped = false;
      for (let a = node.parentElement; a && a !== el; a = a.parentElement) {
        if (getComputedStyle(a).overflow !== 'visible') { clipped = true; break; }
      }
      if (clipped) continue;
      const r = node.getBoundingClientRect();
      over = Math.max(over, r.bottom - box.bottom, r.right - box.right);
    }
    // Návrh D: text nesmí vylézt z krémové karty na fotku, i když se do
    // inzerátu ještě vejde — karta je absolutně pozicovaná a sama neroste.
    for (const card of el.querySelectorAll('.card')) {
      const limit = card.getBoundingClientRect().bottom;
      for (const kid of card.children)
        over = Math.max(over, kid.getBoundingClientRect().bottom - limit);
    }
    return { over: Math.round(over), chars: el.innerText.replace(/\s+/g, '').length };
  });
  if (over > 1) console.warn(`  !! ${name}: obsah přetéká o ${over} px`);
  // sítě pod sebou musí mít přesně stejnou levou hranu
  const socOff = await ad.evaluate((el) => {
    const socs = [...el.querySelectorAll('.soc')];
    if (socs.length < 2) return 0;
    const tops = socs.map((n) => n.getBoundingClientRect().top);
    if (new Set(tops.map(Math.round)).size < socs.length) return 0; // vedle sebe, ne pod sebou
    const lefts = socs.map((n) => n.getBoundingClientRect().left);
    return Math.max(...lefts) - Math.min(...lefts);
  });
  if (socOff > 0.5)
    console.warn(`  !! ${name}: ikony sítí nesedí pod sebou, rozdíl ${socOff.toFixed(1)} px`);
  if (chars < 120) console.warn(`  !! ${name}: skoro prázdný (${chars} znaků) — nevykreslil se obsah`);
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
