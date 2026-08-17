import {AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BODY,
  BrandCard,
  C,
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

/* REEL — „Benefitkou od zaměstnavatele": benefitní poukázky v optice.
   Nejpraktičtější téma ze všech. Spousta lidí má u zaměstnavatele body
   a vůbec je nenapadne, že se dají utratit za brýle — a body na konci roku
   propadají. Zároveň se to přirozeně posílá kolegům, což je pro dosah
   to nejcennější.

   Vizuální podpis: KARTY. Čtyři programy naskáčou zespodu jako karty
   z balíčku, každá s vlastním nakloněním, a zůstanou dole po zbytek videa.
   Nic jiného na profilu nepracuje s kartami.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM,
   musí sedět s scripts/make-audio-nove-reels.mjs):
     0,000–2,500   HÁČEK   „Máte u zaměstnavatele body?"
     2,500–5,625   BOD 01  přijímáme benefitní poukázky (karty naskáčou)
     5,625–8,750   BOD 02  uplatníte je na brýle i skla
     8,750–11,875  BOD 03  každý program má vlastní pravidla
    11,875–15,000  BOD 04  a když body nemáte — měření ke kompletním brýlím zdarma
    15,000–18,750  CTA

   OBRÁZKY (public/benefity/):
     hook.jpg   optika/opt-0690.jpg  recepce s nápisem OPTIK DVOŘÁK
     konec.jpg  optika/opt-0691.jpg  vitríny a pult
     benefit-*.webp — loga programů, tatáž, která jsou na webu

   Programy odpovídají tomu, co je uvedené na homepage i na akce.html:
   Edenred, Pluxee, Up a Benefit Plus. Žádné podmínky ani limity se
   neslibují — web sám říká „podle podmínek daného programu". */

const T_S1 = F(2.5);
const T_S2 = F(5.625);
const T_S3 = F(8.75);
const T_S4 = F(11.875);
const T_CTA = F(15.0);
export const BENEFITY_KARTY_DURATION = F(18.75);

const STARTS = [T_S1, T_S2, T_S3, T_S4];

/* Rozvržení 1080 × 1920 */
const WIN_X = 90;
const WIN_W = 900;
const WIN_TOP = 300;
const WIN_H = 560;
const TEXT_TOP = 900;
const CARDS_TOP = 1168;
const CARD_W = 420;
const CARD_H = 160;
const CARD_GAP = 20;

const SHOTS: Shot[] = [
  {src: 'benefity/hook.jpg', from: 0, to: T_S3, dir: 'in'},
  {src: 'benefity/konec.jpg', from: T_S3, to: T_CTA, dir: 'out'},
];

/* Loga programů. Šířka v návrhových px je volená tak, aby optická váha
   log byla srovnatelná — zdrojové soubory mají hodně různý poměr stran. */
const CARDS = [
  {src: 'benefity/benefit-edenred.webp', w: 190, alt: 'Edenred'},
  {src: 'benefity/benefit-pluxee.webp', w: 210, alt: 'Pluxee'},
  {src: 'benefity/benefit-up.webp', w: 128, alt: 'Up Česká republika'},
  {src: 'benefity/benefit-plus.webp', w: 180, alt: 'Benefit Plus'},
];

/* ---------- Karta jednoho programu ---------- */
const Card: React.FC<{index: number; k: number; out: number}> = ({index, k, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  /* karty se rozdají jedna po druhé v rytmu půlky doby */
  const at = T_S1 + F(0.2) + index * F(0.3125);
  const p = spring({frame: frame - at, fps, config: {damping: 15, stiffness: 170}});
  if (p <= 0.002) return null;

  const col = index % 2;
  const row = Math.floor(index / 2);
  const left = (1080 - (CARD_W * 2 + CARD_GAP)) / 2 + col * (CARD_W + CARD_GAP);
  const top = CARDS_TOP + row * (CARD_H + CARD_GAP);
  const tilt = [-2.4, 1.8, 1.4, -2.0][index];
  const c = CARDS[index];

  return (
    <div
      style={{
        position: 'absolute',
        left: left * k,
        top: top * k,
        width: CARD_W * k,
        height: CARD_H * k,
        borderRadius: 20 * k,
        background: '#FFFFFF',
        display: 'grid',
        placeItems: 'center',
        boxShadow: `0 ${14 * k}px ${40 * k}px rgba(0,0,0,0.5)`,
        opacity: p * out,
        transform: `translateY(${(1 - p) * 70 * k}px) rotate(${tilt * p}deg) scale(${0.9 + p * 0.1})`,
      }}
    >
      <Img src={staticFile(c.src)} alt={c.alt} style={{width: c.w * k, height: 'auto'}} />
    </div>
  );
};

/* ---------- Textový blok jednoho bodu ---------- */
const Beat: React.FC<{index: number; head: string[]; detail: React.ReactNode; k: number}> = ({
  index,
  head,
  detail,
  k,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const from = STARTS[index];
  const to = STARTS[index + 1] ?? T_CTA;
  const op = interpolate(frame, [from - XF, from, to - XF, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;
  const det = spring({frame: frame - from - F(0.4), fps, config: {damping: 200}, durationInFrames: F(0.8)});

  return (
    <div style={{position: 'absolute', left: M * k, right: M * k, top: TEXT_TOP * k, opacity: op}}>
      <HeadWords words={head} startAt={from + 4} k={k} size={72} />
      <div
        style={{
          marginTop: 22 * k,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 31 * k,
          lineHeight: 1.4,
          color: C.soft,
          opacity: det,
          transform: `translateY(${(1 - det) * 14 * k}px)`,
          maxWidth: 860 * k,
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
  const sub = interpolate(frame, [F(1.35), F(1.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div style={{position: 'absolute', left: M * k, right: M * k, top: (TEXT_TOP - 20) * k, opacity: op}}>
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
        // BENEFITNÍ POUKÁZKY
      </div>
      <HeadWords words={['Máte', 'body', 'od']} startAt={8} k={k} size={88} />
      <div style={{height: 8 * k}} />
      <HeadWords words={['zaměstnavatele?']} startAt={24} k={k} size={88} color={C.yellow} />
      <div
        style={{
          marginTop: 30 * k,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 34 * k,
          lineHeight: 1.45,
          color: C.soft,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 16 * k}px)`,
        }}
      >
        Dají se u nás utratit za brýle.
      </div>
    </div>
  );
};

/* ---------- Reel ---------- */
export const ReelBenefityKarty: React.FC = () => {
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
  /* V posledním bodě už nejde o poukázky, ale nemazat je úplně — ustoupí
     do pozadí a zešednou. Řekne to „tohle se vás netýká" a zároveň nezůstane
     dole prázdná plocha. */
  const cardsOut = interpolate(frame, [T_S4 - F(0.35), T_S4 + F(0.1)], [1, 0.22], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const cardsGray = interpolate(frame, [T_S4 - F(0.35), T_S4 + F(0.1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const vol = interpolate(frame, [0, F(0.8), BENEFITY_KARTY_DURATION - F(2.0), BENEFITY_KARTY_DURATION], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-benefity-karty.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp}}>
        {SHOTS.map((s) => (
          <Wash key={`w-${s.src}`} shot={s} strength={0.5} />
        ))}
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: WIN_X * k,
          top: WIN_TOP * k,
          width: WIN_W * k,
          height: WIN_H * k,
          borderRadius: 20 * k,
          overflow: 'hidden',
          opacity: bodyOp * winIn,
          transform: `translateY(${(1 - winIn) * 30 * k}px)`,
          boxShadow: `0 ${20 * k}px ${70 * k}px rgba(0,0,0,0.55)`,
        }}
      >
        {SHOTS.map((s) => (
          <Photo key={s.src} shot={s} />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(7,7,7,0.26) 0%, transparent 26%, transparent 68%, rgba(7,7,7,0.5) 100%)',
          }}
        />
      </div>

      <Hook k={k} />
      <Beat
        index={0}
        head={['Přijímáme', 'je']}
        detail={<>Edenred, Pluxee, Up i Benefit Plus — <Hi start={T_S1}>čtyři programy</Hi>.</>}
        k={k}
      />
      <Beat
        index={1}
        head={['Uplatníte', 'je', 'na', 'brýle']}
        detail={<>Na obruby, <Hi start={T_S2}>brýlová skla</Hi> i další sortiment.</>}
        k={k}
      />
      <Beat
        index={2}
        head={['Pravidla', 'má', 'každý', 'svá']}
        detail={<>Na co přesně poukázka platí, se liší program od programu. <Hi start={T_S3}>Projdeme to s vámi</Hi> na prodejně.</>}
        k={k}
      />
      <Beat
        index={3}
        head={['A', 'když', 'body', 'nemáte?']}
        detail={<>Při pořízení kompletních dioptrických brýlí máte <Hi start={T_S4}>měření zraku zdarma</Hi>.</>}
        k={k}
      />

      {/* karty programů */}
      <div style={{opacity: bodyOp, filter: `grayscale(${cardsGray})`}}>
        {CARDS.map((c, i) => (
          <Card key={c.src} index={i} k={k} out={cardsOut} />
        ))}
      </div>

      <BrandCard
        k={k}
        at={T_CTA}
        bg="nakup/vyloha.jpg"
        claim={['Body propadají.', 'Brýle ne.']}
        pill="Zastavte se u nás 👓"
        recap="// Edenred · Pluxee · Up · Benefit Plus"
      />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
