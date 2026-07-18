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
import {LogoMark} from './LogoMark';

/* Konverzní Reel na SOBOTU — víkend máme ZAVŘENO.
   Úhel: háček na bolest (rozmazané vidění) → honest „zavřeno" →
   nízkotřecí CTA, které jde i o víkendu (objednat online / DM 24/7).
   Žádná falešná urgence, žádné vymyšlené otevírací hodiny. */

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

export const FPS = 60;
export const SOBOTA_DURATION = 900; // 15 s

const F = (s: number) => Math.round(s * FPS);
/* scény */
const T_HOOK = F(0.3);
const T_CLOSED = F(3.6); // „o víkendu zavřeno"
const T_TURN = F(4.9); // obrat: „ale termín teď"
const T_BULLETS = F(6.6);
const T_CTA = F(9.8);

const useScale = () => useVideoConfig().width / 1080;

/* ---------- Zrno (sdílené s Teaser) ---------- */
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
const HeadWords: React.FC<{words: string[]; startAt: number; k: number; color?: string; dot?: boolean}> = ({
  words,
  startAt,
  k,
  color = C.cream,
  dot = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: `0 ${20 * k}px`, color}}>
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
    <div style={{display: 'flex', alignItems: 'center', gap: 16 * k, opacity: p, transform: `translateX(${(1 - p) * -24 * k}px)`}}>
      <span style={{color: C.yellowDeep, fontFamily: MONO, fontSize: 28 * k}}>→</span>
      <span style={{fontFamily: BODY, fontWeight: 600, fontSize: 36 * k, color: C.cream}}>{text}</span>
    </div>
  );
};

export const ReelSobota = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* pozadí: rozmazané → ostré (metafora zraku i „vyjasnění") */
  const blur = interpolate(frame, [0, T_TURN], [26, 3], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  const ken = interpolate(frame, [0, SOBOTA_DURATION], [1.14, 1.02]);
  const photo = interpolate(frame, [0, 30, T_CTA - 10, T_CTA + 20], [0, 0.42, 0.42, 0.22], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* scéna 1: háček (zmizí při obratu) */
  const s1 = interpolate(frame, [T_HOOK, T_HOOK + 12, T_CLOSED, T_CLOSED + 12], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* scéna 2: „zavřeno → ale termín teď" (zmizí před bullety) */
  const s2 = interpolate(frame, [T_CLOSED, T_CLOSED + 12, T_BULLETS - 4, T_BULLETS + 8], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* scéna 3: bullety (zmizí před CTA) */
  const s3 = interpolate(frame, [T_BULLETS, T_BULLETS + 10, T_CTA - 4, T_CTA + 8], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* CTA */
  const ctaP = spring({frame: frame - T_CTA, fps, config: {damping: 14, stiffness: 140}});
  const ctaPulse = 1 + Math.sin(Math.max(0, frame - T_CTA - 20) / 10) * 0.015;
  const shine = interpolate(frame, [T_CTA + 18, T_CTA + 60], [-150, 260], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rule = spring({frame: frame - T_CTA + 6, fps, config: {damping: 200}});

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music.wav')}
        volume={(f) =>
          interpolate(f, [0, 8, SOBOTA_DURATION - 30, SOBOTA_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* pozadí — rozmazané portrétové stock foto (volná licence), zaostřuje se */}
      <AbsoluteFill style={{opacity: photo, transform: `scale(${ken})`, filter: `blur(${blur}px)`}}>
        <Img src={staticFile('stock-portrait.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.bg} 0%, rgba(10,10,10,0.55) 30%, rgba(10,10,10,0.88) 60%, ${C.bg} 100%)`,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, rgba(255,228,92,0.05), transparent 52%)'}} />

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
        }}
      >
        Optik <span style={{color: C.yellow}}>Dvořák</span>
      </div>
      <div style={{position: 'absolute', top: 102 * k, right: 90 * k, fontFamily: MONO, fontSize: 20 * k, color: C.dim}}>
        // sobota
      </div>

      {/* SCÉNA 1 — háček na bolest */}
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', opacity: s1}}>
        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 20 * k}}>
          // večer · ležíš · scrolluješ
        </div>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 128 * k, lineHeight: 1.0, letterSpacing: '-0.035em'}}>
          <HeadWords words={['Vidíš', 'tohle']} startAt={T_HOOK} k={k} />
          <HeadWords words={['rozmazaně?']} startAt={T_HOOK + 8} k={k} dot />
        </div>
      </AbsoluteFill>

      {/* SCÉNA 2 — honest zavřeno → obrat */}
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', opacity: s2}}>
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 40 * k, color: C.dim, marginBottom: 26 * k}}>
          O víkendu máme zavřeno.
        </div>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 116 * k, lineHeight: 1.02, letterSpacing: '-0.035em'}}>
          <HeadWords words={['Termín', 'si', 'ale']} startAt={T_TURN} k={k} />
          <HeadWords words={['vezmeš', 'teď.']} startAt={T_TURN + 8} k={k} dot />
        </div>
      </AbsoluteFill>

      {/* SCÉNA 3 — proč my */}
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', opacity: s3}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 72 * k, color: C.cream, marginBottom: 44 * k, letterSpacing: '-0.03em'}}>
          Než přijdeš v týdnu:
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 26 * k}}>
          <Bullet text="Měření zraku odborníkem" delay={T_BULLETS + 6} k={k} />
          <Bullet text="Brýle na míru tvému obličeji" delay={T_BULLETS + 20} k={k} />
          <Bullet text="Rodinná optika v Plzni od 1991" delay={T_BULLETS + 34} k={k} />
        </div>
      </AbsoluteFill>

      {/* SCÉNA 4 — CTA (logo + akce, drží do konce) */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: ctaP}}>
        <div style={{width: 360 * k, transform: `scale(${ctaP})`}}>
          {/* logo už zaklaplé — časování v minulosti, aby bylo staticky hotové */}
          <LogoMark timing={{tNodes: -60, tLines: -50, tDraw: -40, tLock: -20}} />
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 66 * k,
            color: C.cream,
            marginTop: 48 * k,
            letterSpacing: '-0.03em',
            textAlign: 'center',
          }}
        >
          Objednej se online.
        </div>
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 34 * k, color: C.dim, marginTop: 16 * k, textAlign: 'center'}}>
          Kdykoli — i teď v sobotu. Ozveme se v týdnu.
        </div>
      </AbsoluteFill>

      {/* SPODNÍ LIŠTA + tlačítko */}
      <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 170 * k, opacity: ctaP}}>
        <div
          style={{
            height: 1,
            background: 'rgba(244,241,234,0.22)',
            transform: `scaleX(${rule})`,
            transformOrigin: 'left',
            marginBottom: 40 * k,
          }}
        />
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontFamily: MONO, fontSize: 22 * k, color: C.dim}}>
            optikdvorak.cz
            <br />
            Americká 325/23 · Plzeň
          </div>
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
              transform: `scale(${ctaPulse})`,
              boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
              whiteSpace: 'nowrap',
            }}
          >
            Rezervovat termín →
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

      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};

/* PLACEHOLDER pro majitelku:
   - „Rezervovat termín" musí vést na reálnou akci. Web má formulář → poptávka jde na optika.americka@seznam.cz.
     Buď dej do IG/FB bio odkaz na optikdvorak.cz#kontakt, nebo v popisku vyzvi „napiš do DM".
   - Pokud máte přesné otevírací hodiny v týdnu, můžu je doplnit místo obecného „ozveme se v týdnu". */
