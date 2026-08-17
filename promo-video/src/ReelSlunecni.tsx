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
  HookBlock,
  M,
  MONO,
  Photo,
  punch,
  Shot,
  useScale,
  Vignette,
  Wash,
  XF,
} from './kit';

/* REEL — „V létě mhouříte oči?": sluneční brýle a klip na dioptrické obruby.
   Téma, které nemá ani jedna z dosavadních řad, a přitom je to nejlevnější
   způsob, jak přimět člověka s dioptrickými brýlemi přijít na prodejnu.

   Vizuální podpis: KLIP, KTERÝ CVAKNE. Přes okno s fotkou sjede shora tmavý
   pruh — přesně jako když nacvaknete klip na obrubu — a obraz pod ním rázem
   ztmavne do jantarova. Ten jeden pohyb vysvětlí produkt beze slov a nikde
   jinde na profilu se neopakuje.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM):
     0,000–2,500   HÁČEK   „Mhouříte v létě oči?"
     2,500–5,625   BOD 01  klip: jedním nacvaknutím sluneční brýle
     5,625–8,750   BOD 02  dioptrické sluneční brýle
     8,750–11,875  BOD 03  100% UV ochrana
    11,875–15,000  BOD 04  vybereme spolu, ať sedí i sluší
    15,000–18,750  CTA

   FOTKY (public/slunecni/, poměr okna 1980:1320):
     hook.jpg   img/ai/akce-slunecni.jpg     sluneční brýle
     krok1.jpg  img/glasses-round.jpg        sluneční brýle v protisvětle
     krok2.jpg  img/ai/galerie-slunecni.jpg  sluneční kolekce
     krok3.jpg  img/ai/ridic-bryle.jpg       řidička ve slunečních brýlích

   Tvrzení jsou z homepage: „K dioptrickým obrubám nabídneme i praktický klip.
   Jedním nacvaknutím z nich uděláte sluneční brýle." a „Sluneční brýle ·
   100% UV ochrana". Nic o zdravotních účincích se netvrdí. */

const T_S1 = F(2.5);
const T_S2 = F(5.625);
const T_S3 = F(8.75);
const T_S4 = F(11.875);
const T_CTA = F(15.0);
export const SLUNECNI_DURATION = F(18.75);
const STARTS = [T_S1, T_S2, T_S3, T_S4];

const WIN_X = 90;
const WIN_W = 900;
const WIN_TOP = 300;
const WIN_H = 600;
const TEXT_TOP = 1000;

const SHOTS: Shot[] = [
  {src: 'slunecni/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'slunecni/krok1.jpg', from: T_S1, to: T_S2, dir: 'out'},
  {src: 'slunecni/krok2.jpg', from: T_S2, to: T_S3, dir: 'in'},
  {src: 'slunecni/krok3.jpg', from: T_S3, to: T_CTA, dir: 'out'},
];

/* ---------- Klip: sjede shora a ztmaví obraz pod sebou ---------- */
const Klip: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  /* cvakne přesně na začátku prvního bodu, kde se o něm mluví */
  const drop = spring({frame: frame - T_S1 + F(0.25), fps, config: {damping: 12, stiffness: 200}});
  const off = interpolate(frame, [T_S3 - F(0.35), T_S3], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const a = drop * off;
  if (a <= 0.002) return null;

  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {/* jantarové sklo klipu */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '100%',
          background: 'linear-gradient(180deg, rgba(92,58,10,0.72), rgba(52,32,6,0.62))',
          opacity: a,
          transform: `translateY(${(1 - drop) * -100}%)`,
        }}
      />
      {/* kovový rámeček klipu */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 10 * k,
          background: 'linear-gradient(180deg, rgba(244,241,234,0.9), rgba(160,155,145,0.7))',
          opacity: a,
          transform: `translateY(${(1 - drop) * -600}%)`,
          boxShadow: `0 ${8 * k}px ${24 * k}px rgba(0,0,0,0.5)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 26 * k,
          top: 24 * k,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 22 * k,
          letterSpacing: '0.16em',
          color: C.ink900,
          background: C.yellow,
          padding: `${8 * k}px ${16 * k}px`,
          borderRadius: 6 * k,
          opacity: a,
        }}
      >
        KLIP
      </div>
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
          maxWidth: 850 * k,
        }}
      >
        {detail}
      </div>
    </div>
  );
};

/* ---------- Reel ---------- */
export const ReelSlunecni: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  const bodyOp = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const hdrOp = interpolate(frame, [T_S1 - F(0.2), T_S1 + F(0.3), T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const vol = interpolate(frame, [0, F(0.8), SLUNECNI_DURATION - F(2.0), SLUNECNI_DURATION], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-slunecni.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp, transform: `scale(${punch(frame)})`}}>
        {SHOTS.map((s) => (
          <Wash key={`w-${s.src}`} shot={s} strength={0.5} />
        ))}

        <div
          style={{
            position: 'absolute',
            left: WIN_X * k,
            top: WIN_TOP * k,
            width: WIN_W * k,
            height: WIN_H * k,
            borderRadius: 20 * k,
            overflow: 'hidden',
            boxShadow: `0 ${20 * k}px ${70 * k}px rgba(0,0,0,0.55)`,
          }}
        >
          {SHOTS.map((s) => (
            <Photo key={s.src} shot={s} />
          ))}
          <Klip k={k} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(7,7,7,0.22) 0%, transparent 26%, transparent 68%, rgba(7,7,7,0.5) 100%)',
            }}
          />
        </div>

        <HookBlock
          k={k}
          until={T_S1}
          top={TEXT_TOP}
          kicker="// SLUNEČNÍ BRÝLE"
          lines={[['Mhouříte', 'v', 'létě'], ['oči?']]}
          sub="A druhé brýle s sebou tahat nechcete."
          loop="řešení má 4 slova"
          size={96}
        />

        <Beat
          index={0}
          head={['Nacvakněte', 'si', 'klip']}
          detail={<>K dioptrickým obrubám nabídneme praktický klip. <Hi start={T_S1}>Jedním nacvaknutím</Hi> z nich uděláte sluneční brýle.</>}
          k={k}
        />
        <Beat
          index={1}
          head={['Nebo', 'rovnou', 'dvoje']}
          detail={<>Máme i <Hi start={T_S2}>dioptrické sluneční brýle</Hi> — když chcete mít na léto samostatný pár.</>}
          k={k}
        />
        <Beat
          index={2}
          head={['Vždycky', 's', 'ochranou']}
          detail={<>Sluneční brýle u nás mají <Hi start={T_S3}>100% UV ochranu</Hi>. Tmavé sklo bez ní je horší než žádné.</>}
          k={k}
        />
        <Beat
          index={3}
          head={['Vybereme', 'je', 'spolu']}
          detail={<>Zkoušejte, kolik chcete. Sluneční brýle nosíte na očích celé léto — musí <Hi start={T_S4}>sedět i slušet</Hi>.</>}
          k={k}
        />
      </AbsoluteFill>

      <BrandCard
        k={k}
        at={T_CTA}
        bg="nakup/vyloha.jpg"
        claim={['Přijďte si pro', 'sluneční.']}
        pill="Zastavte se u nás 👓"
        recap="// klip · dioptrické sluneční · 100% UV ochrana"
      />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
