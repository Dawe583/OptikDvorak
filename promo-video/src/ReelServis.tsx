import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {LogoMark} from './LogoMark';

/* REEL — „Brýle jako nové": servis a opravy brýlí na Americké 325/23.
   Jediný Reel, který nic neprodává — jen říká, že se s rozbitými brýlemi dá
   přijít bez objednání a většina věcí se zvládne na počkání. Přesně ten
   nereklamní obsah, který podle podkladů v docs/REKLAMA-A-SOCIAL-PLAN.md
   nese organický dosah nejlíp.

   Vizuální podpis schválně JINÝ než u ostatních Reels (Edukace = číslované
   tipy na černém, Nákup = filmový pás s ukazatelem, Měření = signály a
   střihy prodejny): tady je krémový SERVISNÍ LÍSTEK přes celou bezpečnou
   zónu, ve kterém se postupně odškrtávají čtyři závady. Světlá karta na
   tmavém pozadí je i nejlíp čitelná bez zvuku — a dá se vyfotit.

   ČASOVÁ OSA (doba běhu 20,0 s = 1200 snímků, mřížka 0,625 s = 96 BPM,
   musí sedět s scripts/make-audio-servis.mjs):
     0,00–2,50   HÁČEK    „Ohnuté brýle? Nevyhazujte je."
     2,50–5,00   ZÁVADA 01 povolený šroubek, otlačená sedýlka
     5,00–7,50   ZÁVADA 02 prasklý silon u poloobrub
     7,50–10,00  ZÁVADA 03 zašlá obruba — hloubkové čištění ultrazvukem
    10,00–12,50  ZÁVADA 04 brýle tlačí nebo padají — seřízení na obličej
    12,50–16,25  RAZÍTKO  „objednávat se nemusíte, stavte se v otevírací době"
    16,25–20,00  CTA      brandová karta, adresa, otevírací doba, telefon

   FOTKY (public/servis/, poměr okna lístku 1820:1213, háček 2340:1864):
     hook.jpg    optika/opt-0691.jpg  pult s kelímkem nářadí, za ním vitríny
     krok1.jpg   img/ai/pece-o-bryle  ruce se šroubovákem u obruby
     krok2.jpg   img/ai/galerie-detail ruce drží tenkou kovovou obrubu proti světlu
     krok3.jpg   img/ai/kolaz-cisteni  utírání brýlí hadříkem
     krok4.jpg   img/senior-glasses    usměvavý pán v brýlích, co sedí
     hotovo.jpg  optika/opt-0690.jpg  recepce s nápisem OPTIK DVOŘÁK
     (pozadí CTA se bere z nakup/vyloha.jpg — výloha z Americké)

   Všechna tvrzení jsou doslova ze servis.html: výměna šroubků a sedýlek,
   napnutí silonu u poloobrub, hloubkové čištění ultrazvukem, seřízení na
   obličej, běžné věci obvykle na počkání, objednávat se není třeba.
   Žádné lhůty ani ceny se neslibují — ty nikde ověřené nemáme. */

const {fontFamily: DISPLAY} = loadBricolage('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});
const {fontFamily: BODY} = loadInter('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext']});
const {fontFamily: MONO} = loadMono('normal', {weights: ['400', '700'], subsets: ['latin', 'latin-ext']});

const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  /* barvy na krémové kartě */
  ink: '#111111',
  inkSoft: 'rgba(17,17,17,0.66)',
  inkDim: 'rgba(17,17,17,0.42)',
  rule: 'rgba(17,17,17,0.14)',
  /* barvy na tmavém pozadí */
  dim: 'rgba(244,241,234,0.5)',
  soft: 'rgba(244,241,234,0.78)',
};

/* Světlý grade — servis má působit čistě a prosvětleně, ne jako dílna v šeru. */
const GRADE = 'saturate(1.05) contrast(1.04) brightness(1.03)';

export const FPS = 60;
const F = (s: number) => Math.round(s * FPS);

/* Klíčové časy */
const T_S1 = F(2.5);
const T_S2 = F(5.0);
const T_S3 = F(7.5);
const T_S4 = F(10.0);
const T_STAMP = F(12.5);
const T_CTA = F(16.25);
export const SERVIS_DURATION = F(20.0); // 1200 snímků = 20,0 s

const STARTS = [T_S1, T_S2, T_S3, T_S4];
const XF = F(0.4); // délka prolínačky mezi fotkami v okně

/* Rozvržení v souřadnicích 1080 × 1920 (násobí se useScale()).
   Bezpečné zóny Instagramu: horní ~269 px a dolní ~384 px (od 1536 dolů)
   překrývá UI. Lístek proto přesně vyplňuje pruh 280 až 1536. */
const CARD_X = 66;
const CARD_W = 1080 - 2 * CARD_X;
const CARD_TOP = 280;
const CARD_BOT = 1536;
const PAD = 60;

const HEAD_H = 104;               // hlavička lístku (mono řádek + linka)
const WIN_X = CARD_X + PAD;       // okno s fotkou
const WIN_W = CARD_W - 2 * PAD;
const WIN_TOP = CARD_TOP + HEAD_H + 20;
const WIN_H = Math.round(WIN_W / 1.5);
const ROWS_TOP = WIN_TOP + WIN_H + 32;
const ROW_H = 128;

/* Háček: fotka přes celou šířku, ještě bez lístku. Text pod ní musí skončit
   nad 1536 px, jinak by ho překryl spodní pruh Instagramu. */
const HOOK_TOP = 250;
const HOOK_H = 750;
const HOOK_TEXT = HOOK_TOP + HOOK_H + 50;

const useScale = () => useVideoConfig().width / 1080;

/* ---------- Zrno (stejné jako u ostatních Reels) ---------- */
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
        pointerEvents: 'none',
      }}
    />
  );
};

/* ---------- Reveal nadpisu po slovech ---------- */
const HeadWords: React.FC<{
  words: string[];
  startAt: number;
  k: number;
  size: number;
  color?: string;
  dot?: boolean;
}> = ({words, startAt, k, size, color = C.cream, dot = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `0 ${16 * k}px`,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size * k,
        lineHeight: 1.02,
        letterSpacing: '-0.035em',
        color,
      }}
    >
      {words.map((w, i) => {
        const p = spring({frame: frame - startAt - i * 4, fps, config: {damping: 18, stiffness: 150}});
        const isLast = i === words.length - 1;
        return (
          <span key={`${w}-${i}`} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 6 * k}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>
              {w}
              {dot && isLast && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 15 * k,
                    height: 15 * k,
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

/* ---------- Fotka v okně lístku (Ken Burns + prolínačka) ---------- */
type Shot = {src: string; from: number; to: number; dir: 'in' | 'out'};

const SHOTS: Shot[] = [
  {src: 'servis/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'servis/krok1.jpg', from: T_S1, to: T_S2, dir: 'out'},
  {src: 'servis/krok2.jpg', from: T_S2, to: T_S3, dir: 'in'},
  {src: 'servis/krok3.jpg', from: T_S3, to: T_S4, dir: 'out'},
  {src: 'servis/krok4.jpg', from: T_S4, to: T_STAMP, dir: 'in'},
  {src: 'servis/hotovo.jpg', from: T_STAMP, to: T_CTA, dir: 'in'},
];

const shotOpacity = (frame: number, s: Shot) =>
  interpolate(frame, [s.from - XF, s.from, s.to - XF, s.to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const WinPhoto: React.FC<{shot: Shot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const op = shotOpacity(frame, shot);
  if (op <= 0.002) return null;

  const p = interpolate(frame, [shot.from, shot.to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const scale = shot.dir === 'in' ? 1 + p * 0.06 : 1.06 - p * 0.06;
  return (
    <Img
      src={staticFile(shot.src)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: GRADE,
        transform: `scale(${scale})`,
        opacity: op,
      }}
    />
  );
};

/* Rozostřený barevný nádech přes celou plochu — pozadí není mrtvě černé. */
const Wash: React.FC<{shot: Shot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const op = shotOpacity(frame, shot);
  if (op <= 0.002) return null;
  return (
    <Img
      src={staticFile(shot.src)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'blur(90px) brightness(0.32) saturate(1.2)',
        transform: 'scale(1.3)',
        opacity: op * 0.6,
      }}
    />
  );
};

/* ---------- Háček ---------- */
const Hook: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [T_S1 - F(0.5), T_S1 - F(0.1)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;

  const kicker = interpolate(frame, [4, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sub = interpolate(frame, [F(1.3), F(1.75)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        position: 'absolute',
        left: 90 * k,
        right: 90 * k,
        top: HOOK_TEXT * k,
        opacity: op,
      }}
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
        // SERVIS BRÝLÍ · PLZEŇ
      </div>
      <HeadWords words={['Ohnuté', 'brýle?']} startAt={8} k={k} size={96} />
      <div style={{height: 8 * k}} />
      <HeadWords words={['Nevyhazujte', 'je']} startAt={26} k={k} size={96} color={C.yellow} dot />
      <div
        style={{
          marginTop: 34 * k,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 34 * k,
          lineHeight: 1.45,
          color: C.soft,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 16 * k}px)`,
        }}
      >
        Běžné opravy zvládneme obvykle na počkání.
      </div>
    </div>
  );
};

/* ---------- Odškrtávací políčko ---------- */
const Check: React.FC<{start: number; k: number}> = ({start, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  /* fajfka doskočí o něco později než řádek — je to ta „hotovo" chvilka */
  const p = spring({frame: frame - start - 8, fps, config: {damping: 11, stiffness: 210}});
  const draw = interpolate(frame, [start + 10, start + 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: 'relative',
        flex: `0 0 ${62 * k}px`,
        width: 62 * k,
        height: 62 * k,
        borderRadius: 14 * k,
        border: `${3 * k}px solid ${C.rule}`,
        background: `rgba(255,228,92,${0.12 + p * 0.88})`,
        boxShadow: p > 0.5 ? `0 0 ${22 * k}px rgba(245,197,24,0.35)` : 'none',
        transform: `scale(${0.94 + p * 0.06})`,
      }}
    >
      <svg viewBox="0 0 24 24" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <path
          d="M6 12.5 10.2 16.6 18 8.4"
          fill="none"
          stroke={C.ink900}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="20"
          strokeDashoffset={20 * (1 - draw)}
        />
      </svg>
    </div>
  );
};

/* ---------- Žlutý zvýrazňovač pod klíčovou částí věty ----------
   Rozměry schválně v em, ne v pixelech — komponenta se používá i uvnitř
   pole ITEMS, kde měřítko snímku (k) ještě není k dispozici. */
const Hi: React.FC<{children: React.ReactNode; start: number}> = ({children, start}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [start + 14, start + 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      <span
        style={{
          position: 'absolute',
          left: '-0.14em',
          right: '-0.14em',
          top: '16%',
          bottom: '2%',
          background: 'rgba(255,228,92,0.62)',
          borderRadius: '0.1em',
          transform: `scaleX(${w})`,
          transformOrigin: 'left center',
        }}
      />
      <span style={{position: 'relative'}}>{children}</span>
    </span>
  );
};

/* ---------- Jeden řádek servisního lístku ---------- */
type Item = {fault: string; fix: React.ReactNode};

const ITEMS: Item[] = [
  {fault: 'Povolený šroubek, otlačená sedýlka', fix: <>Vyměníme je <Hi start={T_S1}>na počkání</Hi>.</>},
  {fault: 'Prasklý silon u poloobrub', fix: <>Napneme nový, sklo zase <Hi start={T_S2}>pevně drží</Hi>.</>},
  {fault: 'Zašlá obruba, kam hadřík nedosáhne', fix: <>Vyčistíme ji <Hi start={T_S3}>ultrazvukem</Hi>.</>},
  {fault: 'Brýle tlačí nebo padají', fix: <>Seřídíme je <Hi start={T_S4}>přesně na váš obličej</Hi>.</>},
];

/* Řádky jsou na lístku vidět všechny čtyři hned, jak karta najede — jen
   zešedlé a s prázdným políčkem. Divák tak od začátku ví, že jsou čtyři,
   a zůstane u videa až k poslední fajfce. Teprve „ve své" chvíli se řádek
   rozsvítí, doskočí mu fajfka a objeví se, co s tou závadou uděláme. */
const Row: React.FC<{item: Item; index: number; k: number; collapse: number}> = ({item, index, k, collapse}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = STARTS[index];

  /* nájezd s lístkem, po řádcích shora dolů */
  const appear = spring({
    frame: frame - (T_S1 - F(0.32)) - index * 4,
    fps,
    config: {damping: 22, stiffness: 150},
  });
  if (appear <= 0.002) return null;

  /* rozsvícení řádku ve chvíli, kdy na něj přijde řada */
  const landed = interpolate(frame, [start, start + F(0.35)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* a ustoupení do pozadí, jakmile nastoupí další */
  const next = STARTS[index + 1] ?? T_STAMP;
  const active = interpolate(frame, [next - F(0.3), next], [1, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dim = 0.6 + 0.4 * active;

  return (
    <div
      style={{
        position: 'absolute',
        left: (CARD_X + PAD) * k,
        right: (CARD_X + PAD) * k,
        top: (ROWS_TOP + index * ROW_H) * k,
        height: ROW_H * k,
        display: 'flex',
        alignItems: 'center',
        gap: 26 * k,
        opacity: appear * (1 - collapse),
        transform: `translateX(${(1 - appear) * 34 * k}px) translateY(${collapse * -18 * k}px)`,
      }}
    >
      <Check start={start} k={k} />
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 35 * k,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            color: C.ink,
            opacity: (0.3 + 0.7 * landed) * dim,
          }}
        >
          {item.fault}
        </div>
        <div
          style={{
            marginTop: 8 * k,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 31 * k,
            lineHeight: 1.28,
            color: C.inkSoft,
            opacity: landed * active,
          }}
        >
          {item.fix}
        </div>
      </div>
    </div>
  );
};

/* ---------- Razítko HOTOVO ---------- */
const Stamp: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - T_STAMP - 6, fps, config: {damping: 13, stiffness: 190}});
  const out = interpolate(frame, [T_CTA - F(0.45), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (p <= 0.002) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: (WIN_TOP + WIN_H - 150) * k,
        display: 'flex',
        justifyContent: 'center',
        opacity: p * out,
      }}
    >
      <div
        style={{
          transform: `rotate(-7deg) scale(${1.5 - p * 0.5})`,
          border: `${6 * k}px solid ${C.yellowDeep}`,
          borderRadius: 18 * k,
          background: 'rgba(255,228,92,0.92)',
          padding: `${18 * k}px ${40 * k}px`,
          textAlign: 'center',
          boxShadow: `0 ${16 * k}px ${48 * k}px rgba(0,0,0,0.35)`,
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 76 * k,
            letterSpacing: '0.02em',
            lineHeight: 1,
            color: C.ink900,
          }}
        >
          HOTOVO
        </div>
        <div
          style={{
            marginTop: 8 * k,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 23 * k,
            letterSpacing: '0.14em',
            color: 'rgba(17,17,17,0.72)',
          }}
        >
          OBVYKLE NA POČKÁNÍ
        </div>
      </div>
    </div>
  );
};

/* ---------- Závěr lístku: objednávat se nemusíte ---------- */
const Closing: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - T_STAMP - 22, fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const out = interpolate(frame, [T_CTA - F(0.45), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sub = spring({frame: frame - T_STAMP - 40, fps, config: {damping: 200}, durationInFrames: F(0.9)});
  if (p <= 0.002) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: (CARD_X + PAD) * k,
        right: (CARD_X + PAD) * k,
        top: (ROWS_TOP + 34) * k,
        opacity: out,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 82 * k,
          lineHeight: 1.04,
          letterSpacing: '-0.035em',
          color: C.ink,
          opacity: p,
          transform: `translateY(${(1 - p) * 22 * k}px)`,
        }}
      >
        Objednávat se
        <br />
        nemusíte.
      </div>
      <div
        style={{
          marginTop: 30 * k,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 34 * k,
          lineHeight: 1.42,
          color: C.inkSoft,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 16 * k}px)`,
        }}
      >
        Stavte se s brýlemi kdykoli v otevírací době.
        <br />
        Rodinná oční optika na Americké od roku 1991.
      </div>

      {/* patička lístku — otevírací doba ať je na obrazovce co nejdéle */}
      <div
        style={{
          marginTop: 46 * k,
          paddingTop: 26 * k,
          borderTop: `${2 * k}px solid ${C.rule}`,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 25 * k,
          letterSpacing: '0.1em',
          color: C.inkDim,
          opacity: sub,
        }}
      >
        PO–ČT 8:30–17:00 · PÁ 8:30–16:00
      </div>
    </div>
  );
};

/* ---------- Servisní lístek ---------- */
const Docket: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  /* karta vyjede zespodu přesně ve chvíli, kdy háček odchází */
  const rise = spring({frame: frame - T_S1 + F(0.5), fps, config: {damping: 22, stiffness: 130}});
  const out = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const collapse = interpolate(frame, [T_STAMP - F(0.3), T_STAMP + F(0.15)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  if (rise <= 0.002) return null;

  const headOp = interpolate(frame, [T_S1 - F(0.15), T_S1 + F(0.3)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: CARD_X * k,
        top: CARD_TOP * k,
        width: CARD_W * k,
        height: (CARD_BOT - CARD_TOP) * k,
        background: C.cream,
        borderRadius: 34 * k,
        boxShadow: `0 ${28 * k}px ${90 * k}px rgba(0,0,0,0.55)`,
        opacity: rise * out,
        transform: `translateY(${(1 - rise) * 90 * k}px) scale(${0.96 + rise * 0.04})`,
        overflow: 'hidden',
      }}
    >
      {/* hlavička lístku */}
      <div
        style={{
          position: 'absolute',
          left: PAD * k,
          right: PAD * k,
          top: 40 * k,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 25 * k,
          letterSpacing: '0.18em',
          color: C.ink,
          opacity: headOp,
        }}
      >
        <span>SERVISNÍ LÍSTEK</span>
        <span style={{color: C.inkDim, letterSpacing: '0.1em'}}>OD ROKU 1991</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: PAD * k,
          right: PAD * k,
          top: (HEAD_H - 6) * k,
          height: 2 * k,
          background: C.rule,
          opacity: headOp,
        }}
      />
    </div>
  );
};

/* ---------- CTA / brandová karta ---------- */
const CtaCard: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - T_CTA;
  if (t < -F(0.5)) return null;

  const logo = spring({frame: t, fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const claim = spring({frame: t - F(0.35), fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const addr = spring({frame: t - F(0.7), fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const cta = spring({frame: t - F(1.05), fps, config: {damping: 14, stiffness: 170}});
  const recap = interpolate(t, [F(1.5), F(2.0)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = 1 + Math.sin(Math.max(0, t - F(1.05)) / 11) * 0.02;
  const shine = interpolate(t, [F(1.5), F(2.4)], [-30, 120], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fade = interpolate(t, [-F(0.5), 0], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <Img
        src={staticFile('nakup/vyloha.jpg')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(70px) brightness(0.32) saturate(1.15)',
          transform: `scale(${1.25 + Math.min(1, Math.max(0, t / F(3.2))) * 0.06})`,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, rgba(255,228,92,0.08), rgba(7,7,7,0.86) 62%)'}} />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 28 * k, padding: `0 ${90 * k}px`}}>
        <div style={{width: 320 * k, opacity: logo, transform: `scale(${logo})`}}>
          <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 84 * k,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.06,
            color: C.cream,
            opacity: claim,
            transform: `translateY(${(1 - claim) * 22 * k}px)`,
          }}
        >
          Přineste nám je
          <br />
          <span style={{color: C.yellow}}>na Americkou.</span>
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 31 * k,
            color: C.soft,
            textAlign: 'center',
            lineHeight: 1.55,
            opacity: addr,
            transform: `translateY(${(1 - addr) * 16 * k}px)`,
          }}
        >
          Optik Dvořák · Americká 325/23, Plzeň
          <br />
          Po–Čt 8:30–17:00 · Pá 8:30–16:00
          <br />
          +420 702 194 246
        </div>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginTop: 10 * k,
            background: C.yellow,
            color: C.ink900,
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 30 * k,
            padding: `${20 * k}px ${40 * k}px`,
            borderRadius: 999,
            opacity: cta,
            transform: `scale(${cta * pulse})`,
            boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
          }}
        >
          Bez objednání 👓
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
        <div
          style={{
            fontFamily: MONO,
            fontSize: 23 * k,
            color: C.dim,
            marginTop: 4 * k,
            textAlign: 'center',
            opacity: recap,
          }}
        >
          // šroubky · sedýlka · silon · ultrazvuk · seřízení
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Reel ---------- */
export const ReelServis: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  /* Fotka z háčku se scvrkne do okna servisního lístku — signaturní pohyb. */
  const morph = interpolate(frame, [T_S1 - F(0.5), T_S1 + F(0.2)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const winX = 0 + (WIN_X - 0) * morph;
  const winW = 1080 + (WIN_W - 1080) * morph;
  const winTop = HOOK_TOP + (WIN_TOP - HOOK_TOP) * morph;
  const winH = HOOK_H + (WIN_H - HOOK_H) * morph;
  const winRadius = 0 + 20 * morph;

  const winOp = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const collapse = interpolate(frame, [T_STAMP - F(0.3), T_STAMP + F(0.15)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const hdrOp = interpolate(frame, [0, 8, T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const vol = interpolate(
    frame,
    [0, F(0.8), SERVIS_DURATION - F(2.2), SERVIS_DURATION],
    [0, 0.9, 0.9, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-servis.wav')} volume={vol} />

      {/* barevný nádech z právě běžící fotky */}
      <AbsoluteFill style={{opacity: winOp}}>
        {SHOTS.map((s) => (
          <Wash key={`w-${s.src}`} shot={s} />
        ))}
      </AbsoluteFill>

      {/* servisní lístek (krémová karta) */}
      <Docket k={k} />

      {/* okno s fotkou — v háčku přes celou šířku, pak uvnitř lístku */}
      <div
        style={{
          position: 'absolute',
          left: winX * k,
          top: winTop * k,
          width: winW * k,
          height: winH * k,
          borderRadius: winRadius * k,
          overflow: 'hidden',
          opacity: winOp,
        }}
      >
        {SHOTS.map((s) => (
          <WinPhoto key={s.src} shot={s} />
        ))}
        {/* v háčku je pod fotkou tmavý spád, ať drží text; v lístku zmizí */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(7,7,7,0.30) 0%, transparent 26%, transparent 58%, rgba(7,7,7,0.62) 100%)',
            opacity: 1 - morph,
          }}
        />
      </div>

      {/* řádky lístku a jeho závěr */}
      {ITEMS.map((item, i) => (
        <Row key={item.fault} item={item} index={i} k={k} collapse={collapse} />
      ))}
      <Closing k={k} />
      <Stamp k={k} />

      {/* háček */}
      <Hook k={k} />

      {/* CTA */}
      <CtaCard k={k} />

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
          opacity: hdrOp,
        }}
      >
        Optik <span style={{color: C.yellow}}>Dvořák</span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 102 * k,
          right: 90 * k,
          fontFamily: MONO,
          fontSize: 20 * k,
          color: C.dim,
          opacity: hdrOp,
        }}
      >
        // Plzeň
      </div>

      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,0.5) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
