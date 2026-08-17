import {
  AbsoluteFill,
  Easing,
  Img,
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

/* Společné díly Reels — písma, barvy, zrno, nadpisy, fotky a brandová karta.
   Starší Reels (Teaser, Vitrina, ReelSobota … ReelServis) vznikaly jeden po
   druhém a mají tyhle kusy opsané u sebe; ty se schválně nepřepisují, aby se
   omylem nezměnilo něco, co je už vyrenderované a schválené. Nové Reels
   (děti, čočky, multifokály, benefity) berou všechno odtud.

   Návrhové souřadnice jsou vždy 1080 × 1920; skutečný render je 2160 × 3840,
   takže se všechny rozměry násobí useScale() (k = 2). Bezpečné zóny
   Instagramu: horní ~269 px a dolní ~384 px (od 1536 dolů) překrývá UI —
   nic důležitého tam nesmí ležet. */

export const {fontFamily: DISPLAY} = loadBricolage('normal', {
  weights: ['800'],
  subsets: ['latin', 'latin-ext'],
});
export const {fontFamily: BODY} = loadInter('normal', {
  weights: ['500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
});
export const {fontFamily: MONO} = loadMono('normal', {
  weights: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
});

export const C = {
  bg: '#070707',
  ink900: '#0C0C0C',
  cream: '#F4F1EA',
  yellow: '#FFE45C',
  yellowDeep: '#F5C518',
  dim: 'rgba(244,241,234,0.5)',
  soft: 'rgba(244,241,234,0.78)',
  line: 'rgba(244,241,234,0.16)',
  /* na světlém podkladu */
  ink: '#111111',
  inkSoft: 'rgba(17,17,17,0.66)',
  inkDim: 'rgba(17,17,17,0.42)',
  rule: 'rgba(17,17,17,0.14)',
};

/* Světlý, vzdušný grade — fotky mají působit prosvětleně, ne ponuře. */
export const GRADE = 'saturate(1.06) contrast(1.05) brightness(1.04)';

export const FPS = 60;
export const F = (s: number) => Math.round(s * FPS);
export const useScale = () => useVideoConfig().width / 1080;

/* Bezpečné zóny Instagramu v návrhových souřadnicích */
export const SAFE_TOP = 269;
export const SAFE_BOT = 1536;
export const M = 90; // boční okraj

/* ---------- Zrno ---------- */
const GRAIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.5"/></svg>'
  );

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN}")`,
        backgroundPosition: `${(frame * 41) % 200}px ${(frame * 67) % 200}px`,
        opacity: 0.045,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

/* Viněta, kterou má každý Reel úplně navrchu */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{background: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,0.5) 100%)'}}
  />
);

/* ---------- Hlavička „Optik Dvořák // Plzeň" ---------- */
export const Header: React.FC<{k: number; opacity: number; light?: boolean}> = ({
  k,
  opacity,
  light = false,
}) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 96 * k,
        left: M * k,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 30 * k,
        color: light ? C.ink : C.cream,
        opacity,
      }}
    >
      Optik <span style={{color: light ? C.yellowDeep : C.yellow}}>Dvořák</span>
    </div>
    <div
      style={{
        position: 'absolute',
        top: 102 * k,
        right: M * k,
        fontFamily: MONO,
        fontSize: 20 * k,
        color: light ? C.inkDim : C.dim,
        opacity,
      }}
    >
      // Plzeň
    </div>
  </>
);

/* ---------- Nadpis, který naskakuje po slovech ---------- */
export const HeadWords: React.FC<{
  words: string[];
  startAt: number;
  k: number;
  size: number;
  color?: string;
  dot?: boolean;
  align?: 'left' | 'center';
}> = ({words, startAt, k, size, color = C.cream, dot = false, align = 'left'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        gap: `0 ${16 * k}px`,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size * k,
        lineHeight: 1.02,
        letterSpacing: '-0.035em',
        color,
      }}
    >
      {words.map((w, i) => {
        const p = spring({frame: frame - startAt - i * 4, fps, config: {damping: 18, stiffness: 150}});
        const isLast = i === words.length - 1;
        return (
          <span key={`${w}-${i}`} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 6 * k}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>
              {w}
              {dot && isLast && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 15 * k,
                    height: 15 * k,
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

/* ---------- Žlutý zvýrazňovač pod částí věty ----------
   Rozměry v em, ne v pixelech — používá se i v polích definovaných mimo
   komponentu, kde měřítko snímku (k) ještě není k dispozici. */
export const Hi: React.FC<{children: React.ReactNode; start: number; light?: boolean}> = ({
  children,
  start,
  light = false,
}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [start + 14, start + 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      <span
        style={{
          position: 'absolute',
          left: '-0.14em',
          right: '-0.14em',
          top: '16%',
          bottom: '2%',
          background: light ? 'rgba(255,228,92,0.62)' : 'rgba(255,228,92,0.24)',
          borderRadius: '0.1em',
          transform: `scaleX(${w})`,
          transformOrigin: 'left center',
        }}
      />
      <span style={{position: 'relative'}}>{children}</span>
    </span>
  );
};

/* ---------- HÁČEK: první tři sekundy ----------
   Rozhodnutí, jestli člověk zůstane, padne během zlomku vteřiny, a Instagram
   podle chování v prvních minutách rozhoduje, komu video ukáže dál. Z toho
   plyne pár tvrdých pravidel, která tahle komponenta drží:

   0–100 ms  Nic se nesmí rozsvěcet. První slovo nadpisu je čitelné hned na
             nultém snímku — žádný fade z černé, žádné čekání. Zároveň už běží
             pohyb (fotka je uprostřed nájezdu, ne v klidu) a celý obraz jednou
             „doskočí" z 1,035 na 1,0. Video pak nezačíná, ale přistane.
   0,1–0,7 s Zbytek nadpisu doskáče po třech snímcích na slovo a pod klíčové
             slovo se přetáhne žlutý zvýrazňovač. To je druhá událost, která
             oko znovu chytí přesně ve chvíli, kdy palec rozhoduje o odscrollování.
   0,7–1,3 s Věta, která slibuje užitek.
   1,3–2,2 s Otevřená smyčka („čtyři věci", „tři kroky"). Divák zůstane, když
             ví, na co čeká a jak dlouho to bude trvat.

   Hlavička „Optik Dvořák" v háčku schválně NENÍ — logo je v první vteřině
   ten nejméně zajímavý pixel na obrazovce a bere místo sdělení. Nastupuje
   až s tělem videa. */
export const punch = (frame: number) =>
  interpolate(frame, [0, 10], [1.035, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

export const HookBlock: React.FC<{
  k: number;
  until: number;
  top: number;
  lines: [string[], string[]?];
  kicker?: string;
  sub?: string;
  loop?: string;
  size?: number;
  align?: 'left' | 'center';
}> = ({k, until, top, lines, kicker, sub, loop, size = 96, align = 'left'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const op = interpolate(frame, [until - F(0.4), until - F(0.05)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (op <= 0.002) return null;

  const center = align === 'center';
  const word = (w: string, i: number, startAt: number, color: string, stagger: number) => {
    const p = spring({frame: frame - startAt - i * stagger, fps, config: {damping: 17, stiffness: 190}});
    return (
      <span key={`${w}-${i}`} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 6 * k}}>
        <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`, color}}>{w}</span>
      </span>
    );
  };
  const row = (words: string[], startAt: number, color: string, stagger = 3) => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: center ? 'center' : 'flex-start',
        gap: `0 ${16 * k}px`,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size * k,
        lineHeight: 1.0,
        letterSpacing: '-0.04em',
      }}
    >
      {words.map((w, i) => word(w, i, startAt, color, stagger))}
    </div>
  );

  /* zvýrazňovač pod druhým řádkem — druhá „událost" v háčku */
  const swipe = interpolate(frame, [18, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const subP = spring({frame: frame - F(0.7), fps, config: {damping: 200}, durationInFrames: F(0.7)});
  const loopP = spring({frame: frame - F(1.3), fps, config: {damping: 14, stiffness: 170}});

  return (
    <div
      style={{
        position: 'absolute',
        left: M * k,
        right: M * k,
        top: top * k,
        textAlign: center ? 'center' : 'left',
        opacity: op,
      }}
    >
      {kicker && (
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 24 * k,
            letterSpacing: '0.16em',
            color: C.yellow,
            marginBottom: 20 * k,
          }}
        >
          {kicker}
        </div>
      )}
      {/* náskok 14 snímků: na nultém snímku je první řádek už dole a čitelný */}
      {row(lines[0], -14, C.cream, 2)}
      {lines[1] && (
        <div style={{position: 'relative', display: 'inline-block', marginTop: 4 * k}}>
          <div
            style={{
              position: 'absolute',
              left: -10 * k,
              right: -10 * k,
              top: '14%',
              bottom: '12%',
              background: 'rgba(255,228,92,0.20)',
              borderRadius: 6 * k,
              transform: `scaleX(${swipe})`,
              transformOrigin: 'left center',
            }}
          />
          <div style={{position: 'relative'}}>{row(lines[1], 10, C.yellow)}</div>
        </div>
      )}
      {sub && (
        <div
          style={{
            marginTop: 30 * k,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 34 * k,
            lineHeight: 1.42,
            color: C.soft,
            opacity: subP,
            transform: `translateY(${(1 - subP) * 16 * k}px)`,
          }}
        >
          {sub}
        </div>
      )}
      {loop && (
        <div
          style={{
            display: 'inline-block',
            marginTop: 26 * k,
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 27 * k,
            color: C.ink900,
            background: C.yellow,
            padding: `${12 * k}px ${24 * k}px`,
            borderRadius: 999,
            opacity: loopP,
            transform: `scale(${0.86 + loopP * 0.14})`,
            transformOrigin: center ? 'center' : 'left center',
          }}
        >
          {loop}
        </div>
      )}
    </div>
  );
};

/* ---------- Fotky: prolínačka + Ken Burns ---------- */
export type Shot = {src: string; from: number; to: number; dir?: 'in' | 'out'};
export const XF = F(0.4); // délka prolínačky

export const shotOpacity = (frame: number, s: Shot) =>
  interpolate(frame, [s.from - XF, s.from, s.to - XF, s.to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const Photo: React.FC<{shot: Shot; amount?: number}> = ({shot, amount = 0.06}) => {
  const frame = useCurrentFrame();
  const op = shotOpacity(frame, shot);
  if (op <= 0.002) return null;
  const p = interpolate(frame, [shot.from, shot.to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const scale = shot.dir === 'out' ? 1 + amount - p * amount : 1 + p * amount;
  return (
    <Img
      src={staticFile(shot.src)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: GRADE,
        transform: `scale(${scale})`,
        opacity: op,
      }}
    />
  );
};

/* Rozostřený barevný nádech přes celou plochu — pozadí není mrtvě černé. */
export const Wash: React.FC<{shot: Shot; strength?: number}> = ({shot, strength = 0.6}) => {
  const op = shotOpacity(useCurrentFrame(), shot);
  if (op <= 0.002) return null;
  return (
    <Img
      src={staticFile(shot.src)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'blur(90px) brightness(0.30) saturate(1.2)',
        transform: 'scale(1.3)',
        opacity: op * strength,
      }}
    />
  );
};

/* ---------- Brandová karta na konci ----------
   Konec musí vypadat u všech Reels stejně — je to podpis. Mění se jen
   claim, text v pilulce a shrnutí pod ní. */
export const BrandCard: React.FC<{
  k: number;
  at: number;              // snímek, kdy karta nastupuje
  bg: string;              // fotka na rozostřené pozadí
  claim: [string, string]; // druhý řádek je žlutý
  pill: string;
  recap: string;
}> = ({k, at, bg, claim, pill, recap}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - at;
  if (t < -F(0.5)) return null;

  const fade = interpolate(t, [-F(0.5), 0], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const logo = spring({frame: t, fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const line = spring({frame: t - F(0.35), fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const addr = spring({frame: t - F(0.7), fps, config: {damping: 200}, durationInFrames: F(0.9)});
  const cta = spring({frame: t - F(1.05), fps, config: {damping: 14, stiffness: 170}});
  const rec = interpolate(t, [F(1.5), F(2.0)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = 1 + Math.sin(Math.max(0, t - F(1.05)) / 11) * 0.02;
  const shine = interpolate(t, [F(1.5), F(2.4)], [-30, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <Img
        src={staticFile(bg)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(70px) brightness(0.32) saturate(1.15)',
          transform: `scale(${1.25 + Math.min(1, Math.max(0, t / F(3.2))) * 0.06})`,
        }}
      />
      <AbsoluteFill
        style={{background: 'radial-gradient(circle at 50% 46%, rgba(255,228,92,0.08), rgba(7,7,7,0.86) 62%)'}}
      />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 28 * k, padding: `0 ${M * k}px`}}>
        <div style={{width: 320 * k, opacity: logo, transform: `scale(${logo})`}}>
          <LogoMark timing={{tNodes: -400, tLines: -300, tDraw: -200, tLock: -100}} />
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 84 * k,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.06,
            color: C.cream,
            opacity: line,
            transform: `translateY(${(1 - line) * 22 * k}px)`,
          }}
        >
          {claim[0]}
          <br />
          <span style={{color: C.yellow}}>{claim[1]}</span>
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 31 * k,
            color: C.soft,
            textAlign: 'center',
            lineHeight: 1.55,
            opacity: addr,
            transform: `translateY(${(1 - addr) * 16 * k}px)`,
          }}
        >
          Optik Dvořák · Americká 325/23, Plzeň
          <br />
          Po–Čt 8:30–17:00 · Pá 8:30–16:00
          <br />
          +420 702 194 246
        </div>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginTop: 10 * k,
            background: C.yellow,
            color: C.ink900,
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 30 * k,
            padding: `${20 * k}px ${40 * k}px`,
            borderRadius: 999,
            opacity: cta,
            transform: `scale(${cta * pulse})`,
            boxShadow: `0 0 ${40 * k}px rgba(255,228,92,0.35)`,
          }}
        >
          {pill}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '22%',
              left: `${shine}%`,
              background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.7), transparent)',
              transform: 'skewX(-18deg)',
            }}
          />
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 23 * k,
            color: C.dim,
            marginTop: 4 * k,
            textAlign: 'center',
            opacity: rec,
          }}
        >
          {recap}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
