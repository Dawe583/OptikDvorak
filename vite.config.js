import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Vícestránkový build: hlavní web + právní stránky.
export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'ochrana-osobnich-udaju.html'),
        cookies: resolve(__dirname, 'cookies.html'),
      },
    },
  },
});
