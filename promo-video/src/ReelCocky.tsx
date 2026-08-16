import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BODY,
  BrandCard,
  C,
  F,
  FPS,
  Grain,
  Header,
  HeadWords,
  Hi,
  M,
  MONO,
  Photo,
  Shot,
  useScale,
  Vignette,
  Wash,
  XF,
} from './kit';

/* REEL — „Zkušební pár zdarma": aplikace kontaktních čoček.
   Segment, který na profilu zatím nemá vůbec nic, a přitom je na webu
   celá podstránka kontaktni-cocky.html.

   Vizuální podpis: KRUH JAKO ČOČKA. Celý obsah kouká skrz kruhové okno,
   kolem něj běží tenký prstenec, který se v průběhu videa zaplňuje jako
   ukazatel postupu. Kruh se mezi kroky nadechne. Nic jiného na profilu
   kruhové není.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM,
   musí sedět s scripts/make-audio-nove-reels.mjs):
     0,000–2,500   HÁČEK   „Brýle při sportu překážejí?"
     2,500–5,625   KROK 01 probereme, na co je chcete
     5,625–8,750   KROK 02 změříme a vybereme typ
     8,750–11,875  KROK 03 naučíme vás je nasazovat
    11,875–15,000  KROK 04 zkušební pár zdarma a kontrola
    15,000–18,750  CTA

   FOTKY (public/cocky/, čtverec 1900 × 1900 do kruhu):
     hook.jpg   img/hero/od-blonde.webp   žena dělá prsty kroužek u oka
     krok1.jpg  img/portrait-woman.jpg    žena bez brýlí v podvečerním světle
     krok2.jpg  optika/opt-0692.jpg       konzultační stůl na prodejně
     krok3.jpg  img/portrait-man.jpg      muž bez brýlí
     krok4.jpg  img/hero/od-redhead.webp  usměvavá žena venku

   Všechna tvrzení jsou z kontaktni-cocky.html. Nikde se neslibuje, komu
   čočky sednou a komu ne — web sám říká, že to posoudíme, a že aplikace
   v optice nenahrazuje lékařské vyšetření očí. Ta věta je i tady. */

const T_S1 = F(2.5);
const T_S2 = F(5.625);
const T_S3 = F(8.75);
const T_S4 = F(11.875);
const T_CTA = F(15.0);
export const COCKY_DURATION = F(18.75);

const STARTS = [T_S1, T_S2, T_S3, T_S4];

/* Rozvržení 1080 × 1920 */
const CX = 540;
const CY = 740;
const RAD = 400;            // poloměr kruhového okna
const RING = RAD + 34;      // poloměr prstence
const TEXT_TOP = 1180;
const NOTE_TOP = 1506;      // poznámka až úplně dole, ať se nepotká s textem

const SHOTS: Shot[] = [
  {src: 'cocky/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'cocky/krok1.jpg', from: T_S1, to: T_S2, dir: 'out'},
  {src: 'cocky/krok2.jpg', from: T_S2, to: T_S3, dir: 'in'},
  {src: 'cocky/krok3.jpg', from: T_S3, to: T_S4, dir: 'out'},
  {src: 'cocky/krok4.jpg', from: T_S4, to: T_CTA, dir: 'in'},
];

/* ---------- Prstenec kolem čočky = ukazatel postupu ---------- */
const Ring: React.FC<{k: number; opacity: number}> = ({k, opacity}) => {
  const frame = useCurrentFrame();
  const r = RING;
  const circ = 2 * Math.PI * r;
  /* prstenec se plní od prvního kroku po poslední */
  const fill = interpolate(frame, [T_S1, T_CTA - F(0.4)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  return (
    <svg
      viewBox={`0 0 ${1080} ${1920}`}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity}}
    >
      <circle cx={CX} cy={CY} r={r} fill="none" stroke="rgba(244,241,234,0.16)" strokeWidth={3} />
      <circle
        cx={CX}
        cy={CY}
        r={r}
        fill="none"
        stroke={C.yellow}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - fill)}
        transform={`rotate(-90 ${CX} ${CY})`}
        style={{filter: `drop-shadow(0 0 ${10}px rgba(255,228,92,0.55))`}}
      />
      {/* čtyři značky kroků na prstenci */}
      {[0, 1, 2, 3].map((i) => {
        const a = (-90 + (i * 360) / 4) * (Math.PI / 180);
        return (
          <circle
            key={i}
            cx={CX + Math.cos(a) * r}
            cy={CY + Math.sin(a) * r}
            r={7}
            fill={frame >= STARTS[i] ? C.yellow : 'rgba(244,241,234,0.3)'}
          />
        );
      })}
    </svg>
  );
};

/* ---------- Textový blok jednoho kroku ---------- */
const Step: React.FC<{
  index: number;
  badge: string;
  head: string[];
  detail: React.ReactNode;
  k: number;
}> = ({index, badge, head, detail, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const from = STARTS[index];
  const to = STARTS[index + 1] ?? T_CTA;
  const op = interpolate(frame, [from - XF, from, to - XF, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;
  const chip = spring({frame: frame - from, fps, config: {damping: 14, stiffness: 180}});
  const det = spring({frame: frame - from - F(0.4), fps, config: {damping: 200}, durationInFrames: F(0.8)});

  return (
    <div
      style={{
        position: 'absolute',
        left: M * k,
        right: M * k,
        top: TEXT_TOP * k,
        textAlign: 'center',
        opacity: op,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 23 * k,
          letterSpacing: '0.18em',
          color: C.yellow,
          border: `${2 * k}px solid rgba(255,228,92,0.4)`,
          padding: `${9 * k}px ${20 * k}px`,
          borderRadius: 999,
          marginBottom: 24 * k,
          transform: `scale(${0.85 + chip * 0.15})`,
          opacity: chip,
        }}
      >
        {badge}
      </div>
      <HeadWords words={head} startAt={from + 4} k={k} size={72} align="center" />
      <div
        style={{
          marginTop: 22 * k,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 32 * k,
          lineHeight: 1.4,
          color: C.soft,
          opacity: det,
          transform: `translateY(${(1 - det) * 14 * k}px)`,
        }}
      >
        {detail}
      </div>
    </div>
  );
};

/* ---------- Háček ---------- */
const Hook: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [T_S1 - F(0.45), T_S1 - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;
  const kicker = interpolate(frame, [4, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sub = interpolate(frame, [F(1.3), F(1.75)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div
      style={{position: 'absolute', left: M * k, right: M * k, top: (TEXT_TOP - 40) * k, textAlign: 'center', opacity: op}}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 24 * k,
          letterSpacing: '0.16em',
          color: C.yellow,
          opacity: kicker,
          marginBottom: 22 * k,
        }}
      >
        // KONTAKTNÍ ČOČKY
      </div>
      <HeadWords words={['Překážejí', 'vám']} startAt={8} k={k} size={90} align="center" />
      <div style={{height: 8 * k}} />
      <HeadWords words={['brýle', 'při', 'sportu?']} startAt={26} k={k} size={90} color={C.yellow} align="center" />
      <div
        style={{
          marginTop: 30 * k,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 34 * k,
          lineHeight: 1.45,
          color: C.soft,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 16 * k}px)`,
        }}
      >
        Čočky zvládne i úplný začátečník.
      </div>
    </div>
  );
};

/* ---------- Reel ---------- */
export const ReelCocky: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const bodyOp = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const hdrOp = interpolate(frame, [0, 8, T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* clona: kruh se na začátku otevře a před každým dalším krokem se nadechne */
  const open = spring({frame: frame - 2, fps: FPS, config: {damping: 20, stiffness: 120}});
  const breathe = STARTS.reduce((acc, s) => {
    const b = interpolate(frame, [s - F(0.2), s, s + F(0.35)], [0, 0.035, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.sin),
    });
    return acc + b;
  }, 0);
  const scale = open * (1 + breathe);

  const vol = interpolate(frame, [0, F(0.8), COCKY_DURATION - F(2.0), COCKY_DURATION], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-cocky.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp}}>
        {SHOTS.map((s) => (
          <Wash key={`w-${s.src}`} shot={s} strength={0.55} />
        ))}
      </AbsoluteFill>

      {/* kruhové okno = čočka */}
      <div
        style={{
          position: 'absolute',
          left: (CX - RAD) * k,
          top: (CY - RAD) * k,
          width: RAD * 2 * k,
          height: RAD * 2 * k,
          borderRadius: '50%',
          overflow: 'hidden',
          opacity: bodyOp,
          transform: `scale(${scale})`,
          boxShadow: `0 ${20 * k}px ${70 * k}px rgba(0,0,0,0.6), inset 0 0 ${60 * k}px rgba(0,0,0,0.35)`,
        }}
      >
        {SHOTS.map((s) => (
          <Photo key={s.src} shot={s} amount={0.08} />
        ))}
        {/* lesk na skle */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 32%, transparent 52%)',
          }}
        />
      </div>

      <Ring k={k} opacity={bodyOp * open} />

      <Hook k={k} />
      {/* Nadpisy musí vyjít na jeden řádek — dvouřádkový by odsunul text dolů
          přes poznámku o lékařském vyšetření. */}
      <Step
        index={0}
        badge="KROK 01"
        head={['Na', 'co', 'je', 'chcete?']}
        detail={<>Na sport, do práce nebo na víkend — a jestli jsou pro vás <Hi start={T_S1}>vhodné</Hi>.</>}
        k={k}
      />
      <Step
        index={1}
        badge="KROK 02"
        head={['Změříme', 'a', 'vybereme', 'typ']}
        detail={<>Denní, čtrnáctidenní nebo měsíční — <Hi start={T_S2}>podle vašich očí</Hi> i režimu nošení.</>}
        k={k}
      />
      <Step
        index={2}
        badge="KROK 03"
        head={['Naučíme', 'vás', 'je', 'nasadit']}
        detail={<>V klidu a <Hi start={T_S3}>dokud vám to nepůjde samo</Hi>. A vysvětlíme, jak o ně pečovat.</>}
        k={k}
      />
      <Step
        index={3}
        badge="KROK 04"
        head={['Zkušební', 'pár']}
        detail={<>Dostanete ho <Hi start={T_S4}>zdarma</Hi> a objednáme vás na kontrolu.</>}
        k={k}
      />

      {/* drobná poctivá poznámka */}
      <div
        style={{
          position: 'absolute',
          left: M * k,
          right: M * k,
          top: NOTE_TOP * k,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 20 * k,
          color: 'rgba(244,241,234,0.35)',
          opacity:
            bodyOp *
            interpolate(frame, [T_S1, T_S1 + F(0.5)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
        }}
      >
        // aplikace v optice nenahrazuje lékařské vyšetření očí
      </div>

      <BrandCard
        k={k}
        at={T_CTA}
        bg="nakup/vyloha.jpg"
        claim={['Zkuste to.', 'Pár je zdarma.']}
        pill="Objednat aplikaci 👁"
        recap="// konzultace · měření · výběr typu · zkušební pár"
      />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
