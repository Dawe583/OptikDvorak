import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
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

/* REEL — „Střídáte dvoje brýle?": multifokální brýlová skla.
   Míří na publikum 45+, které nosí zvlášť brýle na čtení a zvlášť na dálku.
   Na profilu zatím nic takového není a je to nejdražší položka sortimentu.

   Vizuální podpis: DĚLICÍ ČÁRA V OKNĚ. Přes fotku běží vodorovný předěl
   se štítky NA DÁLKU (nahoře) a NA ČTENÍ (dole) — přesně tak, jak funguje
   multifokální sklo. Předěl v průběhu videa klesá a v posledním bodě zmizí,
   protože obojí je nakonec v jedněch brýlích.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM,
   musí sedět s scripts/make-audio-nove-reels.mjs):
     0,000–2,500   HÁČEK   „Brýle na čtení. Brýle na dálku."
     2,500–5,625   BOD 01  multifokální skla = obojí v jedněch
     5,625–8,750   BOD 02  zvyknete si během několika dní až dvou týdnů
     8,750–11,875  BOD 03  když adaptace nejde, doladíme
    11,875–15,000  BOD 04  poradíme i další skla (řidiči, filtr, klip)
    15,000–18,750  CTA

   FOTKY (public/multi/, poměr okna 1980:1320):
     hook.jpg   img/ai/lenses-big.jpg      dvoje brýle vedle sebe na černé
     krok1.jpg  img/ai/lenses-reading.jpg  pán s kávou a novinami
     krok2.jpg  img/ai/ridic-bryle.jpg     řidička za volantem
     krok3.jpg  img/senior-glasses.jpg     usměvavý pán v brýlích
     krok4.jpg  img/hero/od-redhead.webp   žena v brýlích ve městě

   Tvrzení o adaptaci jsou doslova z FAQ na homepage. Slovo „značkové" se
   nepoužívá a konkrétní výrobci se nejmenují (přání majitelky). Akce
   „multifokální 1+1" ve videu schválně NENÍ — sezónní nabídka by video
   znehodnotila ve chvíli, kdy skončí. Patří do popisku, ne do obrazu. */

const T_S1 = F(2.5);
const T_S2 = F(5.625);
const T_S3 = F(8.75);
const T_S4 = F(11.875);
const T_CTA = F(15.0);
export const MULTI_DELIC_DURATION = F(18.75);

const STARTS = [T_S1, T_S2, T_S3, T_S4];

/* Rozvržení 1080 × 1920 */
const WIN_X = 90;
const WIN_W = 900;
const WIN_TOP = 340;
const WIN_H = 600;
const TEXT_TOP = 1010;

const SHOTS: Shot[] = [
  {src: 'multi/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'multi/krok1.jpg', from: T_S1, to: T_S2, dir: 'out'},
  {src: 'multi/krok2.jpg', from: T_S2, to: T_S3, dir: 'in'},
  {src: 'multi/krok3.jpg', from: T_S3, to: T_S4, dir: 'out'},
  {src: 'multi/krok4.jpg', from: T_S4, to: T_CTA, dir: 'in'},
];

/* ---------- Dělicí čára se štítky ---------- */
const Divider: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  /* předěl postupně klesá — a v posledním bodě se rozplyne */
  const y = interpolate(frame, [F(0.6), T_S1, T_S2, T_S3], [0.42, 0.5, 0.58, 0.64], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const inOp = interpolate(frame, [F(0.5), F(1.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outOp = interpolate(frame, [T_S4 - F(0.4), T_S4 + F(0.2)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const op = inOp * outOp;
  if (op <= 0.002) return null;

  /* štítky sedí u protilehlých rohů okna, ať se u předělu nepotkají */
  const label = (text: string, top: boolean) => (
    <div
      style={{
        position: 'absolute',
        left: 22 * k,
        [top ? 'top' : 'bottom']: 18 * k,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 22 * k,
        letterSpacing: '0.18em',
        color: C.ink900,
        background: C.yellow,
        padding: `${8 * k}px ${16 * k}px`,
        borderRadius: 6 * k,
      }}
    >
      {text}
    </div>
  );

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: `${y * 100}%`}}>{label('NA DÁLKU', true)}</div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${y * 100}%`,
          height: 3 * k,
          background: 'rgba(255,228,92,0.85)',
          boxShadow: `0 0 ${20 * k}px rgba(255,228,92,0.6)`,
        }}
      />
      <div style={{position: 'absolute', left: 0, right: 0, top: `${y * 100}%`, bottom: 0}}>
        {label('NA ČTENÍ', false)}
      </div>
    </div>
  );
};

/* Když předěl zmizí, nastoupí místo něj jeden štítek */
const OneLabel: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - T_S4 - F(0.15), fps, config: {damping: 13, stiffness: 190}});
  const out = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (p <= 0.002) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 22 * k,
        bottom: 18 * k,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 22 * k,
        letterSpacing: '0.18em',
        color: C.ink900,
        background: C.yellow,
        padding: `${8 * k}px ${16 * k}px`,
        borderRadius: 6 * k,
        opacity: p * out,
        transform: `scale(${0.85 + p * 0.15})`,
        transformOrigin: 'left bottom',
      }}
    >
      JEDNY BRÝLE
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
      <HeadWords words={head} startAt={from + 4} k={k} size={78} />
      <div
        style={{
          marginTop: 28 * k,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 33 * k,
          lineHeight: 1.42,
          color: C.soft,
          opacity: det,
          transform: `translateY(${(1 - det) * 16 * k}px)`,
          maxWidth: 850 * k,
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
    <div style={{position: 'absolute', left: M * k, right: M * k, top: (TEXT_TOP - 10) * k, opacity: op}}>
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
        // MULTIFOKÁLNÍ SKLA
      </div>
      <HeadWords words={['Střídáte']} startAt={8} k={k} size={94} />
      <div style={{height: 8 * k}} />
      <HeadWords words={['dvoje', 'brýle?']} startAt={22} k={k} size={94} color={C.yellow} dot />
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
        Jedny na čtení, druhé na dálku. A pořád je hledáte.
      </div>
    </div>
  );
};

/* ---------- Reel ---------- */
export const ReelMultifokalyDelic: React.FC = () => {
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
  const vol = interpolate(frame, [0, F(0.8), MULTI_DELIC_DURATION - F(2.0), MULTI_DELIC_DURATION], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-multi.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp}}>
        {SHOTS.map((s) => (
          <Wash key={`w-${s.src}`} shot={s} strength={0.5} />
        ))}
      </AbsoluteFill>

      {/* okno s fotkou a dělicí čárou */}
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
            background: 'linear-gradient(180deg, rgba(7,7,7,0.28) 0%, transparent 24%, transparent 70%, rgba(7,7,7,0.5) 100%)',
          }}
        />
        <Divider k={k} />
        <OneLabel k={k} />
      </div>

      <Hook k={k} />
      <Beat
        index={0}
        head={['Obojí', 'v', 'jedněch']}
        detail={<>Multifokální skla vidí <Hi start={T_S1}>na dálku i na čtení</Hi>. Žádné přendávání a hledání po bytě.</>}
        k={k}
      />
      <Beat
        index={1}
        head={['Zvyknete', 'si']}
        detail={<>Většina lidí <Hi start={T_S2}>během několika dní až dvou týdnů</Hi>. V prvních dnech je noste pravidelně.</>}
        k={k}
      />
      <Beat
        index={2}
        head={['A', 'když', 'ne?']}
        detail={<>Přijďte za námi. Brýle <Hi start={T_S3}>zkontrolujeme a doladíme</Hi>, dokud vám nebudou sedět.</>}
        k={k}
      />
      <Beat
        index={3}
        head={['Poradíme', 'i', 'další']}
        detail={
          <>
            Skla pro řidiče, filtr modrého světla k počítači nebo <Hi start={T_S4}>klip</Hi>, ze kterého jedním
            nacvaknutím uděláte sluneční brýle.
          </>
        }
        k={k}
      />

      <BrandCard
        k={k}
        at={T_CTA}
        bg="nakup/vyloha.jpg"
        claim={['Jedny brýle', 'místo dvojích.']}
        pill="Objednat měření 👓"
        recap="// multifokální · bifokální · pro řidiče · filtr modrého světla"
      />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
