import {useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {
  C,
  Card,
  Cta,
  Eyebrow,
  F,
  Fineprint,
  HeadWords,
  Note,
  NumItem,
  OfferBadge,
  PanoShot,
  PhotoShot,
  ReelShell,
  totalDuration,
  useScale,
  DISPLAY,
} from './reel-kit';

/* REEL 1/5 — „Do oka? To si nesáhnu." (kontaktní čočky, 22,6 s)

   Cíl: přivést na prodejnu lidi, kteří o čočkách přemýšlí, ale bojí se
   sáhnout si do oka. Ta obava je jediná skutečná překážka — video ji
   pojmenuje hned v první vteřině, uzemní ji („nikdo to nedá napoprvé")
   a nabídne konkrétní důvod přijít: zkušební pár zdarma.

   Časová osa (absolutní sekundy, sedí s scripts/make-audio-kampan.mjs):
    0,0–3,4   HÁČEK    „Do oka? To si nesáhnu."
    3,0–6,2   OTOČENÍ  „Nikdo to nedá napoprvé." + naučíme vás to
    5,8–9,2   PRODEJNA reálný záběr — všechno na jednom místě
    8,8–12,8  POSTUP   pět kroků aplikace (01–05)
   12,4–16,0  NABÍDKA  „Zkušební pár zdarma."
   15,6–18,8  PANORAMA „Přijďte si je vyzkoušet."
   18,4–22,6  CTA      logo, telefon, adresa, otevírací doba

   Obsah: doslovně z kontaktni-cocky.html. Nabídka „zkušební pár zdarma"
   je na webu i v pásu údajů, kroky aplikace taky. Zdravotní disclaimer
   („aplikace čoček v optice nenahrazuje lékařské vyšetření očí") je ve
   videu stejně jako na webu. */

const D = [F(3.4), F(3.2), F(3.4), F(4.0), F(3.6), F(3.2), F(4.2)];
export const COCKY_DURATION = totalDuration(D);

const Hook = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 40%" padBottom={130}>
      <Eyebrow k={k}>// slyšíme skoro každý týden</Eyebrow>
      <HeadWords words={['Do', 'oka?']} startAt={F(0.1)} k={k} size={118} />
      <HeadWords words={['To', 'si', 'nesáhnu.']} startAt={F(0.32)} k={k} size={118} dot />
      <Note at={F(1.25)} k={k} size={44}>
        Tuhle větu u nás slyší skoro každý, kdo o čočkách přemýšlí.
      </Note>
    </Card>
  );
};

const Turn = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 42%">
      <Eyebrow k={k}>// a víte co?</Eyebrow>
      <HeadWords words={['Nikdo', 'to', 'nedá']} startAt={F(0.1)} k={k} size={100} />
      <HeadWords words={['napoprvé.']} startAt={F(0.3)} k={k} size={100} dot />
      <Note at={F(0.95)} k={k}>
        Proto vás to v klidu naučíme — nasazovat i vyndavat. A vysvětlíme, jak o čočky pečovat.
      </Note>
    </Card>
  );
};

const Steps = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 44%">
      <Eyebrow k={k} mb={22}>
        // krok za krokem, bez stresu
      </Eyebrow>
      <HeadWords words={['Jak', 'aplikace']} startAt={F(0.05)} k={k} size={88} />
      <HeadWords words={['probíhá.']} startAt={F(0.2)} k={k} size={88} dot />
      <div style={{display: 'flex', flexDirection: 'column', gap: 22 * k, marginTop: 46 * k}}>
        <NumItem n={1} at={F(0.5)} k={k} text="Konzultace" size={44} />
        <NumItem n={2} at={F(0.95)} k={k} text="Měření zraku" size={44} />
        <NumItem n={3} at={F(1.4)} k={k} text="Výběr čoček" size={44} />
        <NumItem n={4} at={F(1.85)} k={k} text="Nácvik aplikace" size={44} />
        <NumItem n={5} at={F(2.3)} k={k} text="Kontrola" size={44} />
      </div>
      <Fineprint
        at={F(2.9)}
        k={k}
        mt={44}
        lines={['// denní, čtrnáctidenní i měsíční —', '// doporučíme podle vašich očí i režimu nošení']}
      />
    </Card>
  );
};

const Offer = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const tail = spring({frame: frame - F(1.0), fps, config: {damping: 200}, durationInFrames: F(0.8)});
  return (
    <Card glowAt="50% 44%">
      <Eyebrow k={k}>// co si odnesete hned</Eyebrow>
      <HeadWords words={['Zkušební', 'pár']} startAt={F(0.1)} k={k} size={96} />
      <div style={{marginTop: 14 * k}}>
        <OfferBadge text="zdarma." at={F(0.75)} k={k} size={150} />
      </div>
      <div
        style={{
          marginTop: 26 * k,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 52 * k,
          letterSpacing: '-0.03em',
          color: C.cream,
          opacity: tail,
          transform: `translateY(${(1 - tail) * 16 * k}px)`,
        }}
      >
        A objednáme vás na kontrolu.
      </div>
      <Fineprint
        at={F(1.6)}
        k={k}
        mt={38}
        lines={['// aplikace čoček v optice nenahrazuje', '// lékařské vyšetření očí']}
      />
    </Card>
  );
};

export const ReelCocky = () => (
  <ReelShell
    duration={COCKY_DURATION}
    music="music-cocky.wav"
    scenes={[
      {d: D[0], el: <Hook />},
      {d: D[1], el: <Turn />},
      {
        d: D[2],
        el: (
          <PhotoShot
            src="optika/opt-0690.jpg"
            focus="34% 46%"
            dir="in"
            mono="// konzultace, měření i výběr na jednom místě"
            line1="Všechno u nás"
            line2="na prodejně."
          />
        ),
      },
      {d: D[3], el: <Steps />},
      {d: D[4], el: <Offer />},
      {
        d: D[5],
        el: (
          <PanoShot
            from={2600}
            to={4300}
            mono="// rodinná oční optika na Americké od roku 1991"
            line1="Přijďte si je"
            line2="vyzkoušet."
          />
        ),
      },
      {
        d: D[6],
        el: (
          <Cta
            claim1="Objednejte se na"
            claim2="aplikaci čoček."
            button="Zavolejte nám 👓"
            notes={['// zkušební pár dostanete zdarma', '// Americká 325/23, Plzeň']}
          />
        ),
      },
    ]}
  />
);
