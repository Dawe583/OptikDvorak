import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BODY, BrandCard, C, F, Grain, Header, HookBlock, M, MONO,
  Photo, punch, Shot, useScale, Vignette, Wash, XF,
} from './kit';

/* REEL — „Na co se nás ptáte nejčastěji": čtyři skutečné dotazy z FAQ na webu.
   Nejlevnější obsah, jaký optika může mít — otázky si nevymýšlíme, jsou to ty,
   které na webu opravdu stojí, a odpovědi jsou zkrácené verze těch webových.

   Vizuální podpis: CHATOVÉ BUBLINY. Otázka přiletí zprava v šedé bublině,
   odpověď zleva v krémové, přesně jako konverzace ve zprávách. Nic jiného
   na profilu takhle nevypadá a čte se to i bez zvuku na první dobrou.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM):
     0,000–2,500   HÁČEK   „Na co se ptáte nejčastěji?"
     2,500–5,625   DOTAZ 1 kolik stojí měření zraku
     5,625–8,750   DOTAZ 2 jak dlouho měření trvá
     8,750–11,875  DOTAZ 3 nikdy jsem nenosil čočky, jak začít
    11,875–15,000  DOTAZ 4 jak je to s opravami brýlí
    15,000–18,750  CTA

   Všechny čtyři odpovědi jsou zkrácené věty z FAQ na homepage. Nic se nepřidalo,
   ceny se neuvádějí (na webu nejsou), u měření se drží podmínka „při pořízení
   kompletních dioptrických brýlí". */

const T_S1 = F(2.5), T_S2 = F(5.625), T_S3 = F(8.75), T_S4 = F(11.875), T_CTA = F(15.0);
export const FAQ_DURATION = F(18.75);
const STARTS = [T_S1, T_S2, T_S3, T_S4];
const WIN_X = 90, WIN_W = 900, WIN_TOP = 300, WIN_H = 600;
const TEXT_TOP = 1000;   // háček pod fotkou
const CHAT_TOP = 700;    // bubliny bez fotky — vycentrované v bezpečné zóně

const SHOTS: Shot[] = [
  {src: 'faq/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'faq/konec.jpg', from: T_S4, to: T_CTA, dir: 'out'},
];

type QA = {q: string; a: string};
const QAS: QA[] = [
  {q: 'Kolik stojí měření zraku?', a: 'Při pořízení kompletních dioptrických brýlí je zdarma. Jinak se cena odvíjí od rozsahu vyšetření — rádi ji řekneme dopředu.'},
  {q: 'Jak dlouho měření trvá?', a: 'Obvykle 30 až 45 minut. Neodbýváme ho — podle toho měření pak brýle nosíte každý den.'},
  {q: 'Nikdy jsem nenosil čočky. Jak začít?', a: 'Pomůžeme vám krok za krokem. Zkušební pár dostanete zdarma a objednáme vás na kontrolu.'},
  {q: 'Jak je to u vás s opravami?', a: 'Šroubky, sedýlka, silon i čištění ultrazvukem zvládneme obvykle na počkání. Objednávat se nemusíte.'},
];

/* ---------- Dvojice bublin ---------- */
const Bubble: React.FC<{index: number; k: number}> = ({index, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const from = STARTS[index];
  const to = STARTS[index + 1] ?? T_CTA;
  const op = interpolate(frame, [from - XF, from, to - XF, to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (op <= 0.002) return null;
  const qa = QAS[index];
  const q = spring({frame: frame - from, fps, config: {damping: 16, stiffness: 180}});
  const a = spring({frame: frame - from - F(0.55), fps, config: {damping: 16, stiffness: 170}});

  return (
    <div style={{position: 'absolute', left: M * k, right: M * k, top: CHAT_TOP * k, opacity: op}}>
      {/* otázka — zprava, šedá */}
      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        <div style={{maxWidth: 720 * k, background: 'rgba(244,241,234,0.14)', color: C.cream,
          borderRadius: `${26 * k}px ${26 * k}px ${6 * k}px ${26 * k}px`, padding: `${22 * k}px ${28 * k}px`,
          fontFamily: BODY, fontWeight: 600, fontSize: 34 * k, lineHeight: 1.32,
          opacity: q, transform: `translateX(${(1 - q) * 50 * k}px)`}}>
          {qa.q}
        </div>
      </div>
      {/* odpověď — zleva, krémová */}
      <div style={{display: 'flex', justifyContent: 'flex-start', marginTop: 22 * k}}>
        <div style={{maxWidth: 800 * k, background: C.cream, color: C.ink,
          borderRadius: `${26 * k}px ${26 * k}px ${26 * k}px ${6 * k}px`, padding: `${24 * k}px ${30 * k}px`,
          fontFamily: BODY, fontWeight: 600, fontSize: 32 * k, lineHeight: 1.35,
          opacity: a, transform: `translateX(${(1 - a) * -50 * k}px)`,
          boxShadow: `0 ${12 * k}px ${34 * k}px rgba(0,0,0,0.45)`}}>
          {qa.a}
        </div>
      </div>
      <div style={{marginTop: 20 * k, fontFamily: MONO, fontSize: 21 * k, letterSpacing: '0.12em',
        color: C.dim, opacity: a}}>
        // dotaz {index + 1} ze 4 · odpověď z našeho webu
      </div>
    </div>
  );
};

export const ReelFaq: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const bodyOp = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  /* fotka je jen v háčku a pak zase u posledního dotazu */
  const winOp = interpolate(frame,
    [T_S1 - F(0.45), T_S1 - F(0.05), T_S4 - F(0.3), T_S4 + F(0.1), T_CTA - F(0.4), T_CTA - F(0.05)],
    [1, 0, 0, 0.5, 0.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hdrOp = interpolate(frame, [T_S1 - F(0.2), T_S1 + F(0.3), T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const vol = interpolate(frame, [0, F(0.8), FAQ_DURATION - F(2.0), FAQ_DURATION], [0, 0.9, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-faq.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp, transform: `scale(${punch(frame)})`}}>
        {SHOTS.map((s) => <Wash key={`w-${s.src}`} shot={s} strength={0.45} />)}

        <div style={{position: 'absolute', left: WIN_X * k, top: WIN_TOP * k, width: WIN_W * k, height: WIN_H * k,
          borderRadius: 20 * k, overflow: 'hidden', opacity: winOp,
          boxShadow: `0 ${20 * k}px ${70 * k}px rgba(0,0,0,0.55)`}}>
          {SHOTS.map((s) => <Photo key={s.src} shot={s} />)}
        </div>

        <HookBlock k={k} until={T_S1} top={TEXT_TOP} kicker="// NEJČASTĚJŠÍ DOTAZY"
          lines={[['Na', 'co', 'se', 'nás'], ['ptáte', 'nejvíc?']]}
          sub="Čtyři otázky, které slyšíme skoro každý den." loop="4 otázky a 4 odpovědi" size={88} />

        {QAS.map((qa, i) => <Bubble key={qa.q} index={i} k={k} />)}
      </AbsoluteFill>

      <BrandCard k={k} at={T_CTA} bg="nakup/vyloha.jpg"
        claim={['Máte jinou', 'otázku?']} pill="Napište nám 💬"
        recap="// všechny odpovědi najdete na optikdvorak.cz" />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
