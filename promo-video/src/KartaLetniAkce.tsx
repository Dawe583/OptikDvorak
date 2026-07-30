import {AbsoluteFill, useVideoConfig} from 'remotion';
import {
  BODY,
  C,
  DISPLAY,
  Grain,
  LETNI_AKCE_DEFAULTS,
  MONO,
  Pozadi,
  Slunce,
  SlunecniBryle,
  type LetniAkceProps,
} from './ReelLetniAkce';

/* Statické formáty k letní akci — stejná vizuální řeč jako Reel, ale bez pohybu.
   Jedna komponenta, dva výstupy:
     post-letni-akce   2160×2700 (4:5, příspěvek do feedu)
     cover-letni-akce  2160×3840 (9:16, náhledovka Reelu / Story)
   Čísla a platnost jdou přes stejné props jako Reel. */

type Props = LetniAkceProps & {varianta: 'post' | 'story'};

export const KARTA_DEFAULTS = {...LETNI_AKCE_DEFAULTS};

export const KartaLetniAkce: React.FC<Props> = ({sleva, platnostOd, platnostDo, varianta}) => {
  const {width} = useVideoConfig();
  const k = width / 1080;
  const jePost = varianta === 'post';

  /* ve čtvercovějším formátu musí typografie o kus dolů, ať se to nemačká */
  const t = jePost ? 0.86 : 1;

  return (
    <AbsoluteFill>
      <Pozadi zare={1.05} />
      <Slunce y={(jePost ? 470 : 620) * k} velikost={jePost ? 300 : 360} opacity={0.75} />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: `${(jePost ? 90 : 120) * k}px ${90 * k}px`,
          textAlign: 'center',
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 28 * k * t, color: C.yellowDeep, marginBottom: 46 * k * t}}>
          // Letní dvojka · Optik Dvořák Plzeň
        </div>

        <SlunecniBryle postup={1} sirka={(jePost ? 560 : 640) * t} />

        <div
          style={{
            marginTop: 54 * k * t,
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 268 * k * t,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            color: C.yellow,
            textShadow: `0 0 ${70 * k}px rgba(255,228,92,0.42)`,
          }}
        >
          −{sleva} %
        </div>

        <div
          style={{
            marginTop: 18 * k * t,
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 92 * k * t,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            color: C.cream,
          }}
        >
          na druhý pár brýlí
        </div>

        <div
          style={{
            marginTop: 22 * k * t,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 34 * k * t,
            color: C.dim,
            lineHeight: 1.5,
          }}
        >
          obruba i skla · při objednání dvou brýlí
          <br />
          sluneční s dioptrií · na počítač · náhradní pár
        </div>

        <div
          style={{
            marginTop: 46 * k * t,
            display: 'inline-block',
            border: `${3 * k}px solid ${C.yellow}`,
            color: C.yellow,
            borderRadius: 999,
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 36 * k * t,
            padding: `${16 * k * t}px ${38 * k * t}px`,
          }}
        >
          {platnostOd} → {platnostDo}
        </div>
      </AbsoluteFill>

      {/* patička s adresou a telefonem */}
      <div
        style={{
          position: 'absolute',
          left: 90 * k,
          right: 90 * k,
          bottom: (jePost ? 70 : 150) * k,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 26 * k * t,
          color: 'rgba(244,241,234,0.5)',
          lineHeight: 1.7,
        }}
      >
        Americká 325/23, Plzeň · rodinná optika od 1991
        <br />
        objednání: 702 194 246
      </div>

      <Grain />
    </AbsoluteFill>
  );
};

export const PostLetniAkce: React.FC<LetniAkceProps> = (props) => (
  <KartaLetniAkce {...props} varianta="post" />
);

export const CoverLetniAkce: React.FC<LetniAkceProps> = (props) => (
  <KartaLetniAkce {...props} varianta="story" />
);
