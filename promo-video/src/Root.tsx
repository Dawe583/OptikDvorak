import {Composition, Still} from 'remotion';
import {CoverVidetLip} from './CoverVidetLip';
import {Teaser, TEASER_DURATION, FPS} from './Teaser';
import {Vitrina, VITRINA_DURATION} from './Vitrina';
import {ReelSobota, SOBOTA_DURATION} from './ReelSobota';
import {ReelEdukace, EDUKACE_DURATION} from './ReelEdukace';
import {ReelVidetLip, VIDETLIP_DURATION} from './ReelVidetLip';
import {ReelPredPo, PREDPO_DURATION} from './ReelPredPo';
import {ReelRodina, RODINA_DURATION} from './ReelRodina';
import {ReelOptika, OPTIKA_DURATION} from './ReelOptika';
import {ReelMereni, MERENI_DURATION} from './ReelMereni';
import {ReelNakup, NAKUP_DURATION} from './ReelNakup';
import {ReelServis, SERVIS_DURATION} from './ReelServis';
import {CoverServis} from './CoverServis';
import {ReelCocky, COCKY_DURATION} from './ReelCocky';
import {ReelSkola, SKOLA_DURATION} from './ReelSkola';
import {ReelMultifokal, MULTIFOKAL_DURATION} from './ReelMultifokal';
import {ReelRidic, RIDIC_DURATION} from './ReelRidic';
import {ReelBenefity, BENEFITY_DURATION} from './ReelBenefity';
import {ReelServisListek, SERVIS_LISTEK_DURATION} from './ReelServisListek';
import {ReelDeti, DETI_DURATION} from './ReelDeti';
import {ReelCockyKruh, COCKY_KRUH_DURATION} from './ReelCockyKruh';
import {ReelMultifokalyDelic, MULTI_DELIC_DURATION} from './ReelMultifokalyDelic';
import {ReelBenefityKarty, BENEFITY_KARTY_DURATION} from './ReelBenefityKarty';
import {ReelRecenze, RECENZE_DURATION} from './ReelRecenze';
import {ReelSlunecni, SLUNECNI_DURATION} from './ReelSlunecni';
import {ReelVyrobci, VYROBCI_DURATION} from './ReelVyrobci';
import {ReelPoctivost, POCTIVOST_DURATION} from './ReelPoctivost';

/* Obě kompozice: 4K na výšku (9:16) — IG/FB Reels, Stories, TikTok */
export const RemotionRoot = () => {
  return (
    <>
      {/* Výkonnostní reklama — akce a nabídky */}
      <Composition
        id="reklama"
        component={Teaser}
        durationInFrames={TEASER_DURATION}
        fps={FPS}
        width={2160}
        height={3840}
      />
      {/* Brandový teaser pro IG — prezentace optiky, bez akcí */}
      <Composition
        id="ig-teaser"
        component={Vitrina}
        durationInFrames={VITRINA_DURATION}
        fps={FPS}
        width={2160}
        height={3840}
      />
      {/* Konverzní Reel na sobotu — víkend zavřeno, CTA objednat online */}
      <Composition
        id="reel-sobota"
        component={ReelSobota}
        durationInFrames={SOBOTA_DURATION}
        fps={FPS}
        width={2160}
        height={3840}
      />
      {/* Vlajkový teaser „Vidět líp než včera" — pondělní Reel dle plánu (ČÁST 2) */}
      <Composition
        id="reel-videt-lip"
        component={ReelVidetLip}
        durationInFrames={VIDETLIP_DURATION}
        fps={FPS}
        width={2160}
        height={3840}
      />
      {/* Náhledovka (cover) k vlajkovému teaseru */}
      <Still id="cover-videt-lip" component={CoverVidetLip} width={2160} height={3840} />
      {/* Edukativní Reel — 3 věci při výběru brýlí, CTA ulož si */}
      <Composition
        id="reel-edukace"
        component={ReelEdukace}
        durationInFrames={EDUKACE_DURATION}
        fps={FPS}
        width={2160}
        height={3840}
      />
      {/* REEL B — Před/po „wow moment nasazení", odpočet + zaostření (Pá dle plánu) */}
      <Composition
        id="reel-pred-po"
        component={ReelPredPo}
        durationInFrames={PREDPO_DURATION}
        fps={FPS}
        width={2160}
        height={3840}
      />
      {/* REEL D — Rodina od 1991, count-up 1991→2026 (víkend dle plánu) */}
      <Composition
        id="reel-rodina"
        component={ReelRodina}
        durationInFrames={RODINA_DURATION}
        fps={FPS}
        width={2160}
        height={3840}
      />
      {/* Pomalá prohlídka optiky — jen nejlepší reálné záběry prodejny */}
      <Composition
        id="reel-optika"
        component={ReelOptika}
        durationInFrames={OPTIKA_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
      {/* REEL — nalákání na měření zraku (30–45 min, na prodejně, ke kompletním brýlím zdarma) */}
      <Composition
        id="reel-mereni"
        component={ReelMereni}
        durationInFrames={MERENI_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
      {/* REEL — celá cesta k novým brýlím: měření → obruba → brýlová skla → seřízení a servis */}
      <Composition
        id="reel-nakup"
        component={ReelNakup}
        durationInFrames={NAKUP_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
      {/* REEL — servis a opravy: „Nekupujte nové brýle." Běžné věci obvykle na počkání. */}
      <Composition
        id="reel-servis"
        component={ReelServis}
        durationInFrames={SERVIS_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
      {/* Náhledovka (cover) k Reelu o servisu */}
      <Still id="cover-servis" component={CoverServis} width={2160} height={3840} />

      {/* ---- Kampaň pěti Reelů: pět různých důvodů přijít na prodejnu ---- */}
      {/* 1/5 — kontaktní čočky, zkušební pár zdarma */}
      <Composition id="reel-cocky" component={ReelCocky} durationInFrames={COCKY_DURATION} fps={60} width={2160} height={3840} />
      {/* 2/5 — děti před začátkem školy (sezónní, srpen a začátek září) */}
      <Composition id="reel-skola" component={ReelSkola} durationInFrames={SKOLA_DURATION} fps={60} width={2160} height={3840} />
      {/* 3/5 — multifokální skla 1 + 1 */}
      <Composition id="reel-multifokal" component={ReelMultifokal} durationInFrames={MULTIFOKAL_DURATION} fps={60} width={2160} height={3840} />
      {/* 4/5 — brýlová skla pro řidiče −30 % */}
      <Composition id="reel-ridic" component={ReelRidic} durationInFrames={RIDIC_DURATION} fps={60} width={2160} height={3840} />
      {/* 5/5 — benefitní poukázky */}
      <Composition id="reel-benefity" component={ReelBenefity} durationInFrames={BENEFITY_DURATION} fps={60} width={2160} height={3840} />

      {/* ---- Druhá řada: stejná témata z jiného úhlu (edukace místo nabídky) ----
           Vznikla souběžně s kampaní výš. Kampaň vede konkrétní nabídkou
           („zdarma", „1 + 1", „−30 %"), tahle řada procesem a vysvětlením,
           a každý díl má vlastní vizuální podpis. Nepouštějte dvojici na
           stejné téma ve stejném týdnu — viz docs/PREHLED-VSECH-REELS.md. */}
      {/* servisní lístek — čtyři závady, které se odškrtávají */}
      <Composition id="reel-servis-listek" component={ReelServisListek} durationInFrames={SERVIS_LISTEK_DURATION} fps={60} width={2160} height={3840} />
      {/* linkovaný sešit — děti a začátek školního roku */}
      <Composition id="reel-deti" component={ReelDeti} durationInFrames={DETI_DURATION} fps={60} width={2160} height={3840} />
      {/* kruhové okno jako čočka — aplikace kontaktních čoček */}
      <Composition id="reel-cocky-kruh" component={ReelCockyKruh} durationInFrames={COCKY_KRUH_DURATION} fps={60} width={2160} height={3840} />
      {/* dělicí čára na dálku / na čtení — multifokály */}
      <Composition id="reel-multifokaly-delic" component={ReelMultifokalyDelic} durationInFrames={MULTI_DELIC_DURATION} fps={60} width={2160} height={3840} />
      {/* karty programů — benefitní poukázky */}
      <Composition id="reel-benefity-karty" component={ReelBenefityKarty} durationInFrames={BENEFITY_KARTY_DURATION} fps={60} width={2160} height={3840} />

      {/* ---- Témata, která nemá žádná z předchozích řad ----
           Silnější háček: první slovo nadpisu je čitelné na nultém snímku,
           hlavička s logem nastupuje až s tělem videa. Viz HookBlock v kit.tsx. */}
      {/* skutečné recenze z Googlu — typografie místo fotek */}
      <Composition id="reel-recenze" component={ReelRecenze} durationInFrames={RECENZE_DURATION} fps={60} width={2160} height={3840} />
      {/* sluneční brýle a klip — klip sjede přes okno a ztmaví obraz */}
      <Composition id="reel-slunecni" component={ReelSlunecni} durationInFrames={SLUNECNI_DURATION} fps={60} width={2160} height={3840} />
      {/* odkud jsou brýlová skla — jména výrobců jako titulky */}
      <Composition id="reel-vyrobci" component={ReelVyrobci} durationInFrames={VYROBCI_DURATION} fps={60} width={2160} height={3840} />
      {/* „Nebudeme vám nic nutit" — jedna věta na prázdné ploše */}
      <Composition id="reel-poctivost" component={ReelPoctivost} durationInFrames={POCTIVOST_DURATION} fps={60} width={2160} height={3840} />
    </>
  );
};
