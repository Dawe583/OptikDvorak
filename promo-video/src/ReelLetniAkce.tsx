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

/* REEL „LETNÍ DVOJKA" — výkonnostní reklama na letní akci.
   Celá je vygenerovaná (typografie, slunce, sluneční brýle, světlo, zrno),
   žádná fotka ani záběr z prodejny — proto ji jde kdykoli přečíslovat
   nebo přepsat, aniž by se musela nafotit nová sada.

   Dramaturgie: bolest (mhouření na slunci) → důvod (dioptrie) →
   nabídka (druhý pár za polovic) → co si pod tím představit →
   platnost (urgence) → značka a CTA.

   Čísla a platnost jdou přes props, takže se dají změnit bez zásahu do
   layoutu:  npx remotion render reel-letni-akce --props='{"sleva":40}'  */

export const {fontFamily: DISPLAY} = loadBricolage('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});
export const {fontFamily: BODY} = loadInter('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext']});
export const {fontFamily: MONO} = loadMono('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

export const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  amber: '#FFA92E', // teplý letní přísvit, jen do záře a gradientů
  dim: 'rgba(244,241,234,0.5)',
};

export const FPS = 60;
const F = (s: number) => Math.round(s * FPS);

/* Délky scén a prolínaček */
const S_HOOK = F(2.8);
const S_PROBLEM = F(2.6);
const S_NABIDKA = F(5.0);
const S_PRO_KOHO = F(3.4);
const S_PLATNOST = F(2.2);
const S_OUTRO = F(4.4);
const T_A = F(0.5);
const T_B = F(0.4);
const T_C = F(0.5);
const T_D = F(0.4);
const T_E = F(0.6);

export const LETNI_AKCE_DURATION =
  S_HOOK + S_PROBLEM + S_NABIDKA + S_PRO_KOHO + S_PLATNOST + S_OUTRO - (T_A + T_B + T_C + T_D + T_E); // 1080 = 18 s

/* Nástupy scén v sekundách — musí sedět s scripts/make-audio-letni-akce.mjs */
export const CUES = {
  problem: 2.3,
  nabidka: 4.5,
  cislo: 5.7, // dopad velkého čísla uvnitř scény s nabídkou
  proKoho: 9.0,
  platnost: 12.0,
  outro: 13.6,
};

export type LetniAkceProps = {
  sleva: number; // sleva na druhý pár v procentech
  platnostOd: string;
  platnostDo: string;
};

export const LETNI_AKCE_DEFAULTS: LetniAkceProps = {
  sleva: 50,
  platnostOd: '1. 8.',
  platnostDo: '30. 9. 2026',
};

const useScale = () => useVideoConfig().width / 1080;

/* ---------- Zrno (stejná textura jako u ostatních Reels) ---------- */
const GRAIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.5"/></svg>'
  );
export const Grain = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN}")`,
        backgroundPosition: `${(frame * 41) % 200}px ${(frame * 67) % 200}px`,
        opacity: 0.05,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

/* ---------- Letní podklad: tmavá scéna + teplá záře, která pomalu dýchá ---------- */
export const Pozadi: React.FC<{zare?: number}> = ({zare = 1}) => {
  const frame = useCurrentFrame();
  const dech = 1 + Math.sin(frame / 70) * 0.06;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 62% at 50% 108%, rgba(255,169,46,${0.42 * zare}) 0%, rgba(245,197,24,${
            0.16 * zare
          }) 34%, transparent 68%)`,
          transform: `scale(${dech})`,
        }}
      />
      <AbsoluteFill
        style={{background: 'radial-gradient(110% 74% at 50% 42%, transparent 46%, rgba(7,7,7,0.6) 100%)'}}
      />
    </AbsoluteFill>
  );
};

/* ---------- Slunce s paprsky (čistě SVG, nic staženého) ---------- */
export const Slunce: React.FC<{y: number; velikost: number; opacity?: number}> = ({y, velikost, opacity = 1}) => {
  const frame = useCurrentFrame();
  const k = useScale();
  const paprsky = Array.from({length: 16}, (_, i) => i);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: y,
        width: velikost * k,
        height: velikost * k,
        transform: 'translate(-50%, -50%)',
        opacity,
      }}
    >
      <svg viewBox="-100 -100 200 200" style={{width: '100%', overflow: 'visible'}}>
        <defs>
          <radialGradient id="slunce-g">
            <stop offset="0%" stopColor="#FFF6C9" />
            <stop offset="55%" stopColor={C.yellow} />
            <stop offset="100%" stopColor={C.amber} />
          </radialGradient>
        </defs>
        <g transform={`rotate(${frame * 0.16})`} opacity={0.55}>
          {paprsky.map((i) => (
            <rect
              key={i}
              x={-1.6}
              y={-96}
              width={3.2}
              height={26 + (i % 2) * 12}
              rx={1.6}
              fill={C.yellow}
              transform={`rotate(${(360 / paprsky.length) * i})`}
              style={{filter: 'blur(1px)'}}
            />
          ))}
        </g>
        <circle r={54} fill="url(#slunce-g)" style={{filter: `drop-shadow(0 0 ${26}px ${C.amber})`}} />
      </svg>
    </div>
  );
};

/* ---------- Sluneční brýle: skládají se ze dvou skel, mostu a straniček ---------- */
export const SlunecniBryle: React.FC<{postup: number; sirka: number}> = ({postup, sirka}) => {
  const k = useScale();
  const p = Math.max(0, Math.min(1, postup));
  const prijezd = (od: number) => Math.max(0, Math.min(1, (p - od) / 0.34));
  const levo = prijezd(0);
  const pravo = prijezd(0.12);
  const most = prijezd(0.34);
  const nozicky = prijezd(0.5);

  return (
    <div style={{position: 'relative', width: sirka * k}}>
      <svg viewBox="-16 -6 232 100" style={{width: '100%', overflow: 'visible'}}>
        <defs>
          <linearGradient id="sklo" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="rgba(255,228,92,0.30)" />
            <stop offset="60%" stopColor="rgba(7,7,7,0.86)" />
            <stop offset="100%" stopColor="rgba(7,7,7,0.94)" />
          </linearGradient>
        </defs>
        {/* levé sklo */}
        <g opacity={levo} transform={`translate(${(1 - levo) * -60} 0)`}>
          <rect x="0" y="16" width="86" height="58" rx="26" fill="url(#sklo)" stroke={C.yellow} strokeWidth="5" />
        </g>
        {/* pravé sklo */}
        <g opacity={pravo} transform={`translate(${(1 - pravo) * 60} 0)`}>
          <rect x="114" y="16" width="86" height="58" rx="26" fill="url(#sklo)" stroke={C.yellow} strokeWidth="5" />
        </g>
        {/* most */}
        <path
          d="M86 30 q14 -10 28 0"
          stroke={C.yellow}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="34"
          strokeDashoffset={34 * (1 - most)}
        />
        {/* straničky */}
        <path
          d="M0 30 L-14 20"
          stroke={C.cream}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="18"
          strokeDashoffset={18 * (1 - nozicky)}
        />
        <path
          d="M200 30 L214 20"
          stroke={C.cream}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="18"
          strokeDashoffset={18 * (1 - nozicky)}
        />
      </svg>
    </div>
  );
};

/* ---------- Typografie scén ---------- */
const Mono: React.FC<{children: React.ReactNode; opacity?: number}> = ({children, opacity = 1}) => {
  const k = useScale();
  return (
    <div style={{fontFamily: MONO, fontSize: 27 * k, color: C.yellowDeep, opacity, letterSpacing: '0.01em'}}>
      {children}
    </div>
  );
};

const Nadpis: React.FC<{radky: [string, string]; zluty?: 0 | 1; delay?: number; velikost?: number}> = ({
  radky,
  zluty = 1,
  delay = F(0.25),
  velikost = 108,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const radek = (i: number) => {
    const s = spring({frame: frame - delay - i * F(0.14), fps, config: {damping: 200}, durationInFrames: F(1.0)});
    return {opacity: s, transform: `translateY(${(1 - s) * 30 * k}px)`};
  };
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: velikost * k,
        lineHeight: 1.04,
        letterSpacing: '-0.035em',
        color: C.cream,
        textShadow: `0 ${6 * k}px ${30 * k}px rgba(0,0,0,0.6)`,
      }}
    >
      {radky.map((r, i) => (
        <div key={i} style={{...radek(i), color: i === zluty ? C.yellow : C.cream}}>
          {r}
        </div>
      ))}
    </div>
  );
};

/* Spodní blok textu — stejné umístění jako u ostatních Reels */
const Spodek: React.FC<{children: React.ReactNode}> = ({children}) => {
  const k = useScale();
  return <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 250 * k}}>{children}</div>;
};

/* ---------- 1) HÁČEK: mhouření očí ---------- */
const Hacek: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();
  const {durationInFrames} = useVideoConfig();

  /* obě „oči" se pomalu přivírají = mhouření do slunce */
  const mhoureni = interpolate(frame, [0, durationInFrames * 0.75], [1, 0.24], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const zare = interpolate(frame, [0, durationInFrames], [0.35, 1], {extrapolateRight: 'clamp'});

  const oko = (posun: number) => (
    <div
      style={{
        width: 344 * k,
        height: 344 * k,
        borderRadius: '50%',
        border: `${11 * k}px solid ${C.cream}`,
        transform: `translateX(${posun * k}px) scaleY(${mhoureni})`,
        boxShadow: `0 0 ${50 * k}px rgba(255,228,92,0.35)`,
      }}
    />
  );

  return (
    <AbsoluteFill>
      <Pozadi zare={zare} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 420 * k}}>
        <div style={{display: 'flex', gap: 70 * k}}>
          {oko(0)}
          {oko(0)}
        </div>
      </AbsoluteFill>
      <Spodek>
        <Mono>// léto v Plzni</Mono>
        <div style={{height: 22 * k}} />
        <Nadpis radky={['Mhouříš v létě', 'oči?']} delay={F(0.12)} />
      </Spodek>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 2) DŮVOD: slunce vyjde, dioptrie problém neřeší ---------- */
const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();
  const {durationInFrames, height} = useVideoConfig();

  /* slunce musí skončit nad textem, jinak se pere s titulkem */
  const vychod = interpolate(frame, [0, durationInFrames], [1.08, 0.4], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <Pozadi />
      <Slunce y={height * vychod} velikost={620} />
      <Spodek>
        <Mono>// a brýle si nesundáš</Mono>
        <div style={{height: 22 * k}} />
        <Nadpis radky={['Dioptrické brýle', 'na slunce nestačí.']} velikost={92} />
      </Spodek>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 3) NABÍDKA: sluneční brýle + velké číslo ---------- */
const Nabidka: React.FC<{sleva: number}> = ({sleva}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const postup = interpolate(frame, [F(0.1), F(1.5)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  /* dopad čísla — CUES.cislo (1,2 s po nástupu scény) */
  const dopad = spring({frame: frame - F(1.2), fps, config: {damping: 11, stiffness: 190}});
  /* rázová vlna existuje až od dopadu — před ním nesmí být vidět vůbec */
  const rana =
    frame < F(1.2)
      ? 0
      : interpolate(frame, [F(1.2), F(1.75)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lesk = interpolate(frame - F(1.35), [0, F(0.9)], [-40, 140], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const popisek = spring({frame: frame - F(2.0), fps, config: {damping: 200}, durationInFrames: F(1.0)});

  return (
    <AbsoluteFill>
      <Pozadi zare={1.15} />
      <Slunce y={430 * k} velikost={330} opacity={0.85} />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 380 * k}}>
        <SlunecniBryle postup={postup} sirka={760} />

        {/* rázová vlna při dopadu čísla */}
        <div
          style={{
            position: 'absolute',
            width: 700 * k,
            height: 700 * k,
            borderRadius: '50%',
            border: `${6 * k}px solid ${C.yellow}`,
            opacity: rana * 0.5,
            transform: `scale(${1 + (1 - rana) * 1.3})`,
          }}
        />

        {/* velké číslo. Lesk běží v samostatné, ořezané vrstvě nad textem,
            aby ořez neukrajoval záři kolem číslic. */}
        <div
          style={{
            position: 'relative',
            marginTop: 64 * k,
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 260 * k,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            whiteSpace: 'nowrap',
            color: C.yellow,
            opacity: Math.min(1, dopad * 1.4),
            transform: `scale(${0.7 + dopad * 0.3})`,
            textShadow: `0 0 ${70 * k}px rgba(255,228,92,0.45)`,
          }}
        >
          −{sleva} %
          <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '26%',
                left: `${lesk}%`,
                background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)',
                transform: 'skewX(-18deg)',
                mixBlendMode: 'screen',
              }}
            />
          </div>
        </div>
      </AbsoluteFill>

      <Spodek>
        <Mono opacity={popisek}>// Letní dvojka</Mono>
        <div style={{height: 22 * k}} />
        <Nadpis radky={['na druhý pár', 'brýlí.']} delay={F(2.0)} velikost={104} />
        <div
          style={{
            marginTop: 24 * k,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 34 * k,
            color: C.dim,
            opacity: popisek,
          }}
        >
          obruba i skla · při objednání dvou brýlí
        </div>
      </Spodek>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 4) PRO KOHO: tři možnosti druhého páru ---------- */
const ProKoho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const polozky = ['sluneční brýle s dioptrií', 'brýle na počítač', 'náhradní pár do auta'];

  return (
    <AbsoluteFill>
      <Pozadi zare={0.8} />
      <Slunce y={330 * k} velikost={250} opacity={0.5} />

      <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 90 * k, paddingRight: 90 * k}}>
        <div style={{marginBottom: 60 * k}}>
          <Mono>// druhý pár si vybereš sám</Mono>
        </div>
        {polozky.map((text, i) => {
          const s = spring({
            frame: frame - F(0.35) - i * F(0.42),
            fps,
            config: {damping: 200},
            durationInFrames: F(1.0),
          });
          return (
            <div
              key={text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30 * k,
                marginBottom: 40 * k,
                opacity: s,
                transform: `translateX(${(1 - s) * -50 * k}px)`,
              }}
            >
              <div
                style={{
                  flex: '0 0 auto',
                  width: 62 * k,
                  height: 62 * k,
                  borderRadius: '50%',
                  background: C.yellow,
                  color: C.ink900,
                  fontFamily: BODY,
                  fontWeight: 700,
                  fontSize: 34 * k,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 ${30 * k}px rgba(255,228,92,0.35)`,
                }}
              >
                ✓
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 68 * k,
                  letterSpacing: '-0.03em',
                  color: C.cream,
                }}
              >
                {text}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 5) PLATNOST: urgence ---------- */
const Platnost: React.FC<{od: string; do: string}> = ({od, do: doKdy}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const s = spring({frame: frame - F(0.15), fps, config: {damping: 200}, durationInFrames: F(1.0)});
  const puls = 1 + Math.sin(frame / 12) * 0.014;

  return (
    <AbsoluteFill>
      <Pozadi zare={1.1} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 90 * k}}>
        <div style={{opacity: s, transform: `translateY(${(1 - s) * 24 * k}px)`, textAlign: 'center'}}>
          <Mono>// Letní dvojka platí</Mono>
          <div
            style={{
              marginTop: 26 * k,
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 150 * k,
              lineHeight: 1.02,
              letterSpacing: '-0.045em',
              color: C.cream,
              transform: `scale(${puls})`,
            }}
          >
            {od}
            <span style={{color: C.yellow}}> → </span>
            <br />
            <span style={{color: C.yellow}}>{doKdy}</span>
          </div>
          <div
            style={{
              marginTop: 34 * k,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 34 * k,
              color: C.dim,
            }}
          >
            nebo do vyprodání letní kolekce obrub
          </div>
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 6) OUTRO: značka + CTA ---------- */
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
  const benefity = sp(F(1.8));
  const puls = 1 + Math.sin(frame / 14) * 0.012;
  const shine = interpolate(frame % F(2.6), [0, F(1.0)], [-30, 130], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <Pozadi zare={0.55} />
      <AbsoluteFill
        style={{justifyContent: 'center', alignItems: 'center', gap: 28 * k, padding: 90 * k}}
      >
        <div style={{width: 320 * k, opacity: logo, transform: `scale(${logo})`}}>
          <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 82 * k,
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
            marginTop: 12 * k,
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
          Objednej se na měření zraku
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
            fontSize: 25 * k,
            color: 'rgba(244,241,234,0.42)',
            textAlign: 'center',
            opacity: benefity,
            lineHeight: 1.6,
          }}
        >
          // bereme Edenred · Pluxee · Up · Benefit Plus
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- Reel ---------- */
export const ReelLetniAkce: React.FC<LetniAkceProps> = ({sleva, platnostOd, platnostDo}) => {
  const frame = useCurrentFrame();
  const k = useScale();

  const vol = interpolate(
    frame,
    [0, F(1.0), LETNI_AKCE_DURATION - F(2.4), LETNI_AKCE_DURATION],
    [0, 0.85, 0.85, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const prolinacka = (dur: number) => (
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: dur})} />
  );

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-letni-akce.wav')} volume={vol} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S_HOOK}>
          <Hacek />
        </TransitionSeries.Sequence>
        {prolinacka(T_A)}

        <TransitionSeries.Sequence durationInFrames={S_PROBLEM}>
          <Problem />
        </TransitionSeries.Sequence>
        {prolinacka(T_B)}

        <TransitionSeries.Sequence durationInFrames={S_NABIDKA}>
          <Nabidka sleva={sleva} />
        </TransitionSeries.Sequence>

        {/* posun stranou = „a teď konkrétně" */}
        <TransitionSeries.Transition
          presentation={slide({direction: 'from-right'})}
          timing={linearTiming({durationInFrames: T_C})}
        />

        <TransitionSeries.Sequence durationInFrames={S_PRO_KOHO}>
          <ProKoho />
        </TransitionSeries.Sequence>
        {prolinacka(T_D)}

        <TransitionSeries.Sequence durationInFrames={S_PLATNOST}>
          <Platnost od={platnostOd} do={platnostDo} />
        </TransitionSeries.Sequence>
        {prolinacka(T_E)}

        <TransitionSeries.Sequence durationInFrames={S_OUTRO}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* hlavička */}
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
        <span>// Letní dvojka</span>
      </div>
    </AbsoluteFill>
  );
};
