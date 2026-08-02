# Videa (public/video)

## Aktuální stav: web žádné video nepoužívá

Dřív tu byl `hero.webm` (1280×720, VP9), poskládaný z fotek jako filmová
sekvence. Na velkých displejích byl znatelně rozmazaný a zkomprimovaný,
takže web působil levněji, než jak prodejna vypadá ve skutečnosti.
**Byl odstraněn.**

Všude, kde video běželo (subhero panely, celoplošné bandy a černá
konverzní CTA), se místo něj střídají **fotky v plném rozlišení** přes
komponentu `.stills` (crossfade + Ken Burns, viz `src/style.css` a
`initStills()` v `src/js/motion-core.js`). Vypadá to stejně živě, ale
zůstává to ostré v jakémkoli rozlišení a váží to méně než video.

## Až budete mít vlastní natočený materiál

Nejlepší dojem udělá **skutečný natočený záběr** z prodejny (měření zraku,
zkoušení brýlí, detail výlohy, atmosféra). Až ho budete mít:

1. Zkomprimujte na web, ale **ne pod 1600 px na šířku** — právě nízké
   rozlišení bylo problémem předchozího videa:
   ```
   ffmpeg -i vstup.mp4 -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 32 -b:v 0 -an public/video/hero.webm
   ffmpeg -i vstup.mp4 -vf "scale=1920:-2" -c:v libx264 -crf 24 -preset slow -an -movflags +faststart public/video/hero.mp4
   ```
2. Vložte ho do `.stills` rámu jako další vrstvu (fotky pak slouží jako
   plnohodnotný fallback pro starší Safari), nebo jím rám nahraďte.
   Layout i překryvy na to jsou připravené.

## Fotky prodejny ve vysokém rozlišení

Zdroje pro `public/img/hd/` najdete v `public/img/PHOTO-SOURCES.md`.
Reálné snímky prodejny leží i v `promo-video/public/optika/` (3240×2430).
