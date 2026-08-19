import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BODY, BrandCard, C, DISPLAY, F, Grain, Header, HeadWords, Hi, HookBlock, M, MONO,
  Photo, punch, Shot, useScale, Vignette, Wash, XF,
} from './kit';

/* REEL — „Tři věci, co u nás nic nestojí": měření zraku ke kompletním brýlím,
   zkušební pár kontaktních čoček a posouzení skel MiYOSMART pro děti.

   Všechny tři jsou na webu doslova a všechny tři jsou bezpodmínečně ověřené.
   Sezónní akce (1 + 1, −30 %) tu schválně NEJSOU — ty čekají na potvrzení
   platnosti a video by kvůli nim zestárlo. Tenhle kus vydrží roky.

   Vizuální podpis: RAZÍTKO ZDARMA. Ke každé položce dopadne s lehkým natočením
   žluté razítko „ZDARMA" a zůstane; na konci jsou na obrazovce tři vedle sebe.
   U měření zraku je hned pod razítkem uvedená podmínka — bez ní by to byl
   nepoctivý slib.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM):
     0,000–2,500   HÁČEK   „Tři věci u nás nic nestojí"
     2,500–5,625   01 měření zraku (ke kompletním dioptrickým brýlím)
     5,625–8,750   02 zkušební pár kontaktních čoček
     8,750–11,875  03 posouzení skel MiYOSMART pro děti
    11,875–15,000  ZÁVĚR  co zdarma není a proč to říkáme
    15,000–18,750  CTA */

const T_S1 = F(2.5), T_S2 = F(5.625), T_S3 = F(8.75), T_S4 = F(11.875), T_CTA = F(15.0);
export const ZDARMA_DURATION = F(18.75);
const STARTS = [T_S1, T_S2, T_S3, T_S4];
const WIN_X = 90, WIN_W = 900, WIN_TOP = 300, WIN_H = 600, TEXT_TOP = 1000;

const SHOTS: Shot[] = [
  {src: 'zdarma/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'zdarma/krok1.jpg', from: T_S1, to: T_S2, dir: 'out'},
  {src: 'zdarma/krok2.jpg', from: T_S2, to: T_S3, dir: 'in'},
  {src: 'zdarma/krok3.jpg', from: T_S3, to: T_CTA, dir: 'out'},
];

/* ---------- Razítko ZDARMA ---------- */
const Stamp: React.FC<{at: number; k: number; tilt: number}> = ({at, k, tilt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 200}});
  const out = interpolate(frame, [T_CTA - F(0.45), T_CTA - F(0.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (p <= 0.002) return null;
  return (
    <div style={{display: 'inline-block', transform: `rotate(${tilt}deg) scale(${1.45 - p * 0.45})`,
      opacity: p * out, border: `${5 * k}px solid ${C.yellowDeep}`, borderRadius: 12 * k,
      background: 'rgba(255,228,92,0.92)', padding: `${10 * k}px ${22 * k}px`,
      fontFamily: DISPLAY, fontWeight: 800, fontSize: 42 * k, letterSpacing: '0.04em',
      color: C.ink900, lineHeight: 1, boxShadow: `0 ${10 * k}px ${28 * k}px rgba(0,0,0,0.4)`}}>
      ZDARMA
    </div>
  );
};

type Item = {head: string[]; detail: React.ReactNode; note?: string};
const ITEMS: Item[] = [
  {
    head: ['Měření', 'zraku'],
    detail: <>Obvykle 30 až 45 minut, na moderních přístrojích přímo na prodejně.</>,
    note: 'při pořízení kompletních dioptrických brýlí',
  },
  {
    head: ['Zkušební', 'pár', 'čoček'],
    detail: <>Naučíme vás je nasazovat i snímat a objednáme vás na kontrolu.</>,
    note: 'kontaktní čočky, začátečníci i zkušení',
  },
  {
    head: ['Posouzení', 'MiYOSMART'],
    detail: <>Poradíme, jestli jsou pro vaše dítě vhodná brýlová skla pro řízení krátkozrakosti.</>,
    note: 'bezplatně, bez závazku',
  },
];

const Block: React.FC<{index: number; k: number}> = ({index, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const from = STARTS[index];
  const to = STARTS[index + 1] ?? T_CTA;
  const op = interpolate(frame, [from - XF, from, to - XF, to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (op <= 0.002) return null;
  const it = ITEMS[index];
  const det = spring({frame: frame - from - F(0.45), fps, config: {damping: 200}, durationInFrames: F(0.8)});
  return (
    <div style={{position: 'absolute', left: M * k, right: M * k, top: TEXT_TOP * k, opacity: op}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22 * k, marginBottom: 22 * k}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26 * k, letterSpacing: '0.16em', color: C.dim}}>
          0{index + 1}
        </div>
        <Stamp at={from + F(0.3)} k={k} tilt={[-6, 5, -4][index]} />
      </div>
      <HeadWords words={it.head} startAt={from + 4} k={k} size={74} />
      <div style={{marginTop: 22 * k, fontFamily: BODY, fontWeight: 600, fontSize: 32 * k, lineHeight: 1.4,
        color: C.soft, opacity: det, transform: `translateY(${(1 - det) * 14 * k}px)`, maxWidth: 850 * k}}>
        {it.detail}
      </div>
      {it.note && (
        <div style={{marginTop: 16 * k, fontFamily: MONO, fontSize: 22 * k, letterSpacing: '0.06em',
          color: C.yellow, opacity: det}}>
          // {it.note}
        </div>
      )}
    </div>
  );
};

/* Závěr — co zdarma není. Bez téhle věty by to byl slib, který neplatí. */
const Honest: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - T_S4, fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const sub = spring({frame: frame - T_S4 - F(0.55), fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const out = interpolate(frame, [T_CTA - F(0.45), T_CTA - F(0.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (p <= 0.002) return null;
  return (
    <div style={{position: 'absolute', left: M * k, right: M * k, top: TEXT_TOP * k, opacity: out}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 78 * k, lineHeight: 1.06,
        letterSpacing: '-0.035em', color: C.cream, opacity: p, transform: `translateY(${(1 - p) * 20 * k}px)`}}>
        A co zdarma
        <br />
        <span style={{color: C.yellow}}>není?</span>
      </div>
      <div style={{marginTop: 26 * k, fontFamily: BODY, fontWeight: 600, fontSize: 32 * k, lineHeight: 1.42,
        color: C.soft, opacity: sub, transform: `translateY(${(1 - sub) * 16 * k}px)`, maxWidth: 860 * k}}>
        Řekneme vám cenu dopředu, ještě než si cokoli vyberete. Nic se u nás
        nedozvíte až u pokladny.
      </div>
    </div>
  );
};

export const ReelZdarma: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const bodyOp = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hdrOp = interpolate(frame, [T_S1 - F(0.2), T_S1 + F(0.3), T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const vol = interpolate(frame, [0, F(0.8), ZDARMA_DURATION - F(2.0), ZDARMA_DURATION], [0, 0.9, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-zdarma.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp, transform: `scale(${punch(frame)})`}}>
        {SHOTS.map((s) => <Wash key={`w-${s.src}`} shot={s} strength={0.5} />)}

        <div style={{position: 'absolute', left: WIN_X * k, top: WIN_TOP * k, width: WIN_W * k, height: WIN_H * k,
          borderRadius: 20 * k, overflow: 'hidden', boxShadow: `0 ${20 * k}px ${70 * k}px rgba(0,0,0,0.55)`}}>
          {SHOTS.map((s) => <Photo key={s.src} shot={s} />)}
          <div style={{position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(7,7,7,0.24) 0%, transparent 26%, transparent 68%, rgba(7,7,7,0.5) 100%)'}} />
        </div>

        <HookBlock k={k} until={T_S1} top={TEXT_TOP} kicker="// CO U NÁS NIC NESTOJÍ"
          lines={[['Tři', 'věci'], ['jsou', 'zdarma.']]}
          sub="A u každé řekneme, za jakých podmínek." loop="3 věci bez koruny" size={96} />

        {ITEMS.map((it, i) => <Block key={it.head.join(' ')} index={i} k={k} />)}
        <Honest k={k} />
      </AbsoluteFill>

      <BrandCard k={k} at={T_CTA} bg="nakup/vyloha.jpg"
        claim={['Přijďte to', 'vyzkoušet.']} pill="Objednat měření 👓"
        recap="// měření ke kompletním brýlím · zkušební čočky · MiYOSMART" />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
