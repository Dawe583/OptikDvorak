# Loga značek (sekce „Značky, kterým věříme" na homepage)

Sem stačí nahrát soubor s logem a **na webu se objeví automaticky** —
není potřeba nic programovat. Dokud soubor chybí, zobrazí se u dané
značky stylizovaný název (nikdy se neukáže rozbitý obrázek).

## Už doplněno

Loga jsou ve složce u všech značek obrub a u Hoya, ZEISS
a CooperVision. Klidně je nahraďte oficiální verzí od dodavatele,
když budete mít lepší.

**Chybí a hodila by se:** `optika-civice.svg`, `konvex.svg` a
`alcon.svg`. U těchto tří dlaždic zatím svítí jen název značky
(Konvex a Alcon přibyly v srpnu 2026; u Optiky Čivice je na jejich
webu jen malé logo 48 × 32 px, na dlaždici by bylo rozmazané).
Vyžádejte si je prosím od obchodního zástupce.

## Jak na to

1. Připravte logo jako **SVG** (ideální — ostré na všech displejích).
   Funguje i `.png` nebo `.webp`.
2. Nejlépe **bílé / jednobarevné** logo na průhledném pozadí — sekce má
   tmavé pozadí, barevná loga na něm můžou zaniknout.
3. **Bez prázdného okraje kolem loga.** Dlaždice logo vykreslí přes celou
   svou plochu, takže když je v souboru kolem nápisu velký průhledný rám,
   logo se na webu zobrazí zbytečně malé. (Soubory, které tu už jsou, mají
   okraj oříznutý.)
4. Pojmenujte soubor přesně podle tabulky níže (malá písmena, pomlčky)
   a nahrajte ho do této složky `public/img/brands/`.
5. Hotovo. Web logo načte sám.

Zkouší se pořadí přípon: `.svg` → `.png` → `.webp` (použije se první nalezená).

## Přesné názvy souborů

### Obruby
| Značka          | Název souboru (např. SVG)   |
| --------------- | --------------------------- |
| Ray-Ban         | `ray-ban.svg`               |
| Silhouette      | `silhouette.svg`            |
| Emporio Armani  | `emporio-armani.svg`        |
| Vogue           | `vogue.svg`                 |
| Guess           | `guess.svg`                 |
| Ana Hickmann    | `ana-hickmann.svg`          |
| Morel           | `morel.svg`                 |
| Hannah          | `hannah.svg`                |
| Horsefeathers   | `horsefeathers.svg`         |
| Bloomdale       | `bloomdale.svg`             |
| Lightbird       | `lightbird.svg`             |
| Woodys          | `woodys.svg`                |
| Zenka           | `zenka.svg`                 |
| Reserve         | `reserve.svg`               |
| Okula           | `okula.svg`                 |

### Brýlová skla a čočky
| Značka          | Název souboru (např. SVG)   |
| --------------- | --------------------------- |
| Hoya            | `hoya.svg`                  |
| ZEISS           | `zeiss.svg`                 |
| Optika Čivice   | `optika-civice.svg`         |
| Konvex          | `konvex.svg`                |
| Alcon           | `alcon.svg`                 |
| CooperVision    | `coopervision.svg`          |

Poznámka k MiYOSMART a MiSIGHT: v pásu značek už nejsou (srpen 2026).
Jsou to konkrétní produkty — brýlová skla od Hoya, resp. kontaktní
čočky od CooperVision — a oba výrobci jsou v tabulce výš. Zmínky
o certifikaci MiYOSMART / MiSIGHT v textech na webu zůstávají.

Poznámka k `zeiss.svg`: vznikl z volného loga na Wikimedia Commons
(File:Zeiss logo.svg, public domain) — je z něj ponechaný jen samotný
nápis bez modré plochy, aby na tmavém pozadí nebyl z loga bílý obdélník.

> Poznámka k autorským právům: loga značek používejte jen pro označení
> zboží, které v optice reálně prodáváte. Oficiální loga si vyžádejte od
> dodavatelů / obchodních zástupců — mají je v tiskové kvalitě a ve
> správných variantách.
