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

Pět variant, všechny s **fotkou pultu s kasou** (`public/img/interier.webp`,
2048 × 1536, vlastní snímek prodejny). Liší se výřezem a rolí, kterou fotka
v layoutu hraje:

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

Dřívější varianty bez fotky (A „Text", B „Žlutá", G „Značka") byly na přání
klienta vyřazeny — v repu zůstávají v historii gitu, kdyby se hodily.

**Panoramatické snímky (`prohlidka/pano*.jpg` a z nich odvozený
`band/prodejna-vitriny.jpg`) se pro inzerci nepoužívají** — zakřivená
perspektiva v tisku ruší.

### Značka brýlí

Je to **vektorový obrys skutečného loga optiky** — vytrasovaný z
`public/img/logo-optik-dvorak.webp`, tedy z téhož znaku, který má optika na
pultu i na výloze. Ne překreslený od oka: rastr se vykreslil v 6× zvětšení,
prahoval na binární masku a hranice se vysledovaly po hranách pixelů, pak
zjednodušily (RDP, tolerance odpovídá 0,05 mm v tisku). Výsledek je jedna
cesta s `fill-rule="evenodd"` — vnější obrys plus dvě díry po čočkách.

Značka je proto v PDF vektorová a ostrá v jakékoli velikosti. Uložená
samostatně jako `znacka-bryle.svg` (barvu bere z `currentColor`, dá se použít
i jinde — web dnes v sekci s videomaskou používá jinou, kolečkovou značku).

Značka tvoří **lockup s názvem** — sedí těsně nad wordmarkem OPTIK DVOŘÁK.

### Kontakty na inzerátech

Všechny údaje pocházejí z webu optikdvorak.cz a jsou ověřené — žádné
vymyšlené claimy, značky ani čísla.

| Údaj | Hodnota | Zdroj v repu |
| --- | --- | --- |
| Adresa | Americká 325/23, Plzeň | `index.html` |
| Otevírací doba | Po–Čt 8:30–17:00 · Pá 8:30–16:00 | `index.html` |
| Telefon | 702 194 246 · 377 328 367 | `index.html` |
| Web | optikdvorak.cz | — |
| Instagram | `@optik.dvorak` → https://www.instagram.com/optik.dvorak/ | `index.html`, `src/main.js` |
| Facebook | `OptikDvorak` → https://www.facebook.com/OptikDvorak | `index.html` (`sameAs` ve strukturovaných datech) |

Patička čtvrtstranových variant je **mřížka o třech řádcích**, aby levý
a pravý sloupec seděly řádek na řádek:

| levý sloupec | pravý sloupec |
| --- | --- |
| Americká 325/23, Plzeň | černý štítek `optikdvorak.cz` |
| Po–Čt 8:30–17:00 · Pá 8:30–16:00 | Instagram `@optik.dvorak` |
| 702 194 246 · 377 328 367 | Facebook `OptikDvorak` |

Řádky jsou svisle vystředěné (`align-items:center`), takže zarovnání drží bez
ohledu na metriku písma. Štítek i obě ikony sdílejí levou hranu.

V osminovém formátu jsou sítě vedle sebe na jednom řádku pod štítkem — dva
řádky navíc by se tam nevešly.

Služby: měření zraku, dioptrické i sluneční brýle, kontaktní čočky, dětské
brýle, opravy a servis. V užších variantách zkrácené, aby se nelámaly.

---

## 3. Soubory

Pět návrhů × dva formáty, od každého PDF i PNG — v `export/`:

```
C-fotopas-…   D-nafotce-…   E-bryle-…   F-okno-…   H-pulka-…
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

### Kontroly při exportu

`render.mjs` po vykreslení hlídá tři věci a píše `!!` do výstupu:

- **počet inzerátů** — když jich v HTML není 10, nejspíš se rozpadlo párování
  tagů a část dokumentu se vnořila do jiné,
- **skoro prázdný inzerát** (< 120 znaků) — rozbité HTML jinak vyjede jako
  prázdné PDF a na první pohled to nemusí být znát,
- **přetečení** — obsah čouhající mimo plochu inzerátu, a zvlášť obsah, který
  u návrhu D vyleze z krémové karty na fotku. Karta je absolutně pozicovaná,
  takže o jejím přetečení `scrollHeight` rodiče neví; prvky uvnitř
  ořezávajících rodičů (fotky s `overflow:hidden`) se do kontroly nepočítají,
  ty přetékají schválně.

