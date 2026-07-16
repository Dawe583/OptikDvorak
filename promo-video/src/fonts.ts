import {continueRender, delayRender} from 'remotion';
import {FONT_DATA} from './font-data';

/* Brandové fonty vložené jako data-URL (generuje scripts/embed-fonts.mjs
   z public/fonts) — render nedělá žádné síťové požadavky a nezávisí na
   Google Fonts. Vlastní loader drží labely delayRender krátké (data-URL
   v labelu @remotion/fonts zahlcovala log i CDP). */
export const DISPLAY = 'Bricolage Grotesque';
export const BODY = 'Inter';
export const MONO = 'JetBrains Mono';

const load = (family: string, key: string, weight: string) => {
  if (typeof document === 'undefined') return;
  const handle = delayRender(`font ${family} ${weight}`);
  const face = new FontFace(family, `url('${FONT_DATA[key]}') format('truetype')`, {weight});
  /* přidat hned — prohlížeč font použije, jakmile je zparsovaný */
  (document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
  /* FontFace.load() umí v headless Chromiu ojediněle uvíznout (pozorováno
     v neaktivní interní stránce Remotionu) a viselý handle by po timeoutu
     shodil celý render — proto závod s vlastním limitem. Data-URL se jinak
     parsuje okamžitě. */
  const cap = new Promise<void>((resolve) => setTimeout(resolve, 8000));
  Promise.race([face.load().then(() => undefined), cap])
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Font ${family} ${weight} se nenačetl`, err);
    })
    .then(() => continueRender(handle));
};

load(DISPLAY, 'bricolage-800', '800');
load(BODY, 'inter-500', '500');
load(BODY, 'inter-600', '600');
load(BODY, 'inter-700', '700');
load(MONO, 'jbmono-400', '400');
