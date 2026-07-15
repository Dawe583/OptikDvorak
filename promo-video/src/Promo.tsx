import {
  AbsoluteFill,
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

/* Škálování vůči šířce 1080 — stejná kompozice slouží čtverci i story */
const useScale = () => useVideoConfig().width / 1080;

const Eyebrow: React.FC<{children: React.ReactNode; color?: string; delay?: number}> = ({
  children,
  color = C.ink,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const p = spring({frame, fps, delay, config: {damping: 200}});
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
      <span style={{width: 56 * k, height: 2, background: color}} />
      {children}
    </div>
  );
};

/* ---------- Scéna 1: claim na žluté ---------- */
const SceneClaim = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const words = ['Vidět', 'ostře', 'je', 'krásné.'];
  return (
    <AbsoluteFill
      style={{
        background: C.yellow,
        justifyContent: 'center',
        padding: 90 * k,
        gap: 44 * k,
      }}
    >
      <Eyebrow color={C.amberInk}>Optik Dvořák · Plzeň</Eyebrow>
      <h1
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 150 * k,
          lineHeight: 1.02,
          color: C.ink,
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          display: 'flex',
          flexWrap: 'wrap',
          gap: `0 ${36 * k}px`,
        }}
      >
        {words.map((w, i) => {
          const p = spring({frame, fps, delay: 6 + i * 7, config: {damping: 16, stiffness: 160}});
          return (
            <span key={w} style={{display: 'inline-block', overflow: 'hidden'}}>
              <span
                style={{
                  display: 'inline-block',
                  transform: `translateY(${(1 - p) * 110}%)`,
                }}
              >
                {w}
              </span>
            </span>
          );
        })}
      </h1>
      <Eyebrow color={C.amberInk} delay={34}>
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
  const zoom = interpolate(frame, [0, S2], [1.06, 1.18], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: 'clamp',
  });
  const p = spring({frame, fps, delay: 10, config: {damping: 200}});
  return (
    <AbsoluteFill style={{background: C.ink900}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <OffthreadVideo
          muted
          src={staticFile('hero.webm')}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(12,12,12,0.05) 30%, rgba(12,12,12,0.78) 100%)',
        }}
      />
      <AbsoluteFill style={{justifyContent: 'flex-end', padding: 90 * k, gap: 26 * k}}>
        <Eyebrow color={C.yellow} delay={8}>
          Americká 325/23 · Plzeň
        </Eyebrow>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 92 * k,
            lineHeight: 1.05,
            color: C.cream,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            opacity: p,
            transform: `translateY(${(1 - p) * 40 * k}px)`,
          }}
        >
          Změříme, poradíme,
          <br />
          vyladíme na míru.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Obří číslo s podtitulem (scény 3 a 4) ---------- */
const SceneOffer: React.FC<{
  bg: string;
  fg: string;
  accent: string;
  tag: string;
  big: string;
  title: string;
  note: string;
}> = ({bg, fg, accent, tag, big, title, note}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const pop = spring({frame, fps, delay: 4, config: {damping: 11, stiffness: 130}});
  const pTitle = spring({frame, fps, delay: 16, config: {damping: 200}});
  const pNote = spring({frame, fps, delay: 26, config: {damping: 200}});
  return (
    <AbsoluteFill
      style={{
        background: bg,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80 * k,
        gap: 8 * k,
        textAlign: 'center',
      }}
    >
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
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 330 * k,
          lineHeight: 1,
          color: accent,
          letterSpacing: '-0.03em',
          transform: `scale(${pop})`,
        }}
      >
        {big}
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
          maxWidth: 800 * k,
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
  const pLogo = spring({frame, fps, delay: 2, config: {damping: 14, stiffness: 120}});
  const pTitle = spring({frame, fps, delay: 12, config: {damping: 200}});
  const pPhone = spring({frame, fps, delay: 24, config: {damping: 12, stiffness: 140}});
  const pMeta = spring({frame, fps, delay: 36, config: {damping: 200}});
  /* jemný puls telefonu, ať CTA žije */
  const pulse = 1 + Math.sin(Math.max(0, frame - 40) / 9) * 0.012;
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
        style={{width: 250 * k, transform: `scale(${pLogo})`, opacity: pLogo}}
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
    </AbsoluteFill>
  );
};

/* ---------- Sestřih ---------- */
export const Promo = () => {
  const timing = linearTiming({durationInFrames: T});
  return (
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
          big="−30 %"
          title="Skla EnRoute"
          note="Méně oslnění a klidnější noční jízda."
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={S5}>
        <SceneCta />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
