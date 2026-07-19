import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

/* Náhledovka (cover) k teaseru „Vidět líp než včera" — statický Still 9:16.
   Koncept z jednoho snímku: nahoře rozmazaný svět / dole ostrý (wow moment
   reelu), mezi nimi žlutý předěl. Háček + brand. Hlavní text drží ve
   středovém pásu — v mřížce profilu (crop 1:1) zůstane čitelný. */

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

const GRADE = 'saturate(0.85) contrast(1.12) brightness(0.82) sepia(0.22)';

const GRAIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.5"/></svg>'
  );

export const CoverVidetLip = () => {
  const k = useVideoConfig().width / 1080;

  return (
    <AbsoluteFill style={{background: C.bg}}>
      {/* dramatický portrét s brýlemi — celá plocha */}
      <Img
        src={staticFile('stock-portrait.jpg')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '62% 24%',
          filter: GRADE,
          transform: 'scale(1.08)',
        }}
      />

      {/* ztmavení pro text */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7,7,7,0.55) 0%, rgba(7,7,7,0.25) 30%, transparent 46%, transparent 60%, rgba(7,7,7,0.88) 100%)',
        }}
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

      {/* HÁČEK — horní třetina, nad předělem */}
      <div style={{position: 'absolute', left: 64 * k, right: 64 * k, top: 260 * k}}>
        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 18 * k}}>
          // 20 s, které ti zaostří svět
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 118 * k,
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            color: C.cream,
            textShadow: `0 ${4 * k}px ${30 * k}px rgba(0,0,0,0.65)`,
          }}
        >
          Takhle to vidí
          <br />
          každý třetí
          <br />
          Čech
          <span
            style={{
              display: 'inline-block',
              width: 18 * k,
              height: 18 * k,
              background: C.yellow,
              marginLeft: 8 * k,
              boxShadow: `0 0 ${20 * k}px ${C.yellow}`,
            }}
          />
        </div>
      </div>

      {/* dolní pás — claim + adresa */}
      <div style={{position: 'absolute', left: 64 * k, right: 64 * k, bottom: 150 * k}}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 64 * k,
            letterSpacing: '-0.03em',
            color: C.cream,
            marginBottom: 20 * k,
          }}
        >
          Vidět líp <span style={{color: C.yellow}}>než včera.</span>
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
