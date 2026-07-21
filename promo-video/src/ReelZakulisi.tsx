import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {LogoMark} from './LogoMark';

/* REEL E — „Zákulisí: co tě čeká na měření zraku" — 24 s, z reálných záběrů z optiky
   (klipy natočila majitelka na telefon; originální zvuk odstraněn, hudba vygenerovaná).
   Krokový behind-the-scenes = nejvyšší dokoukanost (divák chce vidět celý proces).

   0.0–2.6 s  HÁČEK — vyšetřovna s přístrojem (sedí k textu), „Co tě čeká na měření zraku 👀"
   2.4–8.6 s  KROK 1 — měření zraku na přístroji, „Změříme ti zrak v klidu a přesně."
   8.4–14.4 s KROK 2 — zkušební obruba na míru, „Vybereme obrubu přesně na tvůj obličej."
   14.2–23.2 s KROK 3 — dlouhý průchod podél celé vitríny s obrubami (bez ořezu zoomem),
   „Stovky obrub — na každý typ i rozpočet."
   23.0–28.0 s OUTRO — logo + adresa + CTA „Objednej se na měření 👇"

   Zdroj klipů: public/clip-showroom.mp4 · clip-mereni.mp4 · clip-obruba.mp4
   Časy sekcí musí sedět s scripts/make-audio-zakulisi.mjs. */

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

/* Teplý filmový grade — sladí syrové telefonní klipy do brandu, ale drží detail */
const GRADE = 'saturate(1.06) contrast(1.09) brightness(0.96) sepia(0.10)';

export const FPS = 30;
export const ZAKULISI_DURATION = 840; // 28 s

const F = (s: number) => Math.round(s * FPS);

/* Nástupy sekcí (frame v celé kompozici) — sdíleno s make-audio-zakulisi.mjs */
const T_HOOK = F(0);
const T_S1 = F(2.4);
const T_S2 = F(8.4);
const T_S3 = F(14.2);
const T_OUT = F(23.0);

const useScale = () => useVideoConfig().width / 1080;

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
        opacity: 0.05,
        mixBlendMode: 'overlay',
      }}
    />
  );
};

/* ---------- Reveal nadpisu po slovech ---------- */
const HeadWords: React.FC<{words: string[]; startAt: number; k: number; size: number; dot?: boolean}> = ({
  words,
  startAt,
  k,
  size,
  dot = false,
}) => {
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
        color: C.cream,
      }}
    >
      {words.map((w, i) => {
        const p = spring({frame: frame - startAt - i * 4, fps, config: {damping: 18, stiffness: 160}});
        const isLast = i === words.length - 1;
        return (
          <span key={`${w}-${i}`} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 6 * k}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>
              {w}
              {dot && isLast && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 15 * k,
                    height: 15 * k,
                    background: C.yellow,
                    marginLeft: 5 * k,
                    boxShadow: `0 0 ${18 * k}px ${C.yellow}`,
                  }}
                />
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Vrstva videa s Ken Burns zoomem + gradem a scrimy ---------- */
const Clip: React.FC<{
  src: string;
  trimBefore: number;
  from: number;
  to: number;
  posY?: string;
  dur: number;
}> = ({src, trimBefore, from, to, posY = 'center', dur}) => {
  const frame = useCurrentFrame();
  const k = useScale();
  /* jemný, plynulý zoom — i statický záběr působí „filmově" */
  const scale = interpolate(frame, [0, dur], [from, to], {extrapolateRight: 'clamp'});
  /* fade in/out kraje sekce = plynulý střih */
  const op = interpolate(frame, [0, 8, dur - 8, dur], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{opacity: op, background: C.bg}}>
      <OffthreadVideo
        src={staticFile(src)}
        trimBefore={trimBefore}
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: posY,
          filter: GRADE,
          transform: `scale(${scale})`,
        }}
      />
      {/* scrim nahoře i dole — text zůstává čitelný */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7,7,7,0.62) 0%, transparent 24%, transparent 50%, rgba(7,7,7,0.90) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Číslo kroku (velká grafická značka) ---------- */
const StepBadge: React.FC<{n: string; k: number}> = ({n, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 6, fps, config: {damping: 14, stiffness: 200}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18 * k, opacity: p, transform: `translateY(${(1 - p) * 20 * k}px)`}}>
      <span
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 92 * k,
          lineHeight: 0.9,
          color: C.yellow,
          letterSpacing: '-0.04em',
          textShadow: `0 0 ${30 * k}px rgba(255,228,92,0.35)`,
        }}
      >
        {n}
      </span>
      <span style={{width: 46 * k, height: 3 * k, background: C.yellow, opacity: 0.7}} />
    </div>
  );
};

/* ---------- Krokový overlay (číslo + nadpis + mono popisek) ---------- */
const StepText: React.FC<{
  step: string;
  words1: string[];
  words2: string[];
  mono: string;
  k: number;
}> = ({step, words1, words2, mono, k}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{padding: `0 ${72 * k}px`, justifyContent: 'flex-end', paddingBottom: 300 * k}}>
      <div style={{marginBottom: 26 * k}}>
        <StepBadge n={step} k={k} />
      </div>
      <HeadWords words={words1} startAt={10} k={k} size={82} />
      <HeadWords words={words2} startAt={16} k={k} size={82} dot />
      <div
        style={{
          fontFamily: MONO,
          fontSize: 25 * k,
          color: C.yellowDeep,
          marginTop: 26 * k,
          opacity: interpolate(frame, [26, 38], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      >
        {mono}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Progres nahoře: 3 segmenty podle kroku ---------- */
const Progress: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const fill = (start: number, end: number) =>
    interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const segs = [fill(T_S1, T_S2), fill(T_S2, T_S3), fill(T_S3, T_OUT)];
  const show = interpolate(frame, [T_S1 - 8, T_S1, T_OUT, T_OUT + 8], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        top: 150 * k,
        left: 72 * k,
        right: 72 * k,
        display: 'flex',
        gap: 12 * k,
        opacity: show,
      }}
    >
      {segs.map((f, i) => (
        <div key={i} style={{flex: 1, height: 5 * k, borderRadius: 999, background: 'rgba(244,241,234,0.22)', overflow: 'hidden'}}>
          <div style={{width: `${f * 100}%`, height: '100%', background: C.yellow, borderRadius: 999}} />
        </div>
      ))}
    </div>
  );
};

/* ---------- Hlavní kompozice ---------- */
export const ReelZakulisi = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* žlutý záblesk na řezech mezi kroky = „cvak", drží rytmus */
  const flashAt = (t: number) =>
    interpolate(frame, [t - 2, t, t + 10], [0, 0.42, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flash = Math.max(flashAt(T_S1), flashAt(T_S2), flashAt(T_S3), flashAt(T_OUT));

  /* header (logo) — od 1. kroku do konce */
  const hdrOp = interpolate(frame, [T_S1 - 6, T_S1 + 6, T_OUT - 4, T_OUT + 4], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* HÁČEK text */
  const hookIn = spring({frame: frame - F(0.3), fps, config: {damping: 18, stiffness: 150}});
  const hookOp = interpolate(frame, [F(0.2), F(0.5), T_S1 - 6, T_S1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* OUTRO prvky */
  const outLogo = spring({frame: frame - T_OUT, fps, config: {damping: 13, stiffness: 130}});
  const outAddr = spring({frame: frame - T_OUT - 12, fps, config: {damping: 200}});
  const outCta = spring({frame: frame - T_OUT - 24, fps, config: {damping: 13, stiffness: 140}});
  const outPulse = 1 + Math.sin(Math.max(0, frame - T_OUT - 40) / 9) * 0.02;
  const replayOp = spring({frame: frame - T_OUT - 54, fps, config: {damping: 200}});

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music-zakulisi.wav')}
        volume={(f) =>
          interpolate(f, [0, 8, ZAKULISI_DURATION - 30, ZAKULISI_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* ---- HÁČEK: vyšetřovna s přístrojem — obraz sedí k textu o měření ---- */}
      <Sequence from={T_HOOK} durationInFrames={T_S1 + 6}>
        <Clip src="clip-mereni.mp4" trimBefore={F(14)} from={1.08} to={1.16} posY="center 30%" dur={T_S1 + 6} />
        <AbsoluteFill style={{padding: `0 ${72 * k}px`, justifyContent: 'center', opacity: hookOp}}>
          <div style={{fontFamily: MONO, fontSize: 25 * k, color: C.yellowDeep, marginBottom: 22 * k}}>
            // optika dvořák · plzeň
          </div>
          <div style={{transform: `translateY(${(1 - hookIn) * 24 * k}px)`}}>
            <HeadWords words={['Co', 'tě', 'čeká']} startAt={F(0.3)} k={k} size={104} />
            <HeadWords words={['na', 'měření']} startAt={F(0.5)} k={k} size={104} />
            <HeadWords words={['zraku', '👀']} startAt={F(0.7)} k={k} size={104} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ---- KROK 1: měření zraku ---- */}
      <Sequence from={T_S1} durationInFrames={T_S2 - T_S1 + 6}>
        <Clip src="clip-mereni.mp4" trimBefore={F(3)} from={1.08} to={1.2} posY="center 28%" dur={T_S2 - T_S1 + 6} />
        <StepText
          step="01"
          words1={['Změříme', 'ti', 'zrak']}
          words2={['v', 'klidu', 'a', 'přesně']}
          mono="// moderní přístroje, žádný spěch"
          k={k}
        />
      </Sequence>

      {/* ---- KROK 2: zkušební obruba ---- */}
      <Sequence from={T_S2} durationInFrames={T_S3 - T_S2 + 6}>
        <Clip src="clip-obruba.mp4" trimBefore={F(1.5)} from={1.1} to={1.22} posY="center 32%" dur={T_S3 - T_S2 + 6} />
        <StepText
          step="02"
          words1={['Vybereme', 'obrubu']}
          words2={['přesně', 'na', 'tebe']}
          mono="// zkušební obruba na míru"
          k={k}
        />
      </Sequence>

      {/* ---- KROK 3: dlouhý průchod podél celé vitríny — minimální zoom, ať je vidět celá ---- */}
      <Sequence from={T_S3} durationInFrames={T_OUT - T_S3 + 6}>
        <Clip src="clip-showroom.mp4" trimBefore={F(33)} from={1.0} to={1.05} dur={T_OUT - T_S3 + 6} />
        <StepText
          step="03"
          words1={['Stovky', 'obrub']}
          words2={['na', 'výběr']}
          mono="// na každý typ i rozpočet"
          k={k}
        />
      </Sequence>

      {/* ---- OUTRO ---- */}
      {frame >= T_OUT - 4 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 26 * k, padding: 72 * k}}>
          <div style={{width: 300 * k, opacity: outLogo, transform: `scale(${outLogo})`}}>
            <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 76 * k,
              letterSpacing: '-0.03em',
              textAlign: 'center',
              lineHeight: 1.06,
              color: C.cream,
              opacity: outAddr,
              transform: `translateY(${(1 - outAddr) * 20 * k}px)`,
            }}
          >
            Přijď se k nám
            <br />
            <span style={{color: C.yellow}}>podívat na svět ostře.</span>
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 31 * k,
              color: C.dim,
              textAlign: 'center',
              lineHeight: 1.5,
              opacity: outAddr,
            }}
          >
            Oční optika Dvořák · Americká 325/23, Plzeň
            <br />
            rodinná optika od 1991
          </div>
          <div
            style={{
              marginTop: 12 * k,
              background: C.yellow,
              color: C.ink900,
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 30 * k,
              padding: `${19 * k}px ${40 * k}px`,
              borderRadius: 999,
              opacity: outCta,
              transform: `scale(${outCta * outPulse})`,
              boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
            }}
          >
            Objednej se na měření 👇
          </div>
          <div style={{fontFamily: MONO, fontSize: 24 * k, color: C.dim, marginTop: 4 * k, opacity: replayOp}}>
            // napiš do DM „VIDĚT" a domluvíme termín
          </div>
        </AbsoluteFill>
      )}

      {/* ---- PROGRES + HLAVIČKA ---- */}
      <Progress k={k} />
      <div
        style={{
          position: 'absolute',
          top: 96 * k,
          left: 72 * k,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 30 * k,
          color: C.cream,
          opacity: hdrOp,
        }}
      >
        Optik <span style={{color: C.yellow}}>Dvořák</span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 102 * k,
          right: 72 * k,
          fontFamily: MONO,
          fontSize: 20 * k,
          color: C.dim,
          opacity: hdrOp,
        }}
      >
        // zákulisí
      </div>

      {/* žlutý záblesk na řezech */}
      <AbsoluteFill style={{background: C.yellow, opacity: flash, mixBlendMode: 'screen'}} />
      {/* vinětace */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,0.5) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
