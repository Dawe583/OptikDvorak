import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BODY, BrandCard, C, DISPLAY, F, Grain, Header, Hi, HookBlock, M, MONO,
  Photo, punch, Shot, useScale, Vignette, Wash, XF,
} from './kit';

/* REEL — „Jak se k nám objednat": tři cesty a jedna možnost přijít bez ničeho.
   Nejpraktičtější kus z celé zásoby. Nic neprodává, jen odstraňuje poslední
   překážku mezi divákem a návštěvou.

   Vizuální podpis: TŘI CESTY POD SEBOU. Každá možnost je široký pruh s velkým
   pořadovým číslem, který přiletí zleva a zůstane; nakonec je všechny přebije
   čtvrtý, žlutý — „nebo prostě přijďte". Vypadá to jako rozcestník, ne jako
   další seznam odrážek.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM):
     0,000–2,500   HÁČEK   „Chcete se objednat a nevíte jak?"
     2,500–5,625   CESTA 1 telefon
     5,625–8,750   CESTA 2 e-mail
     8,750–11,875  CESTA 3 formulář na webu
    11,875–15,000  NEBO    přijďte i bez objednání
    15,000–18,750  CTA

   Všechno je doslova z FAQ na homepage: telefonní čísla, e-mail, „Termín na
   měření zraku nabízíme v nejbližších volných dnech; objednání předem
   doporučujeme. Přijít můžete i bez objednání v otevírací době." */

const T_S1 = F(2.5), T_S2 = F(5.625), T_S3 = F(8.75), T_S4 = F(11.875), T_CTA = F(15.0);
export const OBJEDNANI_DURATION = F(18.75);
const STARTS = [T_S1, T_S2, T_S3, T_S4];
const WIN_X = 90, WIN_W = 900, WIN_TOP = 300, WIN_H = 480;
const ROWS_TOP = 880, ROW_H = 168;

const SHOTS: Shot[] = [
  {src: 'objednani/hook.jpg', from: 0, to: T_S3, dir: 'in'},
  {src: 'objednani/konec.jpg', from: T_S3, to: T_CTA, dir: 'out'},
];

type Way = {num: string; head: string; detail: string};
const WAYS: Way[] = [
  {num: '01', head: 'Telefonem', detail: '+420 702 194 246 nebo +420 377 328 367'},
  {num: '02', head: 'E-mailem', detail: 'optika.americka@seznam.cz'},
  {num: '03', head: 'Formulářem', detail: 'Na optikdvorak.cz — nechte kontakt kdykoli, ozveme se'},
];

const Row: React.FC<{index: number; k: number}> = ({index, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const w = WAYS[index];
  const at = STARTS[index];
  const p = spring({frame: frame - at, fps, config: {damping: 18, stiffness: 165}});
  const out = interpolate(frame, [T_S4 - F(0.3), T_S4 + F(0.05)], [1, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fade = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (p <= 0.002) return null;
  /* právě nastoupená cesta svítí, starší ustoupí */
  const fresh = interpolate(frame, [at, at + F(2.6)], [1, 0.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div style={{position: 'absolute', left: M * k, right: M * k, top: (ROWS_TOP + index * ROW_H) * k,
      display: 'flex', alignItems: 'center', gap: 26 * k,
      opacity: p * out * fade, transform: `translateX(${(1 - p) * -50 * k}px)`}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 72 * k, lineHeight: 1,
        color: C.yellow, opacity: 0.35 + fresh * 0.65, minWidth: 100 * k}}>{w.num}</div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 54 * k, lineHeight: 1.05,
          letterSpacing: '-0.03em', color: C.cream, opacity: 0.5 + fresh * 0.5}}>{w.head}</div>
        <div style={{marginTop: 8 * k, fontFamily: MONO, fontSize: 25 * k, color: fresh > 0.7 ? C.soft : C.dim,
          lineHeight: 1.3}}>{w.detail}</div>
      </div>
    </div>
  );
};

/* Čtvrtá možnost — žlutý pruh, který přebije všechny tři */
const Walkin: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - T_S4, fps, config: {damping: 14, stiffness: 180}});
  const out = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (p <= 0.002) return null;
  const sub = spring({frame: frame - T_S4 - F(0.5), fps, config: {damping: 200}, durationInFrames: F(0.8)});
  return (
    <div style={{position: 'absolute', left: M * k, right: M * k, top: (ROWS_TOP + 3 * ROW_H - 20) * k,
      opacity: p * out, transform: `scale(${0.94 + p * 0.06})`, transformOrigin: 'left center'}}>
      <div style={{background: C.yellow, color: C.ink900, borderRadius: 22 * k,
        padding: `${26 * k}px ${32 * k}px`, boxShadow: `0 ${14 * k}px ${40 * k}px rgba(0,0,0,0.5)`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 58 * k, lineHeight: 1.04, letterSpacing: '-0.03em'}}>
          Nebo prostě přijďte.
        </div>
        <div style={{marginTop: 12 * k, fontFamily: BODY, fontWeight: 600, fontSize: 30 * k,
          lineHeight: 1.35, color: 'rgba(17,17,17,0.78)', opacity: sub}}>
          I bez objednání, v otevírací době. Objednat se ale doporučujeme —
          termíny nabízíme v nejbližších volných dnech.
        </div>
      </div>
    </div>
  );
};

export const ReelObjednani: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const bodyOp = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hdrOp = interpolate(frame, [T_S1 - F(0.2), T_S1 + F(0.3), T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const vol = interpolate(frame, [0, F(0.8), OBJEDNANI_DURATION - F(2.0), OBJEDNANI_DURATION], [0, 0.9, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-objednani.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp, transform: `scale(${punch(frame)})`}}>
        {SHOTS.map((s) => <Wash key={`w-${s.src}`} shot={s} strength={0.45} />)}

        <div style={{position: 'absolute', left: WIN_X * k, top: WIN_TOP * k, width: WIN_W * k, height: WIN_H * k,
          borderRadius: 20 * k, overflow: 'hidden', boxShadow: `0 ${20 * k}px ${70 * k}px rgba(0,0,0,0.55)`}}>
          {SHOTS.map((s) => <Photo key={s.src} shot={s} />)}
          <div style={{position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(7,7,7,0.28) 0%, transparent 30%, transparent 60%, rgba(7,7,7,0.62) 100%)'}} />
        </div>

        <HookBlock k={k} until={T_S1} top={870} kicker="// JAK SE K NÁM OBJEDNAT"
          lines={[['Chcete', 'se'], ['objednat?']]}
          sub="Jde to třemi způsoby. A jeden bonus na konci." loop="3 cesty + 1 bez objednání" size={92} />

        {WAYS.map((w, i) => <Row key={w.num} index={i} k={k} />)}
        <Walkin k={k} />
      </AbsoluteFill>

      <BrandCard k={k} at={T_CTA} bg="nakup/vyloha.jpg"
        claim={['Vyberte si', 'kteroukoli.']} pill="Objednat měření 👓"
        recap="// telefon · e-mail · formulář · nebo bez objednání" />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
