import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Vícestránkový build: hlavní web + právní stránky.
export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        akce: resolve(__dirname, 'akce.html'),
        mereni: resolve(__dirname, 'mereni-zraku.html'),
        cocky: resolve(__dirname, 'kontaktni-cocky.html'),
        servis: resolve(__dirname, 'servis.html'),
        onas: resolve(__dirname, 'o-nas.html'),
        privacy: resolve(__dirname, 'ochrana-osobnich-udaju.html'),
        cookies: resolve(__dirname, 'cookies.html'),
      },
    },
  },
});
