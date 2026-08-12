import {
  Card,
  Cta,
  Eyebrow,
  F,
  Fineprint,
  HeadWords,
  Note,
  OfferBadge,
  PanoShot,
  PhotoShot,
  ReelShell,
  totalDuration,
  useScale,
} from './reel-kit';

/* REEL 3/5 — „Na čtení jedny, na dálku druhé?" (multifokály 1 + 1, 21,8 s)

   Cíl: lidé kolem padesátky, kteří přendávají dvoje brýle. Háček je
   situace, kterou zná každý z nich, a nabídka je konkrétní: druhá skla
   zdarma. To je důvod přijít teď, ne někdy.

   Časová osa (absolutní sekundy, sedí s scripts/make-audio-kampan.mjs):
    0,0–3,2   HÁČEK    „Na čtení jedny, na dálku druhé?"
    2,8–6,2   ŘEŠENÍ   multifokální skla zvládnou obojí
    5,8–9,6   NABÍDKA  1 + 1 — druhá skla zdarma
    9,2–12,6  FOTKA    náhradní pár s sebou
   12,2–15,4  PŘÍSTUP  vysvětlíme rozdíly a nic nenutíme
   15,0–18,0  PANORAMA „Přijďte si to zkusit."
   17,6–21,8  CTA      logo, telefon, adresa, otevírací doba

   POZOR — akce. Na webu je u akcí věta „Uvedené akce jsou orientační
   a jejich platnost i podmínky vám rádi upřesníme na prodejně nebo
   telefonicky." Ve videu je proto u nabídky stejná poznámka. Než se
   Reel pustí, ověřte u majitelky, že akce 1 + 1 pořád platí. */

const D = [F(3.2), F(3.4), F(3.8), F(3.4), F(3.2), F(3.0), F(4.2)];
export const MULTIFOKAL_DURATION = totalDuration(D);

const Hook = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 40%" padBottom={130}>
      <Eyebrow k={k}>// znáte to?</Eyebrow>
      <HeadWords words={['Na', 'čtení', 'jedny,']} startAt={F(0.1)} k={k} size={100} />
      <HeadWords words={['na', 'dálku', 'druhé?']} startAt={F(0.32)} k={k} size={100} dot />
      <Note at={F(1.2)} k={k} size={44}>
        A jedny z nich věčně nemůžete najít.
      </Note>
    </Card>
  );
};

const Solution = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 42%">
      <Eyebrow k={k}>// jedny brýle místo dvojích</Eyebrow>
      <HeadWords words={['Multifokální', 'skla']} startAt={F(0.1)} k={k} size={86} />
      <HeadWords words={['zvládnou', 'obojí.']} startAt={F(0.3)} k={k} size={86} dot />
      <Note at={F(1.0)} k={k}>
        Na čtení, na počítač i na dálku. Poradíme, jestli jsou pro vás vhodná — a jak si na ně zvyknout.
      </Note>
    </Card>
  );
};

const Offer = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 40%">
      <Eyebrow k={k}>// sezónní akce</Eyebrow>
      <div style={{marginTop: 6 * k, marginBottom: 26 * k}}>
        <OfferBadge text="1 + 1" at={F(0.15)} k={k} size={210} />
      </div>
      <HeadWords words={['Druhá', 'skla']} startAt={F(0.75)} k={k} size={90} />
      <HeadWords words={['zdarma.']} startAt={F(0.92)} k={k} size={90} dot />
      {/* Doslovná formulace z akce.html. */}
      <Note at={F(1.5)} k={k} size={36} mt={36}>
        Při objednání multifokálních brýlí získáte druhá skla zdarma.
      </Note>
      <Fineprint
        at={F(2.1)}
        k={k}
        mt={30}
        lines={['// akce je orientační, platnost a podmínky', '// vám rádi upřesníme na prodejně']}
      />
    </Card>
  );
};

const Approach = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 42%">
      <Eyebrow k={k}>// jak to u nás chodí</Eyebrow>
      <HeadWords words={['Vysvětlíme', 'rozdíly']} startAt={F(0.1)} k={k} size={84} />
      <HeadWords words={['a', 'nic', 'nenutíme.']} startAt={F(0.3)} k={k} size={84} dot />
      <Note at={F(1.0)} k={k}>
        Ptáme se, jak a kde budete brýle nosit, aby jim měření i skla odpovídala.
      </Note>
    </Card>
  );
};

export const ReelMultifokal = () => (
  <ReelShell
    duration={MULTIFOKAL_DURATION}
    music="music-multifokal.wav"
    scenes={[
      {d: D[0], el: <Hook />},
      {d: D[1], el: <Solution />},
      {d: D[2], el: <Offer />},
      {
        d: D[3],
        el: (
          <PhotoShot
            src="kampan/cteni.jpg"
            focus="48% 34%"
            dir="out"
            mono="// ideální, když chcete i náhradní pár"
            line1="Jedny na nose,"
            line2="druhé v šuplíku."
          />
        ),
      },
      {d: D[4], el: <Approach />},
      {
        d: D[5],
        el: (
          <PanoShot
            from={1400}
            to={3000}
            mono="// rodinná oční optika na Americké od roku 1991"
            line1="Přijďte si to"
            line2="vyzkoušet."
          />
        ),
      },
      {
        d: D[6],
        el: (
          <Cta
            claim1="Objednejte se"
            claim2="na měření."
            button="Zavolejte nám 👓"
            notes={['// akce je orientační, podmínky upřesníme', '// Americká 325/23, Plzeň']}
          />
        ),
      },
    ]}
  />
);
