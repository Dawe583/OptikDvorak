/* Soundtrack k 12s teaseru „Ostření" (kompozice optika-teaser).
   Přenastaví parametry a pustí sdílený generátor make-audio.mjs:
   impakt LOCK=2,6 s sedí na zaklapnutí čočky (T_SNAP v src/Ostreni.tsx),
   akcent CTA=10 s na nástup tlačítka (T_CTA).
   Výstup: public/music-ostreni.wav — spuštění: npm run audio:optika */
process.env.DUR = '12';
process.env.CTA = '10';
process.env.OUT = 'music-ostreni.wav';
await import('./make-audio.mjs');
