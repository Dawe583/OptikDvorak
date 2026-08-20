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
značka brýlí i odkaz `optikdvorak.cz`.

### Značka brýlí

Kreslená podle **skutečného loga optiky** (`public/img/logo-optik-dvorak.webp`) —
wayfarer s měkce zaoblenými rohy, ne kolečka. Je to inline SVG, takže je
v PDF vektorová a ostrá v jakékoli velikosti. Tloušťka obrysu vychází na
0,44–0,64 mm podle velikosti, tedy nad hranicí, kterou novinový rotační tisk
ještě udrží. Můstek je ve žluté akcentové barvě webu, zbytek černý.

Značka tvoří **lockup s názvem** — sedí těsně nad wordmarkem OPTIK DVOŘÁK.

### Fotoverze — všechny s fotkou pultu s kasou

Fotka `public/img/interier.webp` (2048 × 1536, vlastní snímek prodejny).
Verze se liší výřezem a rolí, kterou fotka v layoutu hraje:

| | Návrh | Layout | Výřez |
|---|---|---|---|
| **C** | „Fotopás" | fotka nahoře přes celou šířku | široký záběr i s nápisem OPTIK DVOŘÁK na stěně |
| **D** | „Na fotce" | fotka jako pozadí, krémová karta do ní zajíždí | široký záběr, karta překrývá spodek |
| **E** | „Brýle dole" | text nahoře, fotopás dole | přiblížený pult, zvětšení 1,32× |
| **F** | „Okno" | fotka jako okno mezi wordmarkem a kontakty | nejtěsnější na pult s kasou, zvětšení 1,5× |
| **H** | „Půlka" | fotka na celou výšku vlevo | svislý výřez pultu s brýlemi na čele |

Fotky mají v CSS mírnou předkompenzaci kontrastu (`contrast(1.09)
saturate(1.06)`) — novinový papír kontrast srazí a bez toho fotka vyjde
vybledlá. Ani při největším zvětšení (F, 1,5×) neklesne rozlišení pod 300 DPI.

**Panoramatické snímky (`prohlidka/pano*.jpg` a z nich odvozený
`band/prodejna-vitriny.jpg`) se pro inzerci nepoužívají** — zakřivená
perspektiva v tisku ruší.

### Verze bez fotky

| | Návrh | Layout |
|---|---|---|
| **A** | „Text" | značka, wordmark, kontakty pod sebou |
| **B** | „Žlutá" | celoplošná žlutá, černý kontaktní pruh |
| **G** | „Značka" | velká značka brýlí, vše centrované |

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
