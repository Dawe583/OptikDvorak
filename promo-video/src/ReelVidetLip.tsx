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

/* Vlajkový teaser „Vidět líp než včera" — 20 s, shot-by-shot dle
   docs/REKLAMA-A-SOCIAL-PLAN.md (ČÁST 2):
   0–2 s  háček: rozostřený svět
   2–5 s  obruba z vitríny, od roku 1991
   5–8 s  nasazení brýlí → svět se zaostří (cvak)
   8–12 s tvář zákaznice + „Oční optika. Měření zraku. Brýle na míru."
   12–16 s rychlý sestřih (skla, obruby, výloha)
   16–20 s logo + adresa + CTA
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
export const VIDETLIP_DURATION = 1200; // 20 s

const F = (s: number) => Math.round(s * FPS);
/* Klíčové okamžiky — musí sedět s scripts/make-audio-videtlip.mjs */
const T_HOOK = F(0.3);
const T_FRAME = F(2.0);
const T_FOCUS = F(5.0);
const T_CLICK = F(5.4); // cvak = moment zaostření
const T_FACE = F(8.0);
const T_MONTAGE = F(12.0);
const T_OUT = F(16.0);

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

export const ReelVidetLip = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* --- SCÉNA 1: rozostřený svět (háček) --- */
  const hookOp = interpolate(frame, [0, 14, T_FRAME - 12, T_FRAME], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const hookDrift = frame * 0.08;

  /* --- SCÉNA 2: obruba z vitríny --- */
  const frameOp = interpolate(frame, [T_FRAME, T_FRAME + 12, T_FOCUS - 12, T_FOCUS], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardP = spring({frame: frame - T_FRAME, fps, config: {damping: 18, stiffness: 110}});
  const cardTilt = Math.sin((frame - T_FRAME) / 70) * 4;

  /* --- SCÉNA 3: zaostření (wow) --- */
  const focusOp = interpolate(frame, [T_FOCUS, T_FOCUS + 8, T_FACE - 10, T_FACE], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* blur 46 px → 0 přesně na cvak */
  const sharpen = spring({frame: frame - T_CLICK, fps, config: {damping: 30, stiffness: 90}});
  const focusBlur = (1 - sharpen) * 46;
  const focusScale = 1.12 - sharpen * 0.08;
  const clickFlash = interpolate(frame, [T_CLICK - 2, T_CLICK, T_CLICK + 14], [0, 0.55, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sharpLabel = spring({frame: frame - T_CLICK - 16, fps, config: {damping: 200}});

  /* --- SCÉNA 4: tvář + trojice služeb --- */
  const faceOp = interpolate(frame, [T_FACE, T_FACE + 12, T_MONTAGE - 12, T_MONTAGE], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const faceZoom =
    1.02 +
    interpolate(frame, [T_FACE, T_MONTAGE], [0, 0.06], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  /* --- SCÉNA 5: rychlý sestřih --- */
  const montageOp = interpolate(frame, [T_MONTAGE, T_MONTAGE + 8, T_OUT - 10, T_OUT], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cuts = [
    {src: 'ig-shelves.jpg', at: T_MONTAGE, pos: 'center', flip: false},
    {src: 'stock-frames.jpg', at: T_MONTAGE + F(0.9), pos: 'center', flip: false},
    {src: 'ig-editorial.jpg', at: T_MONTAGE + F(1.8), pos: 'center', flip: false},
    {src: 'ig-shelves.jpg', at: T_MONTAGE + F(2.7), pos: 'left bottom', flip: true},
  ];
  let cutIdx = 0;
  for (let i = 0; i < cuts.length; i++) if (frame >= cuts[i].at) cutIdx = i;
  const cut = cuts[cutIdx];
  const cutT = frame - cut.at;

  /* --- SCÉNA 6: outro --- */
  const outLogo = spring({frame: frame - T_OUT, fps, config: {damping: 13, stiffness: 130}});
  const outClaim = spring({frame: frame - T_OUT - 12, fps, config: {damping: 200}});
  const outAddr = spring({frame: frame - T_OUT - 24, fps, config: {damping: 200}});
  const outCta = spring({frame: frame - T_OUT - 34, fps, config: {damping: 13, stiffness: 140}});
  const outPulse = 1 + Math.sin(Math.max(0, frame - T_OUT - 50) / 10) * 0.015;
  const outShine = interpolate(frame, [T_OUT + 56, T_OUT + 100], [-150, 260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const hdrOp = interpolate(frame, [T_FRAME, T_FRAME + 14, T_OUT, T_OUT + 10], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music-videtlip.wav')}
        volume={(f) =>
          interpolate(f, [0, 8, VIDETLIP_DURATION - 30, VIDETLIP_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* SCÉNA 1 — rozostřený svět */}
      {frame < T_FRAME + 6 && (
        <AbsoluteFill style={{opacity: hookOp}}>
          <Img
            src={staticFile('ig-editorial.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: `${GRADE} blur(${34 * k}px) brightness(0.6)`,
              transform: `scale(1.25) translateY(${hookDrift * k}px)`,
            }}
          />
          <AbsoluteFill style={{background: 'rgba(7,7,7,0.45)'}} />
          <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center'}}>
            <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 22 * k}}>
              // rozmazaně, bez ostrosti
            </div>
            <HeadWords words={['Takhle', 'to', 'vidí']} startAt={T_HOOK} k={k} size={116} />
            <HeadWords words={['každý', 'třetí', 'Čech']} startAt={T_HOOK + 8} k={k} size={116} dot />
          </AbsoluteFill>
        </AbsoluteFill>
      )}

      {/* SCÉNA 2 — obruba z vitríny */}
      {frame >= T_FRAME - 6 && frame < T_FOCUS + 6 && (
        <AbsoluteFill style={{opacity: frameOp}}>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div
              style={{
                position: 'relative',
                width: 640 * k,
                height: 760 * k,
                overflow: 'hidden',
                opacity: cardP,
                transform: `perspective(${1400 * k}px) translateY(${(1 - cardP) * 110 * k}px) rotateZ(-3deg) rotateY(${cardTilt}deg) scale(${0.9 + cardP * 0.1})`,
                boxShadow: `0 ${34 * k}px ${90 * k}px rgba(0,0,0,0.65)`,
              }}
            >
              <div style={{position: 'absolute', inset: 0, clipPath: `inset(${(1 - cardP) * 100}% 0 0 0)`}}>
                <Img
                  src={staticFile('stock-frames.jpg')}
                  style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADE}}
                />
              </div>
              <div style={{position: 'absolute', inset: 0, border: `${1.5 * k}px solid rgba(255,228,92,0.22)`}} />
            </div>
          </AbsoluteFill>
          <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 300 * k}}>
            <HeadWords words={['My', 'to', 'umíme', 'spravit']} startAt={T_FRAME + 10} k={k} size={84} />
            <HeadWords words={['od', 'roku', '1991']} startAt={T_FRAME + 20} k={k} size={84} dot />
          </div>
        </AbsoluteFill>
      )}

      {/* SCÉNA 3 — nasazení brýlí, svět se zaostří */}
      {frame >= T_FOCUS - 6 && frame < T_FACE + 6 && (
        <AbsoluteFill style={{opacity: focusOp}}>
          <Img
            src={staticFile('ig-woman-round.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: `${GRADE} blur(${focusBlur * k}px)`,
              transform: `scale(${focusScale})`,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                'linear-gradient(180deg, rgba(7,7,7,0.5) 0%, transparent 30%, transparent 68%, rgba(7,7,7,0.7) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 90 * k,
              bottom: 260 * k,
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

      {/* SCÉNA 4 — tvář + služby */}
      {frame >= T_FACE - 6 && frame < T_MONTAGE + 6 && (
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
                'linear-gradient(180deg, rgba(7,7,7,0.45) 0%, transparent 32%, transparent 55%, rgba(7,7,7,0.82) 100%)',
            }}
          />
          <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 240 * k}}>
            {['Oční optika.', 'Měření zraku.', 'Brýle na míru.'].map((t, i) => {
              const p = spring({frame: frame - (T_FACE + 14 + i * 26), fps, config: {damping: 18, stiffness: 150}});
              return (
                <div key={t} style={{overflow: 'hidden'}}>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 800,
                      fontSize: 88 * k,
                      lineHeight: 1.08,
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
          </div>
        </AbsoluteFill>
      )}

      {/* SCÉNA 5 — rychlý sestřih */}
      {frame >= T_MONTAGE - 6 && frame < T_OUT + 6 && (
        <AbsoluteFill style={{opacity: montageOp}}>
          <Img
            src={staticFile(cut.src)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: cut.pos,
              filter: GRADE,
              transform: `scale(${1.14 - Math.min(1, cutT / 54) * 0.08}) scaleX(${cut.flip ? -1 : 1})`,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                'linear-gradient(180deg, rgba(7,7,7,0.4) 0%, transparent 35%, transparent 60%, rgba(7,7,7,0.85) 100%)',
            }}
          />
          <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 260 * k}}>
            <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 18 * k}}>
              // Americká 325/23
            </div>
            <HeadWords words={['Rodinná', 'optika']} startAt={T_MONTAGE + 8} k={k} size={104} />
            <HeadWords words={['v', 'srdci', 'Plzně']} startAt={T_MONTAGE + 16} k={k} size={104} dot />
          </div>
        </AbsoluteFill>
      )}

      {/* SCÉNA 6 — outro: logo, claim, adresa, CTA */}
      {frame >= T_OUT - 4 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30 * k, padding: 90 * k}}>
          <div style={{width: 320 * k, opacity: outLogo, transform: `scale(${outLogo})`}}>
            {/* časování dávno v minulosti = logo rovnou hotové, bez formace */}
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
              opacity: outClaim,
              transform: `translateY(${(1 - outClaim) * 22 * k}px)`,
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
              opacity: outAddr,
              transform: `translateY(${(1 - outAddr) * 18 * k}px)`,
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
              opacity: outCta,
              transform: `scale(${outCta * outPulse})`,
              boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
            }}
          >
            Objednej se k nám →
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '22%',
                left: `${outShine}%`,
                background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.7), transparent)',
                transform: 'skewX(-18deg)',
              }}
            />
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

      {/* záblesk cvaknutí */}
      <AbsoluteFill style={{background: C.yellow, opacity: clickFlash, mixBlendMode: 'screen'}} />
      {/* vinětace */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
