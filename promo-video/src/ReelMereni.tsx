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
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {LogoMark} from './LogoMark';

/* REEL — nalákání na měření zraku (23 s).
   Cíl: připomenout lidem, že si mají nechat změřit zrak, a dovést je k objednání.

   Časová osa (absolutní sekundy, sedí s scripts/make-audio-mereni.mjs):
    0,0–2,8   HÁČEK        „Kdy jste si naposledy nechali změřit zrak?"
    2,4–8,8   ROZPOZNÁNÍ   3 signály z běžného života (pozorování, ne diagnóza)
    8,4–11,4  PRODEJNA     recepce — měříme přímo na prodejně, bez čekání u lékaře
   11,0–14,0  STŮL         30 až 45 minut, nespěcháme
   13,6–16,6  PANORAMA     rodinná oční optika od roku 1991 + hodnocení na Googlu
   16,2–19,4  CENA         „Při pořízení kompletních dioptrických brýlí je
                            měření zraku zdarma." (doslovná formulace, neměnit)
   19,0–23,0  CTA          logo, telefon, adresa, otevírací doba

   Obsah: jen ověřená fakta z mereni-zraku.html. Žádné zdravotní sliby,
   žádná diagnóza, žádná vymyšlená čísla. Fotky jsou reálné záběry prodejny
   (výřezy v public/mereni/), nic upscalovaného — zdroj má 2160 px na šířku. */

const {fontFamily: DISPLAY} = loadBricolage('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});
const {fontFamily: BODY} = loadInter('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext']});
const {fontFamily: MONO} = loadMono('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  dim: 'rgba(244,241,234,0.5)',
};

/* Světlý, vzdušný grade — prodejna má působit prosvětleně, ne ponuře. */
const GRADE = 'saturate(1.06) contrast(1.05) brightness(1.03)';

export const FPS = 60;
const F = (s: number) => Math.round(s * FPS);

const D_HOOK = F(2.8);
const D_SIG = F(6.4);
const D_SHOT = F(3.0);
const D_PRICE = F(3.2);
const D_CTA = F(4.0);
const TRANS = F(0.4);

export const MERENI_DURATION = D_HOOK + D_SIG + D_SHOT * 3 + D_PRICE + D_CTA - TRANS * 6; // 1380 = 23 s

/* Absolutní začátek CTA — jen kvůli zhasnutí hlavičky nad brandovou kartou.
   Před CTA leží všech šest přechodů, o které se sekvence překrývají. */
const T_CTA = D_HOOK + D_SIG + D_SHOT * 3 + D_PRICE - TRANS * 6; // 1140 = 19 s

/* Fotky jsou 2160 × 2430 → při šířce 1080 jednotek mají výšku 1215. */
const PHOTO_H = 1215;

const useScale = () => useVideoConfig().width / 1080;

/* ---------- Zrno (jemná filmová textura, jako u ostatních Reels) ---------- */
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

/* ---------- Reveal nadpisu po slovech (sdílený tvar s ostatními Reels) ---------- */
const HeadWords: React.FC<{
  words: string[];
  startAt: number;
  k: number;
  size: number;
  dot?: boolean;
  color?: string;
}> = ({words, startAt, k, size, dot = false, color = C.cream}) => {
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
        const p = spring({frame: frame - startAt - i * 5, fps, config: {damping: 18, stiffness: 150}});
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

/* ---------- Titulek pod fotkou: mono linka + dvouřádkový headline ---------- */
const Caption: React.FC<{mono: string; line1: string; line2: string; size?: number}> = ({
  mono,
  line1,
  line2,
  size = 84,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const k = useScale();

  const appear = spring({frame: frame - F(0.2), fps, config: {damping: 200}, durationInFrames: F(0.7)});
  const leave = interpolate(frame, [durationInFrames - F(0.62), durationInFrames - F(0.18)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const o = appear * leave;

  const slide = (delay: number) => {
    const s = spring({frame: frame - F(0.2) - delay, fps, config: {damping: 200}, durationInFrames: F(0.7)});
    return {opacity: s * leave, transform: `translateY(${(1 - s) * 24 * k}px)`};
  };

  return (
    <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 440 * k}}>
      <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 20 * k, opacity: o}}>
        {mono}
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: size * k,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: C.cream,
          textShadow: `0 ${6 * k}px ${28 * k}px rgba(0,0,0,0.55)`,
        }}
      >
        <div style={slide(0)}>{line1}</div>
        <div style={slide(F(0.16))}>
          <span style={{color: C.yellow}}>{line2}</span>
        </div>
      </div>
    </div>
  );
};

/* Přechod fotky (horní 63 % formátu) do černého podkladu pod titulkem. */
const PhotoScrim = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(7,7,7,0.50) 0%, rgba(7,7,7,0.06) 10%, rgba(7,7,7,0) 34%, rgba(7,7,7,0.55) ${
        ((PHOTO_H - 210) / 1920) * 100
      }%, rgba(7,7,7,0.97) ${(PHOTO_H / 1920) * 100}%, rgba(7,7,7,0.94) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/* ---------- Fotka prodejny: horní pás formátu + Ken Burns, titulek pod ní ---------- */
const PhotoShot: React.FC<{
  src: string;
  dir: 'in' | 'out';
  mono: string;
  line1: string;
  line2: string;
  size?: number;
}> = ({src, dir, mono, line1, line2, size}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const k = useScale();

  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const scale = dir === 'in' ? 1 + p * 0.06 : 1.06 - p * 0.06;
  const url = staticFile(src);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      {/* rozostřený podklad, aby spodní část formátu nebyla mrtvě černá */}
      <Img
        src={url}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(70px) brightness(0.42) saturate(1.15)',
          transform: `scale(${1.3 * scale})`,
        }}
      />
      {/* ostrý snímek — přesně 1 : 1 pixelů, nic se neupscaluje */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: PHOTO_H * k, overflow: 'hidden'}}>
        <Img
          src={url}
          style={{width: '100%', height: 'auto', display: 'block', filter: GRADE, transform: `scale(${scale})`}}
        />
      </div>
      <PhotoScrim />
      <Caption mono={mono} line1={line1} line2={line2} size={size} />
    </AbsoluteFill>
  );
};

/* ---------- Panorama prodejny: pomalý horizontální pohyb kamerou ---------- */
const PanoShot: React.FC<{mono: string; line1: string; line2: string; size?: number}> = ({
  mono,
  line1,
  line2,
  size,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const k = useScale();

  /* Výřez panoramatu 3300 × 2160. Zobrazujeme ho ve výšce pásu fotky
     (2430 px při 4K = 1,125×), takže se prakticky neupscaluje.
     Jedeme od vchodu přes zaoblenou stěnu vitrín k pultu. */
  const s = (PHOTO_H * k) / 2160;
  const imgW = 3300 * s;
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const x = -(100 * s + (1250 - 100) * s * p);
  const url = staticFile('mereni/pano-mereni.jpg');

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Img
        src={url}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(70px) brightness(0.42) saturate(1.15)',
          transform: 'scale(1.3)',
        }}
      />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: PHOTO_H * k, overflow: 'hidden'}}>
        <Img
          src={url}
          style={{
            position: 'absolute',
            height: '100%',
            width: imgW,
            maxWidth: 'none',
            left: 0,
            transform: `translateX(${x}px)`,
            filter: GRADE,
          }}
        />
      </div>
      <PhotoScrim />
      <Caption mono={mono} line1={line1} line2={line2} size={size} />
    </AbsoluteFill>
  );
};

/* ---------- Háček: otázka, na kterou většina lidí nezná odpověď ---------- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const sub = spring({frame: frame - F(1.1), fps, config: {damping: 200}, durationInFrames: F(0.9)});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 40%, rgba(255,228,92,0.075), transparent 58%)'}}
      />
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', paddingBottom: 120 * k}}>
        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 24 * k}}>
          // ruku na srdce
        </div>
        <HeadWords words={['Kdy', 'jste', 'si']} startAt={F(0.1)} k={k} size={100} />
        <HeadWords words={['naposledy', 'nechali']} startAt={F(0.2)} k={k} size={100} />
        <HeadWords words={['změřit', 'zrak?']} startAt={F(0.3)} k={k} size={100} dot />
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 42 * k,
            color: C.dim,
            marginTop: 34 * k,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 16 * k}px)`,
          }}
        >
          Vzpomenete si na rok?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Jeden signál z běžného života (pozorování, ne diagnóza) ---------- */
const Signal: React.FC<{n: number; at: number; text: string; k: number}> = ({n, at, text, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: F(0.7)});
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 28 * k,
        opacity: p,
        transform: `translateY(${(1 - p) * 26 * k}px)`,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 28 * k,
          color: C.yellowDeep,
          lineHeight: `${58 * k}px`,
          flex: '0 0 auto',
          width: 56 * k,
        }}
      >
        {`0${n}`}
      </span>
      <span
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 46 * k,
          color: C.cream,
          lineHeight: `${58 * k}px`,
        }}
      >
        {text}
      </span>
    </div>
  );
};

/* ---------- Rozpoznání: 3 signály, které lidé znají ze svého života ---------- */
const Signals: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const close = spring({frame: frame - F(4.85), fps, config: {damping: 200}, durationInFrames: F(1.0)});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 42%, rgba(255,228,92,0.06), transparent 58%)'}}
      />
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', paddingBottom: 120 * k}}>
        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 22 * k}}>
          // možná to znáte
        </div>
        <HeadWords words={['Možná', 'to', 'znáte.']} startAt={F(0.1)} k={k} size={96} dot />

        <div style={{display: 'flex', flexDirection: 'column', gap: 34 * k, marginTop: 52 * k}}>
          <Signal n={1} at={F(0.55)} k={k} text="Cedule a ceny čtete až zblízka." />
          <Signal n={2} at={F(1.95)} k={k} text="Telefon si při čtení oddalujete." />
          <Signal n={3} at={F(3.35)} k={k} text="Po dni u počítače oči pálí." />
        </div>

        <div
          style={{
            marginTop: 52 * k,
            maxWidth: 860 * k,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 38 * k,
            lineHeight: 1.35,
            color: C.dim,
            opacity: close,
            transform: `translateY(${(1 - close) * 18 * k}px)`,
          }}
        >
          Není to diagnóza — jen dobrý důvod nechat si zrak změřit.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Cena: doslovná formulace nabídky, nesmí se přeformulovat ---------- */
const Price: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const note = spring({frame: frame - F(1.0), fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const disc = spring({frame: frame - F(1.35), fps, config: {damping: 200}, durationInFrames: F(0.9)});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 46%, rgba(255,228,92,0.09), transparent 58%)'}}
      />
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', paddingBottom: 120 * k}}>
        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 24 * k}}>
          // kolik to stojí
        </div>
        {/* Věta je rozdělená na dva bloky jen kvůli zalomení — text zůstává doslovný. */}
        <HeadWords words={['Při', 'pořízení', 'kompletních']} startAt={F(0.1)} k={k} size={62} />
        <HeadWords words={['dioptrických', 'brýlí', 'je']} startAt={F(0.28)} k={k} size={62} />
        <HeadWords words={['měření', 'zraku']} startAt={F(0.46)} k={k} size={62} />
        <div style={{marginTop: 16 * k}}>
          <HeadWords words={['zdarma.']} startAt={F(0.9)} k={k} size={116} color={C.yellow} />
        </div>
        <div
          style={{
            marginTop: 40 * k,
            maxWidth: 860 * k,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 36 * k,
            lineHeight: 1.35,
            color: C.dim,
            opacity: note,
            transform: `translateY(${(1 - note) * 16 * k}px)`,
          }}
        >
          V ostatních případech se cena odvíjí od rozsahu vyšetření.
        </div>
        <div
          style={{
            marginTop: 30 * k,
            fontFamily: MONO,
            fontSize: 23 * k,
            lineHeight: 1.5,
            color: 'rgba(244,241,234,0.48)',
            opacity: disc,
          }}
        >
          // měření zraku v optice nenahrazuje lékařské vyšetření očí
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- CTA / brandová karta (stejná stavba jako u ostatních Reels) ---------- */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const sp = (delay: number) =>
    spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: F(1.0)});

  const logo = sp(F(0.1));
  const claim = sp(F(0.45));
  const phone = sp(F(0.8));
  const addr = sp(F(1.1));
  const cta = sp(F(1.45));
  const note = sp(F(1.9));
  const pulse = 1 + Math.sin(frame / 14) * 0.012;
  const shine = interpolate(frame % F(2.6), [0, F(1.0)], [-30, 130], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 44%, rgba(255,228,92,0.08), transparent 60%)'}}
      />
      <AbsoluteFill
        style={{justifyContent: 'center', alignItems: 'center', gap: 26 * k, padding: `0 ${90 * k}px`}}
      >
        <div style={{width: 340 * k, opacity: logo, transform: `scale(${logo})`}}>
          <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 82 * k,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.06,
            color: C.cream,
            opacity: claim,
            transform: `translateY(${(1 - claim) * 22 * k}px)`,
          }}
        >
          Objednejte se
          <br />
          <span style={{color: C.yellow}}>na měření.</span>
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 54 * k,
            letterSpacing: '0.01em',
            color: C.cream,
            opacity: phone,
            transform: `translateY(${(1 - phone) * 16 * k}px)`,
          }}
        >
          +420 702 194 246
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 30 * k,
            color: C.dim,
            textAlign: 'center',
            lineHeight: 1.55,
            opacity: addr,
            transform: `translateY(${(1 - addr) * 14 * k}px)`,
          }}
        >
          Optik Dvořák · Americká 325/23, Plzeň
          <br />
          Po–Čt 8:30–17:00 · Pá 8:30–16:00
          <br />
          rodinná oční optika od roku 1991
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
          Zavolejte nám 👓
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
            fontSize: 22 * k,
            color: 'rgba(244,241,234,0.42)',
            textAlign: 'center',
            lineHeight: 1.5,
            opacity: note,
          }}
        >
          // objednání předem doporučujeme,
          <br />
          // přijít můžete i bez objednání
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Reel ---------- */
export const ReelMereni: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const vol = interpolate(
    frame,
    [0, F(1.2), MERENI_DURATION - F(2.2), MERENI_DURATION],
    [0, 0.9, 0.9, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  /* hlavička zhasne nad brandovou kartou, kde už je logo */
  const hdr = interpolate(frame, [0, F(0.5), T_CTA, T_CTA + F(0.35)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const trans = () => (
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANS})} />
  );

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-mereni.wav')} volume={vol} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D_HOOK}>
          <Hook />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_SIG}>
          <Signals />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_SHOT}>
          <PhotoShot
            src="mereni/recepce.jpg"
            dir="in"
            mono="// moderní přístroje, bez čekání u lékaře"
            line1="Zrak změříme"
            line2="přímo na prodejně."
          />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_SHOT}>
          <PhotoShot
            src="mereni/stul.jpg"
            dir="out"
            mono="// nespěcháme a neodbýváme to"
            line1="Uděláme si čas —"
            line2="30 až 45 minut."
          />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_SHOT}>
          <PanoShot
            mono="// 4,6 z 26 recenzí na Googlu, stav 8/2026"
            line1="Rodinná oční optika"
            line2="od roku 1991."
            size={76}
          />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_PRICE}>
          <Price />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_CTA}>
          <Cta />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* hlavička */}
      <div
        style={{
          position: 'absolute',
          top: 72 * k,
          left: 90 * k,
          right: 90 * k,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO,
          fontSize: 24 * k,
          color: 'rgba(244,241,234,0.5)',
          opacity: hdr,
          pointerEvents: 'none',
        }}
      >
        <span>Optik Dvořák</span>
        <span>// Plzeň</span>
      </div>

      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};
