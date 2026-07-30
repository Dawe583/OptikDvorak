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
import {ReelProhlidka, PROHLIDKA_DURATION} from './ReelProhlidka';
import {ReelLetniAkce, LETNI_AKCE_DURATION, LETNI_AKCE_DEFAULTS} from './ReelLetniAkce';
import {PostLetniAkce, CoverLetniAkce} from './KartaLetniAkce';
import {ReelSkola, SKOLA_DURATION} from './ReelSkola';
import {ReelServis, SERVIS_DURATION, SERVIS_DEFAULTS} from './ReelServis';

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
      {/* REEL „Projdi si naši optiku" — vertikální střih z reálných záběrů:
          háček, jízda kamerou od dveří, odjezd na nápis, CTA do prodejny i na 360° prohlídku */}
      <Composition
        id="reel-prohlidka"
        component={ReelProhlidka}
        durationInFrames={PROHLIDKA_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
      {/* LETNÍ AKCE „Letní dvojka" — celá vygenerovaná reklama (bez fotek a záběrů).
          Sleva i platnost jdou přes props:
          npx remotion render reel-letni-akce --props='{"sleva":40,"platnostDo":"31. 10. 2026"}' */}
      <Composition
        id="reel-letni-akce"
        component={ReelLetniAkce}
        durationInFrames={LETNI_AKCE_DURATION}
        fps={60}
        width={2160}
        height={3840}
        defaultProps={LETNI_AKCE_DEFAULTS}
      />
      {/* Příspěvek do feedu (4:5) a náhledovka Reelu / Story (9:16) ke stejné akci */}
      <Still
        id="post-letni-akce"
        component={PostLetniAkce}
        width={2160}
        height={2700}
        defaultProps={LETNI_AKCE_DEFAULTS}
      />
      <Still
        id="cover-letni-akce"
        component={CoverLetniAkce}
        width={2160}
        height={3840}
        defaultProps={LETNI_AKCE_DEFAULTS}
      />
      {/* ZPÁTKY DO ŠKOLY — druhý pilíř letní kampaně. Začíná jako čtecí tabule,
          pointa je v nejmenším řádku. Také celé vygenerované, bez fotek. */}
      <Composition
        id="reel-skola"
        component={ReelSkola}
        durationInFrames={SKOLA_DURATION}
        fps={60}
        width={2160}
        height={3840}
      />
      {/* SERVIS NA POČKÁNÍ — reálné snímky prodejny, ale v duotónu, s tvrdými
          střihy a fotkou v masce písma. Věta o ceně servisu jde přes props:
          npx remotion render reel-servis --props='{"bonus":"Letní servis zdarma."}' */}
      <Composition
        id="reel-servis"
        component={ReelServis}
        durationInFrames={SERVIS_DURATION}
        fps={60}
        width={2160}
        height={3840}
        defaultProps={SERVIS_DEFAULTS}
      />
    </>
  );
};
