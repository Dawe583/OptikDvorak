import {
  AbsoluteFill,
  Audio,
  Img,
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

/* REEL B — Před/po „Wow moment nasazení" — 15 s, shot-by-shot dle
   docs/REKLAMA-A-SOCIAL-PLAN.md (ČÁST 4, REEL B):
   0–2 s  háček: rozmazaný svět, „Počkej na tu sekundu 3…"
   2–5 s  odpočet 3…2…1 (napětí, svět pořád rozmazaný)
   5–8 s  nasazení brýlí → svět se ostře ZAOSTŘÍ (cvak = wow moment)
   8–12 s tvář, upřímný úsměv — „Takhle má vypadat svět."
   12–15 s logo + adresa + CTA „Pošli někomu, kdo mhouří"
   Retence: odpočet + snap z blur na ostro = divák si pustí znovu (nejsilnější signál).
   Stock fotky = placeholder, majitelka je nahradí reálnými záběry z optiky. */

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

const GRADE = 'saturate(0.85) contrast(1.12) brightness(0.82) sepia(0.22)';

export const FPS = 60;
export const PREDPO_DURATION = 900; // 15 s

const F = (s: number) => Math.round(s * FPS);
/* Klíčové okamžiky — musí sedět s scripts/make-audio-predpo.mjs */
const T_HOOK = F(0.3);
const T_C3 = F(2.0);
const T_C2 = F(2.9);
const T_C1 = F(3.8);
const T_CLICK = F(4.8); // cvak = moment zaostření
const T_FACE = F(8.0);
const T_OUT = F(11.8);

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
        opacity: 0.045,
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
        gap: `0 ${18 * k}px`,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size * k,
        lineHeight: 1.02,
        letterSpacing: '-0.035em',
        color: C.cream,
      }}
    >
      {words.map((w, i) => {
        const p = spring({frame: frame - startAt - i * 5, fps, config: {damping: 18, stiffness: 150}});
        const isLast = i === words.length - 1;
        return (
          <span key={`${w}-${i}`} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 6 * k}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>
              {w}
              {dot && isLast && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 16 * k,
                    height: 16 * k,
                    background: C.yellow,
                    marginLeft: 6 * k,
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

/* ---------- Jedno číslo odpočtu: napunčovaný scale-in ---------- */
const CountNum: React.FC<{n: number; at: number; k: number}> = ({n, at, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 11, stiffness: 220}});
  const op = interpolate(frame, [at, at + 4, at + F(0.72) - 6, at + F(0.72)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0) return null;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: op}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 620 * k,
          lineHeight: 0.9,
          color: C.cream,
          transform: `scale(${1.5 - p * 0.5})`,
          textShadow: `0 0 ${80 * k}px rgba(0,0,0,0.7)`,
          letterSpacing: '-0.04em',
        }}
      >
        {n}
      </div>
      <div
        style={{
          position: 'absolute',
          width: 300 * k,
          height: 300 * k,
          borderRadius: '50%',
          border: `${3 * k}px solid ${C.yellow}`,
          opacity: (1 - p) * 0.6,
          transform: `scale(${0.6 + p * 1.4})`,
        }}
      />
    </AbsoluteFill>
  );
};

export const ReelPredPo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* --- Svět: blur → ostro přesně na cvak (jádro před/po) --- */
  const sharpen = spring({frame: frame - T_CLICK, fps, config: {damping: 30, stiffness: 90}});
  const worldBlur = (1 - sharpen) * 54;
  const worldScale = 1.16 - sharpen * 0.1;
  const worldOp = interpolate(frame, [0, 12, T_FACE - 10, T_FACE], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* háček „Počkej na tu sekundu 3…" — mizí, když najede odpočet */
  const hookOp = interpolate(frame, [T_HOOK, T_HOOK + 12, T_C3 - 8, T_C3], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* cvak: žlutý záblesk + „ostrost 100 %" */
  const clickFlash = interpolate(frame, [T_CLICK - 2, T_CLICK, T_CLICK + 16], [0, 0.62, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sharpLabel = spring({frame: frame - T_CLICK - 16, fps, config: {damping: 200}});

  /* tvář + payoff „Takhle má vypadat svět." */
  const faceOp = interpolate(frame, [T_FACE, T_FACE + 12, T_OUT - 10, T_OUT], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const faceZoom =
    1.02 +
    interpolate(frame, [T_FACE, T_OUT], [0, 0.07], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* outro */
  const outLogo = spring({frame: frame - T_OUT, fps, config: {damping: 13, stiffness: 130}});
  const outAddr = spring({frame: frame - T_OUT - 16, fps, config: {damping: 200}});
  const outCta = spring({frame: frame - T_OUT - 28, fps, config: {damping: 13, stiffness: 140}});
  const outPulse = 1 + Math.sin(Math.max(0, frame - T_OUT - 44) / 10) * 0.02;
  const replayOp = spring({frame: frame - T_OUT - 60, fps, config: {damping: 200}});

  const hdrOp = interpolate(frame, [T_CLICK, T_CLICK + 14, T_OUT, T_OUT + 10], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music-predpo.wav')}
        volume={(f) =>
          interpolate(f, [0, 8, PREDPO_DURATION - 30, PREDPO_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* SVĚT — rozmazaný → ostrý (drží od začátku po tvář) */}
      {frame < T_FACE + 6 && (
        <AbsoluteFill style={{opacity: worldOp}}>
          <Img
            src={staticFile('ig-editorial.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: `${GRADE} blur(${worldBlur * k}px)`,
              transform: `scale(${worldScale})`,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                'linear-gradient(180deg, rgba(7,7,7,0.55) 0%, transparent 30%, transparent 62%, rgba(7,7,7,0.72) 100%)',
            }}
          />

          {/* HÁČEK */}
          <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', opacity: hookOp}}>
            <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 22 * k}}>
              // mhouříš oči? počkej…
            </div>
            <HeadWords words={['Počkej', 'na', 'tu']} startAt={T_HOOK} k={k} size={122} />
            <HeadWords words={['sekundu', '3…']} startAt={T_HOOK + 8} k={k} size={122} dot />
          </AbsoluteFill>

          {/* „ostrost 100 %" po zaostření */}
          <div
            style={{
              position: 'absolute',
              left: 90 * k,
              bottom: 250 * k,
              fontFamily: MONO,
              fontSize: 26 * k,
              color: C.yellowDeep,
              opacity: sharpLabel,
              transform: `translateY(${(1 - sharpLabel) * 14 * k}px)`,
            }}
          >
            // ostrost: 100 %
          </div>
        </AbsoluteFill>
      )}

      {/* ODPOČET 3…2…1 */}
      <CountNum n={3} at={T_C3} k={k} />
      <CountNum n={2} at={T_C2} k={k} />
      <CountNum n={1} at={T_C1} k={k} />

      {/* TVÁŘ — payoff */}
      {frame >= T_FACE - 6 && frame < T_OUT + 6 && (
        <AbsoluteFill style={{opacity: faceOp}}>
          <Img
            src={staticFile('stock-portrait.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: GRADE,
              transform: `scale(${faceZoom})`,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                'linear-gradient(180deg, rgba(7,7,7,0.45) 0%, transparent 34%, transparent 55%, rgba(7,7,7,0.85) 100%)',
            }}
          />
          <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 250 * k}}>
            <HeadWords words={['Takhle', 'má']} startAt={T_FACE + 12} k={k} size={110} />
            <HeadWords words={['vypadat', 'svět.']} startAt={T_FACE + 20} k={k} size={110} dot />
          </div>
        </AbsoluteFill>
      )}

      {/* OUTRO */}
      {frame >= T_OUT - 4 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30 * k, padding: 90 * k}}>
          <div style={{width: 320 * k, opacity: outLogo, transform: `scale(${outLogo})`}}>
            <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 80 * k,
              letterSpacing: '-0.03em',
              textAlign: 'center',
              lineHeight: 1.06,
              color: C.cream,
              opacity: outAddr,
              transform: `translateY(${(1 - outAddr) * 22 * k}px)`,
            }}
          >
            Kdy jsi byl naposled
            <br />
            <span style={{color: C.yellow}}>na měření zraku?</span>
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 32 * k,
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
              marginTop: 14 * k,
              background: C.yellow,
              color: C.ink900,
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 30 * k,
              padding: `${20 * k}px ${40 * k}px`,
              borderRadius: 999,
              opacity: outCta,
              transform: `scale(${outCta * outPulse})`,
              boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
            }}
          >
            Pošli někomu, kdo mhouří 👇
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 24 * k,
              color: C.dim,
              marginTop: 6 * k,
              opacity: replayOp,
            }}
          >
            // pusť si ten moment znovu 🔁
          </div>
        </AbsoluteFill>
      )}

      {/* hlavička */}
      <div
        style={{
          position: 'absolute',
          top: 96 * k,
          left: 90 * k,
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
          right: 90 * k,
          fontFamily: MONO,
          fontSize: 20 * k,
          color: C.dim,
          opacity: hdrOp,
        }}
      >
        // před / po
      </div>

      {/* záblesk cvaknutí */}
      <AbsoluteFill style={{background: C.yellow, opacity: clickFlash, mixBlendMode: 'screen'}} />
      {/* vinětace */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
