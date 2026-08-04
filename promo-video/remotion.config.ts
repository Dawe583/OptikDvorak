import {Config} from '@remotion/cli/config';
import {existsSync, readdirSync} from 'node:fs';

Config.setOverwriteOutput(true);

/* Renderování v kontejneru (CI / agent).
   Na běžném počítači se nic z toho neuplatní — cesty neexistují, podmínka
   neprojde a Remotion si stáhne a použije vlastní prohlížeč jako dřív.

   1) Moderní Chrome už neumí staré headless režimy, které Remotion spouští.
      Playwright ale dodává samostatný `headless_shell`, který je přesně pro
      tenhle případ. Když ho najdeme, použijeme ho.
   2) Odchozí HTTPS jde přes proxy, která spojení podepisuje vlastní certifikační
      autoritou. Prohlížeč ji nezná a odmítl by načíst písma z Google Fonts —
      render by spadl na NetworkError. */
const PW = '/opt/pw-browsers';
if (existsSync(PW)) {
  const dir = readdirSync(PW).find((d) => d.startsWith('chromium_headless_shell-'));
  const bin = dir ? `${PW}/${dir}/chrome-linux/headless_shell` : null;
  if (bin && existsSync(bin)) {
    Config.setBrowserExecutable(bin);
    Config.setChromiumIgnoreCertificateErrors(true);
  }
}
