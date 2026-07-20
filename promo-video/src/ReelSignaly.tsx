import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {LogoMark} from './LogoMark';

/* REEL E — „Zaškrtni si příznaky" — sebe-diagnostický checklist, 18 s.
   Nejkonverznější formát v sadě: divák si SÁM odškrtává příznaky (aktivní
   zapojení = uložení + opakované přehrání), pocítí potřebu a verdikt ho
   pošle na měření zraku. Shot-by-shot dle docs/REKLAMA-A-SOCIAL-PLAN.md (ČÁST 4, REEL E):
   0–2.6 s  HÁČEK: „Bolí tě večer hlava? Nemusí to být z práce."
   2.6–3.9 s obrat: „Kolik z těchhle poznáváš?" (spustí checklist)
   3.9–12 s 5 příznaků se postupně odškrtává (tik = uspokojení + rytmus)
   12–14.8 s VERDIKT: „2 a víc? To není únava — to je čas na měření zraku."
   14.8–18 s outro: logo + CTA „Objednej se na měření" + adresa
   Příznaky jsou reálné a poctivé (myopie/presbyopie/astigmatismus/únava),
   ne vymyšlená čísla. Stock foto = placeholder, majitelka nahradí reálným záběrem.
   Zvuk: scripts/make-audio-signaly.mjs → public/music-signaly.wav. */

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

const GRADE = 'saturate(0.85) contrast(1.12) brightness(0.8) sepia(0.22)';

export const FPS = 60;
export const SIGNALY_DURATION = 1080; // 18 s

const F = (s: number) => Math.round(s * FPS);
/* Klíčové okamžiky — musí sedět s scripts/make-audio-signaly.mjs */
const T_HOOK = F(0.3);
const T_TURN = F(2.6);
const T_LIST = F(3.9);
/* okamžik, kdy se každý příznak objeví; odškrtnutí (tik) přijde +0.35 s */
const ITEM_AT = [F(4.2), F(5.7), F(7.2), F(8.7), F(10.2)];
const CHECK_OFFSET = F(0.35);
const T_VERDICT = F(12.3);
const T_OUT = F(14.8);

const ITEMS = [
  'Mhouříš oči na telefon nebo ceduli',
  'Večer tě bolí hlava nebo pálí oči',
  'Text oddaluješ dál od očí, než jsi zvyklý',
  'V noci vidíš kolem světel „hvězdičky"',
  'U počítače ti do večera těžknou oči',
];

const useScale = () => useVideoConfig().width / 1080;

/* ---------- Zrno (sdílené s ostatními reely) ---------- */
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
      }}
    />
  );
};

/* ---------- Reveal nadpisu po slovech ---------- */
const HeadWords: React.FC<{words: string[]; startAt: number; k: number; size: number; color?: string; dot?: boolean}> = ({
  words,
  startAt,
  k,
  size,
  color = C.cream,
  dot = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `0 ${18 * k}px`,
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
                    width: 16 * k,
                    height: 16 * k,
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

/* ---------- Jeden odškrtávací příznak ---------- */
const CheckItem: React.FC<{text: string; appear: number; k: number}> = ({text, appear, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slide = spring({frame: frame - appear, fps, config: {damping: 20, stiffness: 160}});
  const checkAt = appear + CHECK_OFFSET;
  const draw = interpolate(frame, [checkAt, checkAt + 9], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pop = spring({frame: frame - checkAt, fps, config: {damping: 9, stiffness: 240}});
  const checked = frame >= checkAt;
  const CHECK_LEN = 30;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 30 * k,
        opacity: slide,
        transform: `translateX(${(1 - slide) * -30 * k}px)`,
      }}
    >
      <div
        style={{
          width: 68 * k,
          height: 68 * k,
          borderRadius: 18 * k,
          flexShrink: 0,
          border: `${3 * k}px solid ${checked ? C.yellow : 'rgba(244,241,234,0.32)'}`,
          background: checked ? 'rgba(255,228,92,0.14)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${checked ? 1 + (1 - pop) * 0.16 : 1})`,
          boxShadow: checked ? `0 0 ${22 * k}px rgba(255,228,92,0.35)` : 'none',
        }}
      >
        <svg viewBox="0 0 24 24" style={{width: 42 * k, height: 42 * k}}>
          <path
            d="M4 12.5 L10 18 L20 5.5"
            fill="none"
            stroke={C.yellow}
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={CHECK_LEN}
            strokeDashoffset={CHECK_LEN * (1 - draw)}
          />
        </svg>
      </div>
      <span
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 42 * k,
          lineHeight: 1.14,
          color: checked ? C.cream : 'rgba(244,241,234,0.72)',
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const ReelSignaly = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* pozadí: rozmazaný portrét — u háčku patrnější, přes checklist ztmaví (čitelnost) */
  const bgOp = interpolate(
    frame,
    [0, 24, T_TURN, T_LIST, T_VERDICT, T_OUT, T_OUT + 20],
    [0, 0.42, 0.42, 0.14, 0.14, 0.1, 0.05],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const bgBlur = interpolate(frame, [0, T_TURN], [30, 16], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  const ken = interpolate(frame, [0, SIGNALY_DURATION], [1.16, 1.03]);

  /* scéna 1 — háček */
  const s1 = interpolate(frame, [T_HOOK, T_HOOK + 12, T_TURN, T_TURN + 12], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  /* nadpis checklistu (drží nad příznaky až do verdiktu) */
  const listHdr = interpolate(frame, [T_TURN, T_TURN + 12, T_VERDICT - 6, T_VERDICT + 6], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const listOp = interpolate(frame, [T_LIST - 6, T_LIST + 6, T_VERDICT - 6, T_VERDICT + 6], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* verdikt */
  const verdOp = interpolate(frame, [T_VERDICT, T_VERDICT + 12, T_OUT - 8, T_OUT], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const verdFlash = interpolate(frame, [T_VERDICT - 2, T_VERDICT + 2, T_VERDICT + 18], [0, 0.4, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* outro */
  const outLogo = spring({frame: frame - T_OUT, fps, config: {damping: 13, stiffness: 130}});
  const outTxt = spring({frame: frame - T_OUT - 14, fps, config: {damping: 200}});
  const outCta = spring({frame: frame - T_OUT - 26, fps, config: {damping: 13, stiffness: 140}});
  const ctaPulse = 1 + Math.sin(Math.max(0, frame - T_OUT - 42) / 10) * 0.02;
  const shine = interpolate(frame, [T_OUT + 30, T_OUT + 74], [-150, 260], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const replayOp = spring({frame: frame - T_OUT - 64, fps, config: {damping: 200}});

  /* hlavička (od obratu dál) */
  const hdrOp = interpolate(frame, [T_TURN, T_TURN + 14, T_OUT, T_OUT + 10], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music-signaly.wav')}
        volume={(f) =>
          interpolate(f, [0, 8, SIGNALY_DURATION - 30, SIGNALY_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* pozadí — rozmazaný portrét (stock, volná licence), zaostřuje se */}
      <AbsoluteFill style={{opacity: bgOp, transform: `scale(${ken})`, filter: `${GRADE} blur(${bgBlur * k}px)`}}>
        <Img src={staticFile('ig-woman-round.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.bg} 0%, rgba(10,10,10,0.6) 26%, rgba(10,10,10,0.9) 60%, ${C.bg} 100%)`,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, rgba(255,228,92,0.05), transparent 54%)'}} />

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
        // test za 10 s
      </div>

      {/* SCÉNA 1 — háček */}
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', opacity: s1}}>
        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 22 * k}}>
          // večer · po práci · mhouříš
        </div>
        <HeadWords words={['Bolí', 'tě', 'večer']} startAt={T_HOOK} k={k} size={122} />
        <HeadWords words={['hlava?']} startAt={T_HOOK + 8} k={k} size={122} dot />
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 44 * k, color: C.dim, marginTop: 30 * k}}>
          Nemusí to být z práce.
        </div>
      </AbsoluteFill>

      {/* SCÉNA 2+3 — nadpis + checklist */}
      <AbsoluteFill style={{padding: `0 ${86 * k}px`, justifyContent: 'center'}}>
        <div style={{opacity: listHdr, marginBottom: 54 * k}}>
          <HeadWords words={['Kolik', 'z', 'těchhle']} startAt={T_TURN} k={k} size={82} />
          <HeadWords words={['poznáváš?']} startAt={T_TURN + 6} k={k} size={82} color={C.yellow} />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 34 * k, opacity: listOp}}>
          {ITEMS.map((t, i) => (
            <CheckItem key={i} text={t} appear={ITEM_AT[i]} k={k} />
          ))}
        </div>
      </AbsoluteFill>

      {/* SCÉNA 4 — verdikt */}
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', opacity: verdOp}}>
        <div
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            gap: 14 * k,
            fontFamily: MONO,
            fontSize: 30 * k,
            color: C.ink900,
            background: C.yellow,
            padding: `${12 * k}px ${26 * k}px`,
            borderRadius: 999,
            marginBottom: 34 * k,
            fontWeight: 400,
          }}
        >
          ✋ 2 a víc?
        </div>
        <HeadWords words={['To', 'není']} startAt={T_VERDICT + 6} k={k} size={104} />
        <HeadWords words={['únava.']} startAt={T_VERDICT + 12} k={k} size={104} />
        <div style={{marginTop: 20 * k}}>
          <HeadWords words={['Čas', 'na', 'měření']} startAt={T_VERDICT + 20} k={k} size={104} color={C.yellow} />
          <HeadWords words={['zraku.']} startAt={T_VERDICT + 28} k={k} size={104} color={C.yellow} dot />
        </div>
      </AbsoluteFill>

      {/* SCÉNA 5 — outro (logo + CTA, drží do konce) */}
      {frame >= T_OUT - 4 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30 * k, padding: 90 * k}}>
          <div style={{width: 320 * k, opacity: outLogo, transform: `scale(${outLogo})`}}>
            <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 78 * k,
              letterSpacing: '-0.03em',
              textAlign: 'center',
              lineHeight: 1.06,
              color: C.cream,
              opacity: outTxt,
              transform: `translateY(${(1 - outTxt) * 22 * k}px)`,
            }}
          >
            Objednej se
            <br />
            <span style={{color: C.yellow}}>na měření zraku.</span>
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 32 * k,
              color: C.dim,
              textAlign: 'center',
              lineHeight: 1.5,
              opacity: outTxt,
            }}
          >
            Oční optika Dvořák · Americká 325/23, Plzeň
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
              padding: `${20 * k}px ${42 * k}px`,
              borderRadius: 999,
              opacity: outCta,
              transform: `scale(${outCta * ctaPulse})`,
              boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
              whiteSpace: 'nowrap',
            }}
          >
            Napiš „VIDÍM" do DM →
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
          <div style={{fontFamily: MONO, fontSize: 24 * k, color: C.dim, marginTop: 6 * k, opacity: replayOp}}>
            // pusť si to znovu a spočítej se 🔁
          </div>
        </AbsoluteFill>
      )}

      {/* žlutý záblesk u verdiktu */}
      <AbsoluteFill style={{background: C.yellow, opacity: verdFlash, mixBlendMode: 'screen'}} />
      {/* vinětace */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};

/* PLACEHOLDER pro majitelku:
   - CTA „Napiš VIDÍM do DM" je měkká konverze, která funguje 24/7 (online rezervace
     zatím není). Až bude, dá se vyměnit za „Rezervovat termín online".
     Do IG/FB popisku doplň telefon a případně odkaz optikdvorak.cz#kontakt.
   - Příznaky v checklistu jsou reálné (myopie/presbyopie/astigmatismus/digitální únava),
     rámované jako „důvod zajít na měření", ne jako diagnóza. */
