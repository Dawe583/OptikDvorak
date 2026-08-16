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
import {ReelDeti, DETI_DURATION} from './ReelDeti';
import {ReelCocky, COCKY_DURATION} from './ReelCocky';
import {ReelMultifokaly, MULTI_DURATION} from './ReelMultifokaly';
import {ReelBenefity, BENEFITY_DURATION} from './ReelBenefity';

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
      {/* REEL — servis a opravy brýlí: servisní lístek se čtyřmi závadami,
          objednávat se nemusíte, běžné věci obvykle na počkání */}
      <Composition
        id="reel-servis"
        component={ReelServis}
        durationInFrames={SERVIS_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
      {/* REEL — děti a začátek školního roku: měření zraku, dětské obruby,
          bezplatné posouzení skel MiYOSMART. Vizuál: linkovaný sešit. */}
      <Composition
        id="reel-deti"
        component={ReelDeti}
        durationInFrames={DETI_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
      {/* REEL — kontaktní čočky: aplikace krok za krokem, zkušební pár
          zdarma. Vizuál: kruhové okno jako čočka s prstencem postupu. */}
      <Composition
        id="reel-cocky"
        component={ReelCocky}
        durationInFrames={COCKY_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
      {/* REEL — multifokální skla pro ty, kdo střídají dvoje brýle.
          Vizuál: dělicí čára na dálku / na čtení přes fotku. */}
      <Composition
        id="reel-multifokaly"
        component={ReelMultifokaly}
        durationInFrames={MULTI_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
      {/* REEL — benefitní poukázky Edenred, Pluxee, Up a Benefit Plus.
          Vizuál: karty programů rozdané jako z balíčku. */}
      <Composition
        id="reel-benefity"
        component={ReelBenefity}
        durationInFrames={BENEFITY_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
    </>
  );
};
