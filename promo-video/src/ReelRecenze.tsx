import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BODY,
  BrandCard,
  C,
  DISPLAY,
  F,
  FPS,
  Grain,
  Header,
  HookBlock,
  M,
  MONO,
  Photo,
  punch,
  Shot,
  useScale,
  Vignette,
  Wash,
  XF,
} from './kit';

/* REEL — „Tohle o nás napsali lidi z Plzně": skutečné recenze z Googlu.
   Nejsilnější druh obsahu, který optika může mít, a zároveň jediný, který
   nesmí být ani z poloviny vymyšlený. Všechny čtyři citace jsou doslovné
   veřejné recenze z Google profilu, které už jsou na webu v sekci Recenze
   (dodala je majitelka). Nic se nekrátí tak, aby to změnilo smysl, nic se
   nepřidává, hodnocení 4,6 z 26 je uvedené i s datem stavu.

   Jména recenzentů ve videu schválně NEJSOU. Na webu jsou, protože jsou
   veřejná na Googlu, ale video se šíří jinam a jinak — a přesvědčivost
   citace nestojí na příjmení.

   Vizuální podpis: TYPOGRAFIE MÍSTO FOTEK. Uprostřed videa nejsou žádné
   snímky prodejny, jen velká žlutá uvozovka a text recenze na tmavém
   pozadí. Mezi ostatními Reels, které stojí na fotkách, je to nepřehlédnutelné
   a zároveň to nechá vyniknout tomu jedinému, na čem tady záleží — slovům
   zákazníků.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM,
   musí sedět s scripts/make-audio-nove-reels.mjs):
     0,000–2,500   HÁČEK    „Tohle o nás napsali lidi z Plzně."
     2,500–5,625   RECENZE 1
     5,625–8,750   RECENZE 2
     8,750–11,875  RECENZE 3
    11,875–15,000  RECENZE 4
    15,000–18,750  CTA */

const T_S1 = F(2.5);
const T_S2 = F(5.625);
const T_S3 = F(8.75);
const T_S4 = F(11.875);
const T_CTA = F(15.0);
export const RECENZE_DURATION = F(18.75);
const STARTS = [T_S1, T_S2, T_S3, T_S4];

const WIN_X = 90;
const WIN_W = 900;
const WIN_TOP = 300;
const WIN_H = 600;
const TEXT_TOP = 1000;

const SHOTS: Shot[] = [
  {src: 'recenze/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'recenze/konec.jpg', from: T_S1, to: T_CTA, dir: 'out'},
];

/* Doslovné veřejné recenze z Google profilu — tytéž, které jsou na webu. */
const REVIEWS = [
  'Naprosto skvělý přístup! Potřebovali jsme vyřešit komplikované atypické brýle, kde se rozbil rám, a partner bez nich nevidí.',
  'Velmi profesionální a milý přístup. Velký výběr značkových i levnějších brýlí. Můžeme jen vřele doporučit.',
  'Moc pěkné jednání. Konzultovaly mě dvě moc milé dámy, které se rozumí ve svém oboru. Velice doporučuji.',
  'Naprostá spokojenost s personálem. Úžasný přístup, věnují se vám na 150 % a vždy poradí.',
];

/* ---------- Pruh s hodnocením ---------- */
const Rating: React.FC<{k: number; opacity: number}> = ({k, opacity}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute',
        left: M * k,
        right: M * k,
        top: 210 * k,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16 * k,
        opacity,
      }}
    >
      <div style={{display: 'flex', gap: 6 * k}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const p = spring({frame: frame - 6 - i * 3, fps, config: {damping: 12, stiffness: 220}});
          return (
            <span
              key={i}
              style={{
                fontSize: 34 * k,
                color: C.yellow,
                lineHeight: 1,
                opacity: p,
                transform: `scale(${0.5 + p * 0.5})`,
                display: 'inline-block',
                filter: `drop-shadow(0 0 ${10 * k}px rgba(255,228,92,0.5))`,
              }}
            >
              ★
            </span>
          );
        })}
      </div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24 * k, letterSpacing: '0.12em', color: C.soft}}>
        4,6 Z 26 RECENZÍ · GOOGLE
      </div>
    </div>
  );
};

/* ---------- Jedna recenze ---------- */
const Quote: React.FC<{index: number; k: number}> = ({index, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const from = STARTS[index];
  const to = STARTS[index + 1] ?? T_CTA;
  const op = interpolate(frame, [from - XF, from, to - XF, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;
  const mark = spring({frame: frame - from, fps, config: {damping: 13, stiffness: 200}});
  const txt = spring({frame: frame - from - F(0.15), fps, config: {damping: 200}, durationInFrames: F(0.8)});
  const src = spring({frame: frame - from - F(0.7), fps, config: {damping: 200}, durationInFrames: F(0.7)});

  return (
    <div style={{position: 'absolute', left: M * k, right: M * k, top: 430 * k, opacity: op}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 180 * k,
          lineHeight: 0.6,
          color: C.yellow,
          opacity: mark * 0.9,
          transform: `translateY(${(1 - mark) * 20 * k}px)`,
        }}
      >
        „
      </div>
      <div
        style={{
          marginTop: 24 * k,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 60 * k,
          lineHeight: 1.16,
          letterSpacing: '-0.03em',
          color: C.cream,
          opacity: txt,
          transform: `translateY(${(1 - txt) * 20 * k}px)`,
        }}
      >
        {REVIEWS[index]}
      </div>
      <div
        style={{
          marginTop: 34 * k,
          display: 'flex',
          alignItems: 'center',
          gap: 12 * k,
          opacity: src,
        }}
      >
        <span style={{color: C.yellow, fontSize: 26 * k, letterSpacing: '0.1em'}}>★★★★★</span>
        <span style={{fontFamily: MONO, fontSize: 22 * k, color: C.dim, letterSpacing: '0.1em'}}>
          RECENZE NA GOOGLU
        </span>
      </div>
    </div>
  );
};

/* ---------- Reel ---------- */
export const ReelRecenze: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const bodyOp = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* fotka je jen v háčku — od první recenze ji vystřídá typografie */
  const winOp = interpolate(frame, [0, 1, T_S1 - F(0.45), T_S1 - F(0.05)], [1, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ratingOp = interpolate(frame, [T_S1 - F(0.2), T_S1 + F(0.2), T_CTA - F(0.4), T_CTA - F(0.05)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const hdrOp = interpolate(frame, [T_S1 - F(0.2), T_S1 + F(0.3), T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const vol = interpolate(frame, [0, F(0.8), RECENZE_DURATION - F(2.0), RECENZE_DURATION], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-recenze.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp, transform: `scale(${punch(frame)})`}}>
        {SHOTS.map((s) => (
          <Wash key={`w-${s.src}`} shot={s} strength={0.5} />
        ))}

        <div
          style={{
            position: 'absolute',
            left: WIN_X * k,
            top: WIN_TOP * k,
            width: WIN_W * k,
            height: WIN_H * k,
            borderRadius: 20 * k,
            overflow: 'hidden',
            opacity: winOp,
            boxShadow: `0 ${20 * k}px ${70 * k}px rgba(0,0,0,0.55)`,
          }}
        >
          {SHOTS.map((s) => (
            <Photo key={s.src} shot={s} />
          ))}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(7,7,7,0.25) 0%, transparent 26%, transparent 66%, rgba(7,7,7,0.5) 100%)',
            }}
          />
        </div>

        <Rating k={k} opacity={ratingOp} />

        <HookBlock
          k={k}
          until={T_S1}
          top={TEXT_TOP}
          kicker="// RECENZE Z GOOGLU"
          lines={[['Tohle', 'o', 'nás'], ['napsali', 'lidi', 'z', 'Plzně']]}
          sub="Ani slovo jsme nezměnili."
          loop="4 skutečné recenze"
          size={88}
        />

        {REVIEWS.map((r, i) => (
          <Quote key={r} index={i} k={k} />
        ))}
      </AbsoluteFill>

      <BrandCard
        k={k}
        at={T_CTA}
        bg="nakup/vyloha.jpg"
        claim={['Přijďte se', 'přesvědčit.']}
        pill="Objednat měření 👓"
        recap="// hodnocení 4,6 z 26 recenzí · stav k 8/2026"
      />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
