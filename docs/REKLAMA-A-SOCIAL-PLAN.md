# Optik Dvořák — reklamní video + týdenní plán IG/FB

_Zpracováno 18. 7. 2026. Optika, Plzeň, Americká 325/23, rodinná od 1991._

---

## ČÁST 1 — Market research: co dnes na Reels reálně táhne dosah

### Klíčová zjištění (se zdroji)

1. **Video > foto, řádově.** Reels mají cca **+36 % dosahu** oproti ostatním typům příspěvků; algoritmus IG i FB dnes tlačí krátké video před fotky a carousely. _(Salesforce, 2025)_
2. **Pozor — dosah Reels sám o sobě loni klesl ~35 %.** Nestačí „točit Reels", rozhoduje kvalita prvních sekund a retence. Samotný formát už není zlatý důl. _(zdroj z IG business analytiků, 2025)_
3. **Prvních 3–5 sekund rozhoduje o všem.** Když divák neudrží pozornost hned, algoritmus přestane video šířit. _(tmys.cz, 9/2025)_
4. **Dokoukání + opakované přehrání = nejsilnější signál.** Proto krátké video (15–25 s), které si člověk pustí dvakrát, bije minutový monolog. _(tmys.cz)_
5. **Uložení a sdílení > lajky.** Lajky už algoritmus váží málo. „Ulož si" / „pošli kamarádce co hledá brýle" je cennější CTA než „lajkni". _(tmys.cz, contentiamo.cz)_
6. **Originální obsah > recyklovaný.** IG v 2025 potvrdil zvýhodnění původního obsahu proti repostům a videím s vodoznakem z TikToku. _(bluetero.com, 2025)_
7. **IG je dnes i vyhledávač.** Klíčová slova v titulku/popisku Reels (např. „optika Plzeň", „brýle na míru") přivádějí dosah přes lupu, podobně jako Google. _(tmys.cz)_
8. **UGC (obsah od zákazníků) roste.** Reálný člověk s novými brýlemi > naaranžovaná produktovka. _(crossroadcoach, 2025)_

### Co z toho plyne pro optiku (implikace)

- **Formát:** 9:16, 15–25 s, titulky vždy (většina lidí kouká bez zvuku).
- **Háček v 1. sekundě:** ne logo, ne „Vítejte", ale otázka/napětí/tvář. Logo až na konci.
- **Nejsilnější témata pro optiku:** proměna „před/po" (nasazení brýlí = viditelný wow moment), lidský příběh (rodina od 1991), edukace (jak vybrat obruby k tvaru obličeje), zákulisí (broušení skel, měření zraku).
- **CTA:** „Ulož si" nebo „Objednej se, odkaz v bio" — ne „lajkni".
- **Konzistence > dokonalost:** raději 3–4 jednoduché Reels týdně než 1 leštěný měsíčně.

### Rizika / co nepřehlédnout

- **Ryze produktová/reklamní videa mají nižší organický dosah** — algoritmus tlačí to, co vypadá „nativně", ne jako reklama. → leštěný teaser (níže) je super jako **placená** reklama, ale organicky ho doplň syrovějším UGC obsahem.
- **Hudba:** používej jen licencované/IG audio z knihovny (originální zvuk nebo trending audio z IG), ne stažený track — jinak riziko ztlumení a nižšího dosahu.
- **Nevymýšlej čísla ani recenze.** Placeholder recenze označuj jako „ukázková".

**Doporučení:** Jeden „vlajkový" leštěný teaser (na placenou reklamu + pin) + 3–4 lehké nativní Reels týdně natočené na mobil v optice. Vlajkový teaser už z velké části existuje v `promo-video/` (Remotion, 4K 9:16).

---

## ČÁST 2 — Reklamní video: koncept + scénář

### Koncept „Vidět líp než včera"

Rodinná optika od 1991 = **35 let důvěry**. Emoce = úleva a jasnost ve chvíli, kdy si člověk nasadí správné brýle. Ne sleva, ne akce — **pocit**.

- Formát: **9:16, 4K, 20 s** (varianta 8 s pro reklamní hook).
- Tón: teplý, tichý, prémiový. Reference = styl už rozjetého teaseru v `promo-video/Teaser.tsx`.
- Zvuk: jemný ambient + jedno cvaknutí (nasazení brýlí) + závěrečný „ping" u loga.

### Scénář — shot by shot (20 s)

| Čas | Obraz | Text na obrazovce | Zvuk |
|-----|-------|-------------------|------|
| 0–2 s | **HÁČEK:** rozostřený svět (ulice Plzně, rozmazané), pomalu | „Takhle to vidí každý třetí Čech." | ambient náběh |
| 2–5 s | Ruka bere obrubu z vitríny, detail | „My to umíme spravit od roku 1991." | jemné tóny |
| 5–8 s | Nasazení brýlí — svět se **zaostří**, wow moment | (cvak) | cvaknutí + swell |
| 8–12 s | Tvář zákazníka, úsměv, měření zraku v pozadí | „Oční optika. Měření zraku. Brýle na míru." | teplý ambient |
| 12–16 s | Rychlý sestřih: broušení skel, 3 obruby, výloha | „Rodinná optika v srdci Plzně." | rytmus zesiluje |
| 16–20 s | Logo Optik Dvořák na čistém pozadí, adresa | „Americká 325/23 · objednej se →" | závěrečný ping |

### Varianta pro placenou reklamu (8 s hook)

Prvních 8 s = řádky 0–8 s výše (rozostření → zaostření → cvak). Skvělý „scroll-stopper". Za ním celý 20s spot jako pokračování.

### Produkce — co reálně udělat

1. **Vlajkový teaser** už z velké části existuje v `promo-video/` (Remotion). Chybí jen: doplnit reálné záběry z optiky (výloha, broušení, tvář zákazníka) místo stock. Render `npx remotion render`.
2. **Reálné záběry natočit na mobil** (moderní telefon, 4K): 5 min v optice — vitrína, ruce, výloha, jedna spokojená zákaznice (se souhlasem).
3. Titulky vždy vypálit do videa (ne jen IG caption).

> ⚠️ Placeholder pro majitelku: záběr zákazníka natočit jen s podepsaným souhlasem. Alternativa bez tváře: záběr na ruce + brýle.

---

## ČÁST 3 — Týdenní plán IG + FB (Po 20. 7. – Ne 26. 7. 2026)

Princip: **1 Reel obden** (algoritmus miluje pravidelnost), FB = zrcadlo IG + delší popisky pro starší publikum. Story denně.

| Den | Kanál | Typ | Obsah | Popisek / háček | CTA |
|-----|-------|-----|-------|-----------------|-----|
| **Po 20. 7.** | IG+FB Reel | Vlajkový teaser | 20s spot „Vidět líp než včera" | „Takhle to vidí každý třetí Čech 👓" | Ulož si / Objednej se |
| Po | Story (obě) | Anketa | „Nosíš brýle, nebo čočky?" | interakce | swipe na Reel |
| **Út 21. 7.** | Story | Zákulisí | Krátká story z měření zraku | „Jak probíhá měření zraku?" | „Napiš do DM, objednáme tě" |
| **St 22. 7.** | IG+FB Reel | Edukace | „Jaké obruby k tvaru obličeje" (3 typy, mobil) | Háček: „Kupuješ brýle špatně. 3 věci, co hlídat 👇" | Ulož si video |
| St | Story | Repost | Sdílení Reelu do story | — | — |
| **Čt 23. 7.** | IG+FB foto/carousel | Produkt + příběh | 3 obruby + věta o rodině od 1991 | „35 let brousíme skla v Plzni." | Přijď se podívat |
| **Pá 24. 7.** | IG+FB Reel | Před/po | Nasazení brýlí = wow moment (mobil) | Háček: „Počkej na tu sekundu 3… 👓" | Pošli kamarádovi, co hledá brýle |
| Pá | Story | Anketa | „Který rámeček? A vs B" | interakce | — |
| **So 25. 7.** | Story | Lidský | Rodina/tým optiky, krátce | „Rodinná optika = známe vás jménem." | — |
| **Ne 26. 7.** | IG+FB foto | Tichý/atmosféra | Výloha nebo detail | „Vidíme se v pondělí. Americká 325/23." | Otevírací doba v bio |

### Zásady pro celý týden

- **Titulky vždy**, 15–25 s Reels, háček v 1. sekundě.
- **3–5 hashtagů**, tematických: `#optikaplzeň #brýlenamíru #plzeň #očníoptika #brýle`.
- **Klíčová slova do titulku Reelu** kvůli IG vyhledávání („optika Plzeň", „brýle na míru").
- **Nejlepší časy postování** pro lokální ČR publikum: cca 18–20 h (po práci). Testuj v IG Insights.
- **Reaguj na komentáře do 1 h** po zveřejnění — zvyšuje počáteční dosah.
- **FB:** stejné video, ale delší popisek + adresa a telefon (starší publikum čte popisky).

### Metriky, které sledovat (týdně)

| Metrika | Kde | Cíl |
|---------|-----|-----|
| Dosah Reelu | IG Insights | roste týden po týdnu |
| % dokoukání (retention) | IG Insights | > 50 % udrží do půlky |
| Uložení + sdílení | IG Insights | > lajky (to je dobře) |
| DM / objednávky ze sítě | ručně | primární cíl |

---

## Další kroky

1. Natočit 5 min reálných záběrů v optice (mobil, 4K).
2. Doplnit je do `promo-video/` teaseru, vyrenderovat 20s + 8s verzi.
3. Připravit 4 mobilní Reels dle plánu (edukace, před/po).
4. Naplánovat týden v Meta Business Suite (plánovač zdarma).

_Zdroje: Salesforce 2025, tmys.cz 9/2025, bluetero.com 2025, contentiamo.cz 2025, crossroadcoach 2025._

---

## ČÁST 4 — 4 mobilní Reels: scénáře po záběrech + hotové popisky

Vše 9:16, natočeno na telefon, 15–25 s, titulky vypálené do videa. Zvuk = trending audio z IG knihovny (ne stažený track).

### REEL A — Edukace „3 věci, co hlídat při výběru brýlí" (St 22. 7.)

**Scénář (20 s):**
| Čas | Záběr | Text na obrazovce | Mluvené / akce |
|-----|-------|-------------------|----------------|
| 0–3 s | Detail na tvář, ruce drží 2 obruby u obličeje | „Kupuješ brýle špatně 👇" | háček, přímý pohled do kamery |
| 3–8 s | Přiložení obruby k obličeji, ukázat šířku | „1. Šířka rámečku = šířka obličeje" | ruka ukáže okraj oka vs. okraj obruby |
| 8–13 s | Boční pohled, obruba na nose | „2. Nesmí tlačit za ušima ani na nose" | prst ukáže dosedací body |
| 13–18 s | Dvě různé barvy obrub střídavě u tváře | „3. Barva ladí s tónem pleti, ne s oblečením" | rychlé střídání teplá/studená |
| 18–20 s | Logo + výloha | „Vybereme ti je v Plzni →" | úsměv |

**IG popisek:**
> Kupuješ brýle podle vzhledu v zrcadle? 👓 Tady jsou 3 věci, které rozhodují, jestli ti budou opravdu sedět — a většina lidí je přehlíží.
> Ulož si to na příště 📌
> Rodinná optika v Plzni od 1991 · Americká 325/23
> 📍 Objednej se — odkaz v bio
> #optikaplzeň #brýlenamíru #plzeň #očníoptika #jakvybratbrýle

**FB popisek (delší, pro starší publikum):**
> Vybíráte nové brýle? Není to jen o vzhledu. Šířka rámečku, dosedací body a barva podle tónu pleti rozhodují o tom, jak vám budou sedět celý den. V naší rodinné optice v Plzni (Americká 325/23) vám s výběrem pomůžeme osobně už od roku 1991. Objednejte se telefonicky nebo přijďte. 👓

---

### REEL B — Před/po „Wow moment nasazení" (Pá 24. 7.)

**Scénář (15 s):**
| Čas | Záběr | Text na obrazovce | Akce |
|-----|-------|-------------------|------|
| 0–2 s | Rozmazaný záběr (kamera rozostřená), člověk mhouří oči | „Počkej na tu sekundu 3…" | napětí |
| 2–5 s | Ruka podává brýle, detail | „3…2…1" | odpočet |
| 5–8 s | Nasazení brýlí → záběr se **ostře zaostří** (přeostření kamery) | (cvak) | wow moment |
| 8–12 s | Tvář, upřímný úsměv, rozhlédne se | „Takhle má vypadat svět." | reakce |
| 12–15 s | Logo + adresa | „Oční optika Dvořák · Plzeň" | — |

**Trik na natočení:** kameru drž zprvu rozostřenou (manuální ostření / prst přes čočku), v momentě nasazení přeostři na tvář. Nebo natoč přes samotné brýle — svět za sklem se zaostří.

**IG popisek:**
> Ten moment, kdy si nasadíš správné brýle a svět se zaostří… 😍👓 Kdy jsi naposledy byl na měření zraku?
> Pošli tohle někomu, kdo pořád mhouří oči 👇
> Plzeň · Americká 325/23 · od 1991
> #brýle #optikaplzeň #měřenízraku #plzeň #vidětlíp

**FB popisek:**
> Někdy si ani neuvědomíme, jak špatně vidíme — dokud si nenasadíme správné brýle. Ten pocit, když se svět zaostří, stojí za to. Přijďte na měření zraku do naší rodinné optiky v Plzni. 👓 Americká 325/23.

---

### REEL C — Zákulisí „Jak vzniká vaše brýlové sklo" (rezerva / bonus)

**Scénář (20 s):**
| Čas | Záběr | Text | Akce |
|-----|-------|------|------|
| 0–3 s | Detail brousicího stroje, jiskření/voda | „Co se děje s vaší brýlí v zákulisí?" | háček |
| 3–10 s | Sklo v brusce, ruce optika | „Každé sklo brousíme na míru vašim očím" | proces |
| 10–15 s | Osazení skla do obruby | „Přesně podle vašeho měření" | detail |
| 15–20 s | Hotové brýle, výloha, logo | „Ruční práce · Plzeň od 1991" | — |

**IG popisek:**
> Vaše brýle nevznikají v továrně na druhém konci světa 🌍 Brousíme skla přímo tady, na míru vašim očím. Ulož si, ať víš, kam příště zajít 📌
> #optikaplzeň #ruční #brýlenamíru #zákulisí #plzeň

---

### REEL D — Lidský příběh „Rodina od 1991" (So/Ne varianta)

**Scénář (18 s):**
| Čas | Záběr | Text | Akce |
|-----|-------|------|------|
| 0–3 s | Stará fotka provozovny / výloha dnes | „Tady stojíme od roku 1991." | háček |
| 3–10 s | Tým/rodina v optice, práce se zákazníkem | „Tři desetiletí. Jedna rodina. Jedno místo." | teplé záběry |
| 10–15 s | Zákazník + optik, podání brýlí | „Neprodáváme brýle. Staráme se o váš zrak." | emoce |
| 15–18 s | Logo + adresa | „Optik Dvořák · Americká 325/23" | — |

**IG popisek:**
> 35 let na stejném místě v Plzni ❤️ Za tu dobu jsme pomohli vidět líp několika generacím jedné rodiny. Děkujeme, že k nám chodíte 🙏
> #rodinnáoptika #plzeň #optikaplzeň #od1991 #děkujeme

> ⚠️ Placeholder pro majitelku: u záběrů s tváří zaměstnanců/zákazníků vždy jejich souhlas. Stará fotka provozovny — pokud existuje v archivu, ideální.

---

### REEL E — Sebe-diagnostický checklist „Poznáváš to?" (nejkonverznější)

**Proč je tohle nejkonverznější formát v sadě:** divák si **sám odškrtává** příznaky (aktivní
zapojení > pasivní koukání), pozná se v nich („to jsem já"), pocítí potřebu a **verdikt** ho
pošle na měření zraku. Checklist navíc táhne dvě nejsilnější metriky algoritmu:
**uložení** („uložím si to") a **opakované přehrání** („pustím znovu a spočítám se"). Háček je
otázka, na kterou skoro každý po 35. roce odpoví „ano". Příznaky jsou **poctivé a reálné**
(myopie / presbyopie / astigmatismus / digitální únava), rámované jako důvod zajít na měření —
ne jako diagnóza a bez vymyšlených čísel.

**Scénář (18 s):**
| Čas | Záběr | Text na obrazovce | Akce / zvuk |
|-----|-------|-------------------|-------------|
| 0–2,6 s | Tmavý rozostřený portrét, mhouří oči | „Bolí tě večer hlava? Nemusí to být z práce." | háček, napjatý pad |
| 2,6–3,9 s | Ztmavení pozadí, nadpis | „Kolik z těchhle poznáváš?" | obrat, swell |
| 3,9–12 s | 5 příznaků se **postupně odškrtává** ✔ | 1) Mhouříš na telefon · 2) Večer bolí hlava / pálí oči · 3) Text oddaluješ dál · 4) V noci „hvězdičky" kolem světel · 5) U PC těžknou oči | 5 tiků (stoupající výška) |
| 12–14,8 s | Verdikt | „✋ 2 a víc? To není únava — je čas na měření zraku." | dopad + záblesk |
| 14,8–18 s | Logo + adresa | „Objednej se na měření zraku · Americká 325/23 · od 1991" | ping u loga |

**Trik na natočení mobilem:** háček natoč přes rozostřenou čočku (nebo večerní záběr u telefonu,
jak někdo mhouří). Checklist může být čistě grafický (text přes tmavé pozadí) — netřeba herce.
Odškrtnutí = jednoduchá animace/samolepka v CapCutu + „tik" zvuk z knihovny.

**Hotová Remotion verze:** `promo-video/` → kompozice `reel-signaly` (18 s, 4K 9:16). Render:
`cd promo-video && npx remotion render reel-signaly out/reel-signaly.mp4`.
Zvuk `public/music-signaly.wav` generuje `node scripts/make-audio-signaly.mjs`.
Kompletní popisky, háčky a IG setup: **`docs/POPISKY-REEL-SIGNALY.md`**.

**IG popisek (zkráceně, celý ve `POPISKY-REEL-SIGNALY.md`):**
> Kolik z těchhle 5 poznáváš? 👀 Mhouření, večerní bolest hlavy, oddalování textu… Většina lidí to bere jako „normál". Není. 2 a víc = čas na měření zraku.
> 📌 Ulož si · 📲 pošli někomu, kdo pořád mhouří · 💬 napiš „VIDÍM" do DM
> Oční optika Dvořák · Plzeň, Americká 325/23 · od 1991
> #optikaplzeň #měřenízraku #brýleplzeň #vidětlíp #očníoptika

> ⚠️ Placeholder pro majitelku: CTA „napiš VIDÍM do DM" je měkká konverze funkční 24/7 (online
> rezervace zatím není). Doplň telefon. Checklist neber jako lékařskou radu — je to pozvánka na měření.

---

## ČÁST 5 — Jaký model / nástroj na tvorbu Reels

**Zásadní pravda z researche napřed:** algoritmus i důvěra v lokální optiku odměňují **autentické, původní záběry**. Reálné video z tvé optiky na telefon (4K) porazí AI generovaný klip skoro vždy — zvlášť u „před/po", zákulisí a lidského příběhu. AI použij tam, kde reálný záběr nejde natočit (rozostřený svět, abstraktní intro, b-roll).

### Doporučení podle úkolu

| Na co | Nejlepší nástroj (2026) | Proč |
|-------|-------------------------|------|
| **Vlajkový teaser (leštěný spot)** | Zůstat u **Remotina** (`promo-video/`, už rozjeté) | Plná kontrola, 4K, konzistentní branding, zdarma |
| **AI b-roll / abstraktní záběry** (rozostřený svět, atmosféra) | **Google Veo 3** nebo **OpenAI Sora 2** | Nejlepší fotorealismus + nativní zvuk; text-to-video |
| **Rychlé AI klipy / levnější** | **Kling 2.x** nebo **Runway Gen-4** | Levnější, dobrá kvalita, image-to-video (oživíš fotku obruby) |
| **Střih mobilních Reels + titulky + trending audio** | **CapCut** (mobil/desktop) | Zdarma, auto-titulky CZ, přímý export do IG, knihovna audia |
| **Titulky / přepis do CZ** | CapCut auto-captions nebo **Descript** | Rychlé, přesné české titulky |

### Konkrétní workflow (nejlevnější a nejúčinnější)

1. **Natoč na telefon** reálné záběry (Reels A–D) → sestříhej v **CapCut**, přidej titulky + trending audio. **Zdarma.** Tohle je 80 % obsahu.
2. **Vlajkový teaser** → dorenderuj v **Remotion** (už máš), doplň reálné záběry.
3. **Jen když potřebuješ abstraktní záběr** (rozostřený svět v intru) → vygeneruj v **Veo 3 / Sora 2**, vlož do CapCut střihu.

**Pozn. „model" jako AI-video:** nejsilnější dnes = Veo 3 a Sora 2 (kvalita + zvuk), Kling/Runway = levnější alternativa. Ale pro lokální optiku je **telefon + CapCut** účinnější a levnější než jakýkoli AI model — nepřeplácej AI tam, kde reálný záběr táhne víc dosahu.

