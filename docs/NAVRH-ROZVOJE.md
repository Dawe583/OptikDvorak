# Optik Dvořák — Návrh rozvoje webu

Roadmapa k plnohodnotnému, „ostrému" webu. Vizuální verze je jako artifact;
tohle je textová verze pro repozitář. Priority a odhady jsou orientační.

## 01 · Kde web stojí dnes (hotové)

- Kompletní homepage: hero s videem, služby, proces, čočky, galerie s lightboxem,
  značky, lookbook, timeline, recenze, FAQ, akce, kontakt s formulářem a živou otevírací dobou.
- Dynamika na všech zařízeních: smooth scroll, parallax, curtain reveals, odometer,
  split-text nadpisy, pinned proces (mobil má odlehčenou variantu), 2 carousely, mobilní fullscreen menu.
- Právní minimum: GDPR, cookies, cookie lišta se souhlasem, mapa až po souhlasu.
- Poctivý obsah: reálná recenze z Firmy.cz + odkazy na profily, jen ověřené značky, ukázky označené.
- Přístupnost (WCAG AA) + SEO základ: sémantika, focus management, prefers-reduced-motion,
  strukturovaná data (Optician + FAQ), Open Graph, canonical.
- Stránka Akce, provázaná z homepage i patičky.

## 02 · Go-live blockery (nutné před ostrým startem)

- [ ] **Formuláře na e-mail** — napojit backend (Formspree / Web3Forms / Netlify Forms),
      ať poptávka reálně dorazí. Dnes se odešle jen „naoko". (~1–2 h)
- [ ] **Doména + HTTPS** — optikdvorak.cz na Vercel (DNS + certifikát).
- [ ] **Reálné fotky** — dodat vlastní prémiové snímky (viz 05). Kde jsou lidé, ať mají brýle.
- [ ] **Ověřit fakta** — PSČ provozovny, platnost/podmínky akcí, přesný výčet značek, milníky timeline (2005/2022 orientační).
- [ ] **Google Business Profile + reálné recenze** — propojit, sbírat, nahradit ukázky.
- [ ] **Právní kontrola** — GDPR/cookies texty jsou pečlivá šablona; doplnit skutečné zpracovatele.
- [ ] **sitemap.xml, robots.txt, 404** + Google Search Console.

## 03 · Podstránky k přidání

Priorita: **P1** brzy · **P2** později

- **P1** Služby (rozcestník) — /sluzby s odkazy na jednotlivé služby
- **P1** Měření zraku — jak probíhá, přístroje, délka, cena, objednání (nejhledanější)
- **P1** Dětské brýle / MiYOSMART — dětská krátkozrakost, MiSIGHT; bez konkrétních zdravotních slibů
- **P1** Kontaktní čočky — typy, první aplikace, dokup, péče
- **P1** O nás / Náš příběh — rodina od 1991, tým (jménem a v brýlích), hodnoty
- **P1** Kontakt — samostatná stránka s mapou, formulářem, dopravou/parkováním
- **P2** Dioptrické & sluneční brýle — obruby, typy skel, UV, ukázky kolekcí
- **P2** Servis a opravy — co na počkání, reklamace
- **P2** Blog / Rady pro zdravý zrak — SEO motor + podklad pro Google Business příspěvky
- **P2** Recenze (plná) — Google + Firmy.cz na jednom místě
- **P2** Značky — rozcestník reálných značek
- **P2** Kariéra — „hledáme optika/optičku"

## 04 · Funkce

- **P0** Odesílání poptávek na e-mail (+ volitelně potvrzení zákazníkovi)
- **P1** Online rezervace termínu (Reservio / Google Calendar / vlastní)
- **P1** Reálné recenze (Google feed nebo ruční výběr) + hvězdičky do vyhledávání
- **P2** Lehký CMS (Decap / Sanity) pro samostatnou editaci obsahu
- **P2** Newsletter (se souhlasem), analytika se souhlasem (Plausible/GA4)
- **P2** Dokup čoček online, dárkové poukazy
- **P2** Signature kurzor a část efektů i na podstránky

## 05 · Obsah & fotografie (foto shot-list)

Nové fotky nejde stáhnout z internetu (prostředí to blokuje) a hlavně — nejlíp působí
vlastní snímky. Ideálně lokální fotograf (½ dne). K nafocení:

- Tým v brýlích (portréty, u pultu, při měření)
- Měření zraku (klient u přístroje, detail vyšetření)
- Prodejna & výloha (interiér, regály, výloha den/večer, detail loga)
- Produktové flatlays (obruby a sluneční brýle na čistém pozadí)
- Děti & MiYOSMART (dítě v brýlích, se souhlasem, bez zdravotních slibů)
- Klienti v brýlích (různé věkové skupiny s hotovými brýlemi)

Texty k doplnění: reálné akce a podmínky · výčet značek · PSČ · medailonky týmu · reálné Google recenze.

## 06 · SEO & lokální dosah

- Strukturovaná data (Optician + FAQ hotové, PSČ doplněno) — přidat schema služeb a recenzí
- Google Business Profile (nejdůležitější kanál pro lokální optiku)
- Katalogy: Firmy.cz, Zlaté stránky, mapy.cz — jednotné NAP
- Obsahové stránky + blog na dotazy „měření zraku Plzeň", „dětské brýle Plzeň", „MiYOSMART"
- sitemap.xml + robots.txt + Search Console
- Hlídat Lighthouse po přidání fotek (komprese, rozměry, lazy-load)

## 07 · Roadmapa ve fázích

1. **Ostrý start (≈1–2 týdny)** — formuláře na e-mail, doména, reálné fotky, ověření faktů +
   právní kontrola, Google Business + první recenze, sitemap/robots/404/Search Console.
2. **Obsah & důvěra (≈2–4 týdny)** — podstránky P1, reálné recenze na web, start blogu,
   analytika se souhlasem, newsletter.
3. **Růst & pohodlí (průběžně)** — online rezervace, lehký CMS, zbylé podstránky,
   do budoucna dokup čoček a dárkové poukazy.

## 08 · Otevřené otázky (odblokují Fázi 1)

1. Kam mají chodit poptávky? (e-mail, případně kopie/SMS)
2. Přístup ke správě DNS domény optikdvorak.cz?
3. Fotky — kdy focení? Logo ve vysokém rozlišení.
4. Fakta — PSČ, reálné akce/podmínky, značky, roky milníků.
5. Recenze — screenshoty/text reálných Google recenzí (nahradím ukázky 1:1).
6. Priority — která podstránka první? Doporučení: Měření zraku a O nás.
