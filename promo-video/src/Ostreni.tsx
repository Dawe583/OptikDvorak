import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import {DISPLAY, BODY, MONO} from './fonts';
import {LogoMark} from './LogoMark';

const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  dim: 'rgba(244,241,234,0.5)',
};

/* Jednotný teplý grade — sjednocuje fotky do jedné kolekce (jako na webu) */
const GRADE = 'saturate(0.85) contrast(1.12) brightness(0.82) sepia(0.22)';
/* Rozostřený svět mimo čočku */
const BLUR = 16;

export const FPS = 60;
export const OSTRENI_DURATION = 720; // 12 s

const F = (s: number) => Math.round(s * FPS);
/* Klíčové okamžiky — T_SNAP a T_CTA musí sedět s LOCK/CTA v scripts/make-ostreni-audio.mjs */
const T_ADDR = F(0.5); // mono adresa se vypisuje
const T_PHOTO = F(0.7); // rozostřený portrét nastupuje
const T_H1 = F(1.0); // „Když svět ztrácí ostrost…"
const T_SNAP = F(2.6); // čočka zaklapne = první doostření + impakt
const T_H2 = F(2.75); // „…my ho vrátíme do detailu."
const T_S1 = F(3.6); // Měření zraku
const T_S2 = F(4.8); // Brýlové obruby
const T_S3 = F(6.0); // Kontaktní čočky
const T_EXPAND = F(7.2); // čočka se roztáhne přes celý obraz
const T_CLAIM = F(7.55); // „Rodinná optika. Od roku 1991."
const T_OUT = F(9.6); // outro
const T_CTA = F(10.0); // CTA tlačítko + akcent v audiu

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

/* ---------- Poletující bokeh částice ---------- */
const Bokeh: React.FC<{count?: number}> = ({count = 14}) => {
  const frame = useCurrentFrame();
  const k = useScale();
  return (
    <AbsoluteFill>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 100;
        const drift = Math.sin(frame / (60 + random(`s${i}`) * 60) + i) * 26 * k;
        const y = ((((random(`y${i}`) * 130 - frame * (0.06 + random(`v${i}`) * 0.09)) % 130) + 130) % 130);
        const size = (5 + random(`r${i}`) * 16) * k;
        const op = 0.05 + random(`o${i}`) * 0.14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y - 15}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: C.yellow,
              opacity: op,
              filter: `blur(${size * 0.5}px)`,
              transform: `translateX(${drift}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Psaný mono řádek s kurzorem ---------- */
const TypedLine: React.FC<{text: string; startAt: number; fadeOutAt?: number}> = ({text, startAt, fadeOutAt}) => {
  const frame = useCurrentFrame();
  const k = useScale();
  const chars = Math.floor(
    interpolate(frame, [startAt, startAt + text.length * 1.6], [0, text.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  if (frame < startAt) return null;
  const done = chars >= text.length;
  const out = fadeOutAt
    ? interpolate(frame, [fadeOutAt, fadeOutAt + 12], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;
  return (
    <div style={{fontFamily: MONO, fontSize: 24 * k, color: C.yellowDeep, letterSpacing: '0.02em', opacity: out}}>
      {text.slice(0, chars)}
      <span
        style={{
          display: 'inline-block',
          width: 11 * k,
          height: 24 * k,
          background: C.yellowDeep,
          marginLeft: 3 * k,
          verticalAlign: 'text-bottom',
          opacity: done && Math.floor(frame / 18) % 2 === 0 ? 0 : 0.9,
        }}
      />
    </div>
  );
};

/* ---------- Kinetické střídání slov (služby) ---------- */
const WordCycle: React.FC<{words: string[]; startAt: number; hold: number; k: number}> = ({
  words,
  startAt,
  hold,
  k,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'relative', height: 122 * k}}>
      {words.map((w, i) => {
        const at = startAt + i * hold;
        const inP = spring({frame: frame - at, fps, config: {damping: 20, stiffness: 160}});
        const outP =
          i < words.length - 1 ? spring({frame: frame - (at + hold), fps, config: {damping: 20, stiffness: 160}}) : 0;
        if (frame < at - 6) return null;
        return (
          <div key={w} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', overflow: 'hidden'}}>
            <span
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 92 * k,
                letterSpacing: '-0.035em',
                color: C.cream,
                display: 'inline-block',
                transform: `translateY(${(1 - inP) * 110 - outP * 110}%)`,
              }}
            >
              {w}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Scény pod čočkou ---------- */
type Scene = {src: string; from: number; to: number; kenFrom: number; kenTo: number};
const SCENES: Scene[] = [
  {src: 'stock-portrait.jpg', from: T_PHOTO, to: T_S1, kenFrom: 1.1, kenTo: 1.16},
  {src: 'ig-woman-round.jpg', from: T_S1, to: T_S2, kenFrom: 1.12, kenTo: 1.06},
  {src: 'ig-shelves.jpg', from: T_S2, to: T_S3, kenFrom: 1.04, kenTo: 1.1},
  {src: 'ig-editorial.jpg', from: T_S3, to: T_OUT, kenFrom: 1.1, kenTo: 1.02},
];

/* Dráha čočky napříč scénami (procenta plochy 1080×1920) */
const LENS_T = [T_SNAP, T_S1 - 8, T_S1 + 10, T_S2 - 8, T_S2 + 10, T_S3 - 8, T_S3 + 10, T_EXPAND];
const LENS_X = [55, 56, 33, 37, 48, 58, 39, 43];
const LENS_Y = [27, 28, 29, 30, 44, 46, 25, 26];
const LENS_R = [195, 195, 175, 175, 210, 210, 185, 185];
const EASE = {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ---------- Hlavní kompozice ---------- */
export const Ostreni = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* čočka: pozice + poloměr */
  const cx = interpolate(frame, LENS_T, LENS_X, EASE) * 10.8 * k;
  const cy = interpolate(frame, LENS_T, LENS_Y, EASE) * 19.2 * k;
  const snapIn = spring({frame: frame - T_SNAP, fps, config: {damping: 11, stiffness: 160}});
  const baseR = interpolate(frame, LENS_T, LENS_R, EASE);
  /* na konci se čočka roztáhne přes celý kadr = vše ostré */
  const expand = interpolate(frame, [T_EXPAND, T_EXPAND + 26], [1, 7.5], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const r = baseR * k * snapIn * expand;
  const ringOpacity =
    interpolate(frame, [T_SNAP - 4, T_SNAP], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(frame, [T_EXPAND, T_EXPAND + 14], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* záblesk při zaklapnutí čočky — držet nízko, žlutá přes tmavou fotku zhnědne */
  const flash = interpolate(frame, [T_SNAP - 2, T_SNAP, T_SNAP + 8], [0, 0.18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* intro nadpisy */
  const h1 = spring({frame: frame - T_H1, fps, config: {damping: 200}});
  const h2 = spring({frame: frame - T_H2, fps, config: {damping: 16, stiffness: 150}});
  const introOut = interpolate(frame, [T_S1 - 14, T_S1 - 2], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* rozostřený text „dýchá", doostří se až se zaklapnutím čočky */
  const h1Blur =
    frame < T_SNAP
      ? 8 + Math.sin(frame / 7) * 2.5
      : interpolate(frame, [T_SNAP, T_SNAP + 10], [8, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* hlavička */
  const hdr = interpolate(frame, [T_S1, T_S1 + 14, T_OUT, T_OUT + 10], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* služby */
  const wordsEyebrow = spring({frame: frame - T_S1 - 6, fps, config: {damping: 200}});
  const wordsOut = interpolate(frame, [T_EXPAND - 12, T_EXPAND], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* claim */
  const claimScrim = interpolate(frame, [T_EXPAND + 6, T_CLAIM + 10], [0, 0.74], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const claim1 = spring({frame: frame - T_CLAIM, fps, config: {damping: 16, stiffness: 140}});
  const claim2 = spring({frame: frame - T_CLAIM - 10, fps, config: {damping: 16, stiffness: 140}});
  const claimOut = interpolate(frame, [T_OUT - 12, T_OUT], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* outro */
  const outLogo = spring({frame: frame - T_OUT, fps, config: {damping: 13, stiffness: 130}});
  const outAddr = spring({frame: frame - T_OUT - 14, fps, config: {damping: 200}});
  const outCta = spring({frame: frame - T_CTA, fps, config: {damping: 13, stiffness: 140}});
  const outShine = interpolate(frame, [T_CTA + 16, T_CTA + 60], [-150, 260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outPulse = 1 + Math.sin(Math.max(0, frame - T_CTA - 20) / 10) * 0.015;

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music-ostreni.wav')}
        volume={(f) =>
          interpolate(f, [0, 8, OSTRENI_DURATION - 34, OSTRENI_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* ambientní záře — nízko, jinak žlutá přes černou zhnědne */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, rgba(255,228,92,0.05), transparent 52%)'}} />

      {/* SCÉNY: rozostřený svět + ostrý výřez pod čočkou */}
      {SCENES.map((s, i) => {
        const isFirst = i === 0;
        const isLast = i === SCENES.length - 1;
        const op = interpolate(
          frame,
          [s.from - (isFirst ? 0 : 9), s.from + (isFirst ? 36 : 9), s.to - 9, s.to + (isLast ? 10 : 9)],
          [0, 1, 1, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        );
        if (op <= 0) return null;
        const ken = interpolate(frame, [s.from, s.to], [s.kenFrom, s.kenTo], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <AbsoluteFill key={s.src} style={{opacity: op}}>
            {/* rozostřená vrstva */}
            <AbsoluteFill style={{transform: `scale(${ken})`}}>
              <Img
                src={staticFile(s.src)}
                style={{width: '100%', height: '100%', objectFit: 'cover', filter: `${GRADE} blur(${BLUR * k}px)`}}
              />
            </AbsoluteFill>
            {/* ostrá vrstva jen uvnitř čočky */}
            {frame >= T_SNAP - 2 && (
              <AbsoluteFill style={{clipPath: `circle(${Math.max(0, r)}px at ${cx}px ${cy}px)`}}>
                <AbsoluteFill style={{transform: `scale(${ken})`}}>
                  <Img
                    src={staticFile(s.src)}
                    style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADE}}
                  />
                </AbsoluteFill>
              </AbsoluteFill>
            )}
          </AbsoluteFill>
        );
      })}

      {/* scrim — fotky drží vzadu, text zůstává čitelný */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(7,7,7,0.85) 0%, rgba(7,7,7,0.25) 30%, rgba(7,7,7,0.35) 62%, ${C.bg} 96%)`,
        }}
      />
      {/* ztmavení pod claim */}
      {claimScrim > 0 && <AbsoluteFill style={{background: `rgba(7,7,7,${claimScrim})`}} />}

      <Bokeh />

      {/* prstenec čočky */}
      {ringOpacity > 0 && snapIn > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: cx - r,
            top: cy - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            border: `${2 * k}px solid rgba(255,228,92,0.8)`,
            boxShadow: `0 0 ${34 * k}px rgba(255,228,92,0.35), inset 0 0 ${26 * k}px rgba(255,228,92,0.12)`,
            opacity: ringOpacity,
          }}
        />
      )}

      {/* INTRO: adresa + nadpisy */}
      {frame < T_S1 && (
        <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center'}}>
          <div style={{marginTop: 560 * k, opacity: introOut}}>
            <TypedLine text="// Americká 325/23 · Plzeň" startAt={T_ADDR} />
            <div
              style={{
                marginTop: 26 * k,
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 64 * k,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: C.cream,
                opacity: h1,
                transform: `translateY(${(1 - h1) * 26 * k}px)`,
                filter: `blur(${h1Blur * k}px)`,
              }}
            >
              Když svět ztrácí ostrost…
            </div>
            <div style={{overflow: 'hidden', paddingBottom: 8 * k}}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 64 * k,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  color: C.yellow,
                  transform: `translateY(${(1 - h2) * 110}%)`,
                }}
              >
                …my ho vrátíme do detailu.
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* hlavička */}
      <div
        style={{
          position: 'absolute',
          top: 90 * k,
          left: 90 * k,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 30 * k,
          color: C.cream,
          opacity: hdr,
        }}
      >
        Optik <span style={{color: C.yellow}}>Dvořák</span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 96 * k,
          right: 90 * k,
          fontFamily: MONO,
          fontSize: 20 * k,
          color: C.dim,
          opacity: hdr,
        }}
      >
        // od 1991
      </div>

      {/* SLUŽBY: kinetická slova */}
      {frame >= T_S1 - 6 && frame < T_EXPAND + 6 && (
        <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'flex-end'}}>
          <div style={{marginBottom: 420 * k, opacity: wordsOut}}>
            <div
              style={{fontFamily: MONO, fontSize: 24 * k, color: C.yellowDeep, opacity: wordsEyebrow, marginBottom: 10 * k}}
            >
              // co pro vás děláme
            </div>
            <WordCycle
              words={['Měření zraku.', 'Brýlové obruby.', 'Kontaktní čočky.']}
              startAt={T_S1 + 8}
              hold={72}
              k={k}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* CLAIM */}
      {frame >= T_CLAIM - 6 && frame < T_OUT + 4 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: `0 ${90 * k}px`}}>
          <div style={{textAlign: 'center', opacity: claimOut}}>
            <div style={{overflow: 'hidden'}}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 104 * k,
                  lineHeight: 1.04,
                  letterSpacing: '-0.035em',
                  color: C.cream,
                  transform: `translateY(${(1 - claim1) * 110}%)`,
                }}
              >
                Rodinná optika.
              </div>
            </div>
            <div style={{overflow: 'hidden', paddingBottom: 10 * k}}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 104 * k,
                  lineHeight: 1.04,
                  letterSpacing: '-0.035em',
                  color: C.yellow,
                  transform: `translateY(${(1 - claim2) * 110}%)`,
                }}
              >
                Od roku 1991.
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* OUTRO */}
      {frame >= T_OUT - 4 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30 * k, padding: 90 * k}}>
          <div style={{width: 300 * k, opacity: outLogo, transform: `scale(${outLogo})`}}>
            {/* časování dávno v minulosti = logo je rovnou hotové, bez formace */}
            <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 68 * k,
              letterSpacing: '-0.02em',
              color: C.cream,
              opacity: outLogo,
            }}
          >
            Optik <span style={{color: C.yellow}}>Dvořák</span>
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
              transform: `translateY(${(1 - outAddr) * 20 * k}px)`,
            }}
          >
            Americká 325/23, Plzeň
            <br />
            optikdvorak.cz
          </div>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              marginTop: 16 * k,
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
            Přijďte se podívat →
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

      {/* záblesk doostření */}
      <AbsoluteFill style={{background: C.yellow, opacity: flash, mixBlendMode: 'screen'}} />
      {/* vinětace */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
