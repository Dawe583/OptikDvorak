import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {LogoMark} from './LogoMark';

/* REEL „ZPÁTKY DO ŠKOLY" — druhý pilíř letní kampaně (viz docs/LETNI-AKCE-2026.md).
   Celá reklama je vygenerovaná: čtecí tabule, typografie, ikony, zrno.
   Žádná fotka, žádný záběr z prodejny, žádné dítě ze stocku.

   Mechanika: reel začne jako čtecí tabule a diváka vtáhne tím, že po něm něco
   chce („přečtete poslední řádek?"). Poslední, nejmenší řádek se zaostří a je
   v něm pointa. Pak se světlo zhasne a jde brandová část.

   Obsah stojí na tom, co je doložitelné: krátkozrakost se u dětí nejčastěji
   odhalí až po nástupu do školy, kdy dítě nevidí na tabuli, a projevuje se
   mhouřením do dálky, sezením blízko obrazovky a bolestmi hlavy. Žádná čísla,
   žádné sliby o výsledku léčby — jen pozvání na kontrolu.
   Formulace o MiYOSMART je shodná s webem (poradíme, zda jsou vhodná). */

const {fontFamily: DISPLAY} = loadBricolage('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});
const {fontFamily: BODY} = loadInter('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext']});
const {fontFamily: MONO} = loadMono('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  papir: '#F4F1EA',
  inkoust: '#14120E',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  dim: 'rgba(244,241,234,0.5)',
};

export const FPS = 60;
const F = (s: number) => Math.round(s * FPS);

/* Délky scén a prolínaček */
const S_TABULE = F(6.6);
const S_POZNANI = F(4.0);
const S_ZNAKY = F(4.4);
const S_NABIDKA = F(3.4);
const S_OUTRO = F(4.0);
const T_A = F(0.5); // tabule → poznání (tmavá karta najede zdola = zhasnutí)
const T_B = F(0.4);
const T_C = F(0.4);
const T_D = F(0.6);

export const SKOLA_DURATION =
  S_TABULE + S_POZNANI + S_ZNAKY + S_NABIDKA + S_OUTRO - (T_A + T_B + T_C + T_D); // 1230 = 20,5 s

/* Nástupy scén v sekundách — musí sedět s scripts/make-audio-skola.mjs */
export const CUES = {
  radky: [0.35, 0.95, 1.55, 2.15], // řádky tabule naskakují
  zaostreni: 3.6, // poslední řádek se zaostří = pointa
  zvyraznovac: 4.2, // přejede žlutý zvýrazňovač
  poznani: 6.1,
  znaky: 9.7,
  nabidka: 13.7,
  outro: 16.5,
};

const useScale = () => useVideoConfig().width / 1080;

/* ---------- Zrno ---------- */
const GRAIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.5"/></svg>'
  );
const Grain: React.FC<{sila?: number; rezim?: 'overlay' | 'multiply'}> = ({sila = 0.05, rezim = 'overlay'}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN}")`,
        backgroundPosition: `${(frame * 41) % 200}px ${(frame * 67) % 200}px`,
        opacity: sila,
        mixBlendMode: rezim,
        pointerEvents: 'none',
      }}
    />
  );
};

/* ---------- 1) ČTECÍ TABULE ----------
   Řádky naskakují jako při zkoušce zraku, poslední je rozostřený.
   V 3,6 s se zaostří a podtrhne se žlutým zvýrazňovačem. */
const Tabule: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const radky: {text: string; velikost: number; tracking: string}[] = [
    {text: 'ŠKOLA', velikost: 210, tracking: '0.14em'},
    {text: 'ZAČÍNÁ', velikost: 130, tracking: '0.16em'},
    {text: 'ZA MĚSÍC', velikost: 82, tracking: '0.18em'},
    {text: 'VIDÍ VAŠE DÍTĚ NA TABULI?', velikost: 44, tracking: '0.05em'},
  ];

  const nastup = (i: number) =>
    spring({frame: frame - F(0.35) - i * F(0.6), fps, config: {damping: 200}, durationInFrames: F(0.8)});

  /* poslední řádek: z rozostření do ostra */
  const ostrost = interpolate(frame, [F(3.6), F(4.5)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  /* žlutý zvýrazňovač se přetáhne přes poslední řádek */
  const zvyraznovac = interpolate(frame, [F(4.2), F(5.1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  /* výzva dole zmizí ve chvíli, kdy má mluvit poslední řádek */
  const vyzva = interpolate(frame, [F(1.0), F(1.6), F(3.4), F(3.9)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.papir}}>
      {/* jemné papírové provedení: teplý střed, tmavší okraje */}
      <AbsoluteFill
        style={{background: 'radial-gradient(120% 78% at 50% 42%, rgba(255,255,255,0.55) 0%, transparent 62%)'}}
      />
      <AbsoluteFill
        style={{background: 'radial-gradient(110% 76% at 50% 46%, transparent 52%, rgba(20,18,14,0.13) 100%)'}}
      />

      {/* hlavička tabule */}
      <div
        style={{
          position: 'absolute',
          top: 150 * k,
          left: 90 * k,
          right: 90 * k,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO,
          fontSize: 25 * k,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(20,18,14,0.55)',
        }}
      >
        <span>Optik Dvořák</span>
        <span>Zkouška</span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 196 * k,
          left: 90 * k,
          right: 90 * k,
          height: 2 * k,
          background: 'rgba(20,18,14,0.75)',
        }}
      />

      {/* řádky tabule */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: `0 ${80 * k}px`}}>
        {radky.map((r, i) => {
          const s = nastup(i);
          const posledni = i === radky.length - 1;
          return (
            <div
              key={r.text}
              style={{
                position: 'relative',
                marginBottom: 40 * k,
                opacity: s,
                transform: `scale(${0.94 + s * 0.06})`,
              }}
            >
              {/* zvýrazňovač pod posledním řádkem */}
              {posledni ? (
                <div
                  style={{
                    position: 'absolute',
                    left: -18 * k,
                    right: -18 * k,
                    top: '18%',
                    bottom: '8%',
                    background: C.yellow,
                    transformOrigin: 'left center',
                    transform: `scaleX(${zvyraznovac})`,
                    borderRadius: 6 * k,
                  }}
                />
              ) : null}
              <div
                style={{
                  position: 'relative',
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: r.velikost * k,
                  letterSpacing: r.tracking,
                  lineHeight: 1.05,
                  color: C.inkoust,
                  whiteSpace: 'nowrap',
                  filter: posledni ? `blur(${ostrost * 13 * k}px)` : undefined,
                }}
              >
                {r.text}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* výzva pro diváka */}
      <div
        style={{
          position: 'absolute',
          left: 90 * k,
          right: 90 * k,
          bottom: 250 * k,
          textAlign: 'center',
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 40 * k,
          color: 'rgba(20,18,14,0.7)',
          opacity: vyzva,
        }}
      >
        Přečtete poslední řádek?
      </div>

      <Grain sila={0.07} rezim="multiply" />
    </AbsoluteFill>
  );
};

/* ---------- Tmavý podklad pro brandovou část ---------- */
const Tma: React.FC = () => {
  const frame = useCurrentFrame();
  const dech = 1 + Math.sin(frame / 80) * 0.05;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(110% 60% at 50% 104%, rgba(245,197,24,0.20) 0%, transparent 62%)',
          transform: `scale(${dech})`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- 2) POZNÁNÍ: děti to samy nepoznají ---------- */
const Poznani: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const radek = (i: number) => {
    const s = spring({frame: frame - F(0.3) - i * F(0.16), fps, config: {damping: 200}, durationInFrames: F(1.0)});
    return {opacity: s, transform: `translateY(${(1 - s) * 28 * k}px)`};
  };
  const podtext = spring({frame: frame - F(1.5), fps, config: {damping: 200}, durationInFrames: F(1.0)});

  return (
    <AbsoluteFill>
      <Tma />
      <AbsoluteFill style={{justifyContent: 'center', padding: `0 ${90 * k}px`}}>
        <div style={{fontFamily: MONO, fontSize: 27 * k, color: C.yellowDeep, marginBottom: 26 * k}}>
          // proč to rodiče prošvihnou
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 104 * k,
            lineHeight: 1.04,
            letterSpacing: '-0.035em',
            color: C.cream,
          }}
        >
          <div style={radek(0)}>Dítě vám neřekne,</div>
          <div style={{...radek(1), color: C.yellow}}>že špatně vidí.</div>
        </div>
        <div
          style={{
            marginTop: 34 * k,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 38 * k,
            lineHeight: 1.45,
            color: C.dim,
            opacity: podtext,
            transform: `translateY(${(1 - podtext) * 18 * k}px)`,
          }}
        >
          Myslí si, že tak to vidí každý.
          <br />
          Krátkozrakost se u dětí nejčastěji najde
          <br />
          až po nástupu do školy.
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- Ikony ke třem signálům (monolinka, nic staženého) ---------- */
const IkonaObrazovka: React.FC = () => (
  <svg viewBox="0 0 100 100" style={{width: '100%'}}>
    <rect x="34" y="20" width="60" height="44" rx="6" fill="none" stroke="#FFE45C" strokeWidth="5" />
    <path d="M64 64 v10 M50 74 h28" stroke="#FFE45C" strokeWidth="5" strokeLinecap="round" />
    <circle cx="12" cy="40" r="10" fill="none" stroke="#F4F1EA" strokeWidth="5" />
    <path d="M12 54 v20" stroke="#F4F1EA" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const IkonaMhoureni: React.FC = () => (
  <svg viewBox="0 0 100 100" style={{width: '100%'}}>
    <path d="M8 50 q42 -30 84 0 q-42 30 -84 0 Z" fill="none" stroke="#FFE45C" strokeWidth="5" />
    <circle cx="50" cy="50" r="11" fill="none" stroke="#FFE45C" strokeWidth="5" />
    <path d="M22 30 l8 8 M78 30 l-8 8" stroke="#F4F1EA" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const IkonaHlava: React.FC = () => (
  <svg viewBox="0 0 100 100" style={{width: '100%'}}>
    <circle cx="50" cy="56" r="24" fill="none" stroke="#FFE45C" strokeWidth="5" />
    <path
      d="M50 20 v-8 M26 30 l-6 -6 M74 30 l6 -6 M14 54 h-8 M86 54 h8"
      stroke="#F4F1EA"
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

/* ---------- 3) TŘI SIGNÁLY ---------- */
const Znaky: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const polozky: {ikona: React.ReactNode; text: string}[] = [
    {ikona: <IkonaObrazovka />, text: 'sedá si blízko k obrazovce'},
    {ikona: <IkonaMhoureni />, text: 'mhouří oči do dálky'},
    {ikona: <IkonaHlava />, text: 'po škole ho bolí hlava'},
  ];

  return (
    <AbsoluteFill>
      <Tma />
      <AbsoluteFill style={{justifyContent: 'center', padding: `0 ${90 * k}px`}}>
        <div style={{fontFamily: MONO, fontSize: 27 * k, color: C.yellowDeep, marginBottom: 54 * k}}>
          // čeho si všimnout doma
        </div>
        {polozky.map((p, i) => {
          const s = spring({
            frame: frame - F(0.4) - i * F(0.6),
            fps,
            config: {damping: 200},
            durationInFrames: F(1.0),
          });
          return (
            <div
              key={p.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 34 * k,
                marginBottom: 48 * k,
                opacity: s,
                transform: `translateX(${(1 - s) * -46 * k}px)`,
              }}
            >
              <div style={{flex: '0 0 auto', width: 96 * k}}>{p.ikona}</div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 66 * k,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: C.cream,
                }}
              >
                {p.text}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 4) NABÍDKA ---------- */
const Nabidka: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const sp = (delay: number) =>
    spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: F(1.0)});
  const nadpis = sp(F(0.25));
  const stitek = sp(F(1.0));
  const pozn = sp(F(1.5));

  return (
    <AbsoluteFill>
      <Tma />
      <AbsoluteFill style={{justifyContent: 'center', padding: `0 ${90 * k}px`}}>
        <div style={{fontFamily: MONO, fontSize: 27 * k, color: C.yellowDeep, marginBottom: 26 * k}}>
          // předškoláci i školáci
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 104 * k,
            lineHeight: 1.04,
            letterSpacing: '-0.035em',
            color: C.cream,
            opacity: nadpis,
            transform: `translateY(${(1 - nadpis) * 26 * k}px)`,
          }}
        >
          Přijďte na kontrolu
          <br />
          <span style={{color: C.yellow}}>před školou.</span>
        </div>

        <div
          style={{
            marginTop: 44 * k,
            alignSelf: 'flex-start',
            background: C.yellow,
            color: C.ink900,
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 34 * k,
            padding: `${18 * k}px ${34 * k}px`,
            borderRadius: 999,
            opacity: stitek,
            transform: `scale(${0.9 + stitek * 0.1})`,
            boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.3)`,
          }}
        >
          Poradenství MiYOSMART zdarma
        </div>

        <div
          style={{
            marginTop: 30 * k,
            fontFamily: BODY,
            fontWeight: 500,
            fontSize: 32 * k,
            lineHeight: 1.45,
            color: C.dim,
            opacity: pozn,
          }}
        >
          Poradíme, jestli jsou skla MiYOSMART pro vaše
          <br />
          dítě vhodná ke zpomalení postupu krátkozrakosti.
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 5) OUTRO ---------- */
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const sp = (delay: number) =>
    spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: F(1.1)});
  const logo = sp(F(0.1));
  const claim = sp(F(0.45));
  const addr = sp(F(0.85));
  const cta = sp(F(1.25));
  const puls = 1 + Math.sin(frame / 14) * 0.012;
  const shine = interpolate(frame % F(2.6), [0, F(1.0)], [-30, 130], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <Tma />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30 * k, padding: 90 * k}}>
        <div style={{width: 320 * k, opacity: logo, transform: `scale(${logo})`}}>
          <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 84 * k,
            letterSpacing: '-0.035em',
            textAlign: 'center',
            lineHeight: 1.06,
            color: C.cream,
            opacity: claim,
            transform: `translateY(${(1 - claim) * 22 * k}px)`,
          }}
        >
          Vidět líp
          <br />
          <span style={{color: C.yellow}}>než včera.</span>
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 32 * k,
            color: C.dim,
            textAlign: 'center',
            lineHeight: 1.5,
            opacity: addr,
            transform: `translateY(${(1 - addr) * 18 * k}px)`,
          }}
        >
          Optik Dvořák · Americká 325/23, Plzeň
          <br />
          rodinná optika od 1991
        </div>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginTop: 14 * k,
            background: C.yellow,
            color: C.ink900,
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 30 * k,
            padding: `${20 * k}px ${40 * k}px`,
            borderRadius: 999,
            opacity: cta,
            transform: `scale(${cta * puls})`,
            boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
          }}
        >
          Objednejte dítě na měření zraku
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
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- Reel ---------- */
export const ReelSkola: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const vol = interpolate(frame, [0, F(1.0), SKOLA_DURATION - F(2.4), SKOLA_DURATION], [0, 0.85, 0.85, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const prolinacka = (dur: number) => (
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: dur})} />
  );

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-skola.wav')} volume={vol} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S_TABULE}>
          <Tabule />
        </TransitionSeries.Sequence>

        {/* tmavá karta najede zdola = zhasnutí světla nad tabulí */}
        <TransitionSeries.Transition
          presentation={slide({direction: 'from-bottom'})}
          timing={linearTiming({durationInFrames: T_A})}
        />

        <TransitionSeries.Sequence durationInFrames={S_POZNANI}>
          <Poznani />
        </TransitionSeries.Sequence>
        {prolinacka(T_B)}

        <TransitionSeries.Sequence durationInFrames={S_ZNAKY}>
          <Znaky />
        </TransitionSeries.Sequence>
        {prolinacka(T_C)}

        <TransitionSeries.Sequence durationInFrames={S_NABIDKA}>
          <Nabidka />
        </TransitionSeries.Sequence>
        {prolinacka(T_D)}

        <TransitionSeries.Sequence durationInFrames={S_OUTRO}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* hlavička jen v tmavé části — na tabuli má vlastní */}
      {frame > S_TABULE - T_A ? (
        <div
          style={{
            position: 'absolute',
            top: 60 * k,
            left: 90 * k,
            right: 90 * k,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: MONO,
            fontSize: 24 * k,
            color: 'rgba(244,241,234,0.45)',
            pointerEvents: 'none',
          }}
        >
          <span>Optik Dvořák</span>
          <span>// zpátky do školy</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
