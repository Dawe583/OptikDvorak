import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import React from 'react';
import {LogoMark} from './LogoMark';

/* SDÍLENÝ STAVEBNICOVÝ KIT PRO REELS.

   Vznikl u kampaně pěti Reelů (čočky, děti před školou, multifokály,
   řidičská skla, benefity). Do té doby měl každý Reel vlastní kopii těch
   samých komponent — pět dalších kopií už nedávalo smysl.

   Starší Reels (ReelMereni, ReelNakup, ReelServis a spol.) se schválně
   NEPŘEPISOVALY: jsou vyrenderované a hotové, přepis by znamenal jen
   riziko, že se výstup nepatrně změní. Tenhle kit je pro nové věci.

   Vizuální jazyk je stejný jako u zbytku série: tmavé pozadí, krémový
   text, jedna žlutá jako signální barva, monospace „// " linky, zrno
   a vinětace. */

export const {fontFamily: DISPLAY} = loadBricolage('normal', {
  weights: ['800'],
  subsets: ['latin', 'latin-ext'],
});
export const {fontFamily: BODY} = loadInter('normal', {
  weights: ['500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
});
export const {fontFamily: MONO} = loadMono('normal', {
  weights: ['400'],
  subsets: ['latin', 'latin-ext'],
});

export const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  dim: 'rgba(244,241,234,0.5)',
};

/* Světlý, vzdušný grade — prodejna i lidé mají působit prosvětleně. */
export const GRADE = 'saturate(1.06) contrast(1.05) brightness(1.03)';

export const FPS = 60;
export const F = (s: number) => Math.round(s * FPS);
export const TRANS = F(0.4);

/* Fotky se vkládají jako výřez (object-fit: cover), zdroje se nikde neořezávají. */
export const PHOTO_H = 1215;

export const useScale = () => useVideoConfig().width / 1080;

/* ---------- Zrno ---------- */
const GRAIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.5"/></svg>'
  );

const Grain = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN}")`,
        backgroundPosition: `${(frame * 41) % 200}px ${(frame * 67) % 200}px`,
        opacity: 0.045,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

/* ---------- Reveal nadpisu po slovech ---------- */
export const HeadWords: React.FC<{
  words: string[];
  startAt: number;
  k: number;
  size: number;
  dot?: boolean;
  color?: string;
}> = ({words, startAt, k, size, dot = false, color = C.cream}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `0 ${16 * k}px`,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size * k,
        lineHeight: 1.02,
        letterSpacing: '-0.035em',
        color,
      }}
    >
      {words.map((w, i) => {
        const p = spring({frame: frame - startAt - i * 5, fps, config: {damping: 18, stiffness: 150}});
        const isLast = i === words.length - 1;
        return (
          <span key={`${w}-${i}`} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 6 * k}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>
              {w}
              {dot && isLast && <Dot k={k} />}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const Dot: React.FC<{k: number}> = ({k}) => (
  <span
    style={{
      display: 'inline-block',
      width: 15 * k,
      height: 15 * k,
      background: C.yellow,
      marginLeft: 6 * k,
      boxShadow: `0 0 ${18 * k}px ${C.yellow}`,
    }}
  />
);

/* ---------- Mono „// " linka ---------- */
export const Eyebrow: React.FC<{children: React.ReactNode; k: number; mb?: number; opacity?: number}> = ({
  children,
  k,
  mb = 24,
  opacity = 1,
}) => (
  <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: mb * k, opacity}}>
    {children}
  </div>
);

/* ---------- Textová scéna na tmavém podkladu ---------- */
export const Card: React.FC<{children: React.ReactNode; glowAt?: string; padBottom?: number}> = ({
  children,
  glowAt = '50% 42%',
  padBottom = 120,
}) => {
  const k = useScale();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{background: `radial-gradient(circle at ${glowAt}, rgba(255,228,92,0.075), transparent 58%)`}}
      />
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', paddingBottom: padBottom * k}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Odstavec, který doplní nadpis ---------- */
export const Note: React.FC<{children: React.ReactNode; at: number; k: number; size?: number; mt?: number}> = ({
  children,
  at,
  k,
  size = 40,
  mt = 44,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: F(0.9)});
  return (
    <div
      style={{
        marginTop: mt * k,
        maxWidth: 880 * k,
        fontFamily: BODY,
        fontWeight: 600,
        fontSize: size * k,
        lineHeight: 1.35,
        color: C.dim,
        opacity: p,
        transform: `translateY(${(1 - p) * 18 * k}px)`,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Drobná mono poznámka (disclaimery) ---------- */
export const Fineprint: React.FC<{lines: string[]; at: number; k: number; mt?: number}> = ({
  lines,
  at,
  k,
  mt = 40,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: F(0.9)});
  return (
    <div
      style={{
        marginTop: mt * k,
        fontFamily: MONO,
        fontSize: 23 * k,
        lineHeight: 1.5,
        color: 'rgba(244,241,234,0.46)',
        opacity: p,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
};

/* ---------- Číslovaná položka seznamu ---------- */
export const NumItem: React.FC<{n: number; at: number; text: string; k: number; size?: number}> = ({
  n,
  at,
  text,
  k,
  size = 45,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: F(0.6)});
  const lh = size * 1.24;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 28 * k,
        opacity: p,
        transform: `translateY(${(1 - p) * 24 * k}px)`,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 28 * k,
          color: C.yellowDeep,
          lineHeight: `${lh * k}px`,
          flex: '0 0 auto',
          width: 56 * k,
        }}
      >
        {`0${n}`}
      </span>
      <span
        style={{fontFamily: BODY, fontWeight: 600, fontSize: size * k, color: C.cream, lineHeight: `${lh * k}px`}}
      >
        {text}
      </span>
    </div>
  );
};

/* ---------- Velké číslo nabídky („1 + 1", „−30 %", „zdarma") ---------- */
export const OfferBadge: React.FC<{text: string; at: number; k: number; size?: number}> = ({
  text,
  at,
  k,
  size = 190,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 150}});
  const glow = interpolate(frame - at, [0, F(0.3), F(1.1)], [0, 1, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size * k,
        lineHeight: 1,
        letterSpacing: '-0.045em',
        color: C.yellow,
        opacity: Math.min(1, p * 1.4),
        transform: `scale(${0.82 + p * 0.18})`,
        textShadow: `0 0 ${(30 + 70 * glow) * k}px rgba(255,228,92,${0.25 + 0.35 * glow})`,
      }}
    >
      {text}
    </div>
  );
};

/* ---------- Přechod fotky do podkladu pod titulkem ---------- */
const PhotoScrim = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(7,7,7,0.50) 0%, rgba(7,7,7,0.06) 10%, rgba(7,7,7,0) 34%, rgba(7,7,7,0.55) ${
        ((PHOTO_H - 210) / 1920) * 100
      }%, rgba(7,7,7,0.97) ${(PHOTO_H / 1920) * 100}%, rgba(7,7,7,0.94) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/* ---------- Titulek pod fotkou ---------- */
export const Caption: React.FC<{mono: string; line1: string; line2: string; size?: number}> = ({
  mono,
  line1,
  line2,
  size = 84,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const k = useScale();

  const appear = spring({frame: frame - F(0.2), fps, config: {damping: 200}, durationInFrames: F(0.7)});
  const leave = interpolate(frame, [durationInFrames - F(0.62), durationInFrames - F(0.18)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const slide = (delay: number) => {
    const s = spring({frame: frame - F(0.2) - delay, fps, config: {damping: 200}, durationInFrames: F(0.7)});
    return {opacity: s * leave, transform: `translateY(${(1 - s) * 24 * k}px)`};
  };

  return (
    <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 440 * k}}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 26 * k,
          color: C.yellowDeep,
          marginBottom: 20 * k,
          opacity: appear * leave,
        }}
      >
        {mono}
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: size * k,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: C.cream,
          textShadow: `0 ${6 * k}px ${28 * k}px rgba(0,0,0,0.55)`,
        }}
      >
        <div style={slide(0)}>{line1}</div>
        <div style={slide(F(0.16))}>
          <span style={{color: C.yellow}}>{line2}</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- Fotka v horním pásu + Ken Burns, titulek pod ní ---------- */
export const PhotoShot: React.FC<{
  src: string;
  focus?: string;
  dir?: 'in' | 'out';
  mono: string;
  line1: string;
  line2: string;
  size?: number;
}> = ({src, focus = '50% 40%', dir = 'in', mono, line1, line2, size}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const k = useScale();

  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const scale = dir === 'in' ? 1 + p * 0.07 : 1.07 - p * 0.07;
  const url = staticFile(src);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Img
        src={url}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(70px) brightness(0.42) saturate(1.15)',
          transform: `scale(${1.3 * scale})`,
        }}
      />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: PHOTO_H * k, overflow: 'hidden'}}>
        <Img
          src={url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: focus,
            display: 'block',
            filter: GRADE,
            transform: `scale(${scale})`,
          }}
        />
      </div>
      <PhotoScrim />
      <Caption mono={mono} line1={line1} line2={line2} size={size} />
    </AbsoluteFill>
  );
};

/* ---------- Panorama prodejny: pomalá jízda ---------- */
export const PanoShot: React.FC<{
  src?: string;
  imgW?: number;
  imgH?: number;
  from?: number;
  to?: number;
  mono: string;
  line1: string;
  line2: string;
  size?: number;
}> = ({
  src = 'optika/pano.jpg',
  imgW = 8456,
  imgH = 2160,
  from = 120,
  to = 1780,
  mono,
  line1,
  line2,
  size,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const k = useScale();

  const s = (PHOTO_H * k) / imgH;
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const x = -(from * s + (to - from) * s * p);
  const url = staticFile(src);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Img
        src={url}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(70px) brightness(0.42) saturate(1.15)',
          transform: 'scale(1.3)',
        }}
      />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: PHOTO_H * k, overflow: 'hidden'}}>
        <Img
          src={url}
          style={{
            position: 'absolute',
            height: '100%',
            width: imgW * s,
            maxWidth: 'none',
            left: 0,
            transform: `translateX(${x}px)`,
            filter: GRADE,
          }}
        />
      </div>
      <PhotoScrim />
      <Caption mono={mono} line1={line1} line2={line2} size={size} />
    </AbsoluteFill>
  );
};

/* ---------- CTA / brandová karta ---------- */
export const Cta: React.FC<{
  claim1: string;
  claim2: string;
  button: string;
  notes: string[];
  claimSize?: number;
}> = ({claim1, claim2, button, notes, claimSize = 82}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const sp = (delay: number) =>
    spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: F(1.0)});

  const logo = sp(F(0.1));
  const claim = sp(F(0.45));
  const phone = sp(F(0.8));
  const addr = sp(F(1.1));
  const cta = sp(F(1.45));
  const note = sp(F(1.9));
  const pulse = 1 + Math.sin(frame / 14) * 0.012;
  const shine = interpolate(frame % F(2.6), [0, F(1.0)], [-30, 130], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 44%, rgba(255,228,92,0.08), transparent 60%)'}}
      />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 26 * k, padding: `0 ${90 * k}px`}}>
        <div style={{width: 340 * k, opacity: logo, transform: `scale(${logo})`}}>
          <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: claimSize * k,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.06,
            color: C.cream,
            opacity: claim,
            transform: `translateY(${(1 - claim) * 22 * k}px)`,
          }}
        >
          {claim1}
          <br />
          <span style={{color: C.yellow}}>{claim2}</span>
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 54 * k,
            letterSpacing: '0.01em',
            color: C.cream,
            opacity: phone,
            transform: `translateY(${(1 - phone) * 16 * k}px)`,
          }}
        >
          +420 702 194 246
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 30 * k,
            color: C.dim,
            textAlign: 'center',
            lineHeight: 1.55,
            opacity: addr,
            transform: `translateY(${(1 - addr) * 14 * k}px)`,
          }}
        >
          Optik Dvořák · Americká 325/23, Plzeň
          <br />
          Po–Čt 8:30–17:00 · Pá 8:30–16:00
          <br />
          rodinná oční optika od roku 1991
        </div>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginTop: 10 * k,
            background: C.yellow,
            color: C.ink900,
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 30 * k,
            padding: `${20 * k}px ${40 * k}px`,
            borderRadius: 999,
            opacity: cta,
            transform: `scale(${cta * pulse})`,
            boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
          }}
        >
          {button}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '22%',
              left: `${shine}%`,
              background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.7), transparent)',
              transform: 'skewX(-18deg)',
            }}
          />
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22 * k,
            color: 'rgba(244,241,234,0.42)',
            textAlign: 'center',
            lineHeight: 1.5,
            opacity: note,
          }}
        >
          {notes.map((n, i) => (
            <div key={i}>{n}</div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Celý Reel: scény, přechody, hlavička, zrno, hudba ---------- */
export type Scene = {d: number; el: React.ReactNode};

export const ReelShell: React.FC<{scenes: Scene[]; music: string; duration: number}> = ({
  scenes,
  music,
  duration,
}) => {
  const frame = useCurrentFrame();
  const k = useScale();

  const tCta = duration - scenes[scenes.length - 1].d;

  const vol = interpolate(frame, [0, F(1.2), duration - F(2.2), duration], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* hlavička zhasne nad brandovou kartou, kde už je logo */
  const hdr = interpolate(frame, [0, F(0.5), tCta, tCta + F(0.35)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile(music)} volume={vol} />

      <TransitionSeries>
        {scenes.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({durationInFrames: TRANS})}
              />
            )}
            <TransitionSeries.Sequence durationInFrames={s.d}>{s.el}</TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>

      <div
        style={{
          position: 'absolute',
          top: 72 * k,
          left: 90 * k,
          right: 90 * k,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO,
          fontSize: 24 * k,
          color: 'rgba(244,241,234,0.5)',
          opacity: hdr,
          pointerEvents: 'none',
        }}
      >
        <span>Optik Dvořák</span>
        <span>// Plzeň</span>
      </div>

      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

/* Součet délek scén minus překryvy přechodů. */
export const totalDuration = (durations: number[]) =>
  durations.reduce((a, b) => a + b, 0) - TRANS * (durations.length - 1);
