import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
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

/* REEL „SERVIS NA POČKÁNÍ" — třetí téma letní kampaně (viz docs/LETNI-AKCE-2026.md).

   Používá stejné reálné snímky prodejny jako reel-optika a reel-prohlidka,
   ale schválně úplně jinou řečí, ať se to nepere:

   - DUOTÓN místo barevné fotky (sítotiskový, plakátový vzhled),
   - TVRDÉ STŘIHY se žlutým bliknutím místo pomalých prolínaček,
   - fotka v masce písma (obrázek uvnitř velkého slova) místo celoplošných záběrů,
   - rychlé tempo, 16,4 s místo dvacetisekundových prohlídek,
   - rytmická hudba na 120 BPM, střihy sedí na dobu.

   Obsah je pozvání, ne prodej: po létě bývají brýle povolené a drobný servis
   zvládne optika na počkání. Nejlevnější způsob, jak dostat do prodejny i
   člověka, který u nás ještě nenakupoval.

   Věta o ceně servisu jde přes props (výchozí znění odpovídá webu):
   npx remotion render reel-servis --props='{"bonus":"Letní servis zdarma, i pro brýle odjinud."}' */

const {fontFamily: DISPLAY} = loadBricolage('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});
const {fontFamily: BODY} = loadInter('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext']});
const {fontFamily: MONO} = loadMono('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

const C = {
  ink: '#0C0B08',
  inkSoft: '#17140C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  dim: 'rgba(244,241,234,0.55)',
};

export const FPS = 60;
const F = (s: number) => Math.round(s * FPS);

/* Tvrdé střihy — žádné prolínačky, jen délky scén za sebou */
const D = {
  hacek: F(2.8),
  pult: F(2.2),
  vycet: F(2.6),
  pozvani: F(2.8),
  kde: F(2.4),
  outro: F(3.6),
};

const START = {
  hacek: 0,
  pult: D.hacek,
  vycet: D.hacek + D.pult,
  pozvani: D.hacek + D.pult + D.vycet,
  kde: D.hacek + D.pult + D.vycet + D.pozvani,
  outro: D.hacek + D.pult + D.vycet + D.pozvani + D.kde,
};

export const SERVIS_DURATION = START.outro + D.outro; // 984 = 16,4 s

/* Střihy v sekundách — musí sedět s scripts/make-audio-servis.mjs */
export const CUES = {
  strihy: [2.8, 5.0, 7.6, 10.4, 12.8],
  vycetPolozky: [5.12, 5.57, 6.02, 6.47],
};

export type ServisProps = {
  /* Co se říká o ceně servisu. Výchozí znění je opsané z webu (akce.html),
     kampaňová varianta „zdarma" se dá pustit přes props, až ji majitelka potvrdí. */
  bonus: string;
};

export const SERVIS_DEFAULTS: ServisProps = {
  bonus: 'Drobnosti zvládneme jako pozornost.',
};

const useScale = () => useVideoConfig().width / 1080;

/* ---------- Zrno, tady hrubší — má to vypadat jako tisk ---------- */
const GRAIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.6"/></svg>'
  );
const Grain = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN}")`,
        backgroundPosition: `${(frame * 53) % 200}px ${(frame * 31) % 200}px`,
        opacity: 0.11,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

/* ---------- Duotón: reálná fotka převedená do dvou barev ----------
   Šedotón → žlutá přes multiply (světla) → inkoust přes lighten (stíny).
   Fotka tím přestane být dokumentem a stane se grafikou. */
type Source = {file: string; w: number; h: number};
type Framing = {fx: number; fy: number; z: number};

const SRC: Record<string, Source> = {
  pult: {file: 'optika/opt-0690.jpg', w: 3240, h: 2430},
  stena: {file: 'optika/opt-0691.jpg', w: 3240, h: 2430},
  stul: {file: 'optika/opt-0692.jpg', w: 3240, h: 2430},
  vstup: {file: 'optika/pano-vstup.jpg', w: 8192, h: 1898},
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const Duoton: React.FC<{src: Source; from: Framing; to: Framing; delka: number}> = ({
  src,
  from,
  to,
  delka,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  /* rychlý nájezd hned po střihu a pak už skoro klid — jiný rytmus než pomalé prohlídky */
  const p = interpolate(frame, [0, delka], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const mix = (a: number, b: number) => a + (b - a) * p;

  const cover = Math.max(width / src.w, height / src.h);
  const z = mix(from.z, to.z);
  const w = src.w * cover * z;
  const h = src.h * cover * z;
  const left = clamp(width / 2 - mix(from.fx, to.fx) * w, width - w, 0);
  const top = clamp(height / 2 - mix(from.fy, to.fy) * h, height - h, 0);

  return (
    <AbsoluteFill style={{backgroundColor: C.ink, overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: 'grayscale(1) contrast(1.28) brightness(1.04)'}}>
        <Img
          src={staticFile(src.file)}
          style={{position: 'absolute', width: w, height: h, left, top, maxWidth: 'none'}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: C.yellowDeep, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{backgroundColor: C.inkSoft, mixBlendMode: 'lighten'}} />
      <AbsoluteFill
        style={{background: 'radial-gradient(115% 74% at 50% 44%, transparent 46%, rgba(12,11,8,0.6) 100%)'}}
      />
    </AbsoluteFill>
  );
};

/* ---------- Žlutý štítek nakřivo (nálepka) ---------- */
const Stitek: React.FC<{children: React.ReactNode; uhel?: number; delay?: number}> = ({
  children,
  uhel = -3,
  delay = F(0.25),
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const s = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 190}});
  return (
    <div
      style={{
        display: 'inline-block',
        background: C.yellow,
        color: C.ink,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 62 * k,
        letterSpacing: '-0.03em',
        lineHeight: 1.12,
        padding: `${16 * k}px ${28 * k}px`,
        transform: `rotate(${uhel}deg) scale(${0.86 + s * 0.14})`,
        opacity: Math.min(1, s * 1.6),
        boxShadow: `${10 * k}px ${12 * k}px 0 rgba(12,11,8,0.55)`,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- 1) HÁČEK: fotka uvnitř písma ---------- */
const Hacek: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* fotka uvnitř slova se pomalu posouvá — písmo se tím „hýbe" */
  const posun = interpolate(frame, [0, D.hacek], [0, -180 * k], {extrapolateRight: 'clamp'});
  const s = spring({frame, fps, config: {damping: 200}, durationInFrames: F(0.7)});
  const spodek = spring({frame: frame - F(0.55), fps, config: {damping: 200}, durationInFrames: F(0.9)});

  return (
    <AbsoluteFill style={{backgroundColor: C.ink}}>
      {/* fotka jde do písma přes background-image, což Remotion sám nehlídá.
          Tenhle neviditelný Img ji nechá načíst dřív, než se snímek vyrenderuje. */}
      <Img
        src={staticFile(SRC.stena.file)}
        style={{position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none'}}
      />
      <AbsoluteFill
        style={{background: 'radial-gradient(100% 55% at 50% 30%, rgba(245,197,24,0.16) 0%, transparent 70%)'}}
      />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: `0 ${70 * k}px`}}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 300 * k,
            lineHeight: 0.92,
            letterSpacing: '-0.045em',
            textAlign: 'center',
            backgroundImage: `url("${staticFile(SRC.stena.file)}")`,
            backgroundSize: `${2400 * k}px auto`,
            backgroundPosition: `${-260 * k + posun}px ${-420 * k}px`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            filter: 'sepia(1) saturate(2.9) hue-rotate(-14deg) contrast(1.02) brightness(1.62)',
            transform: `scale(${0.96 + s * 0.04})`,
            opacity: s,
          }}
        >
          PO LÉTĚ
        </div>
        <div
          style={{
            marginTop: 30 * k,
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 84 * k,
            lineHeight: 1.06,
            letterSpacing: '-0.035em',
            textAlign: 'center',
            color: C.cream,
            opacity: spodek,
            transform: `translateY(${(1 - spodek) * 26 * k}px)`,
          }}
        >
          ti brýle padají
          <br />
          <span style={{color: C.yellow}}>z nosu?</span>
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 2) PULT: srovnáme to ---------- */
const Pult: React.FC = () => {
  const k = useScale();
  return (
    <AbsoluteFill>
      <Duoton
        src={SRC.pult}
        from={{fx: 0.68, fy: 0.58, z: 1.5}}
        to={{fx: 0.66, fy: 0.57, z: 1.34}}
        delka={D.pult}
      />
      <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 270 * k}}>
        <Stitek uhel={-2.5}>Přineste je k nám.</Stitek>
        <div style={{height: 18 * k}} />
        <Stitek uhel={1.8} delay={F(0.55)}>
          Srovnáme to na počkání.
        </Stitek>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 3) VÝČET: co konkrétně ---------- */
const Vycet: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const polozky = ['dotáhneme šroubky', 'srovnáme straničky', 'vyměníme nosníky', 'vyčistíme skla'];

  return (
    <AbsoluteFill style={{backgroundColor: C.ink}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(110% 60% at 50% 106%, rgba(245,197,24,0.2) 0%, transparent 66%)'}}
      />
      <AbsoluteFill style={{justifyContent: 'center', padding: `0 ${90 * k}px`}}>
        <div style={{fontFamily: MONO, fontSize: 27 * k, color: C.yellowDeep, marginBottom: 40 * k}}>
          // co zvládneme hned
        </div>
        {polozky.map((text, i) => {
          const s = spring({
            frame: frame - F(0.12) - i * F(0.45),
            fps,
            config: {damping: 200},
            durationInFrames: F(0.55),
          });
          return (
            <div key={text} style={{overflow: 'hidden', marginBottom: 26 * k}}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 78 * k,
                  lineHeight: 1.14,
                  letterSpacing: '-0.035em',
                  color: i % 2 ? C.yellow : C.cream,
                  transform: `translateY(${(1 - s) * 100}%)`,
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

/* ---------- 4) POZVÁNÍ ---------- */
const Pozvani: React.FC<{bonus: string}> = ({bonus}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const s = spring({frame: frame - F(0.2), fps, config: {damping: 200}, durationInFrames: F(0.8)});
  const b = spring({frame: frame - F(1.1), fps, config: {damping: 200}, durationInFrames: F(0.8)});

  return (
    <AbsoluteFill>
      <Duoton
        src={SRC.stul}
        from={{fx: 0.45, fy: 0.97, z: 1.42}}
        to={{fx: 0.46, fy: 0.97, z: 1.3}}
        delka={D.pozvani}
      />
      <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 250 * k}}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 100 * k,
            lineHeight: 1.04,
            letterSpacing: '-0.035em',
            color: C.cream,
            opacity: s,
            transform: `translateY(${(1 - s) * 26 * k}px)`,
            textShadow: `0 ${6 * k}px ${28 * k}px rgba(0,0,0,0.6)`,
          }}
        >
          Zastav se a<br />
          <span style={{color: C.yellow}}>mrkneme na ně.</span>
        </div>
        <div
          style={{
            marginTop: 26 * k,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 34 * k,
            color: C.cream,
            opacity: b * 0.85,
            transform: `translateY(${(1 - b) * 16 * k}px)`,
          }}
        >
          {bonus}
        </div>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 5) KDE A KDY ---------- */
const Kde: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const s = spring({frame: frame - F(0.15), fps, config: {damping: 200}, durationInFrames: F(0.8)});

  return (
    <AbsoluteFill>
      <Duoton
        src={SRC.vstup}
        from={{fx: 0.128, fy: 0.5, z: 1.06}}
        to={{fx: 0.17, fy: 0.5, z: 1.0}}
        delka={D.kde}
      />
      <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 250 * k, opacity: s}}>
        <div style={{fontFamily: MONO, fontSize: 27 * k, color: C.yellow, marginBottom: 20 * k}}>
          // stavte se cestou
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 88 * k,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            color: C.cream,
            textShadow: `0 ${6 * k}px ${28 * k}px rgba(0,0,0,0.6)`,
          }}
        >
          Americká 325/23,
          <br />
          Plzeň.
        </div>
        <div
          style={{
            marginTop: 22 * k,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 32 * k,
            color: C.cream,
            opacity: 0.85,
          }}
        >
          Po až Čt 8:30–17:00 · Pá 8:30–16:00
        </div>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 6) OUTRO ---------- */
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  const sp = (delay: number) =>
    spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const logo = sp(F(0.05));
  const claim = sp(F(0.35));
  const cta = sp(F(0.75));
  const puls = 1 + Math.sin(frame / 14) * 0.012;
  const shine = interpolate(frame % F(2.6), [0, F(1.0)], [-30, 130], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: C.ink}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(110% 60% at 50% 104%, rgba(245,197,24,0.22) 0%, transparent 64%)'}}
      />
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
            transform: `translateY(${(1 - claim) * 20 * k}px)`,
          }}
        >
          Vidět líp
          <br />
          <span style={{color: C.yellow}}>než včera.</span>
        </div>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginTop: 8 * k,
            background: C.yellow,
            color: C.ink,
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
          Stav se v otevírací době
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
            color: 'rgba(244,241,234,0.45)',
            textAlign: 'center',
            opacity: cta,
          }}
        >
          // Optik Dvořák · rodinná optika od 1991
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- Bliknutí na střihu — místo prolínačky ---------- */
const Bliknuti: React.FC = () => {
  const frame = useCurrentFrame();
  const sila = CUES.strihy.reduce((max, t) => {
    const f = t * FPS;
    const v = interpolate(frame, [f - 1, f, f + 4], [0, 0.5, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return Math.max(max, v);
  }, 0);
  if (sila <= 0) return null;
  return <AbsoluteFill style={{backgroundColor: C.yellow, opacity: sila, pointerEvents: 'none'}} />;
};

/* ---------- Reel ---------- */
export const ReelServis: React.FC<ServisProps> = ({bonus}) => {
  const frame = useCurrentFrame();
  const k = useScale();

  const vol = interpolate(frame, [0, F(0.8), SERVIS_DURATION - F(2.0), SERVIS_DURATION], [0, 0.85, 0.85, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.ink}}>
      <Audio src={staticFile('music-servis.wav')} volume={vol} />

      {/* tvrdé střihy: sekvence jdou za sebou bez prolínaček */}
      <Sequence from={START.hacek} durationInFrames={D.hacek}>
        <Hacek />
      </Sequence>
      <Sequence from={START.pult} durationInFrames={D.pult}>
        <Pult />
      </Sequence>
      <Sequence from={START.vycet} durationInFrames={D.vycet}>
        <Vycet />
      </Sequence>
      <Sequence from={START.pozvani} durationInFrames={D.pozvani}>
        <Pozvani bonus={bonus} />
      </Sequence>
      <Sequence from={START.kde} durationInFrames={D.kde}>
        <Kde />
      </Sequence>
      <Sequence from={START.outro} durationInFrames={D.outro}>
        <Outro />
      </Sequence>

      <Bliknuti />

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
          color: 'rgba(244,241,234,0.5)',
          pointerEvents: 'none',
        }}
      >
        <span>Optik Dvořák</span>
        <span>// servis na počkání</span>
      </div>
    </AbsoluteFill>
  );
};
