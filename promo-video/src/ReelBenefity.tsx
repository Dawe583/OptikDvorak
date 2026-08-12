import {Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  C,
  Card,
  Cta,
  Eyebrow,
  F,
  Fineprint,
  HeadWords,
  MONO,
  Note,
  PanoShot,
  PhotoShot,
  ReelShell,
  totalDuration,
  useScale,
} from './reel-kit';

/* REEL 5/5 — „Máte body od zaměstnavatele?" (benefitní poukázky, 21,8 s)

   Cíl: nejpřímočařejší důvod přijít z celé pětice. Spousta lidí má
   u zaměstnavatele body, o kterých ani neví, že se dají utratit za
   brýle — a spousta z nich je nechá propadnout. Video jen řekne, že
   je tady přijímáme, a pozve je dovnitř.

   Časová osa (absolutní sekundy, sedí s scripts/make-audio-kampan.mjs):
    0,0–3,4   HÁČEK     „Máte body od zaměstnavatele?"
    3,0–6,6   PROGRAMY  čtyři loga: Edenred, Pluxee, Up, Benefit Plus
    6,2–9,6   PRAVIDLA  doslovná věta z webu, na co se dají uplatnit
    9,2–12,6  FOTKA     vitríny — vyberete si na místě
   12,2–15,4  POZVÁNÍ   nevíte, jestli to jde? zeptejte se
   15,0–18,0  PANORAMA  „Stavte se na Americké."
   17,6–21,8  CTA       logo, telefon, adresa, otevírací doba

   Obsah: akce.html, karta Benefity. Věta o uplatnění je doslovná, včetně
   podmínky „podle podmínek daného programu" — ta tam být musí, protože
   každý program má vlastní pravidla a optika je neurčuje.

   Loga programů jsou stejné soubory jako na webu (public/img/benefit-*).
   Jsou to loga platebních programů, které optika opravdu přijímá —
   žádné partnerství se z nich nevyvozuje. */

const D = [F(3.4), F(3.6), F(3.4), F(3.4), F(3.2), F(3.0), F(4.2)];
export const BENEFITY_DURATION = totalDuration(D);

const Hook = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 40%" padBottom={130}>
      <Eyebrow k={k}>// zaměstnanecké benefity</Eyebrow>
      <HeadWords words={['Máte', 'body']} startAt={F(0.1)} k={k} size={116} />
      <HeadWords words={['od', 'zaměstnavatele?']} startAt={F(0.3)} k={k} size={82} dot />
      <Note at={F(1.2)} k={k} size={44}>
        Dají se u nás utratit za brýle.
      </Note>
    </Card>
  );
};

/* Jedno logo na světlé dlaždici — barevná loga by se na tmavém pozadí ztratila. */
const Tile: React.FC<{src: string; label: string; at: number; k: number; h: number}> = ({
  src,
  label,
  at,
  k,
  h,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 160}});
  return (
    <div
      style={{
        background: '#F4F1EA',
        borderRadius: 26 * k,
        height: 150 * k,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `0 ${28 * k}px`,
        opacity: Math.min(1, p * 1.4),
        transform: `scale(${0.88 + p * 0.12})`,
        boxShadow: `0 ${10 * k}px ${34 * k}px rgba(0,0,0,0.45)`,
      }}
    >
      <Img src={staticFile(src)} alt={label} style={{height: h * k, width: 'auto', objectFit: 'contain'}} />
    </div>
  );
};

const Programs = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const tail = spring({frame: frame - F(2.1), fps, config: {damping: 200}, durationInFrames: F(0.9)});
  return (
    <Card glowAt="50% 44%">
      <Eyebrow k={k} mb={26}>
        // přijímáme benefitní poukázky
      </Eyebrow>
      <HeadWords words={['Tyhle', 'programy']} startAt={F(0.05)} k={k} size={80} />
      <HeadWords words={['u', 'nás', 'projdou.']} startAt={F(0.22)} k={k} size={80} dot />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 22 * k,
          marginTop: 50 * k,
        }}
      >
        <Tile src="kampan/benefit-edenred.webp" label="Edenred" at={F(0.7)} k={k} h={54} />
        <Tile src="kampan/benefit-pluxee.webp" label="Pluxee" at={F(0.95)} k={k} h={42} />
        <Tile src="kampan/benefit-up.webp" label="Up Česká republika" at={F(1.2)} k={k} h={92} />
        <Tile src="kampan/benefit-plus.webp" label="Benefit Plus" at={F(1.45)} k={k} h={128} />
      </div>
      <div
        style={{
          marginTop: 40 * k,
          fontFamily: MONO,
          fontSize: 24 * k,
          color: 'rgba(244,241,234,0.5)',
          opacity: tail,
        }}
      >
        // Edenred · Pluxee · Up · Benefit Plus
      </div>
    </Card>
  );
};

const Rules = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 42%">
      <Eyebrow k={k}>// na co je uplatníte</Eyebrow>
      {/* Doslovná formulace z akce.html — včetně podmínky na konci. */}
      <HeadWords words={['Na', 'brýle,', 'skla']} startAt={F(0.1)} k={k} size={92} />
      <HeadWords words={['i', 'další', 'sortiment.']} startAt={F(0.3)} k={k} size={92} dot />
      <Note at={F(1.0)} k={k} size={38}>
        Podle podmínek daného programu — každý má vlastní pravidla a my je neurčujeme.
      </Note>
      <Fineprint at={F(1.7)} k={k} mt={32} lines={['// rádi vám to na místě spočítáme']} />
    </Card>
  );
};

const Invite = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 42%">
      <Eyebrow k={k}>// nevíte, jestli to půjde?</Eyebrow>
      <HeadWords words={['Zavolejte']} startAt={F(0.1)} k={k} size={100} />
      <HeadWords words={['a', 'zeptejte', 'se.']} startAt={F(0.3)} k={k} size={100} dot />
      <Note at={F(1.0)} k={k}>
        Řekneme vám rovnou, jestli váš program u nás projde a co k tomu potřebujete.
      </Note>
      <div style={{marginTop: 40 * k, fontFamily: MONO, fontSize: 30 * k, color: C.yellowDeep}}>
        +420 702 194 246
      </div>
    </Card>
  );
};

export const ReelBenefity = () => (
  <ReelShell
    duration={BENEFITY_DURATION}
    music="music-benefity.wav"
    scenes={[
      {d: D[0], el: <Hook />},
      {d: D[1], el: <Programs />},
      {d: D[2], el: <Rules />},
      {
        d: D[3],
        el: (
          <PhotoShot
            src="optika/opt-0691.jpg"
            focus="50% 46%"
            dir="out"
            mono="// vitríny plné obrub přímo na Americké"
            line1="Vyberete si"
            line2="na místě."
          />
        ),
      },
      {d: D[4], el: <Invite />},
      {
        d: D[5],
        el: (
          <PanoShot
            from={2000}
            to={3600}
            mono="// rodinná oční optika na Americké od roku 1991"
            line1="Stavte se"
            line2="na Americké."
          />
        ),
      },
      {
        d: D[6],
        el: (
          <Cta
            claim1="Benefity u nás"
            claim2="uplatníte."
            button="Zavolejte nám 👓"
            notes={['// podle podmínek daného programu', '// Americká 325/23, Plzeň']}
          />
        ),
      },
    ]}
  />
);
