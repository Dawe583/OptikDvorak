# Hotové Reels k nahrání na Instagram

Tady leží videa připravená k publikování. Stačí je stáhnout a nahrát —
nic se s nimi nemusí dělat.

| Soubor | Délka | Co v něm je |
| --- | --- | --- |
| `reel-mereni-4k-9x16.mp4` | 23 s | Nalákání na měření zraku — „Kdy jste si naposledy nechali změřit zrak?" |
| `reel-nakup-4k-9x16.mp4` | 24,7 s | Celá cesta k novým brýlím ve čtyřech krocích |
| `reel-servis-4k-9x16.mp4` | 20 s | Servis a opravy — „Ohnuté brýle? Nevyhazujte je." Čtyři závady, které zvládneme obvykle na počkání, a že se nemusíte objednávat |

Všechna: **2160 × 3840 px (4K, poměr 9:16), 60 snímků za sekundu, se zvukem.**
To je přesně formát pro Instagram Reels, Stories i TikTok.

**Popisky** (text příspěvku, první komentář, kdy publikovat) najdete
v `docs/POPISKY-REELS-MERENI-NAKUP.md` a `docs/POPISKY-REEL-SERVIS.md`.

## Proč jsou tady a ne ve složce `out/`

Do `out/` se ukládají pracovní rendery a ta složka se do gitu záměrně neukládá
(soubory by repozitář nafoukly). Tyhle soubory jsou hotové výstupy, takže
mají vlastní místo, aby se neztratily.

## Jak si je vyrobit znovu (nebo v ještě vyšším datovém toku)

```
cd promo-video
npm install
npx remotion render reel-mereni out/reel-mereni-4k-9x16.mp4
npx remotion render reel-nakup  out/reel-nakup-4k-9x16.mp4
npx remotion render reel-servis out/reel-servis-4k-9x16.mp4
```

Rozlišení je u všech stejné (2160 × 3840). Soubory tady mají nižší datový tok,
aby se daly pohodlně poslat — Instagram si video stejně vždycky překóduje na
svůj vlastní, výrazně nižší, takže na výsledku v aplikaci to nepoznáte.
Když byste přesto chtěli originál v maximální kvalitě, vyrobí ho příkaz výše.

Zdrojové soubory: `src/ReelMereni.tsx`, `src/ReelNakup.tsx`, `src/ReelServis.tsx`.
Hudba se generuje skripty `scripts/make-audio-mereni.mjs`, `make-audio-nakup.mjs`
a `make-audio-servis.mjs` — není v nich nic licencovaného.
