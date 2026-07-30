/* Soundtrack k Reelu „Servis na počkání" (bez licencované hudby).
   Proti ostatním Reels je tenhle schválně RYTMICKÝ: 120 BPM, kick na každou
   dobu, šejkr na osminy, basová linka. Střihy ve videu padají přesně na dobu
   (2,8 / 5,0 / 7,6 / 10,4 / 12,8 s), takže tvrdý střih zní jako záměr.
   Cinknutí na čtyřech položkách výčtu (5,12 / 5,57 / 6,02 / 6,47 s).
   Výstup: public/music-servis.wav (44,1 kHz / 16 bit / stereo, 17 s).
   Spuštění: node scripts/make-audio-servis.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 17;
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 97;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* 120 BPM — doba je 0,5 s, takže všechny střihy sedí na dobu */
const BPM = 120;
const beat = 60 / BPM;

/* Klíčové časy — musí sedět s CUES v src/ReelServis.tsx */
const STRIHY = [2.8, 5.0, 7.6, 10.4, 12.8];
const VYCET = [5.12, 5.57, 6.02, 6.47];
const T_OUT = 12.8;
const T_FADE = 15.6; // reel končí v 16,4 s

/* ---------- Kick ---------- */
const kick = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.42 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (62 * Math.exp(-t * 14) + 43) * t) * Math.exp(-t * 13) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- Šejkr ---------- */
const shaker = (at, gain) => {
  const s0 = Math.round(at * SR);
  let lp = 0;
  for (let j = 0; j < 0.05 * SR && s0 + j < N; j++) {
    const n = rnd();
    lp = 0.7 * lp + 0.3 * n;
    const v = (n - lp) * Math.exp(-(j / SR) * 95) * gain;
    L[s0 + j] += v * 0.82;
    R[s0 + j] += v;
  }
};

/* ---------- Bas ---------- */
const bas = (at, freq, len, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < len * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.01) * Math.exp(-t * 2.6) * (1 - Math.min(1, t / len) * 0.3);
    const v = (Math.sin(TWO_PI * freq * t) + 0.25 * Math.sin(TWO_PI * freq * 2 * t)) * env * gain;
    L[s0 + j] += v;
    R[s0 + j] += v * 0.96;
  }
};

/* ---------- Pluck / stab ---------- */
const stab = (at, freq, gain, decay = 7, pan = 0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 1.2 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 300));
    const s =
      (Math.sin(TWO_PI * freq * t) +
        0.3 * Math.sin(TWO_PI * freq * 2 * t) +
        0.14 * Math.sin(TWO_PI * freq * 3 * t)) *
      env *
      gain;
    L[s0 + j] += s * (1 - Math.max(0, pan));
    R[s0 + j] += s * (1 + Math.min(0, pan));
  }
};

/* ---------- Zvon ---------- */
const bell = (at, freq, gain, decay = 3.0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 2.6 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 400));
    const s = (Math.sin(TWO_PI * freq * t) + 0.45 * Math.sin(TWO_PI * freq * 2.01 * t)) * env * gain;
    L[s0 + j] += s;
    R[s0 + j] += s;
  }
};

/* ---------- Cinknutí kovu (šroubovák o obrubu) na střizích ---------- */
const cink = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.4 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 16);
    const v =
      (Math.sin(TWO_PI * 3100 * t) * 0.5 + Math.sin(TWO_PI * 4700 * t) * 0.3 + rnd() * 0.2) * env * gain;
    L[s0 + j] += v * 0.9;
    R[s0 + j] += v;
  }
};

/* ---------- Podkladový pad (E moll, ať to má tělo) ---------- */
const padFreqs = [82.41, 123.47, 164.81, 246.94]; // E2 B2 E3 B3
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 0.6);
  if (t > T_FADE) env *= Math.max(0, (DUR - 0.4 - t) / (DUR - 0.4 - T_FADE));
  const lfo = 1 + 0.04 * Math.sin(TWO_PI * 0.16 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.18 * Math.sin(TWO_PI * f * 2 * t + 0.3);
  s = (s / padFreqs.length) * 0.045 * env * lfo;
  L[i] += s;
  R[i] += s * 0.94;
}

/* ---------- Rytmus na celou stopu ---------- */
for (let t = 0; t < T_FADE; t += beat) {
  /* v poslední části (karta) puls zjemní */
  kick(t, t >= T_OUT ? 0.2 : 0.3);
}
for (let t = beat / 2; t < T_FADE; t += beat) shaker(t, t >= T_OUT ? 0.05 : 0.075);
for (let t = 0.25; t < T_FADE; t += beat) shaker(t, 0.03);

/* ---------- Basová linka: E → C → G → D ---------- */
const basNoty = [82.41, 65.41, 98.0, 73.42]; // E2 C2 G2 D2
let bi = 0;
for (let t = 0; t < T_OUT; t += beat * 2) {
  bas(t, basNoty[bi % basNoty.length], beat * 2, 0.16);
  bi++;
}

/* ---------- Střihy: cinknutí + přízvuk ---------- */
STRIHY.forEach((t) => {
  cink(t, 0.24);
  kick(t, 0.34);
});

/* ---------- Výčet: čtyři krátké staby ---------- */
VYCET.forEach((t, i) => {
  stab(t, [329.63, 392.0, 493.88, 587.33][i], 0.11, 8, i % 2 ? 0.25 : -0.25);
  cink(t, 0.1);
});

/* ---------- Brandová karta ---------- */
[164.81, 246.94, 329.63, 493.88].forEach((f, i) => bell(T_OUT + 0.1 + i * 0.07, f, 0.15, 2.8));
bell(T_OUT + 1.8, 987.77, 0.09, 2.2);

/* ---------- Doznění ---------- */
for (let i = Math.round(T_FADE * SR); i < N; i++) {
  const t = i / SR;
  const g = Math.max(0, 1 - (t - T_FADE) / (DUR - 0.4 - T_FADE));
  L[i] *= g;
  R[i] *= g;
}

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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-servis.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
