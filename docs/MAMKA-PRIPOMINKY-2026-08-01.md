# Připomínky k webu od majitelky — 1. 8. 2026

Druhé kolo připomínek (po `MAMKA-PRIPOMINKY-2026-07-20.md`). Níže je mapa
připomínka → kde se to změnilo → co přesně je teď na webu.

## Co bylo zadáno a jak je to vyřešené

| # | Připomínka | Kde | Jak je to teď |
|---|------------|-----|---------------|
| 1 | „Titulka rodinná **oční** optika, ne **malá**" | `index.html` hero + sekce „Rodina za pultem" | Podtitul úvodu: „**Rodinná oční optika** v centru Plzně…", horní řádek: „…rodinná **oční** optika od roku 1991". V sekci o nás zmizelo „Zůstáváme malí a osobní" → „**Zůstáváme osobní.**" |
| 2 | „Jak to probíhá, 02 — **jaká korekce je** pro vás" | `index.html` krok 02 | „Společně zjistíme, **jaká korekce je pro vás nejvhodnější**." (dřív „jaké korekce jsou") |
| 3 | „Skla na míru, vlevo: …a dobře vybranými **brýlovými** skly" | `index.html` sekce Skla na míru | „// Každé brýle u nás začínají pečlivým měřením a dobře vybranými **brýlovými skly**." |
| 4 | „Péče o brýle — ať jsou vidět **brýle**, ne pouzdro, u toho třeba **šroubovák**" | `index.html` galerie | Fotka pouzdra (`kolaz-pouzdro.jpg`) je pryč. Nová reálná fotka `pece-o-bryle.jpg`: ruce opravují obrubu, vedle na stole leží malý šroubovák (Pexels, volné užití). |
| 5 | „Brýle jako nové, obvykle na počkání — **vymaž** ‚Pokud jde o reklamaci, poradíme…'" | `servis.html` | Věta o reklamaci **smazána**. Místo ní: „Objednávat se nemusíte, stavte se s brýlemi kdykoli v otevírací době." |
| 6 | „Co všechno opravíme — **letování obrub vynech**" | `servis.html`, `index.html` (FAQ) | Položka „Letování obrub" **smazána**. Letování zmizelo i z běhacího pásu, z popisku pro Google, z textu „Brýle jako nové" a z otázky ve FAQ na titulce. Nikde na webu už slovo letování není. |
| 7 | „Jak měření probíhá: …a společně vyzkoušíme, **které dioptrické hodnoty vám budou nejlépe vyhovovat**" | `mereni-zraku.html` krok 02 | Přesně touto větou. (Aby se text neopakoval, úvodní odstavec stránky se přeformuloval na „Nespěcháme a ptáme se, jak a kde budete brýle nosit, aby jim měření odpovídalo.") |
| 8 | „Cena a termíny — **při pořízení kompletních dioptrických brýlí je měření zraku zdarma**" | `mereni-zraku.html`, `index.html` (FAQ + data pro Google), `akce.html` | Všude sjednoceno na „**Při pořízení kompletních dioptrických brýlí je měření zraku zdarma.**" Dřívější formulace „měření je zpravidla zvýhodněné" je pryč. Na stránce měření zraku navíc přibyl do pásu údaj „Ke kompletním brýlím zdarma", na stránce Akce se karta jmenuje „Měření zraku zdarma". |
| 9 | „U Značky, kterým věříme, přijde **Alcon** a **Konvex**" | `index.html` sekce Značky | Obě značky doplněny do řady „Brýlová skla a čočky": Hoya · ZEISS · Optika Čivice · **Konvex** · MiYOSMART · **Alcon** · MiSIGHT · CooperVision. |

## Na co se mamky zeptat

1. **Reklamace.** Věta „Pokud jde o reklamaci, poradíme vám, jak dál, a vše za vás
   vyřídíme." byla podle zadání smazána ze stránky Servis. **Stejná věta byla i ve
   FAQ na titulce** („Jak je to u vás s opravami a reklamacemi brýlí?") — aby web
   netvrdil na jednom místě něco, co jinde smazal, byla odstraněna i tam a otázka
   se teď jmenuje jen „Jak je to u vás s opravami brýlí?". Pokud má o reklamacích
   informace zůstat aspoň ve FAQ, stačí říct a vrátí se.
2. **Loga Konvex a Alcon.** Zatím u nich svítí jen název. Až budou od obchodních
   zástupců loga (ideálně bílé/jednobarevné SVG), stačí je nahrát do
   `public/img/brands/` jako `konvex.svg` a `alcon.svg` — web si je načte sám,
   nic se nemusí programovat (viz `public/img/brands/README.md`).
3. **Fotka „Péče o brýle"** je licencovaná fotka z Pexels. Kdykoli ji jde nahradit
   vlastní fotkou z dílny — stačí uložit soubor pod stejným názvem
   `public/img/ai/pece-o-bryle.jpg`.
4. **„Rodinná optika" vs. „rodinná oční optika."** Na titulce je teď všude
   „rodinná **oční** optika". Na dalších stránkách (O nás, Akce, reklamní
   stránka, virtuální prohlídka) zůstává kratší „rodinná optika" — pokud to má
   být jednotné, doplní se „oční" i tam.

## Poznámka k měření zraku zdarma

Formulace „měření zraku zdarma při pořízení kompletních dioptrických brýlí" je
teď na webu **cenová nabídka** — je uvedená na titulce (FAQ i strukturovaná data
pro Google), na stránce Měření zraku a na stránce Akce. Kdyby se podmínka někdy
změnila (třeba jen na určité typy skel), je potřeba upravit všechna tři místa.
