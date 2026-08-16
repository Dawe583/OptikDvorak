import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BODY,
  BrandCard,
  C,
  DISPLAY,
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

/* REEL — „Než začne škola": měření zraku dětem před začátkem školního roku.
   Sezónní kus, který má smysl pouštět od poloviny srpna do půlky září.

   Vizuální podpis: LINKOVANÝ SEŠIT. Přes celý tmavý formát běží slabé
   krémové linky a vlevo žlutá okrajová čára, přesně jako ve školním sešitě.
   Text sedí na linkách, fotka je nad nimi v krémovém rámečku. Žádný jiný
   Reel na profilu takhle nevypadá.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM,
   musí sedět s scripts/make-audio-nove-reels.mjs):
     0,000–2,500   HÁČEK   „Vidí vaše dítě na tabuli?"
     2,500–5,625   BOD 01  změříme mu zrak
     5,625–8,750   BOD 02  nespěcháme, obvykle 30 až 45 minut
     8,750–11,875  BOD 03  obrubu vybereme spolu s ním
    11,875–15,000  BOD 04  MiYOSMART poradenství zdarma
    15,000–18,750  CTA     brandová karta

   FOTKY (public/deti/, poměr okna 1980:1410):
     hook.jpg   img/hero/od-child.webp   holčička v červených brýlích s knihami
     krok1.jpg  optika/opt-0692.jpg      konzultační stůl na prodejně
     krok2.jpg  img/kid-glasses.jpg      holčička zkouší brýle na prodejně
     krok3.jpg  img/ai/deti-bryle.jpg    kluk v brýlích
     krok4.jpg  img/hero/od-child.webp   detail téže holčičky (jiný výřez)

   Tvrzení jsou z mereni-zraku.html, akce.html a FAQ na homepage. Nikde se
   nemluví o příznacích špatného zraku u dětí — to na webu ověřené nemáme
   a vymýšlet zdravotní obsah nebudeme. Proto je i na konci věta, že měření
   v optice nenahrazuje lékařské vyšetření očí. */

const T_S1 = F(2.5);
const T_S2 = F(5.625);
const T_S3 = F(8.75);
const T_S4 = F(11.875);
const T_CTA = F(15.0);
export const DETI_DURATION = F(18.75);

const STARTS = [T_S1, T_S2, T_S3, T_S4];

/* Rozvržení 1080 × 1920 */
const WIN_X = 90;
const WIN_W = 900;
const WIN_TOP = 300;
const WIN_H = 640;
const TEXT_TOP = 1000;
const MARGIN_X = 150; // žlutá okrajová čára sešitu

const SHOTS: Shot[] = [
  {src: 'deti/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'deti/krok1.jpg', from: T_S1, to: T_S2, dir: 'out'},
  {src: 'deti/krok2.jpg', from: T_S2, to: T_S3, dir: 'in'},
  {src: 'deti/krok3.jpg', from: T_S3, to: T_S4, dir: 'out'},
  {src: 'deti/krok4.jpg', from: T_S4, to: T_CTA, dir: 'in'},
];

/* ---------- Linkovaný sešit ---------- */
const Paper: React.FC<{k: number; opacity: number}> = ({k, opacity}) => {
  const frame = useCurrentFrame();
  /* linky se „natáhnou" zleva doprava hned na začátku */
  const draw = interpolate(frame, [4, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{opacity}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${draw * 100}%`,
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${62 * k}px, rgba(244,241,234,0.16) ${62 * k}px ${64 * k}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X * k,
          top: 0,
          width: 3 * k,
          height: `${draw * 100}%`,
          background: 'rgba(255,228,92,0.45)',
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Textový blok jednoho bodu ---------- */
const Beat: React.FC<{
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
    <div style={{position: 'absolute', left: M * k, right: M * k, top: TEXT_TOP * k, opacity: op}}>
      <div
        style={{
          display: 'inline-block',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24 * k,
          letterSpacing: '0.16em',
          color: C.ink900,
          background: C.yellow,
          padding: `${10 * k}px ${20 * k}px`,
          borderRadius: 8 * k,
          marginBottom: 26 * k,
          transform: `scale(${0.8 + chip * 0.2})`,
          transformOrigin: 'left center',
          opacity: chip,
        }}
      >
        {badge}
      </div>
      <HeadWords words={head} startAt={from + 4} k={k} size={76} />
      <div
        style={{
          marginTop: 26 * k,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 33 * k,
          lineHeight: 1.42,
          color: C.soft,
          opacity: det,
          transform: `translateY(${(1 - det) * 16 * k}px)`,
          maxWidth: 820 * k,
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
    <div style={{position: 'absolute', left: M * k, right: M * k, top: TEXT_TOP * k, opacity: op}}>
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
        // ZAČÍNÁ ŠKOLNÍ ROK
      </div>
      <HeadWords words={['Vidí', 'vaše', 'dítě']} startAt={8} k={k} size={92} />
      <div style={{height: 8 * k}} />
      <HeadWords words={['na', 'tabuli?']} startAt={26} k={k} size={92} color={C.yellow} />
      <div
        style={{
          marginTop: 32 * k,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 34 * k,
          lineHeight: 1.45,
          color: C.soft,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 16 * k}px)`,
        }}
      >
        Než začne škola, vezměte ho na měření zraku.
      </div>
    </div>
  );
};

/* ---------- Reel ---------- */
export const ReelDeti: React.FC = () => {
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
  const winIn = spring({frame: frame - 2, fps: FPS, config: {damping: 22, stiffness: 140}});
  const vol = interpolate(frame, [0, F(0.8), DETI_DURATION - F(2.0), DETI_DURATION], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0A0B0A'}}>
      <Audio src={staticFile('music-deti.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp}}>
        {SHOTS.map((s) => (
          <Wash key={`w-${s.src}`} shot={s} strength={0.45} />
        ))}
      </AbsoluteFill>

      <Paper k={k} opacity={bodyOp} />

      {/* okno s fotkou v krémovém rámečku */}
      <div
        style={{
          position: 'absolute',
          left: WIN_X * k,
          top: WIN_TOP * k,
          width: WIN_W * k,
          height: WIN_H * k,
          borderRadius: 18 * k,
          border: `${5 * k}px solid ${C.cream}`,
          boxShadow: `0 ${18 * k}px ${60 * k}px rgba(0,0,0,0.55)`,
          overflow: 'hidden',
          opacity: bodyOp * winIn,
          transform: `translateY(${(1 - winIn) * 30 * k}px)`,
        }}
      >
        {SHOTS.map((s) => (
          <Photo key={s.src} shot={s} />
        ))}
      </div>

      <Hook k={k} />
      <Beat
        index={0}
        badge="01 · MĚŘENÍ"
        head={['Změříme', 'mu', 'zrak']}
        detail={<>Na moderních přístrojích přímo na prodejně, <Hi start={T_S1}>bez čekání u lékaře</Hi>.</>}
        k={k}
      />
      <Beat
        index={1}
        badge="02 · ČAS"
        head={['Nespěcháme']}
        detail={<>Vyšetření obvykle trvá <Hi start={T_S2}>30 až 45 minut</Hi>. Ptáme se, na co brýle nejvíc potřebuje.</>}
        k={k}
      />
      <Beat
        index={2}
        badge="03 · OBRUBA"
        head={['Vybereme', 'ji', 'spolu']}
        detail={<>Najdeme obrubu, která mu sedne <Hi start={T_S3}>tvarem i stylem</Hi>. Nosit ji bude každý den.</>}
        k={k}
      />
      <Beat
        index={3}
        badge="04 · MiYOSMART"
        head={['Poradíme']}
        detail={
          <>
            Brýlová skla pro řízení dětské krátkozrakosti. Jestli jsou pro vaše dítě vhodná,
            posoudíme <Hi start={T_S4}>bezplatně</Hi>.
          </>
        }
        k={k}
      />

      {/* drobná poctivá poznámka */}
      <div
        style={{
          position: 'absolute',
          left: M * k,
          right: M * k,
          top: 1462 * k,
          fontFamily: MONO,
          fontSize: 20 * k,
          color: 'rgba(244,241,234,0.35)',
          opacity: bodyOp * interpolate(frame, [T_S1, T_S1 + F(0.5)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        // měření v optice nenahrazuje lékařské vyšetření očí
      </div>

      <BrandCard
        k={k}
        at={T_CTA}
        bg="nakup/vyloha.jpg"
        claim={['Objednejte se', 'před zvoněním.']}
        pill="Objednat měření 👓"
        recap="// měření zraku · dětské obruby · MiYOSMART"
      />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
