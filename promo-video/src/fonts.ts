import {FONT_DATA} from './font-data';

/* Brandové fonty vložené jako @font-face s data-URL (generuje
   scripts/embed-fonts.mjs z public/fonts). Injektujeme čisté CSS do <head> —
   žádné delayRender/FontFace.load(), takže render nemá co zaseknout a
   nezávisí na síti. Data-URL font je k dispozici prakticky okamžitě. */
export const DISPLAY = 'Bricolage Grotesque';
export const BODY = 'Inter';
export const MONO = 'JetBrains Mono';

const FACES: {family: string; key: string; weight: string}[] = [
  {family: DISPLAY, key: 'bricolage-800', weight: '800'},
  {family: BODY, key: 'inter-500', weight: '500'},
  {family: BODY, key: 'inter-600', weight: '600'},
  {family: BODY, key: 'inter-700', weight: '700'},
  {family: MONO, key: 'jbmono-400', weight: '400'},
];

if (typeof document !== 'undefined' && !document.getElementById('optik-fonts')) {
  const css = FACES.map(
    ({family, key, weight}) =>
      `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};` +
      `font-display:block;src:url(${FONT_DATA[key]}) format('truetype');}`
  ).join('');
  const style = document.createElement('style');
  style.id = 'optik-fonts';
  style.textContent = css;
  document.head.appendChild(style);
}
