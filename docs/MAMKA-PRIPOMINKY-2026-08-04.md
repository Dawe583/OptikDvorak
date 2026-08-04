# Připomínky k webu od majitelky — 4. 8. 2026

Čtvrté kolo (po `MAMKA-PRIPOMINKY-2026-07-20.md` a `MAMKA-PRIPOMINKY-2026-08-01.md`).
Zdroj: tři zprávy na WhatsApp s fotkami obrazovky (14:51, 14:52, 14:54).

## Co bylo zadáno a jak je to vyřešené

| # | Připomínka (doslova) | Kde | Jak je to teď |
|---|----------------------|-----|---------------|
| 1 | „Rodina za pultem ne, prosím text. Rodinná oční optika, která je tu pro vás již od roku 1991. nic víc" | `o-nas.html` hlavička, `o-nas.html` video pás, `index.html` sekce o nás | Titulek stránky O nás je nově **celá tahle věta** na třech řádcích. Dlouhý úvodní odstavec pod ním je **smazaný** („nic víc"). Formulace „Rodina za pultem" zmizela ze všech tří míst na webu. |
| 2 | „Misight a miyosmart vypustit" | `index.html` sekce Značky, řada „Brýlová skla a čočky" | Dlaždice **MiYOSMART a MiSIGHT odstraněny**. Zbylo 6 výrobců: Hoya · ZEISS · Optika Čivice · Konvex · Alcon · CooperVision. |
| 3 | „A nešel by nějakej jinej chlap starší, tenhle vypadá jak strýček pedo" | `public/img/ai/lenses-reading.jpg` (titulka sekce Skla + stránka Kontaktní čočky) | Fotka **vyměněna** za jiného staršího pána — viz níže. |

## Podrobně

### 1. „Rodina za pultem" pryč, nový text v hlavičce O nás

**Stránka O nás (`o-nas.html`).** Titulek `.subhero__title` byl „Rodina / za pultem".
Teď je to věta od majitelky rozdělená na tři animované řádky:

> Rodinná oční optika,
> která je tu pro vás
> již od roku 1991.

Úvodní odstavec („Optik Dvořák je rodinná oční optika v samém centru Plzně. Už od roku
1991 se staráme o zrak lidí z okolí…") je **smazaný** — majitelka výslovně řekla „nic víc".

Kvůli tomu se drobně upravil i pás údajů pod titulkem, aby se stejná informace
neopakovala třikrát pod sebou:
- „Od roku **1991**" → „Město **Plzeň**" (rok už je v titulku)
- „Přístup **rodinný**" → „Přístup **osobní**" (slovo „rodinná" je taky v titulku)

Adresa i hodnocení z Googlu zůstávají beze změny.

Devět slov v původní velikosti titulku by přeteklo, proto vznikl **cílený CSS
modifikátor `.subhero__title--statement`** v `src/css/subpage.css` — platí jen pro
stránku O nás. Ostatní podstránky (Měření zraku, Kontaktní čočky, Servis, Akce,
reklamní stránka) mají titulek úplně beze změny.

**Video pás na stránce O nás.** „Rodina za pultem, kterou poznáte jménem."
→ „**Rodinná oční optika**, kterou poznáte jménem."

**Titulka (`index.html`, sekce o nás).** Nadpis „Rodina / za pultem"
→ „**Rodinná / oční optika**". Odstavec pod ním začínal „Optik Dvořák je rodinná oční
optika, která se v Plzni stará o zrak už od roku 1991." — to by nadpis doslova
opakovalo, takže je z toho „**Jsme tu pro vás v Plzni už od roku 1991.**"
Zbytek odstavce je beze změny.

### 2. MiYOSMART a MiSIGHT pryč z pásu značek

Z řady „// Brýlová skla a čočky" na titulce zmizely dlaždice **MiYOSMART** a **MiSIGHT**.
Zbylo šest jmen: Hoya · ZEISS · Optika Čivice · Konvex · Alcon · CooperVision — to je
ve třech sloupcích **přesně dvě plné řady**, žádná osamocená dlaždice (na mobilu dva
sloupce = tři plné řady).

**Proč to dává smysl:** ta řada je dneska seznam **výrobců**. MiYOSMART jsou konkrétní
brýlová skla od **Hoyi** a MiSIGHT konkrétní kontaktní čočky od **CooperVision** —
a oba výrobci v řadě stojí hned vedle. Byly to tedy jediné dvě dlaždice, které nebyly
značkou výrobce, ale názvem produktu. (V červenci, kdy v řadě byly jen čtyři položky,
to ještě takhle nevyznívalo — Konvex, Alcon, ZEISS a Optiku Čivice majitelka doplnila
až v červenci a srpnu.)

**Co zůstalo:** textové zmínky o certifikaci MiYOSMART a MiSIGHT jinde na webu —
v FAQ na titulce, na kartě „Pro děti", v sekci Skla, v časové ose, na stránce O nás,
Akce a Kontaktní čočky, v popiscích pro Google. Ty majitelka v červenci výslovně
schválila („MiYOSMART / MiSIGHT je OK — jsme certifikovaní, jde o certifikaci, ne
o reklamu jedné značky", viz `MAMKA-PRIPOMINKY-2026-07-20.md`).

> **Na potvrzení:** pokud měla na mysli vypustit MiYOSMART a MiSIGHT z webu **úplně
> všude**, včetně zmínek o certifikaci, dá se to udělat — je to zhruba deset míst.
> Zatím to bylo pochopené jako „pryč z pásu značek", protože fotka byla právě z něj.

Doprovodné úpravy: přepsaný komentář nad sekcí v `index.html` (vysvětluje, proč tam
ty dva názvy nejsou, aby je někdo omylem nevrátil), upravená
`public/img/brands/README.md` a smazaný nepoužívaný soubor `misight.png`.

### 3. Jiná fotka staršího pána

<!-- DOPLNIT PO VÝMĚNĚ FOTKY -->

## Na co se mamky zeptat

1. **MiYOSMART / MiSIGHT — jen z pásu značek, nebo úplně odevšad?** (viz rámeček výše)
2. **Loga Konvex a Alcon** pořád chybí — u obou dlaždic svítí jen název. Stačí je
   nahrát do `public/img/brands/` jako `konvex.svg` a `alcon.svg`, web si je načte sám.
   Totéž platí pro `optika-civice.svg`.
3. Otázky z minulého kola (platnost akcí, roky v časové ose, recenze paní Hackerové)
   pořád čekají — viz `MAMKA-PRIPOMINKY-2026-08-01.md`, sekce „Na co se mamky zeptat".
