/* Vygeneruje src/font-data.ts s fonty vloženými jako base64 data-URL.
   FontFace pak nedělá žádný síťový požadavek — render je deterministický
   i bez sítě. Spustit po každé změně souborů v public/fonts:
   node scripts/embed-fonts.mjs */
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, join, basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontsDir = join(root, 'public', 'fonts');

const entries = readdirSync(fontsDir)
  .filter((f) => f.endsWith('.ttf'))
  .sort()
  .map((f) => {
    const b64 = readFileSync(join(fontsDir, f)).toString('base64');
    return `  '${basename(f, '.ttf')}': 'data:font/ttf;base64,${b64}',`;
  });

const out = [
  '/* VYGENEROVÁNO scripts/embed-fonts.mjs — needitovat ručně.',
  '   Zdrojové TTF: public/fonts (Google Fonts, licence OFL). */',
  'export const FONT_DATA: Record<string, string> = {',
  ...entries,
  '};',
  '',
].join('\n');

writeFileSync(join(root, 'src', 'font-data.ts'), out);
console.log(`OK: src/font-data.ts (${entries.length} fontů, ${(out.length / 1e6).toFixed(2)} MB)`);
