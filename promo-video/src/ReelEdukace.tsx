import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {LogoMark} from './LogoMark';

/* Edukativní Reel — „3 věci, co hlídat při výběru brýlí".
   Bez zmínky o online objednání (zatím neexistuje) a bez akcí/slev.
   CTA = ulož si + přijď se poradit osobně. Vysoký organický dosah. */

const {fontFamily: DISPLAY} = loadBricolage('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});
const {fontFamily: BODY} = loadInter('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext']});
const {fontFamily: MONO} = loadMono('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  dim: 'rgba(244,241,234,0.5)',
};

export const FPS = 60;
export const EDUKACE_DURATION = 1200; // 20 s

const F = (s: number) => Math.round(s * FPS);
const T_HOOK = F(0.3);
const T_T1 = F(3.2);
const T_T2 = F(7.6);
const T_T3 = F(12.0);
const T_CTA = F(16.4);

const useScale = () => useVideoConfig().width / 1080;

/* ---------- Zrno ---------- */
const GRAIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.5"/></svg>'
  );
const Grain = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN}")`,
        backgroundPosition: `${(frame * 41) % 200}px ${(frame * 67) % 200}px`,
        opacity: 0.045,
        mixBlendMode: 'overlay',
      }}
    />
  );
};

/* ---------- Reveal nadpisu po slovech ---------- */
const HeadWords: React.FC<{words: string[]; startAt: number; k: number; size: number; dot?: boolean}> = ({
  words,
  startAt,
  k,
  size,
  dot = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `0 ${18 * k}px`,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size * k,
        lineHeight: 1.02,
        letterSpacing: '-0.035em',
        color: C.cream,
      }}
    >
      {words.map((w, i) => {
        const p = spring({frame: frame - startAt - i * 5, fps, config: {damping: 18, stiffness: 150}});
        const isLast = i === words.length - 1;
        return (
          <span key={w} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 6 * k}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>
              {w}
              {dot && isLast && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 16 * k,
                    height: 16 * k,
                    background: C.yellow,
                    marginLeft: 6 * k,
                    boxShadow: `0 0 ${18 * k}px ${C.yellow}`,
                  }}
                />
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Jeden tip: obří číslo + nadpis + detail ---------- */
const Tip: React.FC<{
  n: number;
  start: number;
  end: number;
  head: string[];
  detail: string;
  k: number;
}> = ({n, start, end, head, detail, k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const op = interpolate(frame, [start, start + 12, end - 12, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const numP = spring({frame: frame - start, fps, config: {damping: 12, stiffness: 200}});
  const detailP = spring({frame: frame - start - 22, fps, config: {damping: 200}});

  return (
    <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', opacity: op}}>
      {/* obří číslo */}
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 300 * k,
          lineHeight: 0.9,
          color: C.yellow,
          transform: `scale(${0.6 + numP * 0.4})`,
          transformOrigin: 'left center',
          textShadow: `0 0 ${60 * k}px rgba(255,228,92,0.35)`,
          marginBottom: 10 * k,
        }}
      >
        {n}
      </div>
      <HeadWords words={head} startAt={start + 6} k={k} size={96} dot />
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 40 * k,
          color: C.dim,
          marginTop: 32 * k,
          maxWidth: 820 * k,
          lineHeight: 1.3,
          opacity: detailP,
          transform: `translateY(${(1 - detailP) * 16 * k}px)`,
        }}
      >
        {detail}
      </div>
    </AbsoluteFill>
  );
};

export const ReelEdukace = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();

  /* háček */
  const hook = interpolate(frame, [T_HOOK, T_HOOK + 12, T_T1 - 10, T_T1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* CTA */
  const ctaP = spring({frame: frame - T_CTA, fps, config: {damping: 14, stiffness: 140}});
  const rule = spring({frame: frame - T_CTA + 6, fps, config: {damping: 200}});
  const savePulse = 1 + Math.sin(Math.max(0, frame - T_CTA - 20) / 10) * 0.02;

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio
        src={staticFile('music.wav')}
        volume={(f) =>
          interpolate(f, [0, 8, EDUKACE_DURATION - 30, EDUKACE_DURATION], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* ambientní žlutá záře */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, rgba(255,228,92,0.06), transparent 55%)'}} />

      {/* hlavička */}
      <div style={{position: 'absolute', top: 96 * k, left: 90 * k, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30 * k, color: C.cream}}>
        Optik <span style={{color: C.yellow}}>Dvořák</span>
      </div>
      <div style={{position: 'absolute', top: 102 * k, right: 90 * k, fontFamily: MONO, fontSize: 20 * k, color: C.dim}}>
        // jak vybrat brýle
      </div>

      {/* HÁČEK */}
      <AbsoluteFill style={{padding: `0 ${90 * k}px`, justifyContent: 'center', opacity: hook}}>
        <div style={{fontFamily: MONO, fontSize: 26 * k, color: C.yellowDeep, marginBottom: 22 * k}}>
          // většina lidí je vybírá špatně
        </div>
        <HeadWords words={['Vybíráš', 'brýle']} startAt={T_HOOK} k={k} size={124} />
        <HeadWords words={['jen', 'podle', 'zrcadla?']} startAt={T_HOOK + 8} k={k} size={124} dot />
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 40 * k, color: C.dim, marginTop: 34 * k}}>
          3 věci, které rozhodují 👇
        </div>
      </AbsoluteFill>

      {/* 3 TIPY */}
      <Tip
        n={1}
        start={T_T1}
        end={T_T2}
        head={['Šířka', 'rámečku']}
        detail="Okraj obruby má končit u okraje obličeje — nemá přesahovat spánky ani je zužovat."
        k={k}
      />
      <Tip
        n={2}
        start={T_T2}
        end={T_T3}
        head={['Dosedací', 'body']}
        detail="Brýle nesmí tlačit na nos ani za ušima. Správně padnou, aniž je pořád posouváš."
        k={k}
      />
      <Tip
        n={3}
        start={T_T3}
        end={T_CTA}
        head={['Barva', 'k', 'pleti']}
        detail="Rámeček ladí s tónem pleti a barvou očí — ne s oblečením, to střídáš každý den."
        k={k}
      />

      {/* CTA — bez online objednání, jen ulož si + přijď se poradit */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: ctaP}}>
        <div style={{width: 340 * k, transform: `scale(${ctaP})`}}>
          <LogoMark timing={{tNodes: -60, tLines: -50, tDraw: -40, tLock: -20}} />
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 60 * k,
            color: C.cream,
            marginTop: 48 * k,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          S výběrem ti
          <br />
          poradíme osobně.
        </div>
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 34 * k, color: C.dim, marginTop: 18 * k, textAlign: 'center'}}>
          Rodinná optika v Plzni od 1991.
        </div>
      </AbsoluteFill>

      <div style={{position: 'absolute', left: 90 * k, right: 90 * k, bottom: 170 * k, opacity: ctaP}}>
        <div
          style={{
            height: 1,
            background: 'rgba(244,241,234,0.22)',
            transform: `scaleX(${rule})`,
            transformOrigin: 'left',
            marginBottom: 40 * k,
          }}
        />
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontFamily: MONO, fontSize: 22 * k, color: C.dim}}>
            Americká 325/23
            <br />
            Plzeň
          </div>
          <div
            style={{
              background: C.yellow,
              color: C.ink900,
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 30 * k,
              padding: `${20 * k}px ${38 * k}px`,
              borderRadius: 999,
              transform: `scale(${savePulse})`,
              boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
              whiteSpace: 'nowrap',
            }}
          >
            Ulož si návod 📌
          </div>
        </div>
      </div>

      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
