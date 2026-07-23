# Instagram feed na webu

Sekce „Sledujte nás" na homepage ukazuje příspěvky z [@optik.dvorak](https://www.instagram.com/optik.dvorak/).
Jde to dvěma způsoby — vyber si podle toho, jak moc to má být bezúdržbové.

---

## Varianta A — plně automaticky (doporučeno)

Web bude **sám ukazovat všechny nové posty i reely**, jakmile je přidáš na Instagram.
Nastavuje se jednou, pak už se o nic nestaráš. Používáme **behold.so** — je zdarma,
neukládá návštěvníkům cookies (šetří starosti s GDPR) a je na to dělané.

1. Založ si účet zdarma na <https://behold.so> a přihlas se.
2. Připoj svůj Instagram účet **@optik.dvorak** (Behold tě provede; funguje s běžným
   i firemním účtem).
3. Vytvoř „feed" a zkopíruj jeho **JSON feed URL** (vypadá jako
   `https://feeds.behold.so/XXXXXXXX`).
4. V souboru `index.html` najdi řádek se sekcí Instagram a vlož URL do `data-insta-feed`:
   ```html
   <section class="insta" id="instagram" ... data-insta-feed="https://feeds.behold.so/XXXXXXXX">
   ```
5. Commit + nasazení. Hotovo — od teď se poslední příspěvky (i reely, označené ▶)
   načítají samy, bez dalšího zásahu.

> Když pole `data-insta-feed` necháš prázdné nebo se feed nenačte, web se automaticky
> vrátí k lokálním fotkám z varianty B (nic se nerozbije).

---

## Varianta B — poloautomaticky (bez třetí strany)

Když nechceš žádnou externí službu, feed se dá obnovit ručně za ~2 minuty.
Fotky se stáhnou k nám na web (`public/img/ig/`), takže nezávisíme na Instagramu.

1. Otevři <https://www.instagram.com/optik.dvorak/> v prohlížeči.
2. Otevři konzoli (F12) a spusť příkaz z hlavičky `scripts/fetch-instagram.mjs`
   (vypíše posledních 12 příspěvků/reelů).
3. Výstup vlož do `scripts/ig-posts.json` (přepiš celý soubor).
4. Spusť `npm run ig:refresh` — stáhne náhledy a přegeneruje `public/data/instagram.json`.
5. Commit + push.

Web čte `public/data/instagram.json` a ukáže všechny příspěvky, které v něm jsou
(aktuálně až 11 + dlaždice „Sledovat"). Není potřeba sahat do HTML.

---

## Jak to funguje uvnitř
- Načítání řídí `initInstaFeed()` v `src/main.js`.
- Pořadí zdrojů: `data-insta-feed` (živý feed) → `public/data/instagram.json` (lokální).
- Když obojí selže, zůstanou statické dlaždice napevno v `index.html` (web vždy vypadá dobře).
