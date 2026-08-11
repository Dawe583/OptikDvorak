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

/* REEL — „Nekupujte nové brýle" (servis a opravy na počkání, 22,6 s).

   Proč zrovna tohle téma: ostatní Reels už zvou na měření zraku a na výběr
   nových brýlí. Tenhle jde opačně — optika říká „nekupujte", a právě proto
   se u něj člověk zastaví. Přivádí lidi fyzicky na prodejnu (přinesou brýle),
   je věčně platný (nezastará jako sezónní akce) a dobře se posílá do zpráv
   někomu, kdo chodí s křivými brýlemi.

   Časová osa (absolutní sekundy, sedí s scripts/make-audio-servis.mjs):
    0,0–3,2   HÁČEK     „Nekupujte nové brýle." + křivé brýle, které se viklají
    2,8–6,0   PROBLÉM   tři věci, se kterými lidé chodí: šroubek, obruba, silon
    5,6–9,4   OPRAVA    brýle se srovnají — šroubek se dotáhne, stranička zaklapne
    9,0–12,4  FOTO      reálný záběr opravy: napínání silonu do poloobruby
   12,0–15,8  SEZNAM    co všechno opravíme (01–04) + poctivá poznámka
   15,4–18,8  PANORAMA  „Objednávat se nemusíte." — prodejna, pomalá jízda
   18,4–22,6  CTA       logo, telefon, adresa, otevírací doba

   Obsah: jen ověřená fakta ze servis.html. Věty o opravách jsou převzaté
   doslova („Prasklý silon u poloobrub napneme znovu, sklo bude zase pevně
   držet.", „Objednávat se nemusíte, stavte se s brýlemi kdykoli v otevírací
   době."). Video záměrně NEslibuje, že je servis zdarma ani že spravíme
   úplně všechno — obojí web taky netvrdí. */

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

const D_HOOK = F(3.2);
const D_PROB = F(3.2);
const D_FIX = F(3.8);
const D_PHOTO = F(3.4);
const D_LIST = F(3.8);
const D_PANO = F(3.4);
const D_CTA = F(4.2);
const TRANS = F(0.4);

export const SERVIS_DURATION =
  D_HOOK + D_PROB + D_FIX + D_PHOTO + D_LIST + D_PANO + D_CTA - TRANS * 6; // 1356 = 22,6 s

/* Absolutní začátek CTA — jen kvůli zhasnutí hlavičky nad brandovou kartou. */
const T_CTA = SERVIS_DURATION - D_CTA; // 1104 = 18,4 s

/* Fotky se do pásu vkládají jako výřez (object-fit: cover), takže se nic
   needituje mimo Remotion — pás je 1080 × 1215 návrhových jednotek. */
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

/* ---------- Kreslené brýle: křivé → srovnané ----------
   Jediný „hraný" prvek celého Reelu. Ukazuje přesně to, o čem video mluví:
   povolený šroubek u kloubu, svěšená stranička a nakřivo posazená obruba.
   V okamžiku opravy se šroubek dotáhne (otočí se drážka), stranička zaklapne
   nahoru a obruba se srovná do roviny. Kreslené schválně — je to ilustrace,
   ne fotka konkrétních brýlí, takže nic nepředstírá.

   bend  … svěšení pravé straničky ve stupních (0 = zaklapnutá)
   tilt  … naklonění celé obruby ve stupních (0 = v rovině)
   screw … otočení drážky šroubku ve stupních
   glow  … 0–1, žluté „cvak" v okamžiku dotažení
   tool  … 0–1, viditelnost šroubováku u kloubu                           */
export const Glasses: React.FC<{
  bend: number;
  tilt: number;
  screw: number;
  glow: number;
  k: number;
  tool?: number;
}> = ({bend, tilt, screw, glow, k, tool = 0}) => {
  const SW = 13; // tloušťka čar v jednotkách viewBoxu
  /* rozbité brýle jsou o něco matnější — spravené se rozsvítí */
  const fixed = 1 - Math.min(1, Math.abs(bend) / 40);
  const ink = `rgba(244,241,234,${0.72 + 0.28 * fixed})`;
  return (
    <svg viewBox="0 0 900 400" style={{width: 780 * k, overflow: 'visible'}}>
      <defs>
        <filter id="servis-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={2 + 7 * glow} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`rotate(${tilt} 450 200)`}>
        {/* levá stranička — ta je v pořádku, drží pod stálým úhlem */}
        <path d="M150 168 L34 128" stroke={ink} strokeWidth={SW} strokeLinecap="round" fill="none" />

        {/* obě čočky + most */}
        <g filter="url(#servis-glow)">
          <rect x="150" y="118" width="245" height="170" rx="74" stroke={ink} strokeWidth={SW} fill="none" />
          <rect x="505" y="118" width="245" height="170" rx="74" stroke={ink} strokeWidth={SW} fill="none" />
          <path
            d="M395 162 q55 -34 110 0"
            stroke={C.yellow}
            strokeWidth={SW}
            strokeLinecap="round"
            fill="none"
            style={{filter: `drop-shadow(0 0 ${6 + 22 * glow}px ${C.yellow})`}}
          />
        </g>

        {/* pravá stranička — otáčí se kolem kloubu (750, 168).
            V klidu míří 19° nahoru, takže teprve od bendu ~25° je vidět,
            že je svěšená. Proto se rozbitý stav kreslí kolem 46°. */}
        <g transform={`rotate(${bend} 750 168)`}>
          <path d="M750 168 L866 128" stroke={ink} strokeWidth={SW} strokeLinecap="round" fill="none" />
        </g>

        {/* šroubek v kloubu — jádro celé scény */}
        <g transform={`translate(750 168)`}>
          <circle r="21" fill={C.ink900} stroke={C.yellow} strokeWidth="6" opacity={0.55 + 0.45 * glow} />
          <g transform={`rotate(${screw})`}>
            <path
              d="M-11 0 L11 0"
              stroke={C.yellow}
              strokeWidth="6"
              strokeLinecap="round"
              style={{filter: `drop-shadow(0 0 ${4 + 16 * glow}px ${C.yellow})`}}
            />
          </g>
        </g>

        {/* šroubovák — přijede ke kloubu, když se utahuje */}
        {tool > 0.01 && (
          <g
            opacity={tool}
            transform={`translate(${(1 - tool) * 90} ${(1 - tool) * -90}) rotate(${
              Math.sin(screw / 26) * 3
            } 762 152)`}
          >
            <path d="M770 146 L884 32" stroke={ink} strokeWidth="11" strokeLinecap="round" fill="none" />
            <path d="M884 32 L972 -56" stroke={C.yellowDeep} strokeWidth="30" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* záblesk v okamžiku dotažení */}
        <circle cx="750" cy="168" r={30 + 120 * glow} fill="none" stroke={C.yellow} strokeWidth={3} opacity={glow * 0.7} />
      </g>
    </svg>
  );
};

/* ---------- Háček: optika, která říká „nekupujte" ---------- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const sub = spring({frame: frame - F(1.15), fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const gl = spring({frame: frame - F(0.55), fps, config: {damping: 200}, durationInFrames: F(1.0)});

  /* brýle se viklají — povolený šroubek má být vidět, ne jen slyšet */
  const wob = Math.sin(frame / 9) * 2.4 + Math.sin(frame / 3.7) * 0.8;

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 38%, rgba(255,228,92,0.085), transparent 58%)'}}
      />
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', paddingBottom: 150 * k}}>
        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 24 * k}}>
          // zvláštní rada z optiky
        </div>
        <HeadWords words={['Nekupujte']} startAt={F(0.1)} k={k} size={112} />
        <HeadWords words={['nové', 'brýle.']} startAt={F(0.28)} k={k} size={112} dot />
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 44 * k,
            color: C.dim,
            marginTop: 34 * k,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 16 * k}px)`,
          }}
        >
          Aspoň ne kvůli povolenému šroubku.
        </div>

        <div style={{marginTop: 84 * k, opacity: gl, transform: `translateY(${(1 - gl) * 26 * k}px)`}}>
          <Glasses bend={46 + wob * 1.4} tilt={-8 + wob * 0.6} screw={-18} glow={0} k={k} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Jedna věc, se kterou lidé přijdou ---------- */
const Fault: React.FC<{at: number; text: string; k: number; dot?: boolean}> = ({at, text, k, dot = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: F(0.55)});
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 74 * k,
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        color: C.cream,
        opacity: p,
        transform: `translateX(${(1 - p) * -30 * k}px)`,
      }}
    >
      {text}
      {dot && (
        <span
          style={{
            display: 'inline-block',
            width: 15 * k,
            height: 15 * k,
            background: C.yellow,
            marginLeft: 10 * k,
            marginBottom: 8 * k,
            boxShadow: `0 0 ${18 * k}px ${C.yellow}`,
          }}
        />
      )}
    </div>
  );
};

/* ---------- Problém: tři věci, se kterými lidé chodí nejčastěji ---------- */
const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const close = spring({frame: frame - F(2.05), fps, config: {damping: 200}, durationInFrames: F(0.9)});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 42%, rgba(255,228,92,0.06), transparent 58%)'}}
      />
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', paddingBottom: 120 * k}}>
        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 34 * k}}>
          // s čím k nám lidé chodí
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 30 * k}}>
          <Fault at={F(0.1)} k={k} text="Povolený šroubek." />
          <Fault at={F(0.72)} k={k} text="Ohnutá obruba." />
          <Fault at={F(1.34)} k={k} text="Prasklý silon." dot />
        </div>

        <div
          style={{
            marginTop: 56 * k,
            maxWidth: 880 * k,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 40 * k,
            lineHeight: 1.35,
            color: C.dim,
            opacity: close,
            transform: `translateY(${(1 - close) * 18 * k}px)`,
          }}
        >
          Kvůli žádné z nich nemusíte kupovat nové.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Oprava: šroubek se dotáhne a brýle se srovnají ---------- */
const Fix: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* Okamžik dotažení. Před ním se brýle ještě viklají, po něm už drží. */
  const SNAP = F(1.25);

  const wob = Math.sin(frame / 9) * 2.4 + Math.sin(frame / 3.7) * 0.8;
  const fix = spring({frame: frame - SNAP, fps, config: {damping: 11, stiffness: 170}});
  const wobble = Math.max(0, 1 - fix * 1.6);

  /* šroubek se točí ještě před zaklapnutím — nejdřív práce, pak výsledek */
  const screw = interpolate(frame, [F(0.35), SNAP], [-18, 702], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const glow = interpolate(frame, [SNAP - 2, SNAP + 4, SNAP + F(0.75)], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* šroubovák je u kloubu jen po dobu práce — pak uhne z obrazu */
  const tool = interpolate(frame, [F(0.12), F(0.5), SNAP + F(0.1), SNAP + F(0.45)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bend = 46 * (1 - fix) + wob * 1.4 * wobble;
  const tilt = -8 * (1 - fix) + wob * 0.6 * wobble;

  const cap = spring({frame: frame - SNAP - F(0.2), fps, config: {damping: 200}, durationInFrames: F(0.8)});
  const note = spring({frame: frame - SNAP - F(0.75), fps, config: {damping: 200}, durationInFrames: F(0.9)});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(255,228,92,${0.06 + 0.14 * glow}), transparent 60%)`,
        }}
      />
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', paddingBottom: 90 * k}}>
        <div style={{alignSelf: 'center', marginBottom: 96 * k}}>
          <Glasses bend={bend} tilt={tilt} screw={screw} glow={glow} tool={tool} k={k} />
        </div>

        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 22 * k, opacity: cap}}>
          // dotáhnout, napnout, seřídit
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 92 * k,
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            color: C.cream,
            opacity: cap,
            transform: `translateY(${(1 - cap) * 22 * k}px)`,
          }}
        >
          Běžné věci zvládneme
          <br />
          <span style={{color: C.yellow}}>obvykle na počkání.</span>
        </div>
        <div
          style={{
            marginTop: 34 * k,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 38 * k,
            color: C.dim,
            opacity: note,
            transform: `translateY(${(1 - note) * 14 * k}px)`,
          }}
        >
          Přímo na prodejně na Americké.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
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

/* ---------- Fotka v horním pásu formátu + Ken Burns, titulek pod ní ----------
   Výřez řeší object-fit/object-position přímo v prohlížeči, takže se zdrojový
   soubor nemusí nikde ořezávat ani přeukládat. */
const PhotoShot: React.FC<{
  src: string;
  focus: string;
  dir: 'in' | 'out';
  mono: string;
  line1: string;
  line2: string;
  size?: number;
}> = ({src, focus, dir, mono, line1, line2, size}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const k = useScale();

  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const scale = dir === 'in' ? 1 + p * 0.07 : 1.07 - p * 0.07;
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
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: PHOTO_H * k, overflow: 'hidden'}}>
        <Img
          src={url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: focus,
            display: 'block',
            filter: GRADE,
            transform: `scale(${scale})`,
          }}
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

  /* Panorama 8456 × 2160 se zobrazuje ve výšce pásu (2430 px při 4K),
     tedy 1,125× — prakticky se neupscaluje. Jedeme od vchodu doprava
     přes zaoblenou stěnu vitrín, aby bylo vidět, kam se má člověk stavit. */
  const s = (PHOTO_H * k) / 2160;
  const imgW = 8456 * s;
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const x = -(120 * s + (1780 - 120) * s * p);
  const url = staticFile('optika/pano.jpg');

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

/* ---------- Jedna položka seznamu oprav ---------- */
const Item: React.FC<{n: number; at: number; text: string; k: number}> = ({n, at, text, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: F(0.6)});
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 28 * k,
        opacity: p,
        transform: `translateY(${(1 - p) * 24 * k}px)`,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 28 * k,
          color: C.yellowDeep,
          lineHeight: `${56 * k}px`,
          flex: '0 0 auto',
          width: 56 * k,
        }}
      >
        {`0${n}`}
      </span>
      <span style={{fontFamily: BODY, fontWeight: 600, fontSize: 45 * k, color: C.cream, lineHeight: `${56 * k}px`}}>
        {text}
      </span>
    </div>
  );
};

/* ---------- Seznam: co všechno opravíme (doslova ze servis.html) ---------- */
const List: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const honest = spring({frame: frame - F(2.55), fps, config: {damping: 200}, durationInFrames: F(0.9)});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 44%, rgba(255,228,92,0.07), transparent 58%)'}}
      />
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', paddingBottom: 120 * k}}>
        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 22 * k}}>
          // od šroubku po seřízení
        </div>
        <HeadWords words={['Co', 'všechno']} startAt={F(0.05)} k={k} size={92} />
        <HeadWords words={['opravíme.']} startAt={F(0.2)} k={k} size={92} dot />

        <div style={{display: 'flex', flexDirection: 'column', gap: 26 * k, marginTop: 52 * k}}>
          <Item n={1} at={F(0.5)} k={k} text="Výměna šroubků a sedýlek" />
          <Item n={2} at={F(1.0)} k={k} text="Silon do vázaných obrub" />
          <Item n={3} at={F(1.5)} k={k} text="Čištění ultrazvukem" />
          <Item n={4} at={F(2.0)} k={k} text="Seřízení přesně na obličej" />
        </div>

        <div
          style={{
            marginTop: 52 * k,
            fontFamily: MONO,
            fontSize: 24 * k,
            lineHeight: 1.5,
            color: 'rgba(244,241,234,0.48)',
            opacity: honest,
            transform: `translateY(${(1 - honest) * 14 * k}px)`,
          }}
        >
          // úplně všechno spravit nejde
          <br />
          // když to nepůjde, řekneme vám to rovnou
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
          Přineste brýle,
          <br />
          <span style={{color: C.yellow}}>spravíme je.</span>
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
          Stavte se s brýlemi 👓
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
          // objednávat se nemusíte,
          <br />
          // stavte se kdykoli v otevírací době
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Reel ---------- */
export const ReelServis: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const vol = interpolate(
    frame,
    [0, F(1.2), SERVIS_DURATION - F(2.2), SERVIS_DURATION],
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
      <Audio src={staticFile('music-servis.wav')} volume={vol} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D_HOOK}>
          <Hook />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_PROB}>
          <Problem />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_FIX}>
          <Fix />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_PHOTO}>
          <PhotoShot
            src="servis/oprava.jpg"
            focus="50% 42%"
            dir="in"
            mono="// prasklý silon u poloobrub napneme znovu"
            line1="Sklo bude zase"
            line2="pevně držet."
          />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_LIST}>
          <List />
        </TransitionSeries.Sequence>
        {trans()}
        <TransitionSeries.Sequence durationInFrames={D_PANO}>
          <PanoShot
            mono="// rodinná oční optika na Americké od roku 1991"
            line1="Objednávat se"
            line2="nemusíte."
          />
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
