import {Composition} from 'remotion';
import {Teaser, TEASER_DURATION, FPS} from './Teaser';

export const RemotionRoot = () => {
  return (
    /* 4K na výšku (9:16) — IG/FB Reels, Stories, TikTok */
    <Composition
      id="reklama"
      component={Teaser}
      durationInFrames={TEASER_DURATION}
      fps={FPS}
      width={2160}
      height={3840}
    />
  );
};
