# Videa na webu (složka `public/video`)

## Stručně: video je z webu pryč, teď jsou tam fotky

Na webu dřív běželo video `hero.webm`. **Odstranili jsme ho.** Nebyl to skutečně
natočený materiál — byla to slideshow poskládaná z fotek přímo v prohlížeči
(fotka se pomalu přiblížila, přehodila na další a tak pořád dokola). Výsledek měl
malé rozlišení (1280×720), rozmazané hrany a působil lacině. Na podstránkách
navíc ležel přes reálné fotky a úplně je zakrýval.

**Co je tam místo toho:** celoplošné tmavé pásy uprostřed podstránek
(O nás, Měření zraku, Akce, Reklama) teď ukazují **reálné fotky vaší prodejny**.
Leží ve složce `public/img/band/`:

| Soubor | Co je na fotce | Kde se používá |
| --- | --- | --- |
| `prodejna-cela.jpg` | Celý interiér prodejny s nápisem OPTIK DVOŘÁK | O nás |
| `prodejna-stul.jpg` | Pult / stůl s obrubami | Měření zraku |
| `prodejna-vitriny.jpg` | Prosklené vitríny plné obrub | Akce |
| `vyloha.jpg` | Výloha z ulice | Reklama |

Přes fotku se pořád kreslí tmavý přechod (scrim), filmové zrno, štítek s adresou
a nadpis — tzn. pás vypadá stejně filmově jako předtím, jen v poctivé kvalitě.

Titulní strana (`index.html`) video nikdy nepoužívala a nic se na ní neměnilo —
běží tam prolínačka čtyř velkých fotek.

**Tato složka je teď prázdná (kromě tohoto návodu). To je v pořádku.**

---

## Až budete mít vlastní natočené video

Skutečný záběr z prodejny udělá největší dojem — měření zraku, zkoušení brýlí,
detail výlohy, ruce leštící sklo. Ideálně:

- **na šířku** (ne na výšku), stabilně, ze stativu nebo opřenou rukou,
- **10–20 sekund**, klidný pomalý pohyb, ať jde záběr dokola bez rušivého střihu,
- **bez zvuku** (na webu stejně hraje potichu) a bez titulků v obraze,
- natočené alespoň ve **Full HD (1920×1080)**, klidně 4K.

### Krok 1 — zmenšit soubor pro web

Syrové video z telefonu má klidně 200 MB, to by web brzdilo. Zmenší se programem
[ffmpeg](https://ffmpeg.org) — stačí zkopírovat příkazy do příkazové řádky ve
složce projektu. Vytvoří se dvě verze (WebM je menší, MP4 potřebuje Safari
na iPhonu a Macu):

```bash
# WebM (hlavní, menší soubor)
ffmpeg -i vstup.mp4 -vf "scale=1600:-2" -an -c:v libvpx-vp9 -crf 34 -b:v 0 public/video/prodejna.webm

# MP4 (záloha pro Safari)
ffmpeg -i vstup.mp4 -vf "scale=1600:-2" -an -c:v libx264 -crf 26 -preset slow -movflags +faststart public/video/prodejna.mp4

# Náhledový obrázek (poster) — první snímek videa, ukáže se, než se video načte
ffmpeg -i vstup.mp4 -vframes 1 -q:v 3 public/img/band/prodejna-poster.jpg
```

`vstup.mp4` nahraďte názvem svého souboru. Cílem je dostat WebM **pod 3 MB**;
když bude větší, zvyšte číslo u `-crf` (např. `-crf 38` = menší soubor, o něco
horší kvalita).

### Krok 2 — vyměnit fotku za video v HTML

Video se dá pustit v celoplošném pásu na podstránkách. Týká se to čtyř souborů
v hlavní složce projektu:

- `o-nas.html`
- `mereni-zraku.html`
- `akce.html`
- `reklama.html`

V každém z nich najděte sekci `<section class="sub-videoband" ...>` a **řádek
s `<img ...>` hned pod ní** nahraďte tímto blokem:

```html
<video
  class="sub-videoband__video"
  autoplay muted loop playsinline
  preload="metadata"
  poster="/img/band/prodejna-poster.jpg"
  aria-hidden="true"
>
  <source src="/video/prodejna.webm" type="video/webm" />
  <source src="/video/prodejna.mp4" type="video/mp4" />
</video>
```

Konkrétně: v `o-nas.html` se nahrazuje řádek
`<img src="/img/band/prodejna-cela.jpg" alt="…" loading="lazy" />`,
v ostatních souborech obdobný řádek s jinou fotkou. **Zbytek sekce
(`sub-videoband__scrim`, `sub-videoband__grain`, štítek i nadpis) nechte být** —
kreslí se přes video úplně stejně jako přes fotku.

### Krok 3 — jeden řádek v CSS

Aby video vyplnilo pás na celou plochu stejně jako fotka, je potřeba doplnit ho
do stylů. V souboru `src/css/subpage.css` najděte řádek:

```css
.sub-videoband img {
```

a přepište ho na:

```css
.sub-videoband img,
.sub-videoband video {
```

Nic dalšího v CSS měnit netřeba.

### Krok 4 — zkontrolovat

V příkazové řádce ve složce projektu:

```bash
npm run dev
```

a v prohlížeči otevřít `http://localhost:5173/o-nas.html`. Když video běží,
pusťte ještě `npx vite build` a web nasaďte.

> **Tip:** fotky v `public/img/band/` nemažte, i kdybyste video nasadili.
> Slouží jako poster a hodí se, kdyby se video někdy vracelo zpátky na fotku.
