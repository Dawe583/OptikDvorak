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
import {LogoMark} from './LogoMark';

/* REEL — pomalá prohlídka optiky.
   Jen nejlepší reálné záběry prodejny: recepce s nápisem, stěny obrouček,
   konzultační stůl, panorama. Dlouhé prolínačky, pomalý Ken Burns,
   zakončeno brandovou kartou shodnou s ostatními Reels. */

const {fontFamily: DISPLAY} = loadBricolage('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});
const {fontFamily: BODY} = loadInter('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext']});
const {fontFamily: MONO} = loadMono('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  dim: 'rgba(244,241,234,0.5)',
};

/* Světlý, vzdušný grade — prodejna má působit prosvětleně, ne ponuře. */
const GRADE = 'saturate(1.06) contrast(1.05) brightness(1.03)';

export const FPS = 60;
const F = (s: number) => Math.round(s * FPS);

const SHOT = F(6);
const PANO = F(7);
const OUTRO = F(5);
const TRANS = F(1.2);

export const OPTIKA_DURATION = SHOT * 3 + PANO + OUTRO - TRANS * 4; // 1512 = 25,2 s

const useScale = () => useVideoConfig().width / 1080;

/* ---------- Zrno (jemná filmová textura, jako u ostatních Reels) ---------- */
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
        opacity: 0.04,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

/* ---------- Titulek: mono linka + dvouřádkový headline ---------- */
const Caption: React.FC<{mono: string; line1: string; line2: string}> = ({mono, line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const k = useScale();

  const appear = spring({frame: frame - F(0.7), fps, config: {damping: 200}, durationInFrames: F(1.4)});
  const leave = interpolate(frame, [durationInFrames - F(1.5), durationInFrames - F(0.4)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const o = appear * leave;

  const slide = (delay: number) => {
    const s = spring({frame: frame - F(0.7) - delay, fps, config: {damping: 200}, durationInFrames: F(1.4)});
    return {opacity: s * leave, transform: `translateY(${(1 - s) * 26 * k}px)`};
  };

  return (
    <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 250 * k}}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 26 * k,
          color: C.yellowDeep,
          marginBottom: 20 * k,
          opacity: o,
        }}
      >
        {mono}
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 100 * k,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: C.cream,
          textShadow: `0 ${6 * k}px ${28 * k}px rgba(0,0,0,0.55)`,
        }}
      >
        <div style={slide(0)}>{line1}</div>
        <div style={slide(F(0.18))}>
          <span style={{color: C.yellow}}>{line2}</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- Fotka na výšku: rozostřené pozadí + celý snímek uprostřed ---------- */
const PhotoShot: React.FC<{
  src: string;
  dir: 'in' | 'out';
  mono: string;
  line1: string;
  line2: string;
}> = ({src, dir, mono, line1, line2}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  /* velmi pomalý, plynule zrychlující i zpomalující pohyb */
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const scale = dir === 'in' ? 1 + p * 0.055 : 1.055 - p * 0.055;
  const url = staticFile(src);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      {/* rozostřené pozadí, aby byl celý snímek vidět a nic se neořízlo */}
      <Img
        src={url}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(60px) brightness(0.42) saturate(1.1)',
          transform: `scale(${1.25 * scale})`,
        }}
      />
      {/* ostrý snímek celý */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img
          src={url}
          style={{
            width: '100%',
            height: 'auto',
            filter: GRADE,
            transform: `scale(${scale})`,
            boxShadow: '0 40px 120px rgba(0,0,0,0.45)',
          }}
        />
      </AbsoluteFill>
      {/* scrim pod text */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7,7,7,0.30) 0%, transparent 28%, transparent 55%, rgba(7,7,7,0.88) 100%)',
        }}
      />
      <Caption mono={mono} line1={line1} line2={line2} />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- Panorama: pomalý horizontální pohyb kamerou ---------- */
const PanoShot: React.FC<{mono: string; line1: string; line2: string}> = ({mono, line1, line2}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, height} = useVideoConfig();

  /* Panorama 8456x2160. Jedeme jen přes hezkou část — od vchodu přes stěnu
     s obroučkami ke klenbě. Pravá strana (regály s doplňky, chodba) se nezabírá. */
  const s = height / 2160;
  const imgW = 8456 * s;
  const startLeft = 900 * s;
  const endLeft = 3100 * s;

  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const x = -(startLeft + (endLeft - startLeft) * p);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
      <Img
        src={staticFile('optika/pano.jpg')}
        style={{
          position: 'absolute',
          height: '100%',
          width: imgW,
          maxWidth: 'none',
          left: 0,
          transform: `translateX(${x}px)`,
          filter: GRADE,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7,7,7,0.30) 0%, transparent 30%, transparent 55%, rgba(7,7,7,0.88) 100%)',
        }}
      />
      <Caption mono={mono} line1={line1} line2={line2} />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- Outro: shodné s ostatními Reels (logo, claim, adresa, CTA) ---------- */
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const sp = (delay: number) =>
    spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: F(1.1)});

  const logo = sp(F(0.1));
  const claim = sp(F(0.5));
  const addr = sp(F(0.9));
  const cta = sp(F(1.3));
  const pulse = 1 + Math.sin(frame / 14) * 0.012;
  const shine = interpolate(frame % F(2.6), [0, F(1.0)], [-30, 130], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30 * k,
        padding: 90 * k,
      }}
    >
      <div style={{width: 320 * k, opacity: logo, transform: `scale(${logo})`}}>
        <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 84 * k,
          letterSpacing: '-0.03em',
          textAlign: 'center',
          lineHeight: 1.06,
          color: C.cream,
          opacity: claim,
          transform: `translateY(${(1 - claim) * 22 * k}px)`,
        }}
      >
        Vidět líp
        <br />
        <span style={{color: C.yellow}}>než včera.</span>
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 32 * k,
          color: C.dim,
          textAlign: 'center',
          lineHeight: 1.5,
          opacity: addr,
          transform: `translateY(${(1 - addr) * 18 * k}px)`,
        }}
      >
        Optik Dvořák · Americká 325/23, Plzeň
        <br />
        rodinná optika od 1991
      </div>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          marginTop: 14 * k,
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
        Zastav se za námi 👓
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
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- Reel ---------- */
export const ReelOptika: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  /* hudba tiše doznívá na kartě */
  const vol = interpolate(frame, [0, F(1.5), OPTIKA_DURATION - F(3), OPTIKA_DURATION], [0, 0.85, 0.85, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const trans = () => (
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANS})} />
  );

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('optika/music-optika.wav')} volume={vol} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SHOT}>
          <PhotoShot
            src="optika/opt-0690.jpg"
            dir="in"
            mono="// Americká 325/23, Plzeň"
            line1="Rodinná optika"
            line2="v srdci Plzně."
          />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={SHOT}>
          <PhotoShot
            src="optika/opt-0691.jpg"
            dir="out"
            mono="// od roku 1991"
            line1="Stovky obrouček"
            line2="na jednom místě."
          />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={SHOT}>
          <PhotoShot
            src="optika/opt-0692.jpg"
            dir="in"
            mono="// v klidu a bez spěchu"
            line1="Čas na výběr,"
            line2="který vydrží."
          />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={PANO}>
          <PanoShot mono="// celá prodejna" line1="Přijďte se" line2="podívat k nám." />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={OUTRO}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* hlavička */}
      <div
        style={{
          position: 'absolute',
          top: 60 * k,
          left: 90 * k,
          right: 90 * k,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO,
          fontSize: 24 * k,
          color: 'rgba(244,241,234,0.45)',
          pointerEvents: 'none',
        }}
      >
        <span>Optik Dvořák</span>
        <span>// Plzeň</span>
      </div>
    </AbsoluteFill>
  );
};
