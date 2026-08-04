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

/* REEL — „celkový nákup u nás": celá cesta k novým brýlím na Americké 325/23.
   Vizuální řešení schválně JINÉ než ReelEdukace (ta má číslované tipy na černém
   pozadí): tady je průchod prodejnou — široký filmový pás s reálnou fotkou
   provozovny nahoře, pod ním štítek KROK 0X, nadpis a detail, a přes celou
   cestu běží čtyřdílný ukazatel postupu.

   ČASOVÁ OSA (doba běhu 24,7 s = 1482 snímků, mřížka 0,65 s = 92,3 BPM,
   musí sedět s scripts/make-audio-nakup.mjs):
     0,00–2,60  HÁČEK   recepce — „Brýle nosíte celý den. Nespěcháme."
     2,60–6,50  KROK 01 Změříme zrak (30–45 min, na prodejně, bez čekání u lékaře)
     6,50–10,40 KROK 02 Vybereme obrubu (+ klip na sluneční brýle)
    10,40–14,30 KROK 03 Doporučíme brýlová skla (jedno/víceohnisková, řidiči, filtr, MiYOSMART)
    14,30–18,20 KROK 04 Seřídíme a staráme se dál (servis obvykle na počkání)
    18,20–21,45 PROČ U NÁS  rodinná oční optika od roku 1991 + hodnocení Google
    21,45–24,70 CTA     brandová karta, adresa, otevírací doba, telefon

   FOTKY (public/nakup/, výřezy z reálných snímků prodejny — poměr pásu 1080:630,
   háček 1080:800; exportováno na 2400 px na šířku, aby se při Ken Burns nikde
   neupscalovalo):
     hook.jpg      opt-0690.jpg      recepce s nápisem OPTIK DVOŘÁK a pultem
     krok1.jpg     pano1-8k.jpg      nápis + průchod do zadní části prodejny
     krok2.jpg     opt-0691.jpg      stěna prosklených vitrín s obrubami
     krok3.jpg     opt-0692.jpg      konzultační stůl se zrcadlem a tulipány
     krok4.jpg     pano.jpg          vitrína s doplňky, čisticími prostředky a pouzdry
     pano-why.jpg  pano1-8k.jpg      široký pruh pro pomalý pojezd kamerou
     vyloha.jpg    img/exterier.jpg  výloha z Americké (rozostřené pozadí CTA)

   Všechna tvrzení jsou z ověřených podkladů. Žádné výmysly, žádné zdravotní
   sliby, slovo „značkové" se nepoužívá (přání majitelky). */

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
  soft: 'rgba(244,241,234,0.76)',
};

/* Světlý, vzdušný grade — prodejna má působit prosvětleně, ne ponuře (jako v ReelOptika). */
const GRADE = 'saturate(1.06) contrast(1.05) brightness(1.04)';

export const FPS = 60;
const F = (s: number) => Math.round(s * FPS);

/* Klíčové časy */
const T_S1 = F(2.6);
const T_S2 = F(6.5);
const T_S3 = F(10.4);
const T_S4 = F(14.3);
const T_WHY = F(18.2);
const T_CTA = F(21.45);
export const NAKUP_DURATION = F(24.7); // 1482 snímků = 24,7 s

const STEPS = [T_S1, T_S2, T_S3, T_S4];
const XF = F(0.4); // délka prolínačky mezi sekcemi

/* Rozvržení v souřadnicích 1080 × 1920 (násobí se useScale()).
   Bezpečné zóny Instagramu: horní ~269 px a dolní ~384 px (od 1536 dolů)
   překrývá UI — nic důležitého tam neleží. */
const M = 90;
const HOOK_TOP = 250;
const HOOK_H = 800;
const BAND_TOP = 350;
const BAND_H = 630;
const RAIL_Y = 284;
const TEXT_TOP = 1050;

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

/* ---------- Fotka v pásu (Ken Burns + prolínačka) ---------- */
type Shot = {src: string; from: number; to: number; dir: 'in' | 'out'; pan?: boolean};

const SHOTS: Shot[] = [
  {src: 'nakup/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'nakup/krok1.jpg', from: T_S1, to: T_S2, dir: 'out'},
  {src: 'nakup/krok2.jpg', from: T_S2, to: T_S3, dir: 'in'},
  {src: 'nakup/krok3.jpg', from: T_S3, to: T_S4, dir: 'out'},
  {src: 'nakup/krok4.jpg', from: T_S4, to: T_WHY, dir: 'in'},
  {src: 'nakup/pano-why.jpg', from: T_WHY, to: T_CTA, dir: 'in', pan: true},
];

const shotOpacity = (frame: number, s: Shot) =>
  interpolate(frame, [s.from - XF, s.from, s.to - XF, s.to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const BandPhoto: React.FC<{shot: Shot; k: number}> = ({shot, k}) => {
  const frame = useCurrentFrame();
  const op = shotOpacity(frame, shot);
  if (op <= 0.002) return null;

  const p = interpolate(frame, [shot.from, shot.to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });

  /* Panorama „proč u nás" — pomalý pojezd kamerou zleva doprava. */
  if (shot.pan) {
    const bandW = 1080 * k;
    const bandH = BAND_H * k;
    const imgW = bandH * (3600 / 1400);
    const x = -(imgW - bandW) * (0.12 + 0.72 * p);
    return (
      <Img
        src={staticFile(shot.src)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: imgW,
          maxWidth: 'none',
          transform: `translateX(${x}px)`,
          filter: GRADE,
          opacity: op,
        }}
      />
    );
  }

  const scale = shot.dir === 'in' ? 1 + p * 0.055 : 1.055 - p * 0.055;
  const dx = (shot.dir === 'in' ? 1 : -1) * (0.5 - p) * 16 * k;
  return (
    <Img
      src={staticFile(shot.src)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: GRADE,
        transform: `scale(${scale}) translateX(${dx}px)`,
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
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'blur(90px) brightness(0.30) saturate(1.2)',
        transform: 'scale(1.3)',
        opacity: op * 0.55,
      }}
    />
  );
};

/* ---------- Ukazatel postupu: 4 díly cesty ---------- */
const Rail: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const op = interpolate(
    frame,
    [T_S1 - F(0.6), T_S1 - F(0.1), T_CTA - F(0.5), T_CTA - F(0.1)],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  if (op <= 0.002) return null;

  const ends = [T_S2, T_S3, T_S4, T_WHY];
  return (
    <div
      style={{
        position: 'absolute',
        top: RAIL_Y * k,
        left: M * k,
        right: M * k,
        display: 'flex',
        gap: 20 * k,
        opacity: op,
      }}
    >
      {STEPS.map((start, i) => {
        const fill = interpolate(frame, [start, ends[i]], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={start}
            style={{
              flex: 1,
              height: 6 * k,
              borderRadius: 999,
              background: 'rgba(244,241,234,0.18)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '100%',
                background: C.yellow,
                boxShadow: `0 0 ${14 * k}px rgba(255,228,92,0.5)`,
                transform: `scaleX(${fill})`,
                transformOrigin: 'left',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Štítek KROK 0X, sedí na spodní hraně pásu ---------- */
const Badge: React.FC<{label: string; start: number; k: number}> = ({label, start, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - start, fps, config: {damping: 14, stiffness: 170}});
  return (
    <div
      style={{
        display: 'inline-block',
        background: C.yellow,
        color: C.ink900,
        fontFamily: BODY,
        fontWeight: 700,
        fontSize: 28 * k,
        letterSpacing: '0.14em',
        padding: `${16 * k}px ${28 * k}px`,
        borderRadius: 999,
        boxShadow: `0 0 ${36 * k}px rgba(255,228,92,0.35)`,
        transform: `scale(${0.7 + p * 0.3})`,
        transformOrigin: 'left center',
        opacity: p,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
};

/* ---------- Zvýrazněná poznámka (žlutý proužek) ---------- */
const Note: React.FC<{text: string; start: number; k: number}> = ({text, start, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: F(0.9)});
  return (
    <div
      style={{
        marginTop: 30 * k,
        borderLeft: `${5 * k}px solid ${C.yellow}`,
        background: 'rgba(255,228,92,0.10)',
        borderRadius: `${6 * k}px ${12 * k}px ${12 * k}px ${6 * k}px`,
        padding: `${16 * k}px ${24 * k}px`,
        fontFamily: BODY,
        fontWeight: 700,
        fontSize: 28 * k,
        lineHeight: 1.35,
        color: C.yellow,
        opacity: p,
        transform: `translateY(${(1 - p) * 14 * k}px)`,
      }}
    >
      {text}
    </div>
  );
};

/* ---------- Řádek štítků (druhy brýlových skel) ---------- */
const Chips: React.FC<{items: string[]; start: number; k: number}> = ({items, start, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 14 * k, marginTop: 26 * k}}>
      {items.map((it, i) => {
        const p = spring({frame: frame - start - i * 4, fps, config: {damping: 16, stiffness: 170}});
        return (
          <span
            key={it}
            style={{
              border: `${2 * k}px solid rgba(244,241,234,0.30)`,
              borderRadius: 999,
              padding: `${10 * k}px ${22 * k}px`,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 28 * k,
              color: C.cream,
              opacity: p,
              transform: `translateY(${(1 - p) * 12 * k}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            {it}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Textový blok jednoho kroku ---------- */
const StepText: React.FC<{
  badge: string;
  head: string[];
  head2?: string[];
  detail: string;
  note?: string;
  chips?: string[];
  from: number;
  to: number;
  k: number;
}> = ({badge, head, head2, detail, note, chips, from, to, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const op = interpolate(frame, [from - XF, from, to - XF, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;

  const detailP = spring({frame: frame - from - F(0.35), fps, config: {damping: 200}, durationInFrames: F(1.0)});

  return (
    <div
      style={{
        position: 'absolute',
        left: M * k,
        right: M * k,
        top: (BAND_TOP + BAND_H - 32) * k,
        opacity: op,
      }}
    >
      <Badge label={badge} start={from} k={k} />
      <div style={{marginTop: 38 * k}}>
        <HeadWords words={head} startAt={from + 3} k={k} size={92} dot={!head2} />
        {head2 ? <HeadWords words={head2} startAt={from + 9} k={k} size={92} dot /> : null}
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 36 * k,
          lineHeight: 1.36,
          color: C.soft,
          marginTop: 28 * k,
          opacity: detailP,
          transform: `translateY(${(1 - detailP) * 14 * k}px)`,
        }}
      >
        {detail}
      </div>
      {note ? <Note text={note} start={from + F(0.75)} k={k} /> : null}
      {chips ? <Chips items={chips} start={from + F(0.7)} k={k} /> : null}
    </div>
  );
};

/* ---------- Háček ---------- */
const Hook: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const op = interpolate(frame, [0, 4, T_S1 - XF, T_S1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;

  const monoP = spring({frame: frame - F(0.1), fps, config: {damping: 200}, durationInFrames: F(0.8)});
  const subP = spring({frame: frame - F(1.5), fps, config: {damping: 200}, durationInFrames: F(1.0)});

  return (
    <div
      style={{
        position: 'absolute',
        left: M * k,
        right: M * k,
        top: (HOOK_TOP + HOOK_H + 44) * k,
        opacity: op,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 26 * k,
          color: C.yellowDeep,
          marginBottom: 22 * k,
          opacity: monoP,
        }}
      >
        // celá cesta k novým brýlím
      </div>
      <HeadWords words={['Brýle', 'nosíte', 'celý', 'den.']} startAt={F(0.05)} k={k} size={96} />
      <HeadWords words={['Nespěcháme']} startAt={F(0.5)} k={k} size={96} color={C.yellow} dot />
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 36 * k,
          color: C.soft,
          marginTop: 30 * k,
          opacity: subP,
          transform: `translateY(${(1 - subP) * 14 * k}px)`,
        }}
      >
        Čtyři kroky, než si je odnesete domů 👇
      </div>
    </div>
  );
};

/* ---------- Proč u nás ---------- */
const Why: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const op = interpolate(frame, [T_WHY - XF, T_WHY, T_CTA - XF, T_CTA], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;

  const detailP = spring({frame: frame - T_WHY - F(0.35), fps, config: {damping: 200}, durationInFrames: F(1.0)});
  const rateP = spring({frame: frame - T_WHY - F(0.9), fps, config: {damping: 200}, durationInFrames: F(1.0)});

  return (
    <div
      style={{
        position: 'absolute',
        left: M * k,
        right: M * k,
        top: (BAND_TOP + BAND_H - 32) * k,
        opacity: op,
      }}
    >
      <Badge label="OD ROKU 1991" start={T_WHY} k={k} />
      <div style={{marginTop: 38 * k}}>
        <HeadWords words={['Rodinná', 'oční', 'optika']} startAt={T_WHY + 3} k={k} size={92} />
        <HeadWords words={['na', 'Americké']} startAt={T_WHY + 10} k={k} size={92} color={C.yellow} dot />
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 36 * k,
          lineHeight: 1.36,
          color: C.soft,
          marginTop: 26 * k,
          opacity: detailP,
          transform: `translateY(${(1 - detailP) * 14 * k}px)`,
        }}
      >
        Ne řetězec ani e-shop. Malá optika v Plzni, kde si na vás uděláme čas.
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 24 * k,
          color: C.yellowDeep,
          marginTop: 22 * k,
          opacity: rateP,
        }}
      >
        ★ 4,6 z 26 recenzí na Googlu · stav 8/2026
      </div>
    </div>
  );
};

/* ---------- Závěrečná brandová karta ---------- */
const Card: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const op = interpolate(frame, [T_CTA - XF, T_CTA], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;

  const sp = (delay: number) =>
    spring({frame: frame - T_CTA - delay, fps, config: {damping: 200}, durationInFrames: F(1.0)});

  const logo = sp(0);
  const claim = sp(F(0.22));
  const addr = sp(F(0.46));
  const cta = sp(F(0.72));
  const recap = sp(F(1.0));
  const pulse = 1 + Math.sin(Math.max(0, frame - T_CTA - F(1.1)) / 13) * 0.014;
  const shine = interpolate((frame - T_CTA) % F(2.4), [0, F(1.0)], [-30, 130], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{opacity: op}}>
      {/* rozostřená výloha z Americké jako teplé pozadí */}
      <Img
        src={staticFile('nakup/vyloha.jpg')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(70px) brightness(0.34) saturate(1.15)',
          transform: `scale(${1.25 + Math.min(1, Math.max(0, (frame - T_CTA) / F(3.2))) * 0.06})`,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, rgba(255,228,92,0.08), rgba(7,7,7,0.86) 62%)'}} />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 28 * k,
          padding: `0 ${M * k}px`,
        }}
      >
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
          Přijďte si pro
          <br />
          <span style={{color: C.yellow}}>nové brýle.</span>
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
          Zastav se za námi 👓
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
          // měření zraku · obruba · brýlová skla · servis
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Reel ---------- */
export const ReelNakup: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  /* Pás se na začátku 1. kroku stáhne z háčkové výšky do provozní — signaturní pohyb. */
  const morph = interpolate(frame, [T_S1 - F(0.55), T_S1 + F(0.15)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const bandTop = HOOK_TOP + (BAND_TOP - HOOK_TOP) * morph;
  const bandH = HOOK_H + (BAND_H - HOOK_H) * morph;
  const bandOp = interpolate(frame, [T_CTA - XF, T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const hdrOp = interpolate(frame, [0, 8, T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const vol = interpolate(
    frame,
    [0, F(0.8), NAKUP_DURATION - F(2.2), NAKUP_DURATION],
    [0, 0.9, 0.9, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-nakup.wav')} volume={vol} />

      {/* barevný nádech z právě běžící fotky */}
      <AbsoluteFill style={{opacity: bandOp}}>
        {SHOTS.map((s) => (
          <Wash key={`w-${s.src}`} shot={s} />
        ))}
      </AbsoluteFill>

      {/* FILMOVÝ PÁS s reálnou fotkou prodejny */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: bandTop * k,
          height: bandH * k,
          overflow: 'hidden',
          boxSizing: 'border-box',
          borderTop: `${2 * k}px solid rgba(244,241,234,0.16)`,
          borderBottom: `${2 * k}px solid rgba(244,241,234,0.16)`,
          opacity: bandOp,
        }}
      >
        {SHOTS.map((s) => (
          <BandPhoto key={s.src} shot={s} k={k} />
        ))}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(180deg, rgba(7,7,7,0.34) 0%, transparent 22%, transparent 62%, rgba(7,7,7,0.66) 100%)',
          }}
        />
      </div>

      {/* ukazatel postupu */}
      <Rail k={k} />

      {/* sekce */}
      <Hook k={k} />
      <StepText
        badge="KROK 01"
        head={['Změříme', 'zrak']}
        detail="Na moderních přístrojích přímo na prodejně, bez čekání u lékaře. Obvykle 30 až 45 minut."
        note="Při pořízení kompletních dioptrických brýlí je měření zraku zdarma"
        from={T_S1}
        to={T_S2}
        k={k}
      />
      <StepText
        badge="KROK 02"
        head={['Vybereme', 'obrubu']}
        detail="V klidu a spolu — zkoušejte, kolik chcete. Velký výběr obrub máte na jednom místě."
        note="+ praktický klip: nacvaknete ho a máte sluneční brýle"
        from={T_S2}
        to={T_S3}
        k={k}
      />
      <StepText
        badge="KROK 03"
        head={['Doporučíme']}
        head2={['brýlová', 'skla']}
        detail="Jednoohnisková i víceohnisková."
        chips={['multifokální', 'bifokální', 'pro řidiče', 's filtrem modrého světla', 'dětská MiYOSMART']}
        from={T_S3}
        to={T_S4}
        k={k}
      />
      <StepText
        badge="KROK 04"
        head={['Seřídíme']}
        head2={['a', 'staráme', 'se', 'dál']}
        detail="Seřízení, drobné opravy i výměnu nosníků zvládneme obvykle na počkání."
        note="Otevřeno Po–Čt 8:30–17:00 · Pá 8:30–16:00"
        from={T_S4}
        to={T_WHY}
        k={k}
      />
      <Why k={k} />
      <Card k={k} />

      {/* hlavička */}
      <div
        style={{
          position: 'absolute',
          top: 96 * k,
          left: M * k,
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
          right: M * k,
          fontFamily: MONO,
          fontSize: 20 * k,
          color: C.dim,
          opacity: hdrOp,
        }}
      >
        // Plzeň
      </div>

      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,0.5) 100%)'}}
      />
      <Grain />
    </AbsoluteFill>
  );
};
