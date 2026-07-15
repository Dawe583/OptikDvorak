import {Composition} from 'remotion';
import {Promo, PROMO_DURATION, FPS} from './Promo';

export const RemotionRoot = () => {
  return (
    <>
      {/* Čtverec — feed FB/IG */}
      <Composition
        id="reklama-ctverec"
        component={Promo}
        durationInFrames={PROMO_DURATION}
        fps={FPS}
        width={1080}
        height={1080}
      />
      {/* Na výšku — stories/reels */}
      <Composition
        id="reklama-story"
        component={Promo}
        durationInFrames={PROMO_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
