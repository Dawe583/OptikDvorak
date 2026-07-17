/* Soundtrack k reelu „Hook" (kompozice reel-hook) — TEPLÝ MELODICKÝ podklas.
   Záměrně jiný charakter než ostatní spoty: měkký pad (I–V–vi–IV v A dur),
   jemná zvonková melodie, teplý sub, vzdušný nádech do doostření a zaoblené
   (neklikací) údery. Bez ostrého riseru a hi-hatů.
   Klíčové časy musí sedět s src/Hook.tsx: SNAP 1.3 s, TURN 5.2 s, CTA 11.6 s.
   Výstup: public/music-hook.wav — spuštění: npm run audio:hook */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 14;
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 24;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

const SNAP = 1.3;
const TURN = 5.2;
const CTA = 11.6;

const add = (i, l, r) => {
  if (i >= 0 && i < N) {
    L[i] += l;
    R[i] += r;
  }
};

/* ---------- Měkký pad (detunované sinusy, pomalý nástup) ---------- */
const padVoice = (startT, endT, freqs, gain, pan = 0) => {
  const s0 = Math.round(startT * SR);
  const s1 = Math.round(endT * SR);
  const att = 0.6 * SR;
  const rel = 0.9 * SR;
  for (let i = s0; i < s1 && i < N; i++) {
    const t = i / SR;
    let env = 1;
    const into = i - s0;
    const left = s1 - i;
    if (into < att) env = into / att;
    if (left < rel) env = Math.min(env, left / rel);
    let s = 0;
    for (const f of freqs) {
      s += Math.sin(TWO_PI * f * t);
      s += 0.5 * Math.sin(TWO_PI * f * 1.003 * t); // jemný detune → teplo
      s += 0.22 * Math.sin(TWO_PI * f * 2 * t);
    }
    s = (s / (freqs.length * 1.7)) * gain * env;
    add(i, s * (1 - pan * 0.5), s * (1 + pan * 0.5));
  }
};

/* Akordy A dur: I(A) – V(E) – vi(F#m) – IV(D), každý ~2 s, dvakrát */
const A = 220, Cs = 277.18, E = 164.81, Gs = 207.65, B = 246.94, Fs = 184.997, D = 146.83, Fs2 = 369.99, D2 = 293.66, A3 = 110;
const prog = [
  {f: [A, Cs, E * 2], root: A3},
  {f: [E, Gs, B], root: E},
  {f: [Fs, A, Cs], root: Fs / 2},
  {f: [D, Fs2, A], root: D},
];
const chordDur = 2.0;
for (let n = 0; n < 7; n++) {
  const ch = prog[n % 4];
  const st = n * chordDur;
  if (st >= DUR) break;
  padVoice(st, Math.min(st + chordDur + 0.6, DUR), ch.f, 0.12, (n % 2 ? 0.1 : -0.1));
  /* teplý sub na kořen */
  const s0 = Math.round(st * SR);
  for (let j = 0; j < chordDur * SR && s0 + j < N; j++) {
    const t = j / SR;
    let env = Math.min(1, t / 0.15) * Math.max(0, 1 - t / (chordDur + 0.3));
    const v = Math.sin(TWO_PI * ch.root * (j / SR) + 0) * 0.14 * env;
    add(s0 + j, v, v);
  }
}

/* ---------- Zvonková melodie (sinus + oktáva, exp. dozvuk) ---------- */
const bell = (startT, freq, gain) => {
  const s0 = Math.round(startT * SR);
  for (let j = 0; j < 1.1 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 3.4) * Math.min(1, t / 0.005);
    const v = (Math.sin(TWO_PI * freq * t) + 0.4 * Math.sin(TWO_PI * freq * 2 * t) + 0.15 * Math.sin(TWO_PI * freq * 3 * t)) * gain * env;
    add(s0 + j, v * 0.9, v);
  }
};
/* motiv po doostření – jemná pentatonika (A C# E F# A) */
const mel = [
  [SNAP + 0.0, Cs * 2], [SNAP + 0.5, E * 2], [SNAP + 1.0, Fs2],
  [TURN + 0.2, A * 2], [TURN + 0.7, Cs * 2], [TURN + 1.2, E * 2], [TURN + 1.9, Fs2],
  [8.4, E * 2], [8.9, Fs2], [9.4, A * 2],
  [CTA + 0.1, Cs * 2], [CTA + 0.6, E * 2], [CTA + 1.2, A * 2],
];
for (const [t, f] of mel) bell(t, f, 0.16);

/* ---------- Vzdušný nádech do doostření (jemný, ne ostrý) ---------- */
let lp = 0;
for (let i = 0; i < Math.round(SNAP * SR); i++) {
  const t = i / SR;
  const p = t / SNAP;
  const env = Math.pow(p, 2.6) * 0.3;
  const n = rnd();
  lp += (0.04 + 0.25 * p) * (n - lp);
  const air = (n - lp) * env * 0.5;
  add(i, air * 0.9, air);
}

/* ---------- Zaoblené údery (měkký nástup, bez cvaku) ---------- */
const softHit = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 1.0 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const att = Math.min(1, t / 0.008);
    const body = Math.sin(TWO_PI * (70 * Math.exp(-t * 3) + 42) * t) * Math.exp(-t * 4);
    const v = body * att * gain;
    add(s0 + j, v, v);
  }
};
softHit(SNAP, 0.4);
softHit(TURN, 0.34);
softHit(CTA, 0.24);

/* ---------- Jemný shaker (místo hi-hatů) od TURN ---------- */
const beat = 60 / 84; // 84 BPM
for (let start = TURN; start < DUR - 0.8; start += beat / 2) {
  const s0 = Math.round(start * SR);
  let hp = 0;
  for (let j = 0; j < 0.05 * SR && s0 + j < N; j++) {
    const n = rnd();
    hp = 0.6 * hp + 0.4 * n;
    const v = (n - hp) * Math.exp(-(j / SR) * 55) * 0.035;
    add(s0 + j, v * 0.8, v);
  }
}

/* ---------- Master: jemný fade in/out + měkká saturace ---------- */
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let g = 1;
  if (t < 0.15) g = t / 0.15;
  if (t > DUR - 1.2) g = Math.max(0, (DUR - t) / 1.2);
  L[i] = Math.tanh(L[i] * g * 1.1);
  R[i] = Math.tanh(R[i] * g * 1.1);
}

/* ---------- Zápis WAV ---------- */
const bytes = new DataView(new ArrayBuffer(44 + N * 4));
const wr = (o, s) => {
  for (let i = 0; i < s.length; i++) bytes.setUint8(o + i, s.charCodeAt(i));
};
wr(0, 'RIFF');
bytes.setUint32(4, 36 + N * 4, true);
wr(8, 'WAVE');
wr(12, 'fmt ');
bytes.setUint32(16, 16, true);
bytes.setUint16(20, 1, true);
bytes.setUint16(22, 2, true);
bytes.setUint32(24, SR, true);
bytes.setUint32(28, SR * 4, true);
bytes.setUint16(32, 4, true);
bytes.setUint16(34, 16, true);
wr(36, 'data');
bytes.setUint32(40, N * 4, true);
for (let i = 0; i < N; i++) {
  bytes.setInt16(44 + i * 4, clamp(L[i]) * 32767, true);
  bytes.setInt16(46 + i * 4, clamp(R[i]) * 32767, true);
}
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-hook.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
