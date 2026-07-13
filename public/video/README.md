# Videa (public/video)

## hero.webm — self-hosted cinematické video

`hero.webm` (1280×720, ~15 s bezešvá smyčka, VP9) běží na pozadí hero sekce,
video-masky, konverzních CTA a na podstránkách (subhero panely i celoplošné
video bandy). Bylo **vygenerováno lokálně z fotek prodejny** (interiér,
obruby, portrét, exteriér, sluneční brýle, hero) jako filmová sekvence s Ken
Burns pohybem, cross-dissolve prolínačkami, teplým gradingem, vinětací a
filmovým zrnem — žádné externí stažení nebylo potřeba (prostředí ho blokuje).
Renderováno přes canvas + MediaRecorder v prohlížeči. Přehrává se
`muted autoplay loop playsinline` na všech zařízeních.

Fallback: prohlížeče bez podpory WebM/VP9 (např. starší Safari) zobrazí
statický poster (`hero-portrait.jpg` / `interier.webp`).

## Jak video nahradit vlastním klipem (doporučeno pro ostrý web)

Nejlepší dojem udělá **skutečný natočený materiál** z prodejny (měření zraku,
zkoušení brýlí, detail výlohy, atmosféra). Až ho budete mít:

1. Zkomprimujte na web (ideálně WebM i MP4 pro Safari):
   ```
   ffmpeg -i vstup.mp4 -vf "scale=1600:-2" -c:v libvpx-vp9 -crf 34 -b:v 0 -an public/video/hero.webm
   ffmpeg -i vstup.mp4 -vf "scale=1600:-2" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart public/video/hero.mp4
   ```
2. Přepište `public/video/hero.webm` (a případně přidejte `<source src="/video/hero.mp4" type="video/mp4" />`
   do `<video>` prvků pro maximální kompatibilitu se Safari).
