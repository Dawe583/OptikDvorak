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
import {slide} from '@remotion/transitions/slide';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {LogoMark} from './LogoMark';

/* REEL — „Projdi si naši optiku".
   Druhá reklama složená z reálného materiálu, který nafotila/nasnímala majitelka
   (snímky prodejny opt-0690/0691/0692 a obě panoramata). Proti `reel-optika`
   (pomalá prohlídka, fotky v pásu na rozostřeném pozadí) je tenhle Reel
   udělaný jako opravdový vertikální střih:

   - háček v 1. sekundě (těsný záběr na stěnu obrouček + otázka),
   - dlouhá jízda kamerou napříč panoramatem od dveří ke stěně obrouček,
   - záběry jsou celoplošné výřezy (žádný pás s rozmazaným pozadím),
   - odjezd z detailu pultu na nápis OPTIK DVOŘÁK,
   - CTA vede jak do prodejny, tak na online 360° prohlídku.

   Formát: 2160×3840 (9:16) @ 60 fps, 20,5 s — v pásmu 15–25 s dle
   `docs/REKLAMA-A-SOCIAL-PLAN.md` (ČÁST 1). */

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
const GRADE = 'saturate(1.08) contrast(1.06) brightness(1.02)';

export const FPS = 60;
const F = (s: number) => Math.round(s * FPS);

/* Délky záběrů a prolínaček */
const S_HOOK = F(2.8);
const S_DOLLY = F(5.6);
const S_WALL = F(3.6);
const S_PULT = F(3.6);
const S_STUL = F(3.4);
const S_OUTRO = F(5.0);
const T_IN = F(0.5); // háček → jízda (slide, „vstup do prodejny")
const T_MID = F(0.7); // prolínačky mezi záběry
const T_END = F(0.9); // poslední záběr → brandová karta

export const PROHLIDKA_DURATION =
  S_HOOK + S_DOLLY + S_WALL + S_PULT + S_STUL + S_OUTRO - (T_IN + T_MID * 3 + T_END); // 1230 = 20,5 s

/* Nástupy jednotlivých záběrů v sekundách — musí sedět s scripts/make-audio-prohlidka.mjs */
export const CUES = {
  dolly: 2.3,
  wall: 7.2,
  pult: 10.1,
  stul: 13.0,
  outro: 15.5,
};

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
const Caption: React.FC<{mono: string; line1: string; line2: string; delay?: number}> = ({
  mono,
  line1,
  line2,
  delay = F(0.7),
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const k = useScale();

  const appear = spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: F(1.2)});
  const leave = interpolate(frame, [durationInFrames - F(1.4), durationInFrames - F(0.35)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const o = appear * leave;

  const slideIn = (extra: number) => {
    const s = spring({frame: frame - delay - extra, fps, config: {damping: 200}, durationInFrames: F(1.2)});
    return {opacity: s * leave, transform: `translateY(${(1 - s) * 26 * k}px)`};
  };

  return (
    <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 250 * k}}>
      <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 20 * k, opacity: o}}>
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
        <div style={slideIn(0)}>{line1}</div>
        <div style={slideIn(F(0.18))}>
          <span style={{color: C.yellow}}>{line2}</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- Celoplošný výřez z reálného snímku ----------
   Framing se zadává jako bod zájmu (fx, fy v 0–1 vůči zdroji) a zoom.
   Snímek se vždy zvětší tak, aby záběr vyplnil (cover), a pak se posune
   na bod zájmu; posun se přitom drží uvnitř snímku, takže nikdy nevznikne
   prázdný okraj. Když je bod zájmu při daném zoomu nedosažitelný (třeba stůl
   u spodní hrany fotky), přisadí se záběr na hranu snímku — proto stačí
   u „spodních" motivů zadat fy blízko 1. */
type Framing = {fx: number; fy: number; z: number};
type Source = {file: string; w: number; h: number};

const SRC: Record<string, Source> = {
  frames: {file: 'optika/opt-0691.jpg', w: 3240, h: 2430}, // stěna obrouček + pracovní stůl
  panoIn: {file: 'optika/pano-vstup.jpg', w: 8192, h: 1898}, // panorama od vchodu (z 360° prohlídky)
  wall: {file: 'optika/opt-0692.jpg', w: 3240, h: 2430}, // stěna obrouček + stůl s tulipány
  pult: {file: 'optika/opt-0690.jpg', w: 3240, h: 2430}, // recepce s nápisem OPTIK DVOŘÁK
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const Shot: React.FC<{
  src: Source;
  from: Framing;
  to: Framing;
  mono: string;
  line1: string;
  line2: string;
  delay?: number;
}> = ({src, from, to, mono, line1, line2, delay}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();

  /* velmi pomalý, plynule zrychlující i zpomalující pohyb */
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const mix = (a: number, b: number) => a + (b - a) * p;

  const cover = Math.max(width / src.w, height / src.h);
  const z = mix(from.z, to.z);
  const w = src.w * cover * z;
  const h = src.h * cover * z;
  const left = clamp(width / 2 - mix(from.fx, to.fx) * w, width - w, 0);
  const top = clamp(height / 2 - mix(from.fy, to.fy) * h, height - h, 0);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
      <Img
        src={staticFile(src.file)}
        style={{position: 'absolute', width: w, height: h, left, top, maxWidth: 'none', filter: GRADE}}
      />
      {/* scrim pod text + jemné ztmavení horní hrany kvůli hlavičce.
          Prodejna je světlá, takže spodní část musí být tmavší, ať jsou
          titulky čitelné i na mobilu na plném slunci. */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7,7,7,0.36) 0%, transparent 20%, transparent 44%, rgba(7,7,7,0.58) 74%, rgba(7,7,7,0.93) 100%)',
        }}
      />
      {/* vinětace — dává hloubku, ať to nepůsobí jako fotka z katalogu */}
      <AbsoluteFill
        style={{background: 'radial-gradient(115% 78% at 50% 44%, transparent 52%, rgba(7,7,7,0.42) 100%)'}}
      />
      <Caption mono={mono} line1={line1} line2={line2} delay={delay} />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- Outro: brandová karta + dvě cesty ke konverzi ---------- */
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
  const tour = sp(F(1.9));
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
        Přijď si je zkusit 👓
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
      {/* druhá cesta ke konverzi — 360° prohlídka na webu */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 25 * k,
          color: 'rgba(244,241,234,0.42)',
          textAlign: 'center',
          opacity: tour,
        }}
      >
        // celou prodejnu projdeš i online
        <br />
        optikdvorak.cz/prohlidka
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- Reel ---------- */
export const ReelProhlidka: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  /* hudba tiše doznívá na kartě */
  const vol = interpolate(
    frame,
    [0, F(1.2), PROHLIDKA_DURATION - F(2.6), PROHLIDKA_DURATION],
    [0, 0.85, 0.85, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const dissolve = (dur: number) => (
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: dur})} />
  );

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-prohlidka.wav')} volume={vol} />

      <TransitionSeries>
        {/* 1) HÁČEK — těsně na stěnu obrouček, text hned v 1. sekundě */}
        <TransitionSeries.Sequence durationInFrames={S_HOOK}>
          <Shot
            src={SRC.frames}
            from={{fx: 0.3, fy: 0.51, z: 1.45}}
            to={{fx: 0.325, fy: 0.5, z: 1.28}}
            delay={F(0.15)}
            mono="// oční optika v Plzni"
            line1="Jaké brýle ti"
            line2="vlastně sednou?"
          />
        </TransitionSeries.Sequence>

        {/* slide = jako by kamera vešla dovnitř */}
        <TransitionSeries.Transition
          presentation={slide({direction: 'from-right'})}
          timing={linearTiming({durationInFrames: T_IN})}
        />

        {/* 2) JÍZDA — od vchodových dveří ke stěně obrouček (panorama) */}
        <TransitionSeries.Sequence durationInFrames={S_DOLLY}>
          <Shot
            src={SRC.panoIn}
            from={{fx: 0.134, fy: 0.5, z: 1.0}}
            to={{fx: 0.464, fy: 0.5, z: 1.05}}
            mono="// Americká 325/23, Plzeň"
            line1="Tak se u nás"
            line2="projdi."
          />
        </TransitionSeries.Sequence>
        {dissolve(T_MID)}

        {/* 3) STĚNA OBROUČEK — pomalý odjezd, ať je vidět, kolik je z čeho vybírat */}
        <TransitionSeries.Sequence durationInFrames={S_WALL}>
          <Shot
            src={SRC.wall}
            from={{fx: 0.2, fy: 0.5, z: 1.32}}
            to={{fx: 0.24, fy: 0.5, z: 1.12}}
            mono="// vybírej v klidu"
            line1="Stěny obrouček,"
            line2="žádný spěch."
          />
        </TransitionSeries.Sequence>
        {dissolve(T_MID)}

        {/* 4) PULT — odjezd z detailu brýlí na pultu na nápis OPTIK DVOŘÁK */}
        <TransitionSeries.Sequence durationInFrames={S_PULT}>
          <Shot
            src={SRC.pult}
            from={{fx: 0.68, fy: 0.58, z: 1.42}}
            to={{fx: 0.42, fy: 0.5, z: 1.03}}
            mono="// rodinná optika od 1991"
            line1="Poradíme ti"
            line2="osobně."
          />
        </TransitionSeries.Sequence>
        {dissolve(T_MID)}

        {/* 5) STŮL NA VÝBĚR — pomalý příjezd k tulipánům a zrcátku (fy u spodní hrany) */}
        <TransitionSeries.Sequence durationInFrames={S_STUL}>
          <Shot
            src={SRC.wall}
            from={{fx: 0.45, fy: 0.97, z: 1.28}}
            to={{fx: 0.455, fy: 0.97, z: 1.45}}
            mono="// místo na výběr brýlí"
            line1="Sedni si"
            line2="a zkoušej."
          />
        </TransitionSeries.Sequence>
        {dissolve(T_END)}

        {/* 6) BRANDOVÁ KARTA */}
        <TransitionSeries.Sequence durationInFrames={S_OUTRO}>
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
