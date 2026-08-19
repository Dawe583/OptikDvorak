import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BODY, BrandCard, C, F, Grain, Header, HeadWords, Hi, HookBlock, M, MONO,
  Photo, punch, Shot, useScale, Vignette, Wash, XF,
} from './kit';

/* REEL — „Pálí vás oči po dni u počítače?": brýlová skla s filtrem modrého
   světla a skla na práci u obrazovky. Publikum, které žádný z dosavadních
   Reelů neoslovuje — lidé v kanceláři.

   Vizuální podpis: STUDENÉ SVĚTLO, KTERÉ SE OTEPLÍ. Háček i první bod běží
   v modrém nádechu obrazovky; ve chvíli, kdy se mluví o filtru, se celý obraz
   během půl vteřiny přebarví do teplého tónu a štítek v rohu přeskočí z
   „BEZ FILTRU" na „S FILTREM". Ten jeden přechod vysvětlí produkt beze slov
   a nikde jinde na profilu není.

   ČASOVÁ OSA (18,75 s = 1125 snímků, mřížka 0,625 s = 96 BPM):
     0,000–2,500   HÁČEK   „Pálí vás oči po práci?"
     2,500–5,625   BOD 01  osm hodin na jednu vzdálenost
     5,625–8,750   BOD 02  filtr modrého světla  ← tady se obraz otepluje
     8,750–11,875  BOD 03  jiná skla pro řidiče, jiná k monitoru
    11,875–15,000  BOD 04  při měření se ptáme, na co brýle potřebujete
    15,000–18,750  CTA

   Tvrzení jsou z homepage („filtry modrého světla k počítači", „Pro řidiče
   i k PC") a z mereni-zraku.html („Zajímá nás, na co brýle nejvíc potřebujete:
   čtení, počítač, řízení, sport"). Žádné zdravotní účinky filtru se netvrdí —
   ověřené je jen to, že ta skla nabízíme a poradíme s výběrem. */

const T_S1 = F(2.5), T_S2 = F(5.625), T_S3 = F(8.75), T_S4 = F(11.875), T_CTA = F(15.0);
export const POCITAC_DURATION = F(18.75);
const STARTS = [T_S1, T_S2, T_S3, T_S4];
const WIN_X = 90, WIN_W = 900, WIN_TOP = 300, WIN_H = 600, TEXT_TOP = 1000;

const SHOTS: Shot[] = [
  {src: 'pocitac/hook.jpg', from: 0, to: T_S1, dir: 'in'},
  {src: 'pocitac/krok1.jpg', from: T_S1, to: T_S2, dir: 'out'},
  {src: 'pocitac/krok2.jpg', from: T_S2, to: T_S3, dir: 'in'},
  {src: 'pocitac/krok3.jpg', from: T_S3, to: T_CTA, dir: 'out'},
];

const Beat: React.FC<{index: number; head: string[]; detail: React.ReactNode; k: number}> = ({index, head, detail, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const from = STARTS[index];
  const to = STARTS[index + 1] ?? T_CTA;
  const op = interpolate(frame, [from - XF, from, to - XF, to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (op <= 0.002) return null;
  const det = spring({frame: frame - from - F(0.4), fps, config: {damping: 200}, durationInFrames: F(0.8)});
  return (
    <div style={{position: 'absolute', left: M * k, right: M * k, top: TEXT_TOP * k, opacity: op}}>
      <HeadWords words={head} startAt={from + 4} k={k} size={76} />
      <div style={{marginTop: 26 * k, fontFamily: BODY, fontWeight: 600, fontSize: 33 * k, lineHeight: 1.42,
        color: C.soft, opacity: det, transform: `translateY(${(1 - det) * 16 * k}px)`, maxWidth: 850 * k}}>
        {detail}
      </div>
    </div>
  );
};

export const ReelPocitac: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useScale();

  /* studený nádech obrazovky, který se u druhého bodu otepluje */
  const warm = interpolate(frame, [T_S2 - F(0.15), T_S2 + F(0.5)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });

  const bodyOp = interpolate(frame, [T_CTA - F(0.5), T_CTA - F(0.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hdrOp = interpolate(frame, [T_S1 - F(0.2), T_S1 + F(0.3), T_CTA - XF, T_CTA - F(0.05)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const vol = interpolate(frame, [0, F(0.8), POCITAC_DURATION - F(2.0), POCITAC_DURATION], [0, 0.9, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Audio src={staticFile('music-pocitac.wav')} volume={vol} />

      <AbsoluteFill style={{opacity: bodyOp, transform: `scale(${punch(frame)})`}}>
        {SHOTS.map((s) => <Wash key={`w-${s.src}`} shot={s} strength={0.5} />)}

        <div style={{position: 'absolute', left: WIN_X * k, top: WIN_TOP * k, width: WIN_W * k, height: WIN_H * k,
          borderRadius: 20 * k, overflow: 'hidden', boxShadow: `0 ${20 * k}px ${70 * k}px rgba(0,0,0,0.55)`}}>
          {SHOTS.map((s) => <Photo key={s.src} shot={s} />)}
          <div style={{position: 'absolute', inset: 0, mixBlendMode: 'color',
            background: `rgb(${Math.round(60 + warm * 160)}, ${Math.round(110 + warm * 70)}, ${Math.round(255 - warm * 130)})`,
            opacity: 0.55 - warm * 0.28}} />
          <div style={{position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(7,7,7,0.24) 0%, transparent 26%, transparent 68%, rgba(7,7,7,0.5) 100%)'}} />
          <div style={{position: 'absolute', right: 22 * k, top: 20 * k, fontFamily: MONO, fontWeight: 700,
            fontSize: 21 * k, letterSpacing: '0.14em', padding: `${8 * k}px ${16 * k}px`, borderRadius: 6 * k,
            background: warm > 0.5 ? C.yellow : 'rgba(120,180,255,0.92)', color: C.ink900}}>
            {warm > 0.5 ? 'S FILTREM' : 'BEZ FILTRU'}
          </div>
        </div>

        <HookBlock k={k} until={T_S1} top={TEXT_TOP} kicker="// PRÁCE U POČÍTAČE"
          lines={[['Pálí', 'vás', 'oči'], ['po', 'práci?']]}
          sub="Osm hodin koukáte na jednu vzdálenost." loop="4 věci, co s tím jde dělat" size={94} />

        <Beat index={0} head={['Osm', 'hodin', 'nastejno']}
          detail={<>Monitor máte pořád <Hi start={T_S1}>ve stejné vzdálenosti</Hi>. Oči, které to nemají čím vyrovnat, se ozvou.</>} k={k} />
        <Beat index={1} head={['Filtr', 'modrého', 'světla']}
          detail={<>Do brýlových skel umíme dodat <Hi start={T_S2}>filtr modrého světla</Hi> k počítači. Poradíme, jestli je pro vás vhodný.</>} k={k} />
        <Beat index={2} head={['Jiná', 'skla', 'k', 'PC']}
          detail={<>Jiná skla potřebuje řidič, jiná člověk <Hi start={T_S3}>u monitoru</Hi>. Nejsou to tytéž brýle.</>} k={k} />
        <Beat index={3} head={['Zeptáme', 'se', 'napřed']}
          detail={<>Při měření nás zajímá, na co brýle nejvíc potřebujete: <Hi start={T_S4}>čtení, počítač, řízení, sport</Hi>.</>} k={k} />
      </AbsoluteFill>

      <BrandCard k={k} at={T_CTA} bg="nakup/vyloha.jpg"
        claim={['Přijďte to', 'probrat.']} pill="Objednat měření 👓"
        recap="// filtr modrého světla · skla k PC · pro řidiče" />

      <Header k={k} opacity={hdrOp} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
