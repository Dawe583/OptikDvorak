# Je web připravený na ostrý provoz?

**Audit ke dni 4. 8. 2026.** Prošel jsem web tak, jako by se měl za hodinu pustit
do světa: produkční build, všechny stránky v prohlížeči, každý odkaz, formulář,
strukturovaná data, velikosti fotek a chyby v konzoli.

**Krátká odpověď: skoro. Web je řemeslně v dobrém stavu — ale jsou tři věci,
které se musí opravit, než půjde ven.** Nejvážnější je formulář: dnes
neodesílá poptávky nikam.

Co jsem ověřoval: produkční build (`npx vite build`), 11 stránek v prohlížeči
(Chromium, desktop i mobil 390 px), 401 odkazů, JSON-LD, skutečné odeslání
formuláře, přenesené datové objemy a konzole prohlížeče.

---

## Blokery

Tohle se musí vyřešit **před spuštěním**.

### 1. Formulář neodesílá poptávky — nikam

**Kde:** `src/main.js`, řádek 813 — `const WEB3FORMS_KEY = '';`

Vyzkoušel jsem to naostro: vyplnil jsem formulář „Objednání měření zraku"
(jméno, telefon, e-mail) a odeslal. **Ven neodešel žádný požadavek.** Poptávka
se neuložila a nikomu nepřišla.

Zákazník místo potvrzení uvidí červenou hlášku:

> „Objednávky přes formulář zatím nepřijímáme. Zavolejte nám prosím na
> +420 702 194 246 nebo napište na optika.americka@seznam.cz."

**Dobrá zpráva:** kód je napsaný poctivě — zákazníkovi nelže. Nezobrazí mu
„Vaše poptávka je na cestě" a hned ho nasměruje na telefon. Nikdo tedy
nečeká na zavolání, které by nepřišlo.

**Špatná zpráva:** na webu je **pětkrát** velké tlačítko „Objednat měření
zraku" (`index.html` řádky 111, 141, 175, 772, 791), které vede přesně na
tenhle formulář. Návštěvník projde celou cestu — klikne, vyplní tři pole,
odešle — a na konci se dozví, že to nefunguje. To je nejhorší možný okamžik,
kdy mu to říct. Podle `CLAUDE.md` mají poptávky chodit na
`optika.americka@seznam.cz`; dnes tam nechodí nic.

**Jak to spravit (cca 20 minut):**
1. Na [web3forms.com](https://web3forms.com) si nechte vygenerovat *access key*
   na e-mail `optika.americka@seznam.cz` (zdarma).
2. Klíč vložte v `src/main.js` na řádek 813 mezi apostrofy.
3. V nástěnce Web3Forms zapněte **Allowed Domains** jen na `optikdvorak.cz`
   (klíč je v kódu veřejný záměrně, tohle je ta skutečná ochrana proti zneužití).

Zbytek už je hotový — odesílání, ochrana proti robotům (skryté políčko),
timeout i chybová hláška při výpadku sítě. Chybí opravdu jen ten klíč.

*(Tenhle bod je jako blokera veden i v `docs/NAVRH-ROZVOJE.md`, řádek 20.)*

---

### 2. Na titulce svítí zákazníkům interní poznámka

**Kde:** `index.html`, řádek 569

V sekci „Náš příběh v čase", hned pod časovou osou, je zákazníkům plně
viditelná věta:

> „// Orientační milníky. Přesná data a události s radostí doladíme."

Ověřil jsem, že se skutečně zobrazí (po odscrollování má plnou viditelnost).
Tohle je poznámka pro majitelku, ne pro návštěvníka. Zákazník z ní čte
„tenhle web ještě není hotový a data si tu vymýšlíme" — přesně naopak, než
má sekce o čtyřicetileté tradici působit.

**Jak to spravit:** buď řádek 569 smazat, nebo (lepší) potvrdit roky
**2005** a **2022** v časové ose (`index.html` řádky 548 a 555) a poznámku
odstranit. Viz také sekci „Čeká na majitelku".

---

### 3. Interní poznámky jsou veřejně čitelné na webu

**Kde:** `public/img/PHOTO-SOURCES.md`, `public/img/brands/README.md`,
`public/video/README.md`

Všechno ze složky `public/` se kopíruje na web tak, jak je. Tyhle tři
soubory tedy po spuštění půjde otevřít v prohlížeči — ověřeno, všechny
vracejí HTTP 200 (např. `optikdvorak.cz/img/PHOTO-SOURCES.md`). A protože
`robots.txt` povoluje všechno, může si je zaindexovat i Google.

Co se v nich píše:
- **PHOTO-SOURCES.md** — seznam, které fotky jsou stock z Pexels, plus věta
  „Dřívější AI-generované obrázky byly nahrazeny".
- **brands/README.md** — která loga dodavatelů chybí a proč (u Optiky Čivice
  „na jejich webu je jen malé logo 48 × 32 px, na dlaždici by bylo rozmazané").
- **video/README.md** — popis smazané Ken Burns slideshow.

Pro interní práci jsou to užitečné soubory a mají v repozitáři zůstat.
Jen nemají být na veřejném webu.

**Jak to spravit:** přesunout je z `public/` do `docs/` (a v kódu nikde
nejsou odkazované, takže se nic nerozbije), nebo do buildu přidat krok,
který `.md` soubory z `dist/` maže.

---

## Doporučeno před spuštěním

Nezabije to spuštění, ale škoda to neudělat.

### 4. Analytika je vypnutá — a chystá se kampaň

**Kde:** `src/js/analytics.js`, řádek 12 — `const GA_ID = '';`

Měření návštěvnosti je připravené a správně podmíněné souhlasem s cookies,
ale bez měřicího ID neodesílá nic. Samo o sobě to není problém — web funguje.

Podstatné je, že v repozitáři je `reklama.html`, tedy **kampaňová stránka pro
placenou reklamu** (správně nastavená na `noindex`, aby nekonkurovala hlavním
stránkám). Pokud se na ni pustí placená reklama, poteče do ní rozpočet
a nikdo se nedozví, kolik lidí přišlo ani kolik jich zavolalo. Kód už umí
měřit i kliknutí na telefon a odeslání poptávky — stačí doplnit ID z Google
Analytics na řádek 12.

### 5. Web je na mobilu těžký — 2,6 MB, než člověk vůbec začne scrollovat

Změřeno na mobilu (390 px, tak jak ho uvidí většina návštěvníků z Googlu):

| | Přenesená data |
| --- | --- |
| Titulka, **první obrazovka** | **2,63 MB** (22 požadavků) |
| Titulka, celá po doscrollování | 6,33 MB |
| O nás, celá | 1,71 MB |

Na pomalejším mobilním připojení je 2,6 MB znatelné čekání a člověk, který
hledá optiku v Plzni, mezitím klidně odejde ke konkurenci.

**Dvě konkrétní příčiny:**

**(a) Úvodní slideshow stáhne všechny čtyři fotky naráz.**
`index.html` řádky 159–162: čtyři fotky jsou v CSS jako pozadí, takže se
načtou hned všechny, i když jsou vidět postupně.

| Soubor | Velikost | Rozměr |
| --- | --- | --- |
| `hero/slide-1.jpg` | 336 kB | 1920 × 2560 |
| `hero/od-redhead.webp` | 317 kB | 3000 × 2000 |
| `hero/od-blonde.webp` | 256 kB | 3000 × 2000 |
| `hero/od-child.webp` | 138 kB | 3000 × 2000 |

Dohromady **1,05 MB** hned na začátku. Stačilo by načítat první fotku
a zbylé tři až chvíli po načtení stránky.

**(b) Mobil stahuje stejně velké fotky jako velký monitor.**
Na celém webu není ani jedno `srcset` ani `<picture>` (ověřeno napříč všemi
HTML soubory). Telefon široký 390 px si tak stáhne fotku 3000 px širokou —
tedy zhruba sedmkrát víc pixelů, než umí zobrazit. Nejvíc je to vidět
u `img/portrait-woman.jpg` (375 kB, 1200 × 1798), která se na mobilu
stáhne celá.

Řešení je připravit od klíčových fotek zmenšené varianty (např. 800 px)
a nechat prohlížeč vybrat. Není to na pět minut, ale je to jediná věc,
která web na mobilu opravdu zpomaluje.

*Poznámka: nejde o animace.* Motion je záměrné rozhodnutí a běží všude
(viz `CLAUDE.md`) — s rychlostí načtení nemá nic společného, celý JavaScript
váží jen 189 kB. Problém dělají výhradně fotky.

### 6. Mapa webu pro Google — chybí virtuální prohlídka

**Kde:** `public/sitemap.xml`

- **Chybí `/prohlidka/`.** 360° prohlídka prodejny je z titulky odkazovaná
  třikrát (`index.html` řádky 452, 459, 469), má vlastní titulek i popis,
  ale v mapě webu není — Google o ní tedy nemusí vědět. Je to přitom obsah,
  který konkurence nemá.
- **Data poslední změny nesedí.** U všech stránek je `2026-07-13` / `07-14`,
  ale obsah se měnil ještě 4. 8. 2026. Před spuštěním je stačí přepsat na
  aktuální datum.
- ✅ `reklama.html` v mapě správně **není** (je to kampaňová stránka
  s `noindex`).

### 7. Náhledy při sdílení na Facebooku — dvě stránky bez obrázku

**Kde:** `ochrana-osobnich-udaju.html` a `cookies.html`

Obě právní stránky nemají žádnou `og:` značku, takže při sdílení na
Facebooku se ukáže holý odkaz bez obrázku. U právních stránek to skoro
nevadí, ale je to pár řádků práce.

Drobnost navíc: `og:image:alt` (popis obrázku pro nevidomé) má jen
`index.html`, `akce.html` a `reklama.html`. Chybí na `mereni-zraku.html`,
`kontaktni-cocky.html`, `servis.html` a `o-nas.html`.

Stránka `/prohlidka/` nemá `canonical` ani `og:` značky vůbec
(`public/prohlidka/index.html`).

### 8. Titulka pošle 18 zbytečných dotazů, které skončí chybou 404

V konzoli prohlížeče je na titulce **18 chyb 404**. Nejde o rozbitý web —
ověřil jsem, že se všechno zobrazí správně. Je to způsob, jakým se načítají
loga značek: web u každé značky postupně zkouší `.svg`, pak `.png`, pak
`.webp` a vezme první, co najde (`src/js/brand.js`, řádky 33–57).

Ověřeno, že to funguje podle záměru: **18 z 21 log se načte**, u tří
(Optika Čivice, Konvex, Alcon) zůstane stylizovaný název — rozbitý obrázek
se neukáže nikdy, přesně jak slibuje `public/img/brands/README.md`.

Jen to zbytečně zaplní konzoli a pošle 18 dotazů navíc. Kdyby se u každé
značky rovnou uvedla správná přípona, zmizelo by to. **Nízká priorita.**

### 9. Chybová stránka 404 — ověřit u hostingu

`public/404.html` existuje a je hezky udělaná (má `noindex`, odkaz zpět).
Na Vercelu i Netlify se použije automaticky, na jiném hostingu se musí
nastavit ručně. Po nasazení stačí zadat `optikdvorak.cz/neexistuje` a podívat se.

### 10. Drobnost ve formulaci po odstranění videa

**Kde:** `reklama.html`, řádek 181

Ve fotopásu je štítek „**Živě** z prodejny · Americká 325/23". Slovo „živě"
dávalo smysl, dokud tam bylo video. Teď je tam fotka, takže by sedělo spíš
„Přímo z prodejny" — jak to má `akce.html` na řádku 133.

---

## Čeká na majitelku

Tohle nemůže rozhodnout nikdo jiný. Dokud se to nepotvrdí, na webu stojí
čísla a tvrzení, za která nikdo neručí.

### A. Platnost a podmínky akcí

Na webu jsou dvě konkrétní sezónní nabídky — **multifokální skla 1+1**
a **řidičská skla −30 %**:

| Kde | Řádek |
| --- | --- |
| `index.html` | 751 |
| `akce.html` | 119, 120, 151–158 |
| `reklama.html` | 104, 105, 121, 122, 143 |

U obou chybí odpověď na dvě otázky: **Dokdy platí? A na co přesně?**
V kódu je to poznamenané třikrát (`akce.html` řádky 23–26, `reklama.html`
řádky 25–26) a majitelka to sama zmínila v `docs/MAMKA-PRIPOMINKY-2026-08-01.md`
řádky 89–90.

Zákazníkovi se zatím ukazuje obecná věta (`akce.html` řádek 193): „Uvedené
akce jsou orientační a jejich platnost i podmínky vám rádi upřesníme na
prodejně." To je poctivé, ale u placené reklamy slabé — člověk klikne na
„−30 %" a nedozví se, jestli to ještě platí.

### B. Časová osa — roky 2005 a 2022

`index.html` řádky 548 (2005 — „Rozšiřujeme služby: kontaktní čočky a servis")
a 555 (2022 — „Certifikace MiYOSMART a MiSIGHT"). Jsou to odhady. Potvrdit
nebo opravit — a pak smazat veřejnou poznámku na řádku 569 (viz bloker č. 2).

### C. Jak přesně optika vznikla

`o-nas.html` řádek 142 je označený `<!-- PLACEHOLDER pasáž: přesné okolnosti
založení a jména doplní majitelka -->`. Text pod ním je napsaný obecně
(rok 1991, krátce po revoluci) a nic si nevymýšlí, ale je to nejsilnější
místo celého webu — skutečný příběh rodiny by tu udělal víc než cokoli
jiného.

### D. Právní texty ke kontrole

`ochrana-osobnich-udaju.html` řádek 16 a `cookies.html` řádek 16 nesou obě
stejnou poznámku: je to **pečlivě připravená vzorová šablona**, ne text na
míru. Před spuštěním by ji měl vidět právník a hlavně se do ní musí doplnit
**skutečně používaní zpracovatelé** — kdo web hostuje, přes co chodí e-maily
(Seznam), jestli poběží Google Analytics. Bez toho GDPR text formálně
neodpovídá skutečnosti.

### E. Hodnocení „4,6 z 26" ke stavu 8/2026

`index.html` řádky 583, 589 a 594. Číslo je ručně opsané z Google profilu
a na webu je u něj poctivě uvedeno „stav k 8/2026". Až se na Google změní,
musí se přepsat i tady — automaticky se to neaktualizuje.

✅ Ověřeno: recenze v pásu jsou označené jako skutečné z Google a v
strukturovaných datech **není** žádné vymyšlené `aggregateRating` —
Googlu se tedy nepodsouvá hodnocení, které by nešlo ověřit. To je správně.

### F. Tři chybějící loga dodavatelů

Optika Čivice, Konvex a Alcon. Postup i přesné názvy souborů jsou
v `public/img/brands/README.md` — stačí si je vyžádat od obchodního
zástupce a nahrát do složky, web si je vezme sám. Do té doby se zobrazuje
název značky, což vypadá slušně.

### G. MiYOSMART iQ

`docs/MAMKA-PRIPOMINKY-2026-07-20.md` řádek 4: ověřit přesný název
a dostupnost, než se to na web napíše. Zatím se o něm nikde nepíše — správně.

---

## Ověřeno v pořádku

Aby bylo vidět, co audit pokryl a co se řešit nemusí.

**Technika**
- ✅ Produkční build (`npx vite build`) projde bez chyb i varování — 38 modulů,
  0,9 s, všech 9 stránek se vygeneruje.
- ✅ **Žádná chyba JavaScriptu** na žádné z 11 stránek. Ani jedna výjimka.
- ✅ Jediné chyby v konzoli jsou zmíněné 404 od načítání log (bod 8) — nic jiného.
- ✅ Ken Burnsovo video je pryč **úplně**. Prošel jsem všech 11 stránek
  v prohlížeči: **nezůstal ani jeden `<video>` element.** Soubor
  `public/video/hero.webm` je smazaný a nikde už na něj nevede odkaz.
- ✅ Fotopásy na podstránkách se načítají správně a jejich popisky odpovídají
  tomu, co je na fotce (`o-nas.html` 124, `mereni-zraku.html` 125,
  `akce.html` 129, `reklama.html` 177).

**Odkazy**
- ✅ **Ani jeden rozbitý odkaz.** Prošel jsem Playwrightem všech 401 odkazů
  na 11 stránkách — všechny interní vedou na existující soubor a všechny
  kotvy (`#kontakt`, `#prohlidka`, …) na existující místo.
- ✅ Všechny externí odkazy odpovídají: mapa Google (200), Facebook (200),
  Firmy.cz (200), Úřad pro ochranu osobních údajů (200). Instagram vrátil
  429 — to je jen jeho ochrana proti automatům, ne chyba odkazu.
- ✅ Všech 55 odkazů otevíraných do nového okna má `rel="noopener"`.
- ✅ Telefony a e-mail jsou po webu konzistentní: `+420 702 194 246`,
  `+420 377 328 367`, `optika.americka@seznam.cz`.

**SEO**
- ✅ Každá z 9 stránek má vlastní `<title>`, `meta description` i `canonical`
  — a všechny canonical adresy sedí na `https://optikdvorak.cz/…`.
- ✅ `robots.txt` i `sitemap.xml` existují a jsou dostupné.
- ✅ `reklama.html` je správně `noindex, follow` a není v mapě webu —
  kampaňová stránka tedy nebude konkurovat titulce ve vyhledávání.
- ✅ Otevírací doba je **shodná na všech 9 stránkách** i ve strukturovaných
  datech: Po–Čt 8:30–17:00, Pá 8:30–16:00.

**Strukturovaná data (co si o firmě přečte Google)**
- ✅ Všechny 4 bloky JSON-LD jsou **platný JSON** — na titulce `Optician`
  a `FAQPage`, na `kontaktni-cocky.html` a `servis.html` `Service`.
- ✅ Adresa Americká 325/23, Plzeň, 301 00, souřadnice, telefon, e-mail,
  rok založení 1991 i otevírací doba odpovídají zbytku webu.
- ✅ 7 otázek ve `FAQPage` odpovídá slovo od slova tomu, co je vidět
  v sekci FAQ na stránce — Google nepenalizuje za neshodu.

**Přístupnost**
- ✅ **Všech 82 obrázků má `alt`.** Osm z nich má `alt=""` záměrně — jsou
  to čistě dekorativní fotky a avatary (`index.html` 478, 687, 698, 709,
  783–786), což je správný postup.
- ✅ Každá stránka má právě **jeden `<h1>`** a `lang="cs"`.
- ✅ **Žádné tlačítko ani odkaz bez čitelného názvu** — ověřeno na titulce,
  O nás, Akce i ve virtuální prohlídce. Ikonová tlačítka mají `aria-label`.
- ✅ Odkaz „Přeskočit na obsah" funguje a míří na existující cíl.
- ✅ Hvězdičky u recenzí mají textovou alternativu pro čtečky
  („Hodnocení 5 z 5 hvězd").

**Cookies a soukromí**
- ✅ Cookie lišta se zobrazí a nabízí správné volby: „Odmítnout volitelné",
  „Přijmout vše", „Nastavení cookies" — tedy odmítnutí je stejně dostupné
  jako souhlas, jak GDPR vyžaduje.
- ✅ Mapa se načte až po souhlasu, ne dřív.
- ✅ Analytika je podmíněná souhlasem (byť je teď vypnutá, viz bod 4).

**Ostatní**
- ✅ Živý Instagram feed přes behold.so odpovídá (HTTP 200, 25 kB dat)
  a vrací skutečný profil `optik.dvorak`. Když vypadne, web se má o co opřít —
  zobrazí statické dlaždice.
- ✅ Virtuální prohlídka `/prohlidka/` se načte a má vlastní titulek i popis.
- ✅ Údaj „35 let péče o zrak" na `o-nas.html` sedí (2026 − 1991 = 35)
  a počítá se automaticky, takže nezestárne.

---

## Shrnutí

| | |
| --- | --- |
| **Blokery** | 3 — formulář neodesílá, interní poznámka na titulce, veřejné `.md` soubory |
| **Doporučeno** | 7 — analytika, výkon na mobilu, mapa webu, náhledy sdílení, drobnosti |
| **Čeká na majitelku** | 7 — platnost akcí, roky v ose, příběh, právní kontrola, hodnocení, loga, MiYOSMART iQ |
| **Ověřeno v pořádku** | 30+ kontrol napříč technikou, odkazy, SEO, přístupností a soukromím |

**Nejrychlejší cesta na live:** doplnit klíč do formuláře (20 minut), smazat
řádek 569 v `index.html` (1 minuta), přesunout tři `.md` soubory z `public/`
(5 minut). Tím padnou všechny blokery. Zbytek už se dá doladit i za provozu —
kromě platnosti akcí, pokud se současně pustí placená reklama.
