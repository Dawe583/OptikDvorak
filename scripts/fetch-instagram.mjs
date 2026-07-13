// Build-time Instagram feed pro @optik.dvorak.
//
// JAK OBNOVIT FEED (cca 2 minuty):
// 1. Otevřete https://www.instagram.com/optik.dvorak/ v prohlížeči.
// 2. Otevřete DevTools konzoli (F12) a spusťte:
//    copy(JSON.stringify([...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')].slice(0,12).map(a=>({h:a.getAttribute('href'), i:(a.querySelector('img')||{}).src||null}))))
// 3. Obsah schránky vložte do scripts/ig-posts.json (přepište celý soubor).
// 4. Spusťte: npm run ig:refresh
//    → stáhne thumbnaily do public/img/ig/ a přegeneruje public/data/instagram.json.
// 5. Commit + push. (Dlaždice v index.html čtou ig-01.jpg…ig-06.jpg — jména se nemění.)
//
// Pozn.: přímé stahování z Instagram API vyžaduje Business účet + token;
// tento poloautomatický postup funguje bez přihlášení a bez závislostí.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const posts = JSON.parse(await readFile(path.join(root, 'scripts/ig-posts.json'), 'utf8'));

const imgDir = path.join(root, 'public/img/ig');
const dataDir = path.join(root, 'public/data');
await mkdir(imgDir, { recursive: true });
await mkdir(dataDir, { recursive: true });

const out = [];
let n = 0;
for (const p of posts) {
  if (!p.i || !p.h) continue;
  n += 1;
  const name = `ig-${String(n).padStart(2, '0')}.jpg`;
  const res = await fetch(p.i);
  if (!res.ok) {
    console.error(`SKIP ${name}: HTTP ${res.status} (URL nejspíš expirovala — obnovte ig-posts.json, krok 1–3 v hlavičce)`);
    n -= 1;
    continue;
  }
  await writeFile(path.join(imgDir, name), Buffer.from(await res.arrayBuffer()));
  // href z gridu má tvar /optik.dvorak/p/SHORTCODE/ → normalizovat na /p/SHORTCODE/
  const short = p.h.replace(/^\/[^/]+/, '');
  out.push({ url: `https://www.instagram.com${short}`, img: `/img/ig/${name}` });
  console.log(`OK ${name} ← ${short}`);
}

await writeFile(path.join(dataDir, 'instagram.json'), JSON.stringify(out, null, 2));
console.log(`DONE: ${out.length} postů → public/data/instagram.json`);
