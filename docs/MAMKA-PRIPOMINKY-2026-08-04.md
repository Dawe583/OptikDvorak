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

Fotka `public/img/ai/lenses-reading.jpg` je vyměněná. Používá se na **dvou místech**:
na titulce v sekci „Skla na míru pro jasné vidění" a na stránce Kontaktní čočky
v černém pásu „Vyzkoušejte čočky zdarma". Soubor má stejný název, takže se obě
místa přepsala naráz.

- **Pryč:** Pexels 3782187 — šedovlasý pán v kulatých brýlích v protisvětle, čte
  tyrkysovou knihu. Usmíval se koutkem úst a díval se svrchu.
- **Nově:** [Pexels 7545048](https://www.pexels.com/photo/7545048/) — pán kolem
  sedmdesáti, bílé vlasy a krátký plnovous, tenké zlaté brýle, krémové lněné sako.
  Sedí v křesle, v ruce šálek kávy, na klíně otevřený časopis. **Doopravdy se směje**,
  uvolněně a vřele. Brýle jsou dobře vidět a jsou to skutečné dioptrické obruby,
  ne rekvizita. Časopis na klíně drží čtenářskou linku sekce (multifokální skla
  na dálku i na čtení), aniž by fotka působila naaranžovaně.
- Licence Pexels — volné komerční užití bez povinné atribuce, stejně jako u zbytku
  webu. Soubor 1200 × 1066 px, 168 kB, oříznutý tak, aby obličej zůstal v záběru
  v obou ořezech (široká dlaždice na titulce i vysoký panel na Kontaktních čočkách).
- Popisky pro nevidomé a pro Google (`alt`) na obou místech přepsané na to, co je
  na fotce doopravdy — původní „Muž čte knihu v elegantních brýlích u okna" by
  po výměně nesouhlasil (žádná kniha ani okno).

**Náhradníci**, kdyby se tenhle pán nelíbil (oba Pexels, volná licence):
- [Pexels 7545018](https://www.pexels.com/photo/7545018/) — **tentýž pán** zblízka,
  vlídně se usmívá nad křížovkou. Nejvíc „na téma", ale fotograf mu uřízl temeno
  hlavy, po ořezu je to vidět.
- [Pexels 8899491](https://www.pexels.com/photo/8899491/) — jiný pán, kolem 75,
  výrazné hranaté brýle, čte pod lampou. Klidný a soustředěný, ale neusmívá se.

### Doprovodné úpravy (nebyly zadané, vyplynuly ze změn výše)

- `o-nas.html` — popisek stránky pro Google začínal „Optik Dvořák je rodinná oční
  optika v centru Plzně. Fungujeme od roku 1991." To po změně titulku dělalo tutéž
  větu dvakrát pod sebou, takže je z toho „Rodinná oční optika v centru Plzně,
  na Americké 325/23, od roku 1991. …"
- `o-nas.html` — štítek nad nadpisem ve video pásu byl „Rodinná oční optika ·
  od roku 1991" a nadpis pod ním je nově taky „Rodinná oční optika, …". Štítek
  je proto „Naše prodejna · Americká 325/23".

## Na co se mamky zeptat

1. **MiYOSMART / MiSIGHT — jen z pásu značek, nebo úplně odevšad?** (viz rámeček výše)
2. **Loga Konvex a Alcon** pořád chybí — u obou dlaždic svítí jen název. Stačí je
   nahrát do `public/img/brands/` jako `konvex.svg` a `alcon.svg`, web si je načte sám.
   Totéž platí pro `optika-civice.svg`.
3. Otázky z minulého kola (platnost akcí, roky v časové ose, recenze paní Hackerové)
   pořád čekají — viz `MAMKA-PRIPOMINKY-2026-08-01.md`, sekce „Na co se mamky zeptat".
