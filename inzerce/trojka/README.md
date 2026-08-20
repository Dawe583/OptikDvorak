# Inzerát pro zpravodaj TROJKA (MO Plzeň 3)

Obecná imageová inzerce Optiky Dvořák — dva návrhy, každý ve dvou formátech.
Zdroj: `inzeraty.html`, export: `export.sh` → `export/`.

---

## 1. Zjištěné technické zadání

Ceník ani technické podmínky TROJKY nejsou zveřejněné — na
[umo3.plzen.eu](https://umo3.plzen.eu/zivot-v-obvodu/multimedia/zpravodaj-trojka/)
stojí jen věta, že inzerce „je možná formou grafického prvku i formou
informativního textu". **Rozměry níže jsou proto odměřené přímo z tiskového PDF
vydání červenec 2026** (`trojka_cervenec_2026_a4_tisk.pdf`), ne odhadnuté.

| Parametr | Hodnota | Zdroj |
|---|---|---|
| Čistý formát (TrimBox) | **210 × 297 mm (A4)** | PDF vydání 7/2026 |
| Spadávka (BleedBox) | 3 mm ze všech stran | PDF vydání 7/2026 |
| Sazební obrazec | **190 × 280 mm** (okraje 10 mm) | měření textových bloků |
| Sloupcová mřížka | 2 sloupce po 93 mm, mezera 4 mm | měření |
| Rozsah / náklad | 12 stran A4, plná barevnost 4/4, 6× ročně | umo3.plzen.eu |
| Tiskne | NAVA TISK s.r.o., grafika EURONOVA GROUP s.r.o. | tiráž |

### Skutečně použité inzertní formáty ve vydání 7/2026

| Formát | Odměřeno | Příklad ve vydání |
|---|---|---|
| 1/1 strany | 190 × 280 mm | (sazební obrazec) |
| 1/2 strany na šířku | 190 × 130 mm | DJKT, str. 10 · MO Plzeň 3, str. 12 |
| 1/4 strany na výšku | 93 × 131 mm | „První zvonění", str. 12 |
| 1/8 strany na šířku | 93 × 60 mm | opravy žaluzií, str. 9 |

### Doporučené parametry dat

- **Rozlišení: 300 DPI** při 100 % velikosti (standard pro ofsetový tisk).
  Pro formát 93 × 131 mm to je **1099 × 1548 px**, pro 93 × 60 mm **1099 × 709 px**.
- **Spadávka není potřeba** — inzerát nesahá na ořez stránky, sází se dovnitř
  sazebního obrazce.
- Odevzdat lze PDF (vektor, písmo v křivkách) i PNG/TIFF 300 DPI.
- Barevnost: dodáváme v RGB. Převod do CMYK ať provede tiskárna vlastním
  profilem — orientačně žlutá ≈ C0 M10 Y70 K0, černá jako **100 % K**
  (na novinovém papíru nepoužívat sytou černou kvůli soutisku).

### Kam inzerát poslat

Michaela Adámková, tisková mluvčí MO Plzeň 3 — adamkovam@plzen.eu,
tel. 378 036 496 / 607 046 985.
Ceník je nutné si vyžádat, veřejně publikovaný není.

---

## 2. Návrhy

Všechny vycházejí z vizuálního stylu webu optikdvorak.cz (Bricolage Grotesque +
Inter, krémová / žlutá / černá, ostré hrany, nula dekorací). Na všech je
**logo brýlí** i odkaz `optikdvorak.cz`.

| | Návrh | Layout | Fotka |
|---|---|---|---|
| **A** | „Text" | logo, wordmark, kontakty pod sebou | — |
| **B** | „Žlutá" | celoplošná žlutá, černý kontaktní pruh | — |
| **C** | „Fotopás" | fotka nahoře přes celou šířku, pod ní text | interiér prodejny |
| **D** | „Na fotce" | fotka jako pozadí, krémová karta do ní zajíždí | stůl pro výběr brýlí |
| **E** | „Brýle dole" | text nahoře, fotopás dole | brýle na bílém |
| **F** | „Okno" | fotka jako okno mezi wordmarkem a kontakty | detail obruby |
| **G** | „Značka" | velké logo brýlí, vše centrované | — |
| **H** | „Půlka" | fotka na celou výšku vlevo, text vpravo | portrét v brýlích |

Logo brýlí je na fotoverzích (C–F, H) umístěné jako **razítko v rohu textové
plochy** — nezabírá výšku layoutu a nekoliduje s wordmarkem. V návrzích A, B a G
je logo hlavním prvkem.

### Fotky

| Návrh | Soubor | Původ |
|---|---|---|
| C | `public/img/interier.webp` (2048 × 1536) | vlastní fotka prodejny |
| D | `public/img/band/prodejna-stul.jpg` (2400 × 1100) | vlastní fotka prodejny |
| E | `public/img/ai/kolaz-stack.jpg` (1200 × 800) | licencovaná fotka z Pexels |
| F | `public/img/ai/look-cateye.jpg` (1400 × 1400) | licencovaná fotka z Pexels |
| H | `public/img/hero/od-redhead.webp` (3000 × 2000) | úvodní fotka z optikdvorak.cz |

**Panoramatické snímky (`prohlidka/pano*.jpg` a z nich odvozený
`band/prodejna-vitriny.jpg`) se pro inzerci nepoužívají** — mají zakřivenou
perspektivu, která v tisku působí rušivě.

V PDF jsou fotky vloženy v 300–660 DPI, tedy nad tiskovým minimem. Výměna
fotky = přepsat `src` v `inzeraty.html` a znovu spustit export; vlastní fotky
lze nakopírovat do `foto/` (viz `foto/README.md`).

### Co je na inzerátech napsáno

Všechny údaje pocházejí z webu a jsou ověřené — žádné vymyšlené claimy,
značky ani čísla: adresa Americká 325/23, Plzeň · otevřeno Po–Čt 8:30–17:00,
Pá 8:30–16:00 · 702 194 246, 377 328 367 · optikdvorak.cz · rodinná oční
optika od roku 1991 · měření zraku, dioptrické i sluneční brýle, kontaktní
čočky, dětské brýle, opravy a servis.

---

## 3. Soubory

Osm návrhů × dva formáty, od každého PDF i PNG — v `export/`:

```
A-text-…   B-zluta-…   C-fotopas-…   D-nafotce-…
E-bryle-…  F-okno-…    G-znacka-…    H-pulka-…
   × -ctvrtstrany-93x131   (1/4 strany na výšku)
   × -osminastrany-93x60   (1/8 strany na šířku)
```

PDF mají přesnou velikost stránky (93 × 131 mm / 93 × 60 mm) a text je
v křivkách. PNG jsou z těchto PDF rastrované na 300 DPI.

## 4. Znovuvygenerování

```sh
npm install          # kvůli fontům (@fontsource-variable)
pip install pymupdf
sh inzerce/trojka/export.sh
```

`render.mjs` vysází HTML v Chromiu do PDF o přesném čistém formátu a hlídá
přetečení obsahu, `raster.py` ořízne stránku na milimetr přesně a vyrenderuje
PNG na 300 DPI.

Jiný rozměr (např. 1/2 strany 190 × 130 mm) = přidat blok do `inzeraty.html`
a znovu spustit export.
