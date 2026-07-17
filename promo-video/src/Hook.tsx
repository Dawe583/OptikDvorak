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

const GRADE = 'saturate(0.9) contrast(1.12) brightness(0.8) sepia(0.18)';

export const FPS = 60;
export const HOOK_DURATION = 660; // 11 s

const F = (s: number) => Math.round(s * FPS);
/* Klíčové okamžiky (musí sedět se scripts/make-hook-audio.mjs) */
const T_SNAP = F(0.95); // doostření + první úder = konec háčku
const T_P1 = F(1.25);
const T_P2 = F(1.98);
const T_P3 = F(2.72);
const T_TURN = F(3.45); // „A DOST." + druhý úder
const T_BRAND = F(4.15); // logo + wordmark
const T_SVC = F(5.25); // služby
const T_CLAIM = F(7.7); // claim
const T_CTA = F(8.5); // CTA
const T_END = F(10.2);

const useK = () => useVideoConfig().width / 1080;

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

/* ---------- Rozostřené pozadí s rychlým Ken Burns ---------- */
const Bg: React.FC<{src: string; from: number; to: number; blurFrom: number; blurTo: number; zoomFrom: number; zoomTo: number; snapAt?: number}> = ({
  src,
  from,
  to,
  blurFrom,
  blurTo,
  zoomFrom,
  zoomTo,
  snapAt,
}) => {
  const frame = useCurrentFrame();
  const k = useK();
  const op = interpolate(frame, [from, from + 6, to - 8, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0) return null;
  const zoom = interpolate(frame, [from, to], [zoomFrom, zoomTo], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const blur = snapAt
    ? interpolate(frame, [from, snapAt - 4, snapAt], [blurFrom, blurFrom, blurTo], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : interpolate(frame, [from, to], [blurFrom, blurTo], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: op, transform: `scale(${zoom})`}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `${GRADE} blur(${blur * k}px)`}} />
    </AbsoluteFill>
  );
};

/* ---------- Slovo háčku — velké a čitelné hned od snímku 0, jen se „usadí" ---------- */
const HookWord: React.FC<{text: string; at: number; k: number; color: string; size: number}> = ({text, at, k, color, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  /* overshoot-settle: v klidovém stavu p=0 → text je už velký a viditelný (scale 1.12),
     pak se dosedne na 1.0 — první snímek reelu je tím pádem silný, ne prázdný */
  const p = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 170}});
  const s = 1.12 - p * 0.12;
  const blur = (1 - p) * 9;
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size * k,
        lineHeight: 0.92,
        letterSpacing: '-0.04em',
        color,
        transform: `scale(${s})`,
        filter: `blur(${blur * k}px)`,
        textTransform: 'uppercase',
        textShadow: `0 ${8 * k}px ${40 * k}px rgba(0,0,0,0.55)`,
      }}
    >
      {text}
    </div>
  );
};

/* ---------- Problémová karta (rychlý střih) ---------- */
const Problem: React.FC<{src: string; text: string; at: number; dur: number; k: number}> = ({src, text, at, dur, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at - 6 || frame > at + dur + 6) return null;
  const p = spring({frame: frame - at, fps, config: {damping: 16, stiffness: 200}});
  const out = interpolate(frame, [at + dur - 8, at + dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoom = interpolate(frame, [at, at + dur], [1.18, 1.28], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{opacity: 0.4, transform: `scale(${zoom})`}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `${GRADE} blur(${14 * k}px)`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(7,7,7,0.7), rgba(7,7,7,0.35) 45%, rgba(7,7,7,0.85))`}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: `0 ${100 * k}px`}}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 128 * k,
            lineHeight: 0.98,
            letterSpacing: '-0.04em',
            color: C.cream,
            textAlign: 'center',
            textTransform: 'uppercase',
            transform: `translateY(${(1 - p) * 40 * k}px) scale(${0.9 + p * 0.1})`,
            opacity: p,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Střídání slov (služby) ---------- */
const WordCycle: React.FC<{words: string[]; startAt: number; hold: number; k: number}> = ({words, startAt, hold, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'relative', height: 150 * k}}>
      {words.map((w, i) => {
        const at = startAt + i * hold;
        const inP = spring({frame: frame - at, fps, config: {damping: 18, stiffness: 180}});
        const outP = i < words.length - 1 ? spring({frame: frame - (at + hold), fps, config: {damping: 18, stiffness: 180}}) : 0;
        if (frame < at - 6) return null;
        return (
          <div key={w} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', overflow: 'hidden'}}>
            <span
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 112 * k,
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

/* ---------- Hlavní kompozice ---------- */
export const Hook = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useK();

  /* háček */
  const hookOut = interpolate(frame, [T_SNAP + 2, T_SNAP + 12], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const kicker = interpolate(frame, [0, 6, T_SNAP - 4, T_SNAP], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hookKick = spring({frame: frame - T_SNAP, fps, config: {damping: 10, stiffness: 200}});

  /* úderové záblesky */
  const flash1 = interpolate(frame, [T_SNAP - 2, T_SNAP, T_SNAP + 10], [0, 0.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flash2 = interpolate(frame, [T_TURN - 2, T_TURN, T_TURN + 10], [0, 0.45, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* zvrat „A DOST." */
  const turnP = spring({frame: frame - T_TURN, fps, config: {damping: 11, stiffness: 200}});
  const turnOut = interpolate(frame, [T_BRAND - 8, T_BRAND], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* logo: střed → hlavička */
  const move = spring({frame: frame - (T_BRAND + 30), fps, config: {damping: 200}, durationInFrames: 26});
  const logoW = interpolate(move, [0, 1], [420 * k, 62 * k]);
  const logoX = interpolate(move, [0, 1], [0, -(540 - 90 - 31) * k]);
  const logoY = interpolate(move, [0, 1], [0, -(1920 / 2 - 118) * k]);
  const logoShow = frame >= T_BRAND - 4 && frame < T_CLAIM;

  const wmUnder = spring({frame: frame - (T_BRAND + 8), fps, config: {damping: 200}});
  const wmUnderOut = interpolate(frame, [T_BRAND + 30, T_BRAND + 42], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hdr = interpolate(frame, [T_BRAND + 40, T_BRAND + 54, T_END, T_END + 10], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* služby */
  const svcEyebrow = spring({frame: frame - T_SVC, fps, config: {damping: 200}});
  const svcOut = interpolate(frame, [T_CLAIM - 12, T_CLAIM], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* claim */
  const claim1 = spring({frame: frame - T_CLAIM, fps, config: {damping: 16, stiffness: 150}});
  const claim2 = spring({frame: frame - T_CLAIM - 8, fps, config: {damping: 16, stiffness: 150}});
  const claimOut = interpolate(frame, [T_END - 10, T_END], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* CTA */
  const ctaP = spring({frame: frame - T_CTA, fps, config: {damping: 14, stiffness: 150}});
  const ctaPulse = 1 + Math.sin(Math.max(0, frame - T_CTA - 18) / 10) * 0.02;
  const shine = interpolate(frame, [T_CTA + 16, T_CTA + 58], [-150, 260], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  /* end card */
  const endP = spring({frame: frame - T_END, fps, config: {damping: 13, stiffness: 130}});

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music-hook.wav')}
        volume={(f) =>
          interpolate(f, [0, 4, HOOK_DURATION - 26, HOOK_DURATION], [0.5, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* HÁČEK: rozostřený portrét (viditelný hned od snímku 0), který se doostří */}
      {frame < T_SNAP + 14 && (
        <Bg src="stock-portrait.jpg" from={-12} to={T_SNAP + 14} blurFrom={17} blurTo={0} zoomFrom={1.32} zoomTo={1.12} snapAt={T_SNAP} />
      )}

      {/* PROBLÉMY */}
      <Problem src="ig-editorial.jpg" text="Rozmazané SMS?" at={T_P1} dur={T_P2 - T_P1} k={k} />
      <Problem src="stock-frames.jpg" text="Pálí vás oči?" at={T_P2} dur={T_P3 - T_P2} k={k} />
      <Problem src="ig-woman-round.jpg" text="Mhouříte za volantem?" at={T_P3} dur={T_TURN - T_P3} k={k} />

      {/* společný scrim */}
      <AbsoluteFill
        style={{background: `linear-gradient(180deg, rgba(7,7,7,0.55) 0%, rgba(7,7,7,0.15) 34%, rgba(7,7,7,0.55) 70%, ${C.bg} 100%)`, opacity: frame < T_TURN ? 1 : 0}}
      />

      {/* ambientní záře */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, rgba(255,228,92,0.05), transparent 52%)'}} />

      {/* HÁČEK TEXT */}
      {frame < T_SNAP + 12 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: hookOut}}>
          <div style={{transform: `scale(${1 + hookKick * 0.06})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${2 * k}px`}}>
            <HookWord text="Vidíte" at={0} k={k} color={C.cream} size={168} />
            <HookWord text="svět" at={6} k={k} color={C.cream} size={168} />
            <HookWord text="ostře?" at={12} k={k} color={C.yellow} size={168} />
          </div>
        </AbsoluteFill>
      )}

      {/* mono kicker nahoře */}
      {frame < T_SNAP && (
        <div
          style={{
            position: 'absolute',
            top: 150 * k,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: MONO,
            fontSize: 28 * k,
            letterSpacing: '0.1em',
            color: C.yellowDeep,
            opacity: kicker,
          }}
        >
          // rychlý test zraku
        </div>
      )}

      {/* ZVRAT „A DOST." */}
      {frame >= T_TURN - 4 && frame < T_BRAND + 2 && (
        <AbsoluteFill style={{background: C.ink900, justifyContent: 'center', alignItems: 'center', opacity: turnOut}}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 210 * k,
              letterSpacing: '-0.04em',
              color: C.cream,
              textTransform: 'uppercase',
              transform: `scale(${0.8 + turnP * 0.2})`,
            }}
          >
            A dost<span style={{color: C.yellow}}>.</span>
          </div>
        </AbsoluteFill>
      )}

      {/* tmavé pozadí po zvratu */}
      {frame >= T_BRAND - 2 && <AbsoluteFill style={{background: C.bg}} />}

      {/* LOGO formace → hlavička */}
      {logoShow && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{transform: `translate(${logoX}px, ${logoY}px)`, width: logoW}}>
            <LogoMark timing={{tNodes: T_BRAND, tLines: T_BRAND + 8, tDraw: T_BRAND + 14, tLock: T_BRAND + 24}} />
          </div>
        </AbsoluteFill>
      )}

      {/* wordmark pod logem */}
      {frame >= T_BRAND && frame < T_BRAND + 46 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div
            style={{
              marginTop: 280 * k,
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 82 * k,
              letterSpacing: '-0.02em',
              color: C.cream,
              opacity: wmUnder * wmUnderOut,
              transform: `translateY(${(1 - wmUnder) * 24 * k}px)`,
            }}
          >
            Optik <span style={{color: C.yellow}}>Dvořák</span>
          </div>
        </AbsoluteFill>
      )}

      {/* hlavička */}
      <div style={{position: 'absolute', top: 90 * k, left: 164 * k, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30 * k, color: C.cream, opacity: hdr}}>
        Optik <span style={{color: C.yellow}}>Dvořák</span>
      </div>
      <div style={{position: 'absolute', top: 96 * k, right: 90 * k, fontFamily: MONO, fontSize: 20 * k, color: C.dim, opacity: hdr}}>
        // Plzeň
      </div>

      {/* SLUŽBY */}
      {frame >= T_SVC - 6 && frame < T_CLAIM + 4 && (
        <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center'}}>
          <div style={{marginTop: 60 * k, opacity: svcOut}}>
            <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, opacity: svcEyebrow, marginBottom: 14 * k}}>// co pro vás uděláme</div>
            <WordCycle words={['Změříme zrak.', 'Vybereme obruby.', 'Nasadíme čočky.']} startAt={T_SVC + 8} hold={46} k={k} />
          </div>
        </AbsoluteFill>
      )}

      {/* CLAIM */}
      {frame >= T_CLAIM - 6 && frame < T_END + 4 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: `0 ${90 * k}px`}}>
          <div style={{textAlign: 'center', opacity: claimOut}}>
            <div style={{overflow: 'hidden'}}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 110 * k,
                  lineHeight: 1.02,
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
                  fontSize: 110 * k,
                  lineHeight: 1.02,
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

      {/* CTA */}
      {frame >= T_CTA - 4 && (
        <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 300 * k, display: 'flex', justifyContent: 'center', opacity: ctaP}}>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: C.yellow,
              color: C.ink900,
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 40 * k,
              padding: `${26 * k}px ${54 * k}px`,
              borderRadius: 999,
              transform: `scale(${ctaP * ctaPulse})`,
              boxShadow: `0 0 ${50 * k}px rgba(255,228,92,0.4)`,
              whiteSpace: 'nowrap',
            }}
          >
            Objednejte se →
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
      )}

      {/* END CARD */}
      {frame >= T_END - 2 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 28 * k, padding: 90 * k, background: C.bg}}>
          <div style={{width: 300 * k, opacity: endP, transform: `scale(${endP})`}}>
            <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
          </div>
          <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 72 * k, letterSpacing: '-0.02em', color: C.cream, opacity: endP}}>
            Optik <span style={{color: C.yellow}}>Dvořák</span>
          </div>
          <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 34 * k, color: C.dim, textAlign: 'center', lineHeight: 1.5, opacity: endP}}>
            Americká 325/23, Plzeň
            <br />
            optikdvorak.cz
          </div>
        </AbsoluteFill>
      )}

      {/* záblesky úderů */}
      <AbsoluteFill style={{background: C.yellow, opacity: flash1, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: C.cream, opacity: flash2, mixBlendMode: 'screen'}} />
      {/* vinětace */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 48%, rgba(0,0,0,0.6) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
