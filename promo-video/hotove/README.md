# Hotové Reels k nahrání na Instagram

Tady leží videa připravená k publikování. Stačí je stáhnout a nahrát —
nic se s nimi nemusí dělat.

| Soubor | Délka | Co v něm je |
| --- | --- | --- |
| `reel-mereni-4k-9x16.mp4` | 23 s | Nalákání na měření zraku — „Kdy jste si naposledy nechali změřit zrak?" |
| `reel-nakup-4k-9x16.mp4` | 24,7 s | Celá cesta k novým brýlím ve čtyřech krocích |
| `reel-servis-4k-9x16.mp4` | 22,6 s | Servis a opravy — „Nekupujte nové brýle." Běžné věci obvykle na počkání. |
| `cover-servis.png` | — | Náhledovka k Reelu o servisu (1080 × 1920, nahrává se v IG zvlášť) |

**Kampaň pěti Reelů — pět různých důvodů přijít na prodejnu.** Popisky, pořadí
publikování a co je potřeba ověřit najdete v `docs/KAMPAN-5-REELS.md`.

| Soubor | Délka | Co v něm je |
| --- | --- | --- |
| `reel-cocky-4k-9x16.mp4` | 22,6 s | Kontaktní čočky — „Do oka? To si nesáhnu." Zkušební pár zdarma. |
| `reel-skola-4k-9x16.mp4` | 22,6 s | Děti před školou — měření zdarma ke kompletním brýlím **(sezónní: srpen a začátek září)** |
| `reel-multifokal-4k-9x16.mp4` | 21,8 s | Multifokály 1 + 1 — druhá skla zdarma **(nejdřív ověřit platnost akce)** |
| `reel-ridic-4k-9x16.mp4` | 21,6 s | Řidičská skla −30 % **(nejdřív ověřit platnost akce)** |
| `reel-benefity-4k-9x16.mp4` | 21,8 s | Benefitní poukázky — Edenred, Pluxee, Up, Benefit Plus |


**Druhá řada — stejná témata z jiného úhlu.** Vznikla souběžně s kampaní výš.
Kampaň vede konkrétní nabídkou („zdarma", „1 + 1", „−30 %"), tahle řada
procesem a vysvětlením, a každý díl má vlastní vizuální podpis. **Nepouštějte
dvojici na stejné téma ve stejném týdnu.** Popisky jsou v
`docs/POPISKY-4-NOVE-REELS.md` a `docs/POPISKY-REEL-SERVIS-LISTEK.md`,
přehled celé zásoby v `docs/PREHLED-VSECH-REELS.md`.

| Soubor | Délka | Co v něm je | Vizuál |
| --- | --- | --- | --- |
| `reel-servis-listek-4k-9x16.mp4` | 20,0 s | Servis — „Ohnuté brýle? Nevyhazujte je." Čtyři závady, které se odškrtávají | servisní lístek |
| `reel-deti-4k-9x16.mp4` | 18,8 s | Děti — „Vidí vaše dítě na tabuli?" **(sezónní: srpen a začátek září)** | linkovaný sešit |
| `reel-cocky-kruh-4k-9x16.mp4` | 18,8 s | Kontaktní čočky — „Překážejí vám brýle při sportu?" | kruhové okno jako čočka |
| `reel-multifokaly-delic-4k-9x16.mp4` | 18,8 s | Multifokály — „Střídáte dvoje brýle?" (bez akce, evergreen) | dělicí čára na dálku / na čtení |
| `reel-benefity-karty-4k-9x16.mp4` | 18,8 s | Benefity — „Máte body od zaměstnavatele?" | karty programů |

Videa: **2160 × 3840 px (4K, poměr 9:16), 60 snímků za sekundu, se zvukem.**
To je přesně formát pro Instagram Reels, Stories i TikTok.

**Popisky** (text příspěvku, první komentář, kdy publikovat):

- měření zraku + cesta k novým brýlím → `docs/POPISKY-REELS-MERENI-NAKUP.md`
- servis a opravy (kampaň) → `docs/POPISKY-REEL-SERVIS.md`
- kampaň pěti Reelů → `docs/KAMPAN-5-REELS.md`
- servis (druhá řada) → `docs/POPISKY-REEL-SERVIS-LISTEK.md`
- druhá řada (děti, čočky, multifokály, benefity) → `docs/POPISKY-4-NOVE-REELS.md`
- **přehled celé zásoby a v jakém pořadí postovat** → `docs/PREHLED-VSECH-REELS.md`

## K čemu je `cover-servis.png`

Náhledovka je obrázek, který se ukáže v mřížce profilu a v přehledu Reels,
než si video někdo pustí. Instagram nabídne buď snímek z videa, nebo
**vlastní obrázek z galerie** — a tam se nahraje tenhle soubor. Hlavní text
i brýle jsou v něm posazené tak, aby zůstaly čitelné i po ořezu na čtverec.

## Proč jsou tady a ne ve složce `out/`

Do `out/` se ukládají pracovní rendery a ta složka se do gitu záměrně neukládá
(soubory by repozitář nafoukly). Tyhle soubory jsou hotové výstupy, takže mají
vlastní místo, aby se neztratily.

## Jak si je vyrobit znovu (nebo v ještě vyšším datovém toku)

```
cd promo-video
npm install
npx remotion render reel-mereni out/reel-mereni-4k-9x16.mp4
npx remotion render reel-nakup  out/reel-nakup-4k-9x16.mp4
npx remotion render reel-servis out/reel-servis-4k-9x16.mp4
npx remotion still  cover-servis out/cover-servis.png --scale=0.5
```

Rozlišení je u všech stejné (2160 × 3840). Soubory tady mají nižší datový tok,
aby se daly pohodlně poslat — Instagram si video stejně vždycky překóduje na
svůj vlastní, výrazně nižší, takže na výsledku v aplikaci to nepoznáte.
Když byste přesto chtěli originál v maximální kvalitě, vyrobí ho příkaz výše
(bez `--crf`).

Zdrojové soubory kampaně: `src/ReelMereni.tsx`, `src/ReelNakup.tsx`,
`src/ReelServis.tsx`, `src/ReelCocky.tsx`, `src/ReelSkola.tsx`,
`src/ReelMultifokal.tsx`, `src/ReelRidic.tsx`, `src/ReelBenefity.tsx`,
`src/CoverServis.tsx`, společné díly v `src/reel-kit.tsx`.

Zdrojové soubory druhé řady: `src/ReelServisListek.tsx`, `src/ReelDeti.tsx`,
`src/ReelCockyKruh.tsx`, `src/ReelMultifokalyDelic.tsx`,
`src/ReelBenefityKarty.tsx`, společné díly v `src/kit.tsx`.

Hudba se generuje skripty `scripts/make-audio-*.mjs`; `make-audio-nove-reels.mjs`
vyrobí zvuk ke čtyřem dílům druhé řady najednou. Nic licencovaného v nich není.
