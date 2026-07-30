# Popisky + setup — REEL „Servis na počkání"

_Třetí téma letní kampaně (viz `docs/LETNI-AKCE-2026.md`, pilíř 3).
Kompozice: `promo-video/src/ReelServis.tsx`, id `reel-servis`.
Formát: **9:16, 2160×3840, 60 fps, 16,4 s** — nejkratší a nejrychlejší reel ze všech._

---

## Čím se liší od ostatních Reels

Používá **stejné reálné snímky prodejny** jako `reel-optika` a `reel-prohlidka`,
ale schválně úplně jinou vizuální řečí, ať si ty tři nekonkurují:

| | reel-optika / reel-prohlidka | **reel-servis** |
|---|---|---|
| Obraz | barevná fotka, dokument | **duotón** (žlutá + inkoust), sítotiskový plakát |
| Střih | pomalé prolínačky, 4–6 s záběry | **tvrdé střihy** se žlutým bliknutím, 2–3 s záběry |
| Typografie | titulky pod obrazem | **fotka uvnitř písma** + nakřivo nalepené štítky |
| Hudba | ambient, pad | **rytmus 120 BPM**, kick na dobu, cinknutí kovu na střizích |
| Délka | 20–25 s | **16,4 s** |
| Tón | „přijď se podívat" | „přines je, srovnáme to" |

Střihy padají přesně na dobu (2,8 / 5,0 / 7,6 / 10,4 / 12,8 s), takže tvrdý řez
zní jako záměr, ne jako chyba.

---

## Po záběrech

| Čas | Obraz | Text |
|---|---|---|
| 0–2,8 s | **fotka stěny obrouček uvnitř slova** „PO LÉTĚ" | „ti brýle padají **z nosu?**" |
| 2,8–5,0 s | duotón: pult s nápisem | štítky „Přineste je k nám." · „Srovnáme to na počkání." |
| 5,0–7,6 s | tmavá plocha, rychlý výčet | dotáhneme šroubky · srovnáme straničky · vyměníme nosníky · vyčistíme skla |
| 7,6–10,4 s | duotón: stůl na výběr | „Zastav se a **mrkneme na ně.**" + věta o ceně servisu |
| 10,4–12,8 s | duotón: vchod z panoramatu | „Americká 325/23, Plzeň." + otevírací doba |
| 12,8–16,4 s | brandová karta | logo, „Vidět líp než včera.", CTA „Stav se v otevírací době" |

Zvuk: `promo-video/public/music-servis.wav` (generuje `scripts/make-audio-servis.mjs`).

---

## ⚠️ Věta o ceně servisu — čte se z props

Ve videu je **výchozí znění opsané z webu** (`akce.html`):

> „Drobnosti zvládneme jako pozornost."

Na webu totiž stojí, že seřízení, výměnu nosníků nebo dotažení zvládnete na
počkání *„často jako drobnou pozornost"* — ne bezpodmínečně zdarma. Proto reel
zatím **neslibuje „zdarma"** a **netvrdí**, že opravíte i brýle koupené jinde.

Až to majitelka potvrdí (je to pilíř 3 kampaně), stačí přerenderovat s jiným textem:

```bash
cd promo-video
npx remotion render reel-servis out/reel-servis.mp4 \
  --props='{"bonus":"Letní servis zdarma, i pro brýle odjinud."}'
```

Do layoutu se nesahá, věta se jen vymění.

---

## ✅ IG popisek (výchozí, bezpečná verze)

```
Po létě ti brýle padají z nosu? 👓 Od potu, moře a písku se obruby povolí skoro každému.

Přines je k nám a srovnáme to na počkání:
🔧 dotáhneme šroubky
🔧 srovnáme straničky
🔧 vyměníme nosníky
✨ vyčistíme skla

Drobnosti zvládneme jako pozornost. Nemusíš se objednávat, stačí se zastavit v otevírací době.

Optik Dvořák · Americká 325/23, Plzeň · rodinná optika od 1991
🕗 Po–Čt 8:30–17:00, Pá 8:30–16:00

#optikaplzeň #servisbrýlí #brýle #plzeň #očníoptika
```

### Varianta, až bude „zdarma" potvrzené

Do popisku vyměň odstavec za:

```
Letní servis máte u nás zdarma — a to i brýle, které jste nekupovali u nás. Stačí se zastavit.
```

## 💬 První komentář

```
Povolené brýle se dají srovnat za pár minut, není kvůli tomu potřeba nic kupovat 👓 Klidně se jen zastav.
```

## FB popisek

```
Po létě bývají brýle povolené 👓

Od potu, moře a písku se obruby uvolní skoro každému. Brýle pak padají z nosu, tlačí za ušima nebo sedí nakřivo. Není kvůli tomu potřeba nic kupovat — přineste je k nám a srovnáme to na počkání.

Dotáhneme šroubky, srovnáme straničky, vyměníme nosníky a vyčistíme skla. Drobnosti zvládneme jako pozornost. Objednávat se nemusíte, stačí se zastavit v otevírací době.

Optik Dvořák, Americká 325/23, Plzeň · Po–Čt 8:30–17:00, Pá 8:30–16:00 · rodinná optika od roku 1991
```

## Story

1. První snímek Reelu („PO LÉTĚ") + samolepka ANKETA: „Sedí ti brýle po létě? SEDÍ / PADAJÍ"
2. Výčet toho, co spravíte
3. „Stavte se, jsme na Americké" + samolepka s odkazem na mapu

---

## Kdy postovat

Podle plánu kampaně **týden 4** (viz `docs/LETNI-AKCE-2026.md`), tedy konec
srpna, kdy se lidi vracejí z dovolených. Dá se opakovat i mimo kampaň — je to
evergreen obsah, který nic neslibuje a přivádí do prodejny i lidi, kteří u vás
ještě nenakupovali.

## Render

```bash
cd promo-video
node scripts/make-audio-servis.mjs
npx remotion render reel-servis out/reel-servis.mp4                  # 4K master
npx remotion render reel-servis out/reel-servis-1080.mp4 --scale=0.5  # 1080×1920 pro IG
```

Kdyby se měnily délky scén, uprav i časy v `scripts/make-audio-servis.mjs`
(`STRIHY`, `VYCET`) — musí sedět s exportem `CUES` v `src/ReelServis.tsx`,
jinak přestanou střihy padat na dobu.
