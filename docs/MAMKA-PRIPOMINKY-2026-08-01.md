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

## Rozhodnuto (2. kolo, srpen 2026)

1. **Reklamace — pryč ze všech marketingových textů. Potvrzeno majitelkou.**
   Věta „Pokud jde o reklamaci, poradíme vám, jak dál, a vše za vás vyřídíme."
   je smazaná ze stránky Servis i z FAQ na titulce (otázka se teď jmenuje jen
   „Jak je to u vás s opravami brýlí?") a zmizela i ze strukturovaných dat pro
   Google. Prošel se celý web včetně meta tagů, JSON-LD a videí — žádný slib
   o reklamaci, záruce ani „vyřídíme to za vás" už nikde není.
   **Zůstávají jen povinné právní texty**, které se smazat nesmí a o reklamaci
   zboží nejsou: souhlas pod formuláři („zpracování údajů pro vyřízení vašeho
   dotazu"), Zásady ochrany osobních údajů (účel a doba zpracování, zákonná
   lhůta pro vyřízení žádosti podle GDPR). V roadmapě `NAVRH-ROZVOJE.md` bylo
   u plánované stránky Servis slovo „reklamace" vyškrtnuto, aby se téma
   nevrátilo zadní cestou.
2. **„Rodinná oční optika" všude.** Sjednoceno napříč celým webem — titulka,
   O nás, Akce, reklamní stránka i virtuální 360° prohlídka, včetně popisků
   pro Google a náhledů při sdílení na sítích. Kratší „rodinná optika" zůstala
   jen ve **velkých titulcích promo videí** (např. „Rodinná optika, ne řetězec.")
   — tam je text sázený na dva řádky a třetí slovo by rozbilo sazbu i časování
   animace; navíc by se videa musela znovu vyrenderovat. Pokud to má být
   jednotné i ve videích, dá se to udělat při jejich příštím exportu.

## Rozhodnuto (3. kolo, srpen 2026) — recenze v pásu + doděláno, co majitelka chtěla už v červenci

3. **Recenze teď projíždějí jako pás.** Místo karuselu se šipkami se osm
   skutečných Google recenzí posouvá plynule zleva doprava. Najetím myší se pás
   zpomalí, tlačítkem **Pozastavit** se dá úplně zastavit (kvůli lidem, kterým
   pohyb vadí, a kvůli dotykovým displejům, kde se najet nedá). Nové recenze
   stačí přidat jako další `<blockquote class="review review--real">` do pásu —
   o zdvojení pro plynulou smyčku se postará web sám.
4. **„Značkové" obruby — dodělána červencová připomínka.** Slovo bylo tehdy
   opravené jen v kroku 03, ale zůstalo na kartě Dioptrické brýle, v popisku
   galerie, v časové ose, v popisku pro Google i v náhledu pro sociální sítě
   a ve videu Vitrína. Teď je pryč ze všech těchto míst. **Zůstalo jen
   v doslovné citaci recenze** paní Hackerové („velký výběr značkových
   i levnějších brýlí") — cizí recenzi přepsat nejde, to by bylo falšování.
   Pokud vadí i tam, jediná čistá možnost je tuhle recenzi z webu vypustit.
5. **Žádné zdravotní sliby u MiYOSMART a MiSIGHT.** Formulace „skla zpomalující
   dětskou krátkozrakost" / „pomáhají zpomalovat prohlubování dioptrií" jsou
   nahrazené za „brýlová skla **určená pro řízení dětské krátkozrakosti
   (myopie)**" a „rádi poradíme, zda jsou pro vaše dítě vhodná". Opraveno na
   titulce (sekce Skla, FAQ i data pro Google), na stránce O nás, Akce
   i Kontaktní čočky. Certifikace se uvádí dál — ta je v pořádku.
6. **Popisky fotek už nelžou.** U šestnácti obrázků stálo v popisku pro nevidomé
   a pro Google něco, co na fotce není: „Spokojená klientka Optik Dvořák",
   „Spokojený zákazník v nových brýlích" (muž na fotce brýle nemá),
   „Dítě s brýlemi se skly MiYOSMART" nebo „na prodejně Optik Dvořák"
   u snímků z fotobanky. Každou fotku jsem si prohlédl a popisek přepsal na to,
   co na ní opravdu je. Fotky prodejny (`interier.webp`, `exterier.jpg`)
   zůstávají popsané jako prodejna — ty jsou vaše.
7. **Web si už neodporuje ve vlastních číslech.**
   - Délka měření: všude **30 až 45 minut** (na titulce stálo „zhruba 30 minut").
   - Roky: na titulce bylo „30+ let", o kousek níž „35+", na stránce O nás
     „přes třicet let" i „Tři desetiletí" — teď se všude píše **od roku 1991**
     a počítadlo ukazuje 35 let bez znaménka „+" (35 je přesně 2026 − 1991).
   - Hodnocení: u „4,6 z 26 recenzí" je nově uvedeno **stav k 8/2026**, aby
     bylo poznat, ke kdy údaj platí. Až se číslo na Google změní, přepište ho
     na titulce (2×) a v úvodu každé podstránky.

## Na co se mamky zeptat

1. **Loga Konvex a Alcon.** Zatím u nich svítí jen název. Až budou od obchodních
   zástupců loga (ideálně bílé/jednobarevné SVG), stačí je nahrát do
   `public/img/brands/` jako `konvex.svg` a `alcon.svg` — web si je načte sám,
   nic se nemusí programovat (viz `public/img/brands/README.md`).
2. **Fotka „Péče o brýle"** je licencovaná fotka z Pexels. Kdykoli ji jde nahradit
   vlastní fotkou z dílny — stačí uložit soubor pod stejným názvem
   `public/img/ai/pece-o-bryle.jpg`.
3. **Akce (multifokály 1+1, řidičská skla −30 %)** jsou na webu bez uvedené
   platnosti a podmínek, přitom v kódu je poznámka „před ostrým provozem
   potvrďte". Kdy akce končí a na co přesně platí? Doplní se k nim.
4. **Servis „často jako drobná pozornost"** (stránka Akce a reklamní stránka)
   naznačuje, že servis bývá zdarma, ale nic neslibuje. Buď to říct rovnou
   („drobné seřízení děláme zdarma"), nebo formulaci vypustit — teď je na půl cesty.
5. **Roky 2005 a 2022 v časové ose** jsou podle poznámek jen orientační. Jaké
   jsou skutečné milníky? Jinak je lepší je nahradit obdobím bez konkrétního roku.
6. **Recenze paní Hackerové** obsahuje slovo „značkových" (viz bod 4 výše) —
   ponechat, nebo tuhle recenzi z webu vypustit?

## Poznámka k měření zraku zdarma

Formulace „měření zraku zdarma při pořízení kompletních dioptrických brýlí" je
teď na webu **cenová nabídka** — je uvedená na titulce (FAQ i strukturovaná data
pro Google), na stránce Měření zraku a na stránce Akce. Kdyby se podmínka někdy
změnila (třeba jen na určité typy skel), je potřeba upravit všechna tři místa.
