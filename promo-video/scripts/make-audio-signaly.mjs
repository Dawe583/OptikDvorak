/* Soundtrack k REEL E „Zaškrtni si příznaky" (bez licencované hudby),
   dle scénáře: napjatý háček → 5 odškrtávacích TIKŮ (stoupající výška =
   narůstající „to jsem já") → VERDIKT (akcent) → teplé rozuzlení → ping u loga.
   Struktura: temný pad (A moll) → jemný swell u obratu → 5 tiků na odškrtnutí
   → důrazný akord u verdiktu → teplé arpeggio (outro) → závěrečný ping.
   Výstup: public/music-signaly.wav (44,1 kHz / 16 bit / stereo, 18 s).
   Spuštění: node scripts/make-audio-signaly.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 18;
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 23;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* Klíčové časy — musí sedět s src/ReelSignaly.tsx */
const T_TURN = 2.6;
/* odškrtnutí = appear + 0.35 s (ITEM_AT [4.2,5.7,7.2,8.7,10.2]) */
const TICKS = [4.55, 6.05, 7.55, 9.05, 10.55];
const T_VERDICT = 12.3;
const T_OUT = 14.8;

/* ---------- Plucknutá nota ---------- */
const pluck = (at, freq, gain, decay = 6, pan = 0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 1.6 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 260));
    const s =
      (Math.sin(TWO_PI * freq * t) + 0.28 * Math.sin(TWO_PI * freq * 2 * t) + 0.12 * Math.sin(TWO_PI * freq * 3 * t)) *
      env *
      gain;
    L[s0 + j] += s * (1 - Math.max(0, pan));
    R[s0 + j] += s * (1 + Math.min(0, pan));
  }
};

/* ---------- Zvon / ping ---------- */
const bell = (at, freq, gain, decay = 3.2) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 3 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 400));
    const s =
      (Math.sin(TWO_PI * freq * t) + 0.5 * Math.sin(TWO_PI * freq * 2.01 * t) + 0.25 * Math.sin(TWO_PI * freq * 3 * t)) *
      env *
      gain;
    L[s0 + j] += s;
    R[s0 + j] += s;
  }
};

/* ---------- Měkký sub kick ---------- */
const kick = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.4 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (55 * Math.exp(-t * 12) + 40) * t) * Math.exp(-t * 12) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- TIK odškrtnutí — krátký ostrý transient + jasný zvon ---------- */
const tick = (at, freq, gain, pan = 0) => {
  const s0 = Math.round(at * SR);
  /* klapnutí (checkbox) */
  for (let j = 0; j < 0.05 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 240);
    const v = (rnd() * 0.5 + Math.sin(TWO_PI * 3200 * t) * 0.4) * env * gain;
    L[s0 + j] += v * (1 - Math.max(0, pan));
    R[s0 + j] += v * (1 + Math.min(0, pan));
  }
  /* jasný zvonek (uspokojení) */
  bell(at + 0.01, freq, gain * 0.7, 5.5);
};

/* ---------- Temný napjatý pad (A moll) ---------- */
const padFreqs = [110.0, 130.81, 164.81, 220.0]; // A2 C3 E3 A3
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 1.6);
  if (t > DUR - 2) env *= Math.max(0, (DUR - t) / 2);
  /* u háčku zamlžený a tišší, od obratu se otevře */
  const open = t < T_TURN ? 0.6 : Math.min(1, 0.6 + (t - T_TURN) / 3.0);
  const lfo = 1 + 0.06 * Math.sin(TWO_PI * 0.13 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.22 * Math.sin(TWO_PI * f * 2 * t + 0.4);
  s = (s / padFreqs.length) * 0.05 * env * lfo * open;
  L[i] += s;
  R[i] += s * 0.93;
}

/* ---------- Jemný swell u obratu (spuštění checklistu) ---------- */
for (let i = Math.round((T_TURN - 0.4) * SR); i < Math.round((T_TURN + 0.8) * SR); i++) {
  const t = i / SR;
  const p = (t - (T_TURN - 0.4)) / 1.2;
  const s = Math.sin(TWO_PI * 220 * t) * 0.04 * Math.sin(Math.PI * p);
  L[i] += s;
  R[i] += s;
}

/* ---------- 5 tiků odškrtnutí: stoupající výška ---------- */
/* E5 F#5 A5 B5 D6 — vzestupná pentatonika = narůstající „to jsem já" */
const tickFreqs = [659.25, 739.99, 880.0, 987.77, 1174.66];
TICKS.forEach((at, i) => {
  tick(at, tickFreqs[i], 0.2, i % 2 ? 0.22 : -0.22);
  kick(at, 0.1 + i * 0.015);
});

/* ---------- VERDIKT — důrazný akord (dopad) ---------- */
kick(T_VERDICT, 0.34);
[220.0, 261.63, 329.63].forEach((f, i) => bell(T_VERDICT + 0.02 + i * 0.03, f, 0.16, 2.6)); // A moll dopad
bell(T_VERDICT + 0.05, 880.0, 0.14, 2.2);
/* krátký šumový akcent (⚡) */
for (let j = 0; j < 0.16 * SR && Math.round(T_VERDICT * SR) + j < N; j++) {
  const t = j / SR;
  const v = rnd() * 0.06 * Math.exp(-t * 26);
  L[Math.round(T_VERDICT * SR) + j] += v;
  R[Math.round(T_VERDICT * SR) + j] += v;
}

/* ---------- Teplé arpeggio od outra (A dur — rozuzlení, důvěra) ---------- */
const scale = [220.0, 277.18, 329.63, 440.0, 554.37, 659.25];
const pattern = [0, 2, 3, 4, 5, 4, 2, 3];
const BPM = 100;
const beat = 60 / BPM;
let step = 0;
for (let t = T_OUT; t < DUR - 1.0; t += beat / 2) {
  const f = scale[pattern[step % pattern.length]];
  pluck(t, f, 0.08, 6, step % 2 ? 0.25 : -0.25);
  step++;
}
for (let t = T_OUT; t < DUR - 1.0; t += beat) kick(t, 0.12);

/* ---------- Závěrečný PING u loga (A dur rozklad) ---------- */
kick(T_OUT, 0.22);
[440.0, 554.37, 659.25, 880.0].forEach((f, i) => bell(T_OUT + 0.1 + i * 0.06, f, 0.17, 2.6));
bell(T_OUT + 1.5, 1318.5, 0.1, 2.0);

/* ---------- Zápis WAV ---------- */
const bytes = new DataView(new ArrayBuffer(44 + N * 4));
const wr = (o, s) => { for (let i = 0; i < s.length; i++) bytes.setUint8(o + i, s.charCodeAt(i)); };
wr(0, 'RIFF'); bytes.setUint32(4, 36 + N * 4, true); wr(8, 'WAVE');
wr(12, 'fmt '); bytes.setUint32(16, 16, true); bytes.setUint16(20, 1, true);
bytes.setUint16(22, 2, true); bytes.setUint32(24, SR, true);
bytes.setUint32(28, SR * 4, true); bytes.setUint16(32, 4, true); bytes.setUint16(34, 16, true);
wr(36, 'data'); bytes.setUint32(40, N * 4, true);
for (let i = 0; i < N; i++) {
  bytes.setInt16(44 + i * 4, clamp(L[i]) * 32767, true);
  bytes.setInt16(46 + i * 4, clamp(R[i]) * 32767, true);
}
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-signaly.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
