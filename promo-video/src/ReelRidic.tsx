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

/* REEL 4/5 — „V noci vás oslňují protijedoucí?" (řidičská skla −30 %, 21,6 s)

   Cíl: řidiči. Situace, kterou zná každý, kdo jezdí po setmění, a k ní
   konkrétní nabídka se zvýhodněním. Sedí to i na roční dobu — čím dál
   dřív se stmívá, tím je téma aktuálnější.

   Časová osa (absolutní sekundy, sedí s scripts/make-audio-kampan.mjs):
    0,0–3,4   HÁČEK    „V noci vás oslňují protijedoucí?"
    3,0–6,4   ŘEŠENÍ   brýlová skla pro řidiče (doslovná formulace z webu)
    6,0–9,4   NABÍDKA  −30 %
    9,0–12,4  FOTKA    ptáme se, kde a kdy jezdíte
   12,0–15,2  MĚŘENÍ   30 až 45 minut, ke kompletním brýlím zdarma
   14,8–17,8  PANORAMA „Stavte se na Americké."
   17,4–21,6  CTA      logo, telefon, adresa, otevírací doba

   Háček je schválně jen text na tmavé ploše — fotka z auta v tu chvíli
   není potřeba a noční jízdu by stejně nepředstírala poctivě (fotka na
   prodejně žádná není a stocková fotka je z denní jízdy).

   POZOR — akce. Stejně jako u multifokálů: web u akcí uvádí, že jsou
   orientační a podmínky se upřesňují na prodejně. Video to říká taky.
   Před publikováním ověřte u majitelky, že sleva pořád platí.

   Žádné zdravotní sliby: říká se přesně to, co web — „klidnější noční
   jízda a méně oslnění", nic o bezpečnosti ani o zraku. */

const D = [F(3.4), F(3.4), F(3.4), F(3.4), F(3.2), F(3.0), F(4.2)];
export const RIDIC_DURATION = totalDuration(D);

const Hook = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 38%" padBottom={130}>
      <Eyebrow k={k}>// pro řidiče</Eyebrow>
      <HeadWords words={['V', 'noci', 'vás']} startAt={F(0.1)} k={k} size={110} />
      <HeadWords words={['oslňují']} startAt={F(0.28)} k={k} size={110} />
      <HeadWords words={['protijedoucí?']} startAt={F(0.44)} k={k} size={110} dot />
      <Note at={F(1.3)} k={k} size={44}>
        A po setmění se vám hůř odhaduje vzdálenost.
      </Note>
    </Card>
  );
};

const Solution = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 42%">
      <Eyebrow k={k}>// existuje na to sklo</Eyebrow>
      {/* Doslovná formulace z akce.html — neměnit. */}
      <HeadWords words={['Brýlová', 'skla']} startAt={F(0.1)} k={k} size={88} />
      <HeadWords words={['pro', 'řidiče:']} startAt={F(0.28)} k={k} size={88} />
      <Note at={F(0.9)} k={k} size={44} mt={36}>
        klidnější noční jízda a méně oslnění.
      </Note>
      <Fineprint at={F(1.6)} k={k} mt={34} lines={['// poradíme, jestli jsou pro vás vhodná']} />
    </Card>
  );
};

const Offer = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 40%">
      <Eyebrow k={k}>// sezónní akce</Eyebrow>
      <div style={{marginTop: 6 * k, marginBottom: 26 * k}}>
        <OfferBadge text="−30 %" at={F(0.15)} k={k} size={200} />
      </div>
      <HeadWords words={['Teď', 'se']} startAt={F(0.75)} k={k} size={88} />
      <HeadWords words={['zvýhodněním.']} startAt={F(0.9)} k={k} size={88} dot />
      <Fineprint
        at={F(1.7)}
        k={k}
        mt={40}
        lines={['// akce je orientační, platnost a podmínky', '// vám rádi upřesníme na prodejně']}
      />
    </Card>
  );
};

const Measure = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 42%">
      <Eyebrow k={k}>// než se skla objednají</Eyebrow>
      <HeadWords words={['Nejdřív']} startAt={F(0.1)} k={k} size={94} />
      <HeadWords words={['pořádné', 'měření.']} startAt={F(0.28)} k={k} size={94} dot />
      <Note at={F(0.95)} k={k}>
        Trvá 30 až 45 minut. Při pořízení kompletních dioptrických brýlí je měření zraku zdarma.
      </Note>
      <Fineprint
        at={F(1.7)}
        k={k}
        mt={32}
        lines={['// měření zraku v optice nenahrazuje', '// lékařské vyšetření očí']}
      />
    </Card>
  );
};

export const ReelRidic = () => (
  <ReelShell
    duration={RIDIC_DURATION}
    music="music-ridic.wav"
    scenes={[
      {d: D[0], el: <Hook />},
      {d: D[1], el: <Solution />},
      {d: D[2], el: <Offer />},
      {
        d: D[3],
        el: (
          <PhotoShot
            src="kampan/ridic.jpg"
            focus="42% 44%"
            dir="in"
            mono="// brýlová skla pro řidiče"
            line1="Ptáme se, kde"
            line2="a kdy jezdíte."
          />
        ),
      },
      {d: D[4], el: <Measure />},
      {
        d: D[5],
        el: (
          <PanoShot
            from={1000}
            to={2600}
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
