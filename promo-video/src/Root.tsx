import {Composition} from 'remotion';
import {Teaser, TEASER_DURATION, FPS} from './Teaser';
import {Vitrina, VITRINA_DURATION} from './Vitrina';
import {Ostreni, OSTRENI_DURATION} from './Ostreni';

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
      {/* Brandový teaser „Ostření" — metafora doostření, bez akcí */}
      <Composition
        id="optika-teaser"
        component={Ostreni}
        durationInFrames={OSTRENI_DURATION}
        fps={FPS}
        width={2160}
        height={3840}
      />
    </>
  );
};
