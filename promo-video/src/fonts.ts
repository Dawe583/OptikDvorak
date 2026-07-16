import {loadFont} from '@remotion/fonts';
import {FONT_DATA} from './font-data';

/* Brandové fonty vložené jako data-URL (generuje scripts/embed-fonts.mjs
   z public/fonts) — render nedělá žádné síťové požadavky a nezávisí na
   Google Fonts. Sdílí je všechny kompozice. */
export const DISPLAY = 'Bricolage Grotesque';
export const BODY = 'Inter';
export const MONO = 'JetBrains Mono';

loadFont({family: DISPLAY, url: FONT_DATA['bricolage-800'], format: 'truetype', weight: '800'});
loadFont({family: BODY, url: FONT_DATA['inter-500'], format: 'truetype', weight: '500'});
loadFont({family: BODY, url: FONT_DATA['inter-600'], format: 'truetype', weight: '600'});
loadFont({family: BODY, url: FONT_DATA['inter-700'], format: 'truetype', weight: '700'});
loadFont({family: MONO, url: FONT_DATA['jbmono-400'], format: 'truetype', weight: '400'});
