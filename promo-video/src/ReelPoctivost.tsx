import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BODY,
  BrandCard,
  C,
  DISPLAY,
  F,
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

/* REEL — „Nebudeme vám nic nutit": proč rodinná optika, a ne řetězec.
   Jediný Reel na profilu, který neprodává službu ani produkt, ale postoj.
   Přesně ten důvod, proč lidé chodí do malé optiky místo do obchoďáku —
   a nikde se neříká nahlas.

   Vizuální podpis: TICHO. Žádné okno s fotkou, žádné odrážky, skoro prázdná
   obrazovka a na ní jedna velká věta uprostřed. Mezi ostatními Reels, které
   jsou nabité informacemi, je klid tou největší změnou — a v mřížce profilu
   se to pozná na první pohled.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM):
     0,000–2,500   HÁČEK   „Nebudeme vám nic nutit."
     2,500–5,625   VĚTA 01 vysvětlíme rozdíly a necháme rozhodnutí na vás
     5,625–8,750   VĚTA 02 máme na vás čas, měření ani výběr neodbýváme
     8,750–11,875  VĚTA 03 doporučíme jen to, co vašim očím skutečně pomůže
    11,875–15,000  VĚTA 04 na Americké od roku 1991
    15,000–18,750  CTA

   Všechny čtyři věty jsou složené z formulací, které jsou doslova na webu
   (o-nas.html a mereni-zraku.html). Žádné srovnávání s konkurencí, žádné
   „jsme nejlepší" — jen to, co optika o sobě sama píše. */

const T_S1 = F(2.5);
const T_S2 = F(5.625);
const T_S3 = F(8.75);
const T_S4 = F(11.875);
const T_CTA = F(15.0);
export const POCTIVOST_DURATION = F(18.75);
const STARTS = [T_S1, T_S2, T_S3, T_S4];

const SHOTS: Shot[] = [
  {src: 'poctivost/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'poctivost/konec.jpg', from: T_S4, to: T_CTA, dir: 'out'},
];

type Line = {big: string[]; small: string; badge: string};
const LINES: Line[] = [
  {
    badge: 'PŘI VÝBĚRU',
    big: ['Vysvětlíme', 'rozdíly.'],
    small: 'A rozhodnutí necháme na vás. Nic vám nebudeme nutit.',
  },
  {
    badge: 'PŘI MĚŘENÍ',
    big: ['Máme', 'na', 'vás', 'čas.'],
    small: 'Měření zraku ani výběr obrub u nás neodbýváme. Když k nám přijdete, věnujeme se vám.',
  },
  {
    badge: 'PŘI DOPORUČENÍ',
    big: ['Jen', 'to,', 'co', 'pomůže.'],
    small: 'Doporučíme jen to, co vašim očím skutečně pomůže. Nic víc, nic míň.',
  },
  {
    badge: 'A TO UŽ',
    big: ['Od', 'roku', '1991.'],
    small: 'Na stejné adrese na Americké. Rodinná oční optika, kterou vede rodina.',
  },
];

/* ---------- Jedna věta ---------- */
const Statement: React.FC<{index: number; k: number}> = ({index, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const from = STARTS[index];
  const to = STARTS[index + 1] ?? T_CTA;
  const op = interpolate(frame, [from - XF, from, to - XF, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;
  const l = LINES[index];
  const badge = spring({frame: frame - from, fps, config: {damping: 16, stiffness: 180}});
  const small = spring({frame: frame - from - F(0.6), fps, config: {damping: 200}, durationInFrames: F(0.9)});

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: `0 ${M * k}px`, opacity: op}}>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24 * k,
          letterSpacing: '0.2em',
          color: C.yellow,
          marginBottom: 34 * k,
          opacity: badge,
          transform: `translateY(${(1 - badge) * -14 * k}px)`,
        }}
      >
        // {l.badge}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: `0 ${18 * k}px`,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 104 * k,
          lineHeight: 1.0,
          letterSpacing: '-0.045em',
          color: C.cream,
          textAlign: 'center',
        }}
      >
        {l.big.map((w, i) => {
          const p = spring({frame: frame - from - 4 - i * 4, fps, config: {damping: 17, stiffness: 175}});
          return (
            <span key={`${w}-${i}`} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 8 * k}}>
              <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>{w}</span>
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 40 * k,
          maxWidth: 800 * k,
          textAlign: 'center',
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 33 * k,
          lineHeight: 1.45,
          color: C.soft,
          opacity: small,
          transform: `translateY(${(1 - small) * 16 * k}px)`,
        }}
      >
        {l.small}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Reel ---------- */
export const ReelPoctivost: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const bodyOp = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* fotka je jen v háčku a pak zase u věty o roce 1991 — jinak je ticho */
  const winOp = interpolate(
    frame,
    [T_S1 - F(0.45), T_S1 - F(0.05), T_S4 - F(0.3), T_S4 + F(0.1), T_CTA - F(0.4), T_CTA - F(0.05)],
    [1, 0, 0, 0.55, 0.55, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const hdrOp = interpolate(frame, [T_S1 - F(0.2), T_S1 + F(0.3), T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const vol = interpolate(frame, [0, F(0.8), POCTIVOST_DURATION - F(2.0), POCTIVOST_DURATION], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-poctivost.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp, transform: `scale(${punch(frame)})`}}>
        {SHOTS.map((s) => (
          <Wash key={`w-${s.src}`} shot={s} strength={0.45} />
        ))}

        {/* fotka přes celou plochu, ale potlačená — nikdy nekonkuruje textu */}
        <AbsoluteFill style={{opacity: winOp}}>
          {SHOTS.map((s) => (
            <Photo key={s.src} shot={s} amount={0.1} />
          ))}
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,7,7,0.55), rgba(7,7,7,0.78))'}} />
        </AbsoluteFill>

        <HookBlock
          k={k}
          until={T_S1}
          top={860}
          kicker="// RODINNÁ OPTIKA V PLZNI"
          lines={[['Nebudeme', 'vám'], ['nic', 'nutit.']]}
          sub="Ani dražší skla, ani obrubu, kterou nechcete."
          loop="4 věci, které slibujeme"
          size={104}
          align="center"
        />

        {LINES.map((l, i) => (
          <Statement key={l.badge} index={i} k={k} />
        ))}
      </AbsoluteFill>

      <BrandCard
        k={k}
        at={T_CTA}
        bg="nakup/vyloha.jpg"
        claim={['Přijďte.', 'Máme na vás čas.']}
        pill="Objednat měření 👓"
        recap="// Americká 325/23, Plzeň · rodinná oční optika od 1991"
      />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
