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
| **video 1** → `clip-showroom` | 11 s | pomalý pohled po prodejně — stěny plné obrub, výlohy, pult | háček + KROK 3 (výběr obrub) |
| **video 2** → `clip-mereni` | 21 s | vyšetření zraku na přístroji (optometristka + klient) | KROK 1 (měření) |
| **video 3** → `clip-obruba` | 26 s | nasazování zkušební obruby, příprava vyšetření | KROK 2 (obruba na míru) |

Všechny tři jsou vertikální (poměr ≈ 9:16), takže sedí na Reels bez ořezu.
U všech byl **odstraněn originální zvuk** už při zpracování (ffmpeg `-an`).

---

## 🎬 HLAVNÍ REEL (hotový) — „Zákulisí: co tě čeká na měření zraku"

**Proč právě tenhle formát:** krokové „behind the scenes" (1 → 2 → 3) má na Reels
nejvyšší **dokoukanost** — divák chce vidět celý proces až do konce. A dokoukanost
je pro algoritmus nejsilnější signál. Zároveň to boří ostych („bojím se optiky") a
ukazuje, že měření zraku je klidná, profesionální věc.

**Délka:** 24 s · **Formát:** 4K na výšku 2160×3840 (9:16) · **Zvuk:** vlastní, teplý groove.

> **Ke 4K:** titulky, logo, grade, zrno a všechny efekty se renderují v pravém 4K =
> ostré jak břitva. Samotné záběry mají zdroj z telefonu jen 478×850 px, takže víc
> reálného detailu z nich vytáhnout nejde — jsou čistě zvětšené (lanczos + jemné
> doostření). **Pro plnou 4K ostrost i záběrů natáčej příště rovnou ve 4K** (viz
> `NATACENI-SCENAR.md`, pravidlo 2).

### Střihový scénář (co se děje na obraze)

| Čas | Obraz | Titulek na plátně |
|-----|-------|-------------------|
| 0,0–2,4 s | prodejna, pomalý zoom (háček) | „Co tě čeká, když přijdeš na oči 👀" |
| 2,4–8,4 s | měření na přístroji | **01** · „Změříme ti zrak. Přesně, ne od oka." |
| 8,4–14,2 s | zkušební obruba | **02** · „Vybereme obrubu přesně na tebe." |
| 14,2–19,0 s | stěna obrub | **03** · „Stovky obrub na výběr." |
| 19,0–24,0 s | logo + adresa | „Objednej se na měření 👇" |

**Prvky, které z toho dělají „profesionál", ne „amatér":**
- jednotný **grade** (teplý filmový nádech) přes všechny záběry — sjednotí různé světlo,
- **pomalý Ken Burns zoom** i na statických záběrech = záběr „žije",
- **titulky** ve fontu značky (Bricolage), žluté akcenty, mono popisky,
- **3-dílný ukazatel postupu** nahoře (jako u Stories) — divák vidí „ještě 2 kroky",
- **žlutý záblesk + „cink"** přesně na střihu mezi kroky = rytmus,
- outro s logem, adresou a jasným CTA.

---

## 📲 Popisky k hlavnímu reelu (copy-paste pro IG)

**Formule captionu:** `HÁČEK (1. řádek + klíčové slovo) → hodnota → CTA → adresa → 5 hashtagů`.
První řádek vidí divák před „…více" — musí obsahovat háček i „měření zraku / optika Plzeň".

### Háček — 3 varianty (testuj, který jede)
- **A (zvědavost):** `Co tě čeká, když poprvé přijdeš na oči 👀`
- **B (ostych):** `Bojíš se, že měření zraku je nepříjemné? Podívej 👇`
- **C (proces):** `Takhle u nás probíhá měření zraku — 3 kroky ke skvělým brýlím`

### ✅ IG popisek (hlavní)
```
Co tě čeká, když poprvé přijdeš na oči 👀 Ukazujeme celé měření zraku od A do Z.

1️⃣ Přesné měření na moderních přístrojích — žádný odhad.
2️⃣ Zkušební obruba přímo na tvůj obličej.
3️⃣ Výběr ze stovek obrub na každý typ i rozpočet.

Žádný stres, žádný spěch. Rodinná péče o zrak v srdci Plzně už od roku 1991.

📌 Ulož si, ať víš, kam v Plzni na oči
📲 Pošli někomu, kdo měření odkládá
💬 Napiš „VIDĚT" do DM a domluvíme termín

Oční optika Dvořák · Plzeň, Americká 325/23 · rodinná optika od 1991
☎️ [telefon] — objednej se

#optikaplzeň #měřenízraku #brýleplzeň #očníoptika #plzeň
```

### 💬 První komentář (napiš hned po zveřejnění — nastartuje dosah)
```
Objednání je jednoduché — napiš do DM „VIDĚT" nebo zavolej a najdeme ti termín, který sedne 👓 Kdy jsi byl naposledy na měření zraku?
```

### Cover / náhledovka
Text přes 1. snímek: `CO TĚ ČEKÁ NA OČÍCH` (žlutě) — zvědavost + jasné téma.

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
Hledej klidný / „aesthetic" / „lofi" trend, který sedí k tempu střihu (~92 BPM).
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
