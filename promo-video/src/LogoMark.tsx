import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

/* Podpisová formace loga: svítící uzly → konstelace → kreslení obrysu → zaklapnutí.
   Geometrie odpovídá /public/logo-mark.svg (viewBox 0 0 184 84).
   Sdílí ji Teaser.tsx i Vitrina.tsx — časování se předává v props. */

const LENS_R = 26;
const CIRC = 2 * Math.PI * LENS_R;
const NODES: [number, number][] = [
  [56, 18], [56, 70], [30, 44], [82, 44], // levá čočka
  [128, 18], [128, 70], [102, 44], [154, 44], // pravá čočka
  [92, 35], // most
  [12, 27], [172, 27], // konce straniček
];

export type LogoTiming = {
  tNodes: number;
  tLines: number;
  tDraw: number;
  tLock: number;
};

export const LogoMark: React.FC<{
  timing: LogoTiming;
  cream?: string;
  yellow?: string;
}> = ({timing, cream = '#F4F1EA', yellow = '#FFE45C'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {tNodes, tLines, tDraw, tLock} = timing;

  const lines = interpolate(frame, [tLines, tDraw], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const draw = interpolate(frame, [tDraw, tLock - 6], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lock = spring({frame: frame - tLock, fps, config: {damping: 9, stiffness: 200}});
  const nodesFade = interpolate(frame, [tLock - 10, tLock + 8], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glow = frame > tLock ? 1 + Math.sin((frame - tLock) / 14) * 0.12 : 1;

  return (
    <svg viewBox="0 0 184 84" style={{width: '100%', overflow: 'visible'}}>
      <defs>
        <filter id="logo-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* konstelační spojnice */}
      <g opacity={lines * (1 - draw) * 0.5} stroke={yellow} strokeWidth="0.5">
        {NODES.map(([x1, y1], i) =>
          NODES.slice(i + 1).map(([x2, y2], j) => {
            if (Math.hypot(x2 - x1, y2 - y1) > 62) return null;
            return <line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })
        )}
      </g>

      {/* obrys brýlí */}
      <g
        filter="url(#logo-glow)"
        style={{transform: `scale(${frame > tLock ? 1 + (1 - lock) * 0.03 : 1})`, transformOrigin: 'center'}}
      >
        <circle
          cx="56" cy="44" r={LENS_R} stroke={cream} strokeWidth="5" fill="none"
          strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - draw)} transform="rotate(-90 56 44)"
        />
        <circle
          cx="128" cy="44" r={LENS_R} stroke={cream} strokeWidth="5" fill="none"
          strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - draw)} transform="rotate(-90 128 44)"
        />
        <path
          d="M83 39c6-8 12-8 18 0" stroke={yellow} strokeWidth="5" strokeLinecap="round" fill="none"
          strokeDasharray="24" strokeDashoffset={24 * (1 - Math.max(0, (draw - 0.55) / 0.45))}
          style={{filter: `drop-shadow(0 0 ${6 * glow}px ${yellow})`}}
        />
        <path
          d="M32 35 12 27" stroke={cream} strokeWidth="5" strokeLinecap="round" fill="none"
          strokeDasharray="22" strokeDashoffset={22 * (1 - Math.max(0, (draw - 0.7) / 0.3))}
        />
        <path
          d="M152 35 172 27" stroke={cream} strokeWidth="5" strokeLinecap="round" fill="none"
          strokeDasharray="22" strokeDashoffset={22 * (1 - Math.max(0, (draw - 0.7) / 0.3))}
        />
      </g>

      {/* svítící uzly */}
      <g opacity={nodesFade}>
        {NODES.map(([x, y], i) => {
          const p = spring({frame: frame - tNodes - i * 3, fps, config: {damping: 12, stiffness: 220}});
          return (
            <circle
              key={i} cx={x} cy={y} r={1.8 * p} fill={yellow}
              style={{filter: `drop-shadow(0 0 ${5 * p}px ${yellow})`}}
            />
          );
        })}
      </g>
    </svg>
  );
};
