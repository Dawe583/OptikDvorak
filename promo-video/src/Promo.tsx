import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {fade} from '@remotion/transitions/fade';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

const {fontFamily: DISPLAY} = loadBricolage('normal', {
  weights: ['700', '800'],
  subsets: ['latin', 'latin-ext'],
});
const {fontFamily: BODY} = loadInter('normal', {
  weights: ['500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
});

/* Brand tokeny (shodné s webem — src/css/tokens.css) */
const C = {
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  ink: '#141414',
  ink900: '#0C0C0C',
  inkSoft: '#55534E',
  amberInk: '#6E5200',
};

export const FPS = 30;
const S1 = 96; // claim
const S2 = 120; // prodejna (video)
const S3 = 108; // akce 1+1
const S4 = 96; // akce −30 %
const S5 = 138; // CTA
const T = 15; // délka přechodu
export const PROMO_DURATION = S1 + S2 + S3 + S4 + S5 - 4 * T; // 498
/* Globální frame začátků scén 2–5 (pro flashe): 81, 186, 279, 360 */
const CUTS = [81 + 7, 186 + 7, 279 + 7, 360 + 7];

const useScale = () => useVideoConfig().width / 1080;

/* ---------- Film grain (jako na webu) ---------- */
const GRAIN_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/></filter><rect width="240" height="240" filter="url(#n)" opacity="0.55"/></svg>'
  );
const Grain = () => {
  const frame = useCurrentFrame();
  /* poskakující pozice = živé zrno */
  const x = (frame * 37) % 240;
  const y = (frame * 53) % 240;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN_URI}")`,
        backgroundPosition: `${x}px ${y}px`,
        opacity: 0.05,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

/* ---------- Progress bar nahoře ---------- */
const Progress = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const k = useScale();
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: 8 * k,
        width: `${(frame / durationInFrames) * 100}%`,
        background: C.yellowDeep,
        zIndex: 10,
      }}
    />
  );
};

/* ---------- Žlutý flash na střihu ---------- */
const Flash = () => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const c of CUTS) o = Math.max(o, (1 - Math.abs(frame - c) / 4) * 0.28);
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: C.yellow, opacity: o, zIndex: 9}} />;
};

/* ---------- Eyebrow s linkou ---------- */
const Eyebrow: React.FC<{children: React.ReactNode; color?: string; delay?: number}> = ({
  children,
  color = C.ink,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const p = spring({frame, fps, delay, config: {damping: 200}});
  const line = spring({frame, fps, delay: delay + 4, config: {damping: 30, stiffness: 120}});
  return (
    <div
      style={{
        fontFamily: BODY,
        fontWeight: 700,
        fontSize: 26 * k,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 20 * k}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 18 * k,
      }}
    >
      <span style={{width: 56 * k * line, height: 2, background: color}} />
      {children}
    </div>
  );
};

/* ---------- Písmenkový reveal (masky po znacích) ---------- */
const Chars: React.FC<{text: string; delay: number; per?: number}> = ({text, delay, per = 2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {text.split('').map((ch, i) => {
        const p = spring({frame, fps, delay: delay + i * per, config: {damping: 16, stiffness: 170}});
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom'}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 108}%) rotate(${(1 - p) * 6}deg)`,
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          </span>
        );
      })}
    </>
  );
};

/* ---------- Scéna 1: claim na žluté ---------- */
const SceneClaim = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const drift = interpolate(frame, [0, S1], [0, -220 * k]);
  const under = spring({frame, fps, delay: 40, config: {damping: 24, stiffness: 110}});
  return (
    <AbsoluteFill style={{background: C.yellow, justifyContent: 'center', padding: 90 * k, gap: 44 * k}}>
      {/* obří obrysový wordmark v pozadí */}
      <div
        style={{
          position: 'absolute',
          top: '11%',
          left: 0,
          whiteSpace: 'nowrap',
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 210 * k,
          textTransform: 'uppercase',
          color: 'transparent',
          WebkitTextStroke: `2px ${C.amberInk}`,
          opacity: 0.16,
          transform: `translateX(${drift}px)`,
        }}
      >
        Optik Dvořák · Optik Dvořák
      </div>
      <Eyebrow color={C.amberInk}>Optik Dvořák · Plzeň</Eyebrow>
      <h1
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 148 * k,
          lineHeight: 1.04,
          color: C.ink,
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
        }}
      >
        <div><Chars text="Vidět" delay={6} /></div>
        <div><Chars text="ostře je" delay={16} /></div>
        <div style={{position: 'relative', display: 'inline-block'}}>
          <Chars text="krásné." delay={28} />
          <span
            style={{
              position: 'absolute',
              left: 0,
              bottom: -10 * k,
              width: `${under * 100}%`,
              height: 10 * k,
              background: C.ink,
            }}
          />
        </div>
      </h1>
      <Eyebrow color={C.amberInk} delay={46}>
        Rodinná optika od roku 1991
      </Eyebrow>
    </AbsoluteFill>
  );
};

/* ---------- Scéna 2: video z prodejny ---------- */
const SceneStore = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const zoom = interpolate(frame, [0, S2], [1.08, 1.2], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: 'clamp',
  });
  const frameDraw = spring({frame, fps, delay: 14, config: {damping: 26, stiffness: 90}});
  const badge = spring({frame, fps, delay: 30, config: {damping: 10, stiffness: 150}});
  const words = ['Změříme,', 'poradíme,', 'vyladíme', 'na míru.'];
  return (
    <AbsoluteFill style={{background: C.ink900}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <OffthreadVideo muted src={staticFile('hero.webm')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{background: 'linear-gradient(180deg, rgba(12,12,12,0.08) 30%, rgba(12,12,12,0.82) 100%)'}}
      />
      {/* kreslený žlutý rám */}
      <div
        style={{
          position: 'absolute',
          inset: 44 * k,
          border: `3px solid ${C.yellow}`,
          opacity: frameDraw,
          clipPath: `inset(0 ${(1 - frameDraw) * 100}% 0 0)`,
        }}
      />
      {/* badge */}
      <div
        style={{
          position: 'absolute',
          top: 90 * k,
          right: 90 * k,
          background: C.yellow,
          color: C.ink,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 34 * k,
          padding: `${14 * k}px ${26 * k}px`,
          textTransform: 'uppercase',
          transform: `rotate(-4deg) scale(${badge})`,
        }}
      >
        Od roku 1991
      </div>
      <AbsoluteFill style={{justifyContent: 'flex-end', padding: 100 * k, gap: 26 * k}}>
        <Eyebrow color={C.yellow} delay={8}>
          Americká 325/23 · Plzeň
        </Eyebrow>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 92 * k,
            lineHeight: 1.06,
            color: C.cream,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            display: 'flex',
            flexWrap: 'wrap',
            gap: `0 ${26 * k}px`,
          }}
        >
          {words.map((w, i) => {
            const p = spring({frame, fps, delay: 12 + i * 6, config: {damping: 15, stiffness: 150}});
            return (
              <span key={w} style={{display: 'inline-block', overflow: 'hidden'}}>
                <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>{w}</span>
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Obří číslo s efekty (scény 3 a 4) ---------- */
const SceneOffer: React.FC<{
  bg: string;
  fg: string;
  accent: string;
  tag: string;
  big?: string;
  countTo?: number;
  countPrefix?: string;
  countSuffix?: string;
  title: string;
  note: string;
}> = ({bg, fg, accent, tag, big, countTo, countPrefix = '', countSuffix = '', title, note}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const pop = spring({frame, fps, delay: 4, config: {damping: 10, stiffness: 140}});
  const pTitle = spring({frame, fps, delay: 18, config: {damping: 200}});
  const pNote = spring({frame, fps, delay: 28, config: {damping: 200}});
  /* dozvuk po dopadu čísla */
  const shake = frame > 12 && frame < 30 ? Math.sin(frame * 2.4) * (30 - frame) * 0.5 * k : 0;
  /* echo kruh — obrysová kopie čísla letící ven */
  const echo = interpolate(frame, [14, 48], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bigText =
    countTo != null
      ? `${countPrefix}${Math.round(
          interpolate(frame, [4, 26], [0, countTo], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        )}${countSuffix}`
      : big ?? '';
  const bigStyle: React.CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 800,
    fontSize: 320 * k,
    lineHeight: 1,
    letterSpacing: '-0.03em',
  };
  return (
    <AbsoluteFill
      style={{
        background: bg,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80 * k,
        gap: 10 * k,
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* pomalu jedoucí diagonální šrafy */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(45deg, ${
            fg === C.ink ? 'rgba(20,20,20,0.05)' : 'rgba(244,241,234,0.05)'
          } 0 ${44 * k}px, transparent ${44 * k}px ${88 * k}px)`,
          backgroundPosition: `${frame * 1.6}px 0`,
        }}
      />
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 700,
          fontSize: 26 * k,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: accent,
          border: `2px solid ${accent}`,
          padding: `${12 * k}px ${26 * k}px`,
          opacity: pTitle,
        }}
      >
        {tag}
      </div>
      <div style={{position: 'relative', transform: `translateX(${shake}px)`}}>
        {/* echo obrys */}
        {echo > 0 && echo < 1 && (
          <div
            style={{
              ...bigStyle,
              position: 'absolute',
              inset: 0,
              color: 'transparent',
              WebkitTextStroke: `2px ${accent}`,
              opacity: (1 - echo) * 0.45,
              transform: `scale(${1 + echo * 0.45})`,
            }}
          >
            {bigText}
          </div>
        )}
        <div style={{...bigStyle, color: accent, transform: `scale(${pop})`}}>{bigText}</div>
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 72 * k,
          textTransform: 'uppercase',
          color: fg,
          letterSpacing: '-0.01em',
          opacity: pTitle,
          transform: `translateY(${(1 - pTitle) * 30 * k}px)`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 500,
          fontSize: 34 * k,
          color: fg,
          opacity: pNote * 0.85,
          maxWidth: 820 * k,
          lineHeight: 1.4,
        }}
      >
        {note}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scéna 5: CTA ---------- */
const SceneCta = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const pLogo = spring({frame, fps, delay: 2, config: {damping: 13, stiffness: 130}});
  const pTitle = spring({frame, fps, delay: 12, config: {damping: 200}});
  const pPhone = spring({frame, fps, delay: 24, config: {damping: 11, stiffness: 150}});
  const pMeta = spring({frame, fps, delay: 36, config: {damping: 200}});
  const pulse = 1 + Math.sin(Math.max(0, frame - 42) / 8) * 0.014;
  /* lesk přejíždějící přes telefonní box */
  const shine = interpolate(frame, [46, 78], [-160, 260], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const marqueeX = -frame * 3.4 * k;
  const items = 'Měření zraku · Multifokály 1+1 · EnRoute −30 % · Servis na počkání · Benefity · ';
  return (
    <AbsoluteFill
      style={{
        background: C.cream,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80 * k,
        gap: 34 * k,
        textAlign: 'center',
      }}
    >
      <Img
        src={staticFile('logo-mark.svg')}
        style={{width: 250 * k, transform: `scale(${pLogo}) rotate(${(1 - pLogo) * -8}deg)`, opacity: pLogo}}
      />
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 96 * k,
          lineHeight: 1.05,
          textTransform: 'uppercase',
          color: C.ink,
          letterSpacing: '-0.02em',
          opacity: pTitle,
          transform: `translateY(${(1 - pTitle) * 30 * k}px)`,
        }}
      >
        Objednejte se
        <br />
        na měření zraku
      </div>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 64 * k,
          color: C.ink,
          background: C.yellow,
          padding: `${20 * k}px ${48 * k}px`,
          boxShadow: '0 12px 40px rgba(20,20,20,0.10)',
          transform: `scale(${pPhone * pulse})`,
        }}
      >
        +420 702 194 246
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '18%',
            left: `${shine}%`,
            background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.65), transparent)',
            transform: 'skewX(-18deg)',
          }}
        />
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 32 * k,
          color: C.inkSoft,
          opacity: pMeta,
          lineHeight: 1.5,
        }}
      >
        Americká 325/23, Plzeň · optikdvorak.cz
        <br />
        Rodinná optika od roku 1991
      </div>
      {/* žlutý marquee pás dole — jako na webu */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: C.yellow,
          padding: `${18 * k}px 0`,
          whiteSpace: 'nowrap',
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 34 * k,
          textTransform: 'uppercase',
          color: C.ink,
          opacity: pMeta,
        }}
      >
        <div style={{display: 'inline-block', transform: `translateX(${marqueeX}px)`}}>
          {items.repeat(6)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Sestřih ---------- */
export const Promo = () => {
  const timing = linearTiming({durationInFrames: T});
  return (
    <AbsoluteFill>
      <Audio
        src={staticFile('music.wav')}
        volume={(f) =>
          interpolate(f, [0, 12, PROMO_DURATION - 40, PROMO_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S1}>
          <SceneClaim />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={S2}>
          <SceneStore />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={S3}>
          <SceneOffer
            bg={C.ink}
            fg={C.cream}
            accent={C.yellow}
            tag="Akce"
            big="1 + 1"
            title="Multifokální skla zdarma"
            note="K objednaným multifokálním brýlím získáte druhá skla zdarma."
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={S4}>
          <SceneOffer
            bg={C.yellow}
            fg={C.ink}
            accent={C.ink}
            tag="Pro řidiče"
            countTo={30}
            countPrefix="−"
            countSuffix=" %"
            title="Skla EnRoute"
            note="Méně oslnění a klidnější noční jízda."
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={S5}>
          <SceneCta />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Flash />
      <Progress />
      <Grain />
    </AbsoluteFill>
  );
};
