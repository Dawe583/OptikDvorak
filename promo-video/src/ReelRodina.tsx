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
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {LogoMark} from './LogoMark';

/* REEL D — Lidský příběh „Rodina od 1991" — 18 s, shot-by-shot dle
   docs/REKLAMA-A-SOCIAL-PLAN.md (ČÁST 4, REEL D):
   0–3 s   háček: „Tady stojíme od roku 1991." + obří letopočet
   3–5 s   count-up 1991 → 2026 = „35 let" (emoční kotva, sdílitelné)
   5–10 s  „Tři desetiletí. Jedna rodina. Jedno místo." (teplé záběry)
   10–15 s „Neprodáváme brýle. Staráme se o váš zrak." (emoce, žlutý akcent)
   15–18 s logo + adresa + CTA „Označ, s kým k nám chodíš"
   Tón: teplý, nostalgický, prémiový. Sdílení/označení = dosah dle researche.
   Stock fotky = placeholder, majitelka je nahradí reálnými záběry z optiky
   (ideálně stará fotka provozovny z 1991 → public/foto-1991.jpg). */

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

/* Teplejší grade než ostatní reely — nostalgie */
const GRADE = 'saturate(0.92) contrast(1.06) brightness(0.78) sepia(0.34)';

export const FPS = 60;
export const RODINA_DURATION = 1080; // 18 s

const F = (s: number) => Math.round(s * FPS);
/* Klíčové okamžiky — musí sedět s scripts/make-audio-rodina.mjs */
const T_HOOK = F(0.3);
const T_COUNT = F(2.2);
const T_COUNT_END = F(4.0);
const T_35 = F(4.4);
const T_RODINA = F(6.2);
const T_CARE = F(10.4);
const T_OUT = F(15.0);

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

/* ---------- Teplá kulisa s ken-burns zoomem + fade ---------- */
const Backdrop: React.FC<{src: string; start: number; end: number; k: number}> = ({src, start, end, k}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [start, start + 14, end - 14, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0) return null;
  const zoom = 1.06 + interpolate(frame, [start, end], [0, 0.08], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: op}}>
      <Img
        src={staticFile(src)}
        style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADE, transform: `scale(${zoom})`}}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7,7,7,0.62) 0%, rgba(7,7,7,0.28) 34%, rgba(7,7,7,0.34) 60%, rgba(7,7,7,0.82) 100%)',
        }}
      />
      {/* teplý nádech */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, rgba(245,197,24,0.10), transparent 60%)'}} />
      {/* placeholder pro majitelku: sem se hodí reálné záběry / stará fotka z 1991 */}
    </AbsoluteFill>
  );
};

export const ReelRodina = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* háček */
  const hookOp = interpolate(frame, [T_HOOK, T_HOOK + 12, T_COUNT - 6, T_COUNT], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* count-up 1991 → 2026 */
  const year = Math.round(
    interpolate(frame, [T_COUNT, T_COUNT_END], [1991, 2026], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const yearOp = interpolate(frame, [T_HOOK + 6, T_HOOK + 20, T_35 + F(1.2), T_35 + F(1.6)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const yearIn = spring({frame: frame - T_HOOK - 6, fps, config: {damping: 16, stiffness: 120}});

  /* „35 let" razítko */
  const stampP = spring({frame: frame - T_35, fps, config: {damping: 10, stiffness: 180}});
  const stampOp = interpolate(frame, [T_35, T_35 + 8, T_RODINA - 8, T_RODINA], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* „Tři desetiletí…" */
  const rodinaOp = interpolate(frame, [T_RODINA, T_RODINA + 12, T_CARE - 12, T_CARE], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* „Neprodáváme brýle…" — emoční vrchol */
  const careOp = interpolate(frame, [T_CARE, T_CARE + 12, T_OUT - 12, T_OUT], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* outro */
  const outLogo = spring({frame: frame - T_OUT, fps, config: {damping: 13, stiffness: 130}});
  const outAddr = spring({frame: frame - T_OUT - 16, fps, config: {damping: 200}});
  const outCta = spring({frame: frame - T_OUT - 28, fps, config: {damping: 13, stiffness: 140}});
  const outPulse = 1 + Math.sin(Math.max(0, frame - T_OUT - 44) / 10) * 0.02;

  const hdrOp = interpolate(frame, [T_HOOK, T_HOOK + 14, T_OUT, T_OUT + 10], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music-rodina.wav')}
        volume={(f) =>
          interpolate(f, [0, 10, RODINA_DURATION - 40, RODINA_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* KULISY — teplé, prolínají se */}
      <Backdrop src="ig-shelves.jpg" start={0} end={T_RODINA + 6} k={k} />
      <Backdrop src="stock-frames.jpg" start={T_RODINA - 6} end={T_CARE + 6} k={k} />
      <Backdrop src="stock-portrait.jpg" start={T_CARE - 6} end={T_OUT + 6} k={k} />

      {/* HÁČEK + LETOPOČET */}
      {frame < T_RODINA && (
        <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center'}}>
          <div style={{opacity: hookOp}}>
            <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 22 * k}}>
              // jedno místo, tři generace
            </div>
            <HeadWords words={['Tady', 'stojíme']} startAt={T_HOOK} k={k} size={104} />
            <HeadWords words={['od', 'roku…']} startAt={T_HOOK + 8} k={k} size={104} />
          </div>

          {/* obří count-up letopočet */}
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 300 * k,
              lineHeight: 0.9,
              color: C.yellow,
              letterSpacing: '-0.04em',
              marginTop: 30 * k,
              opacity: yearOp,
              transform: `translateY(${(1 - yearIn) * 40 * k}px) scale(${0.9 + yearIn * 0.1})`,
              textShadow: `0 0 ${70 * k}px rgba(255,228,92,0.35)`,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {year}
          </div>

          {/* „= 35 let" razítko */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24 * k,
              marginTop: 10 * k,
              opacity: stampOp,
              transform: `scale(${0.7 + stampP * 0.3}) rotate(${(1 - stampP) * -6}deg)`,
              transformOrigin: 'left center',
            }}
          >
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 84 * k,
                color: C.cream,
                letterSpacing: '-0.03em',
              }}
            >
              = 35 let
            </div>
            <div
              style={{
                fontFamily: BODY,
                fontWeight: 700,
                fontSize: 30 * k,
                color: C.ink900,
                background: C.yellow,
                padding: `${10 * k}px ${24 * k}px`,
                borderRadius: 999,
                boxShadow: `0 0 ${30 * k}px rgba(255,228,92,0.35)`,
              }}
            >
              jedné rodiny
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* TŘI DESETILETÍ */}
      {frame >= T_RODINA - 6 && frame < T_CARE + 6 && (
        <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', opacity: rodinaOp}}>
          {['Tři desetiletí.', 'Jedna rodina.', 'Jedno místo.'].map((t, i) => {
            const p = spring({frame: frame - (T_RODINA + 10 + i * 24), fps, config: {damping: 18, stiffness: 150}});
            return (
              <div key={t} style={{overflow: 'hidden', paddingBottom: 8 * k}}>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    fontSize: 116 * k,
                    lineHeight: 1.04,
                    letterSpacing: '-0.035em',
                    color: i === 2 ? C.yellow : C.cream,
                    transform: `translateY(${(1 - p) * 110}%)`,
                  }}
                >
                  {t}
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      )}

      {/* NEPRODÁVÁME BRÝLE — emoční vrchol */}
      {frame >= T_CARE - 6 && frame < T_OUT + 6 && (
        <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', opacity: careOp}}>
          <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 26 * k}}>
            // víc než obchod
          </div>
          <HeadWords words={['Neprodáváme']} startAt={T_CARE + 8} k={k} size={112} />
          <HeadWords words={['brýle.']} startAt={T_CARE + 14} k={k} size={112} />
          <div style={{height: 30 * k}} />
          <HeadWords words={['Staráme', 'se', 'o']} startAt={T_CARE + 24} k={k} size={112} />
          <HeadWords words={['váš', 'zrak.']} startAt={T_CARE + 32} k={k} size={112} dot />
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
              fontSize: 76 * k,
              letterSpacing: '-0.03em',
              textAlign: 'center',
              lineHeight: 1.08,
              color: C.cream,
              opacity: outAddr,
              transform: `translateY(${(1 - outAddr) * 22 * k}px)`,
            }}
          >
            Děkujeme, že k nám
            <br />
            <span style={{color: C.yellow}}>chodíte už 35 let.</span>
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
            Optik Dvořák · Americká 325/23, Plzeň
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
            Označ, s kým k nám chodíš 👇
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
        // od 1991
      </div>

      {/* vinětace */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 48%, rgba(0,0,0,0.6) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
