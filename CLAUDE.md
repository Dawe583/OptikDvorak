# Optik Dvořák — pravidla projektu

Web rodinné oční optiky (Plzeň, Americká 325/23, od 1991). Vite MPA (vanilla JS) + GSAP/ScrollTrigger/Observer + Lenis. Stránky: index, akce, ochrana-osobnich-udaju, cookies.

## ZÁVAZNÁ PRAVIDLA (rozhodnutí klienta — neměnit bez jeho výslovného pokynu)

1. **Motion všude, bez výjimky.** Všechny animace, efekty a scroll efekty běží na úplně
   všech zařízeních. NIKDY nepřidávej:
   - `prefers-reduced-motion` gaty (JS `matchMedia` ani CSS `@media`),
   - odlehčené mobilní varianty efektů (width gaty, menší amplitudy),
   - podmíněné vypínání animací.
   V `src/main.js` a `src/akce.js` je `const prefersReduced = false;` — nech ji tak.
   Lenis má `syncTouch: true`. Toto pravidlo klient zopakoval opakovaně poté,
   co mu je předchozí úpravy vracely zpět.

2. **Průběžně commituj a pushuj na GitHub** po každé ucelené fázi práce.

3. **Poctivý obsah.** Žádné smyšlené recenze bez označení „ukázková", žádné
   neověřené značky či partnerství, žádná vymyšlená čísla. Placeholder data
   označuj HTML komentářem pro majitelku.

## Kontext
- Roadmapa: `docs/NAVRH-ROZVOJE.md`
- Poptávky z formuláře mají chodit na `optika.americka@seznam.cz`
- Obsidian vault s kontextem projektu: `C:\Users\dsak5\OneDrive\Dokumenty\OptikDvorak` (jen lokálně)

## Příkazy
- `npm run dev` — dev server (port 5173)
- `npx vite build` — produkční build (musí projít před commitem)
