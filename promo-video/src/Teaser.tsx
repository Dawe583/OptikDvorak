import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

const {fontFamily: DISPLAY} = loadBricolage('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});
const {fontFamily: BODY} = loadInter('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext']});
const {fontFamily: MONO} = loadMono('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

/* Brand paleta — tmavá varianta webu */
const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  dim: 'rgba(244,241,234,0.5)',
};

export const FPS = 60;
export const TEASER_DURATION = 600; // 10 s

/* Klíčové okamžiky (sekundy → framy) — musí sedět s scripts/make-audio.mjs */
const F = (s: number) => Math.round(s * FPS);
const T_NODES = F(0.35);
const T_LINES = F(1.0);
const T_DRAW = F(1.45);
const T_LOCK = F(2.6); // logo zaklapne + impakt
const T_MOVE = F(3.0); // logo letí do hlavičky
const T_TERM = F(3.5);
const T_HEAD = F(4.2);
const T_BULLETS = F(6.0);
const T_CTA = F(8.2);

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

/* ---------- Logo brýlí: formace z uzlů → obrys → zaklapnutí ----------
   Geometrie odpovídá /public/logo-mark.svg (viewBox 0 0 184 84). */
const LENS_R = 26;
const CIRC = 2 * Math.PI * LENS_R;
const NODES = [
  [56, 18], [56, 70], [30, 44], [82, 44], // levá čočka
  [128, 18], [128, 70], [102, 44], [154, 44], // pravá čočka
  [92, 35], // most
  [12, 27], [172, 27], // konce straniček
];

const LogoMark: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  /* fáze formace */
  const lines = interpolate(frame, [T_LINES, T_DRAW], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const draw = interpolate(frame, [T_DRAW, T_LOCK - 6], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lock = spring({frame: frame - T_LOCK, fps, config: {damping: 9, stiffness: 200}});
  const nodesFade = interpolate(frame, [T_LOCK - 10, T_LOCK + 8], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* glow pulz po zaklapnutí */
  const glow = frame > T_LOCK ? 1 + Math.sin((frame - T_LOCK) / 14) * 0.12 : 1;

  return (
    <svg viewBox="0 0 184 84" style={{width: '100%', overflow: 'visible'}}>
      <defs>
        <filter id="g" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* konstelační spojnice mezi uzly */}
      <g opacity={lines * (1 - draw) * 0.5} stroke={C.yellow} strokeWidth="0.5">
        {NODES.map(([x1, y1], i) =>
          NODES.slice(i + 1).map(([x2, y2], j) => {
            const d = Math.hypot(x2 - x1, y2 - y1);
            if (d > 62) return null;
            return <line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })
        )}
      </g>

      {/* obrys brýlí — kreslení stroke-dashoffset */}
      <g filter="url(#g)" style={{transform: `scale(${frame > T_LOCK ? 1 + (1 - lock) * 0.03 : 1})`, transformOrigin: 'center'}}>
        <circle
          cx="56" cy="44" r={LENS_R}
          stroke={C.cream} strokeWidth="5" fill="none"
          strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - draw)}
          transform="rotate(-90 56 44)"
        />
        <circle
          cx="128" cy="44" r={LENS_R}
          stroke={C.cream} strokeWidth="5" fill="none"
          strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - draw)}
          transform="rotate(-90 128 44)"
        />
        {/* most — žlutý akcent, dokresluje se nakonec */}
        <path
          d="M83 39c6-8 12-8 18 0"
          stroke={C.yellow} strokeWidth="5" strokeLinecap="round" fill="none"
          strokeDasharray="24" strokeDashoffset={24 * (1 - Math.max(0, (draw - 0.55) / 0.45))}
          style={{filter: `drop-shadow(0 0 ${6 * glow}px ${C.yellow})`}}
        />
        {/* stranička levá */}
        <path
          d="M32 35 12 27"
          stroke={C.cream} strokeWidth="5" strokeLinecap="round" fill="none"
          strokeDasharray="22" strokeDashoffset={22 * (1 - Math.max(0, (draw - 0.7) / 0.3))}
        />
        {/* stranička pravá */}
        <path
          d="M152 35 172 27"
          stroke={C.cream} strokeWidth="5" strokeLinecap="round" fill="none"
          strokeDasharray="22" strokeDashoffset={22 * (1 - Math.max(0, (draw - 0.7) / 0.3))}
        />
      </g>

      {/* svítící uzly */}
      <g opacity={nodesFade}>
        {NODES.map(([x, y], i) => {
          const p = spring({frame: frame - T_NODES - i * 3, fps, config: {damping: 12, stiffness: 220}});
          return (
            <circle
              key={i} cx={x} cy={y} r={1.8 * p}
              fill={C.yellow}
              style={{filter: `drop-shadow(0 0 ${5 * p}px ${C.yellow})`}}
            />
          );
        })}
      </g>
    </svg>
  );
};

/* ---------- Terminálový řádek s kurzorem ---------- */
const TerminalLine: React.FC<{text: string; startAt: number}> = ({text, startAt}) => {
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
  return (
    <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, letterSpacing: '0.02em'}}>
      {text.slice(0, chars)}
      <span
        style={{
          display: 'inline-block',
          width: 12 * k,
          height: 26 * k,
          background: C.yellowDeep,
          marginLeft: 3 * k,
          verticalAlign: 'text-bottom',
          opacity: done && Math.floor(frame / 18) % 2 === 0 ? 0 : 0.9,
        }}
      />
    </div>
  );
};

/* ---------- Slovní reveal nadpisu ---------- */
const HeadWords: React.FC<{words: string[]; startAt: number; k: number; dot?: boolean}> = ({
  words,
  startAt,
  k,
  dot = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: `0 ${20 * k}px`}}>
      {words.map((w, i) => {
        const p = spring({frame: frame - startAt - i * 5, fps, config: {damping: 18, stiffness: 150}});
        const isLast = i === words.length - 1;
        return (
          <span key={w} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 6 * k}}>
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

/* ---------- Odrážka ---------- */
const Bullet: React.FC<{text: string; delay: number; k: number}> = ({text, delay, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16 * k,
        opacity: p,
        transform: `translateX(${(1 - p) * -24 * k}px)`,
      }}
    >
      <span style={{color: C.yellowDeep, fontFamily: MONO, fontSize: 28 * k}}>→</span>
      <span style={{fontFamily: BODY, fontWeight: 600, fontSize: 34 * k, color: C.cream}}>{text}</span>
    </div>
  );
};

/* ---------- Hlavní kompozice ---------- */
export const Teaser = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* logo: střed → hlavička */
  const move = spring({frame: frame - T_MOVE, fps, config: {damping: 200}, durationInFrames: 26});
  const logoW = interpolate(move, [0, 1], [460 * k, 62 * k]);
  const logoX = interpolate(move, [0, 1], [0, -(540 - 90 - 31) * k]);
  const logoY = interpolate(move, [0, 1], [0, -(1920 / 2 - 118) * k]);

  /* wordmark pod logem (jen v intru) */
  const wm = spring({frame: frame - T_LOCK - 6, fps, config: {damping: 200}});
  const wmOut = interpolate(frame, [T_MOVE, T_MOVE + 12], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* wordmark v hlavičce */
  const hdr = interpolate(frame, [T_MOVE + 10, T_MOVE + 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* pozadí: fotky nastupují po zaklapnutí */
  const photoA = interpolate(frame, [T_MOVE, T_MOVE + 40, T_BULLETS - 10, T_BULLETS + 20], [0, 0.5, 0.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const photoB = interpolate(frame, [T_BULLETS - 10, T_BULLETS + 25, TEASER_DURATION], [0, 0.32, 0.32], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const kenA = interpolate(frame, [T_MOVE, TEASER_DURATION], [1.06, 1.2]);
  const kenB = interpolate(frame, [T_BULLETS - 10, TEASER_DURATION], [1.14, 1.02]);

  /* záblesk při zaklapnutí */
  const flash = interpolate(frame, [T_LOCK - 2, T_LOCK, T_LOCK + 12], [0, 0.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* světelný paprsek v intru */
  const beamW = interpolate(frame, [0, T_LINES], [0, 1], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  const beamOut = interpolate(frame, [T_DRAW, T_LOCK], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* CTA */
  const ctaP = spring({frame: frame - T_CTA, fps, config: {damping: 14, stiffness: 140}});
  const ctaPulse = 1 + Math.sin(Math.max(0, frame - T_CTA - 20) / 10) * 0.015;
  const shine = interpolate(frame, [T_CTA + 18, T_CTA + 60], [-150, 260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rule = spring({frame: frame - T_CTA + 6, fps, config: {damping: 200}});

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music.wav')}
        volume={(f) =>
          interpolate(f, [0, 8, TEASER_DURATION - 30, TEASER_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* fotografická pozadí (Pexels, volná licence) */}
      <AbsoluteFill style={{opacity: photoA, transform: `scale(${kenA})`}}>
        <Img src={staticFile('stock-portrait.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: photoB, transform: `scale(${kenB})`}}>
        <Img src={staticFile('stock-frames.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {/* scrim — fotky drží vzadu, text zůstává čitelný */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.bg} 0%, rgba(10,10,10,0.55) 32%, rgba(10,10,10,0.88) 62%, ${C.bg} 100%)`,
        }}
      />
      {/* ambientní záře — držet nízko, jinak žlutá přes černou zhnědne */}
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 42%, rgba(255,228,92,0.05), transparent 52%)'}}
      />

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

      {/* LOGO — formace ve středu, pak let do hlavičky */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{transform: `translate(${logoX}px, ${logoY}px)`, width: logoW}}>
          <LogoMark />
        </div>
      </AbsoluteFill>

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
        // plzeň
      </div>

      {/* OBSAH */}
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center'}}>
        <div style={{marginTop: 120 * k}}>
          <TerminalLine text="// měření zraku · brýle · čočky" startAt={T_TERM} />
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 118 * k,
              lineHeight: 1.02,
              letterSpacing: '-0.035em',
              color: C.cream,
              marginTop: 22 * k,
            }}
          >
            <HeadWords words={['Vidět', 'ostře']} startAt={T_HEAD} k={k} />
            <HeadWords words={['je', 'krásné.']} startAt={T_HEAD + 8} k={k} dot />
          </div>

          <div style={{marginTop: 54 * k, display: 'flex', flexDirection: 'column', gap: 22 * k}}>
            <Bullet text="Multifokální skla 1 + 1 zdarma" delay={T_BULLETS} k={k} />
            <Bullet text="Řidičská skla EnRoute −30 %" delay={T_BULLETS + 14} k={k} />
            <Bullet text="Servis brýlí na počkání" delay={T_BULLETS + 28} k={k} />
          </div>
        </div>
      </AbsoluteFill>

      {/* SPODNÍ LIŠTA + CTA */}
      <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 150 * k}}>
        <div
          style={{
            height: 1,
            background: 'rgba(244,241,234,0.22)',
            transform: `scaleX(${rule})`,
            transformOrigin: 'left',
            marginBottom: 40 * k,
          }}
        />
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaP}}>
          <div style={{fontFamily: MONO, fontSize: 24 * k, color: C.dim}}>optikdvorak.cz</div>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: C.yellow,
              color: C.ink900,
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 30 * k,
              padding: `${20 * k}px ${38 * k}px`,
              borderRadius: 999,
              transform: `scale(${ctaP * ctaPulse})`,
              boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
              whiteSpace: 'nowrap',
            }}
          >
            Objednat měření zraku →
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
        </div>
      </div>

      {/* záblesk zaklapnutí */}
      <AbsoluteFill style={{background: C.yellow, opacity: flash, mixBlendMode: 'screen'}} />
      {/* vinětace */}
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)'}}
      />
      <Grain />
    </AbsoluteFill>
  );
};
