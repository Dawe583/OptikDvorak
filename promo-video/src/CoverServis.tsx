import {AbsoluteFill, useVideoConfig} from 'remotion';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {Glasses} from './ReelServis';

/* Náhledovka (cover) k Reelu „Nekupujte nové brýle" — statický Still 9:16.

   Schválně vypadá jako první snímek videa: tmavá plocha, velký nápis a pod ním
   křivé brýle s povoleným šroubkem. V mřížce profilu se náhledovka ořízne na
   čtverec, proto hlavní text i brýle drží ve středovém pásu — po ořezu zůstane
   čitelné „Nekupujte nové brýle." i ta rozviklaná obruba. */

const {fontFamily: DISPLAY} = loadBricolage('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});
const {fontFamily: BODY} = loadInter('normal', {weights: ['600', '700'], subsets: ['latin', 'latin-ext']});
const {fontFamily: MONO} = loadMono('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  dim: 'rgba(244,241,234,0.6)',
};

const GRAIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.5"/></svg>'
  );

export const CoverServis = () => {
  const k = useVideoConfig().width / 1080;

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 44%, rgba(255,228,92,0.10), transparent 58%)'}}
      />

      {/* hlavička */}
      <div
        style={{
          position: 'absolute',
          top: 96 * k,
          left: 64 * k,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 34 * k,
          color: C.cream,
        }}
      >
        Optik <span style={{color: C.yellow}}>Dvořák</span>
      </div>
      <div style={{position: 'absolute', top: 104 * k, right: 64 * k, fontFamily: MONO, fontSize: 22 * k, color: C.dim}}>
        // od 1991
      </div>

      {/* HÁČEK + brýle — středový pás, přežije ořez na čtverec */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: `0 ${64 * k}px`}}>
        <div style={{width: '100%'}}>
          <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 20 * k}}>
            // zvláštní rada z optiky
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 126 * k,
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              color: C.cream,
            }}
          >
            Nekupujte
            <br />
            nové brýle
            <span
              style={{
                display: 'inline-block',
                width: 18 * k,
                height: 18 * k,
                background: C.yellow,
                marginLeft: 10 * k,
                boxShadow: `0 0 ${20 * k}px ${C.yellow}`,
              }}
            />
          </div>
        </div>
        <div style={{marginTop: 70 * k}}>
          <Glasses bend={46} tilt={-8} screw={-18} glow={0} k={k} />
        </div>
      </AbsoluteFill>

      {/* dolní pás — co se v Reelu dozví + adresa */}
      <div style={{position: 'absolute', left: 64 * k, right: 64 * k, bottom: 150 * k}}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 62 * k,
            letterSpacing: '-0.03em',
            color: C.cream,
            marginBottom: 22 * k,
          }}
        >
          Oprava brýlí <span style={{color: C.yellow}}>na počkání.</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontFamily: MONO, fontSize: 24 * k, color: C.dim}}>Americká 325/23 · Plzeň</div>
          <div
            style={{
              background: C.yellow,
              color: C.ink900,
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 28 * k,
              padding: `${16 * k}px ${34 * k}px`,
              borderRadius: 999,
              boxShadow: `0 0 ${36 * k}px rgba(255,228,92,0.4)`,
              whiteSpace: 'nowrap',
            }}
          >
            ▶ Pusť si to
          </div>
        </div>
      </div>

      {/* vinětace + zrno */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,0.5) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url("${GRAIN}")`, opacity: 0.045, mixBlendMode: 'overlay'}} />
    </AbsoluteFill>
  );
};
