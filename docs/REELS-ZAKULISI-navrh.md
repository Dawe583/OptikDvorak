# Návrh reels z reálných záběrů z optiky (video od mamky)

_Tři syrové klipy, které natočila mamka na telefon, jsem zapojil do stejného
profesionálního pipeline jako ostatní reely (`promo-video/`). Výsledek =
hotový, hezky zeditovaný Reel **bez originálního zvuku** (vlastní vygenerovaná
hudba, žádný copyright), ve stejném brandovém stylu (černá / krémová / žlutá,
filmový grade, zrno, titulky). Originály byly „syrové" — tady z nich vzniká
reklamní obsah, který vypadá jako od agentury._

> Hotové video (náhled): `promo-video/out/reel-zakulisi.mp4`
> Kód reelu: `promo-video/src/ReelZakulisi.tsx` · hudba: `scripts/make-audio-zakulisi.mjs`
> Zdrojové klipy (bez zvuku): `promo-video/public/clip-showroom.mp4`, `clip-mereni.mp4`, `clip-obruba.mp4`

---

## Co bylo na třech videích

| Klip | Délka | Obsah | Kde se použil |
|------|-------|-------|---------------|
| **video 4 (lepší záznam)** → `clip-showroom` | 52 s | klidný průchod prodejnou — sluneční brýle, stěny obrub, stolek s tulipány | háček + KROK 3 (výběr obrub) — nahradilo původní video 1 |
| **video 2** → `clip-mereni` | 21 s | vyšetření zraku na přístroji (optometristka + klient) | KROK 1 (měření) |
| **video 3** → `clip-obruba` | 26 s | nasazování zkušební obruby, příprava vyšetření | KROK 2 (obruba na míru) |

Všechny tři jsou vertikální (poměr ≈ 9:16), takže sedí na Reels bez ořezu.
U všech byl **odstraněn originální zvuk** už při zpracování (ffmpeg `-an`).

**Vylepšení kvality klipů (z originálů, zdarma):** dvouprůchodová **stabilizace**
(vidstab — pryč roztřesená ruka), **odšumění** (hqdn3d — pryč kompresní šum),
lanczos zvětšení na 1080×1920, **adaptivní doostření** (cas) a deband. Právě
roztřesenost a šum dělaly z klipů „amatérské video" víc než samotné rozlišení.

---

## 🎬 HLAVNÍ REEL (hotový) — „Zákulisí: co tě čeká na měření zraku"

**Proč právě tenhle formát:** krokové „behind the scenes" (1 → 2 → 3) má na Reels
nejvyšší **dokoukanost** — divák chce vidět celý proces až do konce. A dokoukanost
je pro algoritmus nejsilnější signál. Zároveň to boří ostych („bojím se optiky") a
ukazuje, že měření zraku je klidná, profesionální věc.

**Délka:** 28 s · **Formát:** 4K na výšku 2160×3840 (9:16) · **Zvuk:** vlastní, tematický
(viz níže — zvuky z optiky vpletené do hudby).

**Tematický soundtrack (ne generický podkres):** tempo 100 BPM = takt přesně 2,4 s
= délka háčku, takže střihy sedí na dobu. V hudbě jsou „schované" zvuky z ordinace:
tikání kolečka zkušebních čoček jako perkuse, „autofokus" sweep před každým střihem
zakončený cvaknutím čočky, filcový klavír s motivem nad progresí C → G/B → Am7 → Fmaj7
a klesající basovou linkou. Outro = rozklad Cadd9, „svět se zaostřil".

> **Ke 4K:** titulky, logo, grade, zrno a všechny efekty se renderují v pravém 4K =
> ostré jak břitva. Samotné záběry mají zdroj z telefonu jen 478×850 px, takže víc
> reálného detailu z nich vytáhnout nejde — jsou čistě zvětšené (lanczos + jemné
> doostření). **Pro plnou 4K ostrost i záběrů natáčej příště rovnou ve 4K** (viz
> `NATACENI-SCENAR.md`, pravidlo 2).

### Střihový scénář (co se děje na obraze)

| Čas | Obraz | Titulek na plátně |
|-----|-------|-------------------|
| 0,0–2,4 s | vyšetřovna s přístrojem (obraz sedí k textu háčku) | „Co tě čeká na měření zraku 👀" |
| 2,4–8,4 s | měření na přístroji | **01** · „Změříme ti zrak v klidu a přesně." |
| 8,4–14,2 s | zkušební obruba | **02** · „Vybereme obrubu přesně na tebe." |
| 14,2–23,0 s | dlouhý průchod podél celé vitríny (bez ořezu zoomem) | **03** · „Stovky obrub na výběr." |
| 23,0–28,0 s | logo + adresa | „Objednej se na měření 👇" |

**Prvky, které z toho dělají „profesionál", ne „amatér":**
- jednotný **grade** (teplý filmový nádech) přes všechny záběry — sjednotí různé světlo,
- **pomalý Ken Burns zoom** i na statických záběrech = záběr „žije",
- **titulky** ve fontu značky (Bricolage), žluté akcenty, mono popisky,
- **3-dílný ukazatel postupu** nahoře (jako u Stories) — divák vidí „ještě 2 kroky",
- **žlutý záblesk + „cink"** přesně na střihu mezi kroky = rytmus,
- outro s logem, adresou a jasným CTA.

---

## 📲 Popisky k hlavnímu reelu (copy-paste pro IG) — verze dle researche 7/2026

**Proč je popisek postavený takhle (ověřeno researchem):**
- **1. řádek = druhý háček + SEO.** Divák vidí jen ~125 znaků před „…více" a IG dnes
  řadí obsah podle klíčových slov v captionu víc než podle hashtagů → „měření zraku"
  a „Plzeň" musí být hned v prvním řádku.
- **Jedno hlavní CTA, ne čtyři.** Konverzní popisek má mít jediný další krok,
  který zákazník reálně udělá. Vše ostatní (ulož/pošli) patří do prvního komentáře.
- **Klíčové slovo v komentáři („TERMÍN") = nejkonverznější mechanika.** Komentář je
  menší bariéra než psát DM, každý komentář zvedá dosah a konverzace pak pokračuje
  ve zprávách. Postup pro majitelku: na komentář odpovědět veřejně („Posíláme časy
  do zpráv ✉️") **a zároveň** poslat DM s volnými termíny — veřejná odpověď je
  sociální důkaz pro další diváky.
- **3–5 hashtagů stačí** (éra 30 hashtagů skončila) + location tag Plzeň
  (u lokálních podniků výrazně zvedá engagement).

### Háček — 3 varianty na A/B test (měň jen 1. řádek popisku)
- **A (proces + SEO, výchozí):** `Takhle vypadá měření zraku u nás v Plzni 👀`
- **B (námitka/ostych):** `Odkládáš měření zraku, protože nevíš, co tě čeká? Podívej 👇`
- **C (výsledek):** `Rozmazaný svět není normál. Takhle snadno se to řeší 👇`

### ✅ IG popisek (hlavní, copy-paste)
```
Takhle vypadá měření zraku u nás v Plzni 👀 Tři kroky a víš, na čem jsi.

01 · Změříme ti zrak na moderních přístrojích. V klidu, bez spěchu.
02 · Zkušební obruba přímo na tvůj obličej. Poradíme, co ti sedne.
03 · Vybereš si ze stovek obrub, na každý styl i rozpočet.

O zrak Plzeňanů se staráme od roku 1991. Rodinná optika na Americké. Žádný řetězec, pořád stejná péče.

👉 Chceš termín? Napiš do komentáře „TERMÍN" a pošleme ti volné časy do zpráv.
Radši telefon? ☎️ [telefon]

📍 Optik Dvořák · Americká 325/23, Plzeň

#optikaplzeň #měřenízraku #brýleplzeň #očníoptika #plzeň
```
<!-- ⚠️ Placeholder pro majitelku: doplň telefon. „Stovky obrub" odpovídá tomu,
     co říká video — pokud je reálný počet nižší, změň v popisku i ve videu. -->

### 💬 První komentář (připnout hned po zveřejnění — nese vedlejší CTA + startuje dosah)
```
Máte otázku k měření zraku? Ptejte se rovnou tady 👇 ráda odpovím.
A jestli znáš někoho, kdo měření věčně odkládá, pošli mu tohle video 📲
```

### 📩 Šablona DM odpovědi na komentář „TERMÍN" (pro majitelku)
```
Dobrý den! Díky za zájem o měření zraku 👓 Tento týden máme volno např. [den + čas] nebo [den + čas]. Sedí vám některý? Případně napište, kdy se vám to hodí, a najdeme jiný. Těšíme se! Optika Dvořák, Americká 325/23.
```
_(odeslat co nejdřív po komentáři — zájem je nejsilnější prvních pár hodin;
na komentář zároveň veřejně odpovědět „Posíláme časy do zpráv ✉️")_

### Cover / náhledovka
Text přes 1. snímek: `CO TĚ ČEKÁ NA MĚŘENÍ ZRAKU` (žlutě) — zvědavost + jasné téma.

### IG nastavení posta
- **Alt text:** „Oční optika Dvořák Plzeň — měření zraku na přístroji, zkušební obruba, výběr brýlí, zákulisí návštěvy."
- **Poloha:** Plzeň / Optik Dvořák.
- **Zvuk:** video je **bez zvuku** schválně — v IG appce přidej **trending audio** (viz níže).

---

## 🔊 Důležité k „bez originálního zvuku" + viralitě

Video jsem odevzdal **bez zvuku** (jen s podkresovou vygenerovanou hudbou v souboru).
Pro **maximální virální dosah** ale platí:

> **Trending zvuk se musí přidat přímo v Instagram / TikTok appce z jejich knihovny.**
> Jedině tak ho algoritmus započítá jako „používá tento zvuk" a přidá k vlně dosahu.
> Zvuk zabalený natvrdo do MP4 tenhle bonus nedá.

**Postup v IG (30 s):** nahraj video → dole „Zvuk" 🎵 → vyber trend označený
šipkou ↗ (rostoucí) → hlasitost originálu stáhni na 0 → publikuj.
Hledej klidný / „aesthetic" / „lofi" trend, který sedí k tempu střihu (100 BPM).
Vygenerovaná hudba v souboru slouží jako **záloha**, kdyby se ti trend nechtěl řešit.

---

## 🎬 Další reely ze stejného materiálu (snadno odvoditelné)

Ze stejných tří klipů jde udělat víc reelů — stačí vyměnit titulky/hudbu.
Každý cílí na jiného diváka a jiný „hook":

### REEL F — „POV: máš strach z optiky" (emoce / překonání ostychu)
- Háček: `POV: bojíš se, že u optika něco pokazíš 😬`
- Payoff: klidné záběry měření + „U nás nic nezkazíš. Jsme rodina, ne úřad. ❤️"
- Cíl: lidé, kteří měření odkládají. **Silné na sdílení.**

### REEL G — „Kolik obrub u nás máme?" (satisfying / brand)
- Jen `clip-showroom`, zpomalený pomalý pan po stěnách + počítadlo `500+ obrub`.
- Háček: `Kolik brýlí se vejde do jedné rodinné optiky? 👓`
- Cíl: WOW efekt, ukládání. Krátký (10–12 s), „ASMR" tempo.

### REEL H — „3 věci, které nevíš o měření zraku" (edukace)
- Klip měření + obruba jako ilustrace ke 3 faktům (např. „měření zraku je zdarma
  součást výběru brýlí", „obrubu vybíráme podle tvaru obličeje", „skla řešíme na míru").
- Cíl: uložení + autorita. Edukace = důvěra.

> Tyhle tři jsou připravené jako **návrh** — když řekneš který, doplním je do
> `promo-video/` jako hotové kompozice (stejně jako hlavní reel).

---

## ▶️ Jak si video vyrobit / překreslit

```bash
cd promo-video
npm install                 # jednou
npm run audio:zakulisi      # vygeneruje hudbu (public/music-zakulisi.wav)
npm run render:zakulisi     # vyrenderuje out/reel-zakulisi.mp4
# nebo živý náhled a ladění textů:
npm run studio              # otevře Remotion Studio, kompozice „reel-zakulisi"
```
Titulky, časy i barvy se mění v `src/ReelZakulisi.tsx` (nahoře je celý scénář v komentáři).

---

## ⚠️ Poctivé poznámky pro majitelku

- **Souhlas zákazníka.** V klipech měření/obruby je vidět zákazník. Dle vlastního
  pravidla (`docs/NATACENI-SCENAR.md`) je zveřejnění poznatelné tváře cizího člověka
  jen s jeho souhlasem. V editaci je záběr veden spíš na přístroj/obrubu, ale
  **před zveřejněním potvrď ústní/SMS souhlas** — jinak tenhle klip vyměň za jiný
  (např. jen ruce / záda / detail přístroje).
- **Kvalita zdroje.** Klipy přišly v nižším rozlišení (478×850) a jsou pro 4K výstup
  čistě zvětšené. Grafika je v pravém 4K, záběry na úrovni zdroje. Pro příště: natáčej
  v **4K** (viz `NATACENI-SCENAR.md`, pravidlo 2) — pak budou ostré i záběry.
  (Alternativa pro tato videa: AI upscaler záběrů — na vyžádání.)
- **Bez vymyšlených čísel.** „500+ obrub" v návrhu REEL G je jen příklad — před
  použitím ověř skutečný počet, ať to sedí (pravidlo poctivého obsahu).

_Navazuje na `docs/NATACENI-SCENAR.md`, `docs/POPISKY-REELS-B-D.md` a `docs/REKLAMA-A-SOCIAL-PLAN.md`._
