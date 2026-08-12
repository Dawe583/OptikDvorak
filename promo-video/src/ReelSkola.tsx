import {
  Card,
  Cta,
  Eyebrow,
  F,
  Fineprint,
  HeadWords,
  Note,
  NumItem,
  PanoShot,
  PhotoShot,
  ReelShell,
  totalDuration,
  useScale,
} from './reel-kit';

/* REEL 2/5 — „Do školy zbývá pár týdnů." (děti před začátkem školy, 22,6 s)

   Cíl: rodiče. Nejsilnější důvod, proč přijít právě teď — dítě usedne do
   lavice a musí vidět na tabuli. Video nediagnostikuje: vyjmenuje tři
   běžná pozorování ze života a samo přizná, že to není diagnóza, jen
   dobrý důvod se objednat.

   Časová osa (absolutní sekundy, sedí s scripts/make-audio-kampan.mjs):
    0,0–3,2   HÁČEK     „Do školy zbývá pár týdnů."
    2,8–7,2   SIGNÁLY   tři pozorování + „není to diagnóza"
    6,8–10,2  FOTKA     dítě v brýlích, měření 30–45 minut
    9,8–13,2  CENA      měření zraku ke kompletním brýlím zdarma
   12,8–16,2  MIYOSMART bezplatná konzultace pro krátkozraké děti
   15,8–18,8  PANORAMA  „Objednejte dítě na měření."
   18,4–22,6  CTA       logo, telefon, adresa, otevírací doba

   SEZÓNNÍ REEL. Dává smysl pustit ho v srpnu a v prvních dnech září,
   pak ho schovat do příštího roku.

   Obsah: mereni-zraku.html + akce.html. Formulace o MiYOSMART je doslovná
   („Bezplatně poradíme, zda jsou pro vaše dítě vhodná brýlová skla
   MiYOSMART určená pro řízení dětské krátkozrakosti (myopie).") — žádný
   zdravotní slib, jen certifikace a nabídka poradit. */

const D = [F(3.2), F(4.4), F(3.4), F(3.4), F(3.4), F(3.0), F(4.2)];
export const SKOLA_DURATION = totalDuration(D);

const Hook = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 40%" padBottom={130}>
      <Eyebrow k={k}>// než začne škola</Eyebrow>
      <HeadWords words={['Do', 'školy']} startAt={F(0.1)} k={k} size={116} />
      <HeadWords words={['zbývá', 'pár', 'týdnů.']} startAt={F(0.3)} k={k} size={116} dot />
      <Note at={F(1.2)} k={k} size={44}>
        Kdy jste dítěti naposledy nechali změřit zrak?
      </Note>
    </Card>
  );
};

const Signals = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 42%">
      <Eyebrow k={k} mb={22}>
        // možná to znáte
      </Eyebrow>
      <HeadWords words={['Čeho', 'si']} startAt={F(0.05)} k={k} size={92} />
      <HeadWords words={['všímat.']} startAt={F(0.2)} k={k} size={92} dot />
      <div style={{display: 'flex', flexDirection: 'column', gap: 28 * k, marginTop: 48 * k}}>
        <NumItem n={1} at={F(0.55)} k={k} text="Sedá si blízko k televizi." />
        <NumItem n={2} at={F(1.55)} k={k} text="Mhouří oči na tabuli." />
        <NumItem n={3} at={F(2.55)} k={k} text="Po čtení si stěžuje na hlavu." />
      </div>
      <Note at={F(3.3)} k={k} size={38} mt={46}>
        Není to diagnóza — jen dobrý důvod nechat dítěti změřit zrak.
      </Note>
    </Card>
  );
};

const Price = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 44%">
      <Eyebrow k={k}>// kolik to stojí</Eyebrow>
      {/* Věta je rozdělená jen kvůli zalomení — text zůstává doslovný. */}
      <HeadWords words={['Při', 'pořízení', 'kompletních']} startAt={F(0.1)} k={k} size={62} />
      <HeadWords words={['dioptrických', 'brýlí', 'je']} startAt={F(0.28)} k={k} size={62} />
      <HeadWords words={['měření', 'zraku']} startAt={F(0.46)} k={k} size={62} />
      <div style={{marginTop: 16 * k}}>
        <HeadWords words={['zdarma.']} startAt={F(0.9)} k={k} size={116} color="#FFE45C" />
      </div>
      <Note at={F(1.35)} k={k} size={36} mt={38}>
        Uděláme si na vás čas — měření trvá 30 až 45 minut a nespěcháme.
      </Note>
      <Fineprint
        at={F(1.8)}
        k={k}
        mt={30}
        lines={['// měření zraku v optice nenahrazuje', '// lékařské vyšetření očí']}
      />
    </Card>
  );
};

const Myopie = () => {
  const k = useScale();
  return (
    <Card glowAt="50% 42%">
      <Eyebrow k={k}>// pro krátkozraké děti</Eyebrow>
      <HeadWords words={['Poradíme', 'i']} startAt={F(0.1)} k={k} size={88} />
      <HeadWords words={['bezplatně.']} startAt={F(0.28)} k={k} size={88} dot />
      {/* Doslovná formulace z akce.html — neměnit, je to citlivé téma. */}
      <Note at={F(0.9)} k={k} size={38}>
        Bezplatně poradíme, zda jsou pro vaše dítě vhodná brýlová skla MiYOSMART určená pro řízení dětské
        krátkozrakosti (myopie).
      </Note>
      <Fineprint at={F(1.7)} k={k} mt={34} lines={['// jsme certifikovaní, poradenství nic nestojí']} />
    </Card>
  );
};

export const ReelSkola = () => (
  <ReelShell
    duration={SKOLA_DURATION}
    music="music-skola.wav"
    scenes={[
      {d: D[0], el: <Hook />},
      {d: D[1], el: <Signals />},
      {
        d: D[2],
        el: (
          <PhotoShot
            src="kampan/deti.jpg"
            focus="52% 40%"
            dir="in"
            mono="// měření trvá 30 až 45 minut, nespěcháme"
            line1="Změříme ho"
            line2="v klidu a s časem."
          />
        ),
      },
      {d: D[3], el: <Price />},
      {d: D[4], el: <Myopie />},
      {
        d: D[5],
        el: (
          <PanoShot
            from={300}
            to={1900}
            mono="// rodinná oční optika na Americké od roku 1991"
            line1="Objednejte se"
            line2="ještě před školou."
            size={72}
          />
        ),
      },
      {
        d: D[6],
        el: (
          <Cta
            claim1="Objednejte dítě"
            claim2="na měření zraku."
            button="Zavolejte nám 👓"
            notes={['// termíny nabízíme v nejbližších volných dnech', '// Americká 325/23, Plzeň']}
          />
        ),
      },
    ]}
  />
);
