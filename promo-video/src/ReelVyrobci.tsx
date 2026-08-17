import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BODY,
  BrandCard,
  C,
  DISPLAY,
  F,
  Grain,
  Header,
  Hi,
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

/* REEL — „Víte, kdo vyrobil skla ve vašich brýlích?"
   Téma důvěry, které nikdo z konkurence nedělá, protože většina prodejen
   na tuhle otázku nemá dobrou odpověď. Optika na Americké ji má.

   Vizuální podpis: JMÉNA VÝROBCŮ JAKO TITULKY. Uprostřed videa nejsou fotky
   ani rámečky — jen jména vysázená obrovským písmem, která naskakují jedno
   po druhém a zůstávají v seznamu. Vypadá to jako závěrečné titulky filmu
   a je to na profilu naprosto ojedinělé.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM):
     0,000–2,500   HÁČEK   „Víte, kdo vyrobil vaše skla?"
     2,500–5,625   BOD 01  brýlová skla — Hoya, ZEISS
     5,625–8,750   BOD 02  česká výroba — Optika Čivice, Konvex
     8,750–11,875  BOD 03  kontaktní čočky — Alcon, CooperVision
    11,875–15,000  BOD 04  doporučíme jen to, co vašim očím pomůže
    15,000–18,750  CTA

   Seznam výrobců je přesně ten, který je na homepage v pásu značek, včetně
   toho, jak je tam popsaná Optika Čivice a Konvex. MiYOSMART a MiSIGHT tu
   schválně nejsou — jsou to konkrétní produkty, ne výrobci, a majitelka je
   z pásu značek v srpnu 2026 vypustila (viz komentář v index.html).
   Konkrétní typy čoček se neuvádějí, nabídka je širší. */

const T_S1 = F(2.5);
const T_S2 = F(5.625);
const T_S3 = F(8.75);
const T_S4 = F(11.875);
const T_CTA = F(15.0);
export const VYROBCI_DURATION = F(18.75);
const STARTS = [T_S1, T_S2, T_S3, T_S4];

const WIN_X = 90;
const WIN_W = 900;
const WIN_TOP = 300;
const WIN_H = 600;
const TEXT_TOP = 1000;

const SHOTS: Shot[] = [
  {src: 'vyrobci/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'vyrobci/konec.jpg', from: T_S4, to: T_CTA, dir: 'out'},
];

/* Jména přesně tak, jak jsou v pásu značek na homepage. */
type Maker = {name: string; note: string; at: number};
const MAKERS: Maker[] = [
  {name: 'Hoya', note: 'brýlová skla', at: T_S1 + F(0.15)},
  {name: 'ZEISS', note: 'brýlová skla', at: T_S1 + F(1.4)},
  {name: 'Optika Čivice', note: 'jediný velký český výrobce brýlových čoček', at: T_S2 + F(0.15)},
  {name: 'Konvex', note: 'český výrobce zakázkových brýlových čoček', at: T_S2 + F(1.4)},
  {name: 'Alcon', note: 'kontaktní čočky a péče o oči', at: T_S3 + F(0.15)},
  {name: 'CooperVision', note: 'kontaktní čočky', at: T_S3 + F(1.4)},
];

const ROW_TOP = 420;
const ROW_H = 168;

/* ---------- Jméno výrobce ---------- */
const MakerRow: React.FC<{m: Maker; index: number; k: number}> = ({m, index, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - m.at, fps, config: {damping: 18, stiffness: 160}});
  const out = interpolate(frame, [T_S4 - F(0.35), T_S4], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (p <= 0.002) return null;
  /* právě naskočené jméno svítí, starší ustoupí */
  const fresh = interpolate(frame, [m.at, m.at + F(1.25)], [1, 0.45], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: M * k,
        right: M * k,
        top: (ROW_TOP + index * ROW_H) * k,
        opacity: p * out,
        transform: `translateX(${(1 - p) * 40 * k}px)`,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 88 * k,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: C.cream,
          opacity: 0.5 + fresh * 0.5,
        }}
      >
        {m.name}
      </div>
      <div
        style={{
          marginTop: 10 * k,
          fontFamily: MONO,
          fontSize: 23 * k,
          letterSpacing: '0.08em',
          color: fresh > 0.6 ? C.yellow : C.dim,
        }}
      >
        // {m.note}
      </div>
    </div>
  );
};

/* ---------- Závěrečná věta ---------- */
const Closing: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - T_S4, fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const sub = spring({frame: frame - T_S4 - F(0.5), fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const out = interpolate(frame, [T_CTA - F(0.45), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (p <= 0.002) return null;
  return (
    <div style={{position: 'absolute', left: M * k, right: M * k, top: TEXT_TOP * k, opacity: out}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 82 * k,
          lineHeight: 1.06,
          letterSpacing: '-0.035em',
          color: C.cream,
          opacity: p,
          transform: `translateY(${(1 - p) * 20 * k}px)`,
        }}
      >
        Nabídneme jen to,
        <br />
        <span style={{color: C.yellow}}>co vám pomůže.</span>
      </div>
      <div
        style={{
          marginTop: 28 * k,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 33 * k,
          lineHeight: 1.42,
          color: C.soft,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 16 * k}px)`,
        }}
      >
        Ne nejdražší sklo v regálu. To, co vašim očím <Hi start={T_S4 + F(0.5)}>skutečně pomůže</Hi>.
      </div>
    </div>
  );
};

/* ---------- Reel ---------- */
export const ReelVyrobci: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const bodyOp = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* okno s fotkou je jen v háčku a pak zase v posledním bodě */
  const winOp = interpolate(
    frame,
    [T_S1 - F(0.45), T_S1 - F(0.05), T_S4 - F(0.3), T_S4 + F(0.1), T_CTA - F(0.4), T_CTA - F(0.05)],
    [1, 0, 0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const hdrOp = interpolate(frame, [T_S1 - F(0.2), T_S1 + F(0.3), T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const vol = interpolate(frame, [0, F(0.8), VYROBCI_DURATION - F(2.0), VYROBCI_DURATION], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-vyrobci.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp, transform: `scale(${punch(frame)})`}}>
        {SHOTS.map((s) => (
          <Wash key={`w-${s.src}`} shot={s} strength={0.45} />
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
        </div>

        <HookBlock
          k={k}
          until={T_S1}
          top={TEXT_TOP}
          kicker="// ODKUD JSOU VAŠE SKLA"
          lines={[['Víte,', 'kdo', 'vyrobil'], ['skla', 've', 'vašich', 'brýlích?']]}
          sub="Většina lidí to neví. Řekneme vám to na rovinu."
          loop="6 jmen, se kterými pracujeme"
          size={82}
        />

        {MAKERS.map((m, i) => (
          <MakerRow key={m.name} m={m} index={i} k={k} />
        ))}

        <Closing k={k} />
      </AbsoluteFill>

      <BrandCard
        k={k}
        at={T_CTA}
        bg="nakup/vyloha.jpg"
        claim={['Zeptejte se nás', 'na cokoli.']}
        pill="Objednat měření 👓"
        recap="// Hoya · ZEISS · Optika Čivice · Konvex · Alcon · CooperVision"
      />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
