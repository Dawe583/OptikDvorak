import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/* Brandové fonty servírované lokálně z public/fonts (stažené z Google Fonts,
   licence OFL) — render tak nezávisí na síti. Sdílí je všechny kompozice. */
export const DISPLAY = 'Bricolage Grotesque';
export const BODY = 'Inter';
export const MONO = 'JetBrains Mono';

loadFont({family: DISPLAY, url: staticFile('fonts/bricolage-800.ttf'), weight: '800'});
loadFont({family: BODY, url: staticFile('fonts/inter-500.ttf'), weight: '500'});
loadFont({family: BODY, url: staticFile('fonts/inter-600.ttf'), weight: '600'});
loadFont({family: BODY, url: staticFile('fonts/inter-700.ttf'), weight: '700'});
loadFont({family: MONO, url: staticFile('fonts/jbmono-400.ttf'), weight: '400'});
