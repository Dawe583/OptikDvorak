import {Composition, Still} from 'remotion';
import {CoverVidetLip} from './CoverVidetLip';
import {Teaser, TEASER_DURATION, FPS} from './Teaser';
import {Vitrina, VITRINA_DURATION} from './Vitrina';
import {ReelSobota, SOBOTA_DURATION} from './ReelSobota';
import {ReelEdukace, EDUKACE_DURATION} from './ReelEdukace';
import {ReelVidetLip, VIDETLIP_DURATION} from './ReelVidetLip';
import {ReelPredPo, PREDPO_DURATION} from './ReelPredPo';
import {ReelRodina, RODINA_DURATION} from './ReelRodina';
import {ReelSignaly, SIGNALY_DURATION} from './ReelSignaly';

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
      {/* REEL E — Sebe-diagnostický checklist „Zaškrtni si příznaky" → měření zraku */}
      <Composition
        id="reel-signaly"
        component={ReelSignaly}
        durationInFrames={SIGNALY_DURATION}
        fps={FPS}
        width={2160}
        height={3840}
      />
    </>
  );
};
