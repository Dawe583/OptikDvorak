# Videa (public/video)

Web je připravený na skutečné video v hero sekci i v ambientních blocích, ale
v tomto prostředí nebylo možné žádné video stáhnout (egress policy pouští jen
balíčkové registry). Dokud sem nevložíte reálné soubory, hero běží v
cinematickém režimu (Ken Burns zoom/pan + cross-dissolve + grain nad fotkami),
který zároveň slouží jako fallback pro `prefers-reduced-motion`.

## Jak přidat reálné video

1. Stáhněte si krátkou smyčku (5–12 s) z free/CC0 zdroje, např.:
   - https://www.pexels.com/videos/ (licence Pexels, zdarma)
   - https://coverr.co/ (zdarma pro komerční užití)
   - https://mixkit.co/free-stock-video/ (Mixkit License)
   Vhodná témata: detail brýlí, oko/duhovka, výběr obrub, světlo a odlesky skel.

2. Zkomprimujte na web (cílově ~2–5 MB, 1280–1920 px šířka, ~24–30 fps),
   ideálně dodejte i WebM:
   ```
   ffmpeg -i vstup.mp4 -vf "scale=1600:-2" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart hero.mp4
   ffmpeg -i vstup.mp4 -vf "scale=1600:-2" -c:v libvpx-vp9 -crf 34 -b:v 0 -an hero.webm
   ```

3. Uložte jako `public/video/hero.mp4` (a volitelně `public/video/hero.webm`).
   Hero je nasnímá automaticky — stačí přidat `data-has-video` na element
   `.hero` v `index.html` (viz komentář v souboru).
