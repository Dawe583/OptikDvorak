# Hotové Reels k nahrání na Instagram

Tady leží videa připravená k publikování. Stačí je stáhnout a nahrát —
nic se s nimi nemusí dělat.

| Soubor | Délka | Co v něm je |
| --- | --- | --- |
| `reel-mereni-4k-9x16.mp4` | 23 s | Nalákání na měření zraku — „Kdy jste si naposledy nechali změřit zrak?" |
| `reel-nakup-4k-9x16.mp4` | 24,7 s | Celá cesta k novým brýlím ve čtyřech krocích |
| `reel-servis-4k-9x16.mp4` | 20 s | Servis a opravy — „Ohnuté brýle? Nevyhazujte je." Čtyři závady, které zvládneme obvykle na počkání, a že se nemusíte objednávat |
| `reel-deti-4k-9x16.mp4` | 18,75 s | Děti před začátkem školního roku — měření zraku, dětské obruby, bezplatné posouzení skel MiYOSMART. **Sezónní: pouštět od poloviny srpna do poloviny září.** |
| `reel-cocky-4k-9x16.mp4` | 18,75 s | Kontaktní čočky — aplikace krok za krokem, zkušební pár zdarma |
| `reel-multifokaly-4k-9x16.mp4` | 18,75 s | Multifokální skla pro ty, kdo střídají dvoje brýle. Na Facebooku pojede líp než na Instagramu. |
| `reel-benefity-4k-9x16.mp4` | 18,75 s | Benefitní poukázky Edenred, Pluxee, Up a Benefit Plus. Nejlepší období: říjen až prosinec. |

Všechna: **2160 × 3840 px (4K, poměr 9:16), 60 snímků za sekundu, se zvukem.**
To je přesně formát pro Instagram Reels, Stories i TikTok.

**Popisky** (text příspěvku, hashtagy, první komentář, kdy publikovat) najdete
v `docs/POPISKY-REELS-MERENI-NAKUP.md`, `docs/POPISKY-REEL-SERVIS.md`
a `docs/POPISKY-4-NOVE-REELS.md` — v posledním je i **plán, v jakém pořadí
a s jakými odstupy je zveřejňovat**, ať nevyjdou všechny naráz.

## Proč jsou tady a ne ve složce `out/`

Do `out/` se ukládají pracovní rendery a ta složka se do gitu záměrně neukládá
(soubory by repozitář nafoukly). Tyhle soubory jsou hotové výstupy, takže
mají vlastní místo, aby se neztratily.

## Jak si je vyrobit znovu (nebo v ještě vyšším datovém toku)

```
cd promo-video
npm install
npx remotion render reel-mereni      out/reel-mereni-4k-9x16.mp4
npx remotion render reel-nakup       out/reel-nakup-4k-9x16.mp4
npx remotion render reel-servis      out/reel-servis-4k-9x16.mp4
npx remotion render reel-deti        out/reel-deti-4k-9x16.mp4
npx remotion render reel-cocky       out/reel-cocky-4k-9x16.mp4
npx remotion render reel-multifokaly out/reel-multifokaly-4k-9x16.mp4
npx remotion render reel-benefity    out/reel-benefity-4k-9x16.mp4
```

Rozlišení je u všech stejné (2160 × 3840). Soubory tady mají nižší datový tok,
aby se daly pohodlně poslat — Instagram si video stejně vždycky překóduje na
svůj vlastní, výrazně nižší, takže na výsledku v aplikaci to nepoznáte.
Když byste přesto chtěli originál v maximální kvalitě, vyrobí ho příkaz výše.

Zdrojové soubory: `src/ReelMereni.tsx`, `src/ReelNakup.tsx`, `src/ReelServis.tsx`,
`src/ReelDeti.tsx`, `src/ReelCocky.tsx`, `src/ReelMultifokaly.tsx`,
`src/ReelBenefity.tsx`. Společné díly čtyř nejnovějších jsou v `src/kit.tsx`.

Hudba se generuje skripty `scripts/make-audio-mereni.mjs`, `make-audio-nakup.mjs`,
`make-audio-servis.mjs` a `make-audio-nove-reels.mjs` (ten vyrobí zvuk ke všem
čtyřem najednou) — není v nich nic licencovaného.
