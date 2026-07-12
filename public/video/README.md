# Videa (public/video)

## hero.webm — self-hosted cinematické video

`hero.webm` (1280×720, ~16 s smyčka, VP8) běží na pozadí hero sekce. Bylo
**vygenerováno lokálně z fotek prodejny** (glasses-table, hero-portrait,
interiér, glasses-round, glasses-blue) jako cross-dissolve slideshow s Ken
Burns pohybem a jemným barevným gradingem — žádné externí stažení nebylo
potřeba. Přehrává se `muted autoplay loop playsinline`.

Fallback: prohlížeče bez podpory WebM (např. starší Safari) zobrazí poster
`hero-portrait.jpg`. Při `prefers-reduced-motion` se video vypne a zůstane
statická fotka.

## Jak video nahradit vlastním klipem

1. Stáhněte si klip z free/CC0 zdroje (Pexels, Coverr, Mixkit).
2. Zkomprimujte na web (ideálně WebM i MP4):
   ```
   ffmpeg -i vstup.mp4 -vf "scale=1600:-2" -c:v libvpx-vp9 -crf 34 -b:v 0 -an public/video/hero.webm
   ffmpeg -i vstup.mp4 -vf "scale=1600:-2" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart public/video/hero.mp4
   ```
3. Přepište `public/video/hero.webm` (a případně přidejte `<source src="/video/hero.mp4" type="video/mp4" />`
   do `<video>` v `index.html` pro maximální kompatibilitu).
