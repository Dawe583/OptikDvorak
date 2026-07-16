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

/* Jednotný teplý grade — fotky z různých zdrojů sjednotí do jedné kolekce
   (obdoba --photo-filter na webu). */
const GRADE = 'saturate(0.85) contrast(1.12) brightness(0.82) sepia(0.22)';

export const FPS = 60;
export const VITRINA_DURATION = 720; // 12 s

const F = (s: number) => Math.round(s * FPS);
/* Klíčové okamžiky — musí sedět s scripts/make-ig-audio.mjs */
const T_NODES = F(0.35);
const T_LINES = F(1.0);
const T_DRAW = F(1.45);
const T_LOCK = F(2.6); // logo zaklapne + impakt
const T_MOVE = F(3.0); // logo do hlavičky
const T_CLAIM = F(3.4); // "Rodinná optika"
const T_CARDS = F(4.0); // fotokarty nalétnou
const T_WORDS = F(6.0); // kinetická slova
const T_GRID = F(8.6); // mozaika obrub
const T_OUT = F(10.4); // outro

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
const Bokeh: React.FC<{count?: number}> = ({count = 18}) => {
  const frame = useCurrentFrame();
  const k = useScale();
  return (
    <AbsoluteFill>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 100;
        const drift = Math.sin(frame / (60 + random(`s${i}`) * 60) + i) * 26 * k;
        const y = ((((random(`y${i}`) * 130 - frame * (0.06 + random(`v${i}`) * 0.09)) % 130) + 130) % 130);
        const size = (5 + random(`r${i}`) * 16) * k;
        const op = 0.06 + random(`o${i}`) * 0.16;
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

/* ---------- Fotokarta s 3D náklonem, maskou a přejezdem lesku ---------- */
const PhotoCard: React.FC<{
  src: string;
  delay: number;
  x: number; // % středu
  y: number;
  w: number; // px v 1080 prostoru
  h: number;
  rot: number;
  k: number;
  exitAt?: number;
}> = ({src, delay, x, y, w, h, rot, k, exitAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 18, stiffness: 110}});
  const out = exitAt
    ? interpolate(frame, [exitAt, exitAt + 22], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;
  /* pomalý náklon = živá karta */
  const tilt = Math.sin((frame - delay) / 70) * 5;
  const float = Math.sin((frame - delay) / 55) * 10 * k;
  const shine = interpolate(frame, [delay + 14, delay + 54], [-140, 240], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: w * k,
        height: h * k,
        marginLeft: (-w * k) / 2,
        marginTop: (-h * k) / 2,
        opacity: p * out,
        transformStyle: 'preserve-3d',
        transform: `perspective(${1400 * k}px) translateY(${(1 - p) * 90 * k + float}px) rotateZ(${rot}deg) rotateY(${tilt}deg) scale(${0.9 + p * 0.1})`,
        boxShadow: `0 ${34 * k}px ${80 * k}px rgba(0,0,0,0.6)`,
        overflow: 'hidden',
      }}
    >
      {/* maskový reveal zdola */}
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(${(1 - p) * 100}% 0 0 0)`}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADE}} />
      </div>
      {/* žlutá hairline */}
      <div style={{position: 'absolute', inset: 0, border: `${1.5 * k}px solid rgba(255,228,92,0.22)`}} />
      {/* přejezd lesku */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '30%',
          left: `${shine}%`,
          background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.28), transparent)',
          transform: 'skewX(-16deg)',
        }}
      />
    </div>
  );
};

/* ---------- Kinetické střídání slov ---------- */
const WordCycle: React.FC<{words: string[]; startAt: number; hold: number; k: number}> = ({
  words,
  startAt,
  hold,
  k,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'relative', height: 132 * k}}>
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
                fontSize: 104 * k,
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

/* ---------- Mozaika obrub ---------- */
const Mosaic: React.FC<{startAt: number; k: number}> = ({startAt, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  /* 5 unikátních fotek na 6 dlaždic — regál se opakuje překlopený a jinak
     nakadrovaný, aby opakování nebylo znát. */
  const tiles = [
    {src: 'ig-shelves.jpg', ox: 0, oy: 0, pos: 'center', flip: false},
    {src: 'stock-frames.jpg', ox: 1, oy: 0, pos: 'center', flip: false},
    {src: 'ig-editorial.jpg', ox: 0, oy: 1, pos: 'center', flip: false},
    {src: 'ig-woman-round.jpg', ox: 1, oy: 1, pos: 'center', flip: false},
    {src: 'stock-portrait.jpg', ox: 0, oy: 2, pos: 'center', flip: false},
    {src: 'ig-shelves.jpg', ox: 1, oy: 2, pos: 'left bottom', flip: true},
  ];
  const size = 430 * k;
  const gap = 12 * k;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{position: 'relative', width: size * 2 + gap, height: size * 3 + gap * 2}}>
        {tiles.map((t, i) => {
          const p = spring({frame: frame - startAt - i * 4, fps, config: {damping: 20, stiffness: 140}});
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: t.ox * (size + gap),
                top: t.oy * (size + gap),
                width: size,
                height: size,
                overflow: 'hidden',
                opacity: p,
                transform: `scale(${0.82 + p * 0.18})`,
                clipPath: `inset(${(1 - p) * 50}% ${(1 - p) * 50}% ${(1 - p) * 50}% ${(1 - p) * 50}%)`,
              }}
            >
              <Img
                src={staticFile(t.src)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: t.pos,
                  filter: GRADE,
                  transform: `scale(${1.05 + Math.sin((frame - startAt) / 90 + i) * 0.03}) scaleX(${t.flip ? -1 : 1})`,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Hlavní kompozice ---------- */
export const Vitrina = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* logo: střed → hlavička */
  const move = spring({frame: frame - T_MOVE, fps, config: {damping: 200}, durationInFrames: 26});
  const logoW = interpolate(move, [0, 1], [460 * k, 62 * k]);
  const logoX = interpolate(move, [0, 1], [0, -(540 - 90 - 31) * k]);
  const logoY = interpolate(move, [0, 1], [0, -(1920 / 2 - 118) * k]);

  /* wordmark pod logem v intru */
  const wm = spring({frame: frame - T_LOCK - 6, fps, config: {damping: 200}});
  const wmOut = interpolate(frame, [T_MOVE, T_MOVE + 12], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hdr = interpolate(frame, [T_MOVE + 10, T_MOVE + 24, T_OUT, T_OUT + 10], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* záblesk a paprsek intra */
  const flash = interpolate(frame, [T_LOCK - 2, T_LOCK, T_LOCK + 12], [0, 0.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const beamW = interpolate(frame, [0, T_LINES], [0, 1], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  const beamOut = interpolate(frame, [T_DRAW, T_LOCK], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* claim */
  const claim = spring({frame: frame - T_CLAIM, fps, config: {damping: 200}});
  const claimOut = interpolate(frame, [T_WORDS - 16, T_WORDS], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* sekce slov */
  const wordsOut = interpolate(frame, [T_GRID - 16, T_GRID], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wordsEyebrow = spring({frame: frame - T_WORDS, fps, config: {damping: 200}});

  /* mozaika */
  const gridOut = interpolate(frame, [T_OUT - 14, T_OUT], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* outro */
  const outLogo = spring({frame: frame - T_OUT, fps, config: {damping: 13, stiffness: 130}});
  const outAddr = spring({frame: frame - T_OUT - 14, fps, config: {damping: 200}});
  const outCta = spring({frame: frame - T_OUT - 26, fps, config: {damping: 13, stiffness: 140}});
  const outShine = interpolate(frame, [T_OUT + 40, T_OUT + 84], [-150, 260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outPulse = 1 + Math.sin(Math.max(0, frame - T_OUT - 44) / 10) * 0.015;

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music-ig.wav')}
        volume={(f) =>
          interpolate(f, [0, 8, VITRINA_DURATION - 34, VITRINA_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* ambientní záře — nízko, jinak žlutá přes černou zhnědne */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 44%, rgba(255,228,92,0.05), transparent 52%)'}} />
      <Bokeh />

      {/* světelný paprsek intra */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${beamW * 100}%`,
          height: 2 * k,
          transform: 'translate(-50%, -50%)',
          background: `linear-gradient(90deg, transparent, ${C.yellow}, transparent)`,
          opacity: beamOut * 0.9,
          filter: `blur(${1.5 * k}px)`,
        }}
      />

      {/* SEKCE: fotokarty */}
      {frame >= T_CARDS - 10 && frame < T_GRID + 6 && (
        <AbsoluteFill>
          <PhotoCard src="ig-editorial.jpg" delay={T_CARDS} x={30} y={64} w={400} h={540} rot={-4} k={k} exitAt={T_GRID - 20} />
          <PhotoCard src="ig-woman-round.jpg" delay={T_CARDS + 10} x={70} y={70} w={380} h={510} rot={5} k={k} exitAt={T_GRID - 24} />
        </AbsoluteFill>
      )}

      {/* SEKCE: mozaika obrub */}
      {frame >= T_GRID - 10 && frame < T_OUT + 6 && (
        <AbsoluteFill style={{opacity: gridOut}}>
          <Mosaic startAt={T_GRID} k={k} />
          <AbsoluteFill
            style={{background: `linear-gradient(180deg, ${C.bg} 2%, transparent 26%, transparent 74%, ${C.bg} 98%)`}}
          />
        </AbsoluteFill>
      )}

      {/* LOGO — formace, pak let do hlavičky */}
      {frame < T_OUT && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{transform: `translate(${logoX}px, ${logoY}px)`, width: logoW}}>
            <LogoMark timing={{tNodes: T_NODES, tLines: T_LINES, tDraw: T_DRAW, tLock: T_LOCK}} />
          </div>
        </AbsoluteFill>
      )}

      {/* wordmark pod logem v intru */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            marginTop: 300 * k,
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 76 * k,
            letterSpacing: '-0.02em',
            color: C.cream,
            opacity: wm * wmOut,
            transform: `translateY(${(1 - wm) * 24 * k}px)`,
          }}
        >
          Optik <span style={{color: C.yellow}}>Dvořák</span>
        </div>
      </AbsoluteFill>

      {/* hlavička */}
      <div
        style={{
          position: 'absolute',
          top: 90 * k,
          left: 164 * k,
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

      {/* TEXT: claim */}
      {frame < T_WORDS && (
        <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', alignItems: 'center'}}>
          <div style={{marginTop: -430 * k, textAlign: 'center', opacity: claim * claimOut}}>
            <div style={{fontFamily: MONO, fontSize: 24 * k, color: C.yellowDeep, marginBottom: 16 * k}}>
              // Americká 325/23 · Plzeň
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 108 * k,
                lineHeight: 1.02,
                letterSpacing: '-0.035em',
                color: C.cream,
                transform: `translateY(${(1 - claim) * 26 * k}px)`,
              }}
            >
              Rodinná optika,
              <br />
              <span style={{color: C.yellow}}>ne řetězec.</span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* TEXT: kinetická slova */}
      {frame >= T_WORDS - 10 && frame < T_GRID + 6 && (
        <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center'}}>
          <div style={{marginTop: -300 * k, opacity: wordsOut}}>
            <div
              style={{fontFamily: MONO, fontSize: 24 * k, color: C.yellowDeep, opacity: wordsEyebrow, marginBottom: 10 * k}}
            >
              // co u nás dostanete
            </div>
            <WordCycle words={['Čas na vás.', 'Osobní přístup.', 'Značkové obruby.']} startAt={T_WORDS} hold={48} k={k} />
          </div>
        </AbsoluteFill>
      )}

      {/* OUTRO */}
      {frame >= T_OUT - 4 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30 * k, padding: 90 * k}}>
          <div style={{width: 300 * k, opacity: outLogo, transform: `scale(${outLogo})`}}>
            {/* časování dávno v minulosti = logo je rovnou hotové, bez formace
                (hodnoty musí být rostoucí — interpolate vyžaduje monotónní rozsah) */}
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
            Zastavte se za námi →
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

      {/* záblesk zaklapnutí */}
      <AbsoluteFill style={{background: C.yellow, opacity: flash, mixBlendMode: 'screen'}} />
      {/* vinětace */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
