import {Composition} from 'remotion';
import {Teaser, TEASER_DURATION, FPS} from './Teaser';
import {Vitrina, VITRINA_DURATION} from './Vitrina';
import {ReelSobota, SOBOTA_DURATION} from './ReelSobota';
import {ReelEdukace, EDUKACE_DURATION} from './ReelEdukace';

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
      {/* Edukativní Reel — 3 věci při výběru brýlí, CTA ulož si */}
      <Composition
        id="reel-edukace"
        component={ReelEdukace}
        durationInFrames={EDUKACE_DURATION}
        fps={FPS}
        width={2160}
        height={3840}
      />
    </>
  );
};
