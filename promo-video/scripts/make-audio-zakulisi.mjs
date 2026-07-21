/* Soundtrack k REEL E „Zákulisí — co tě čeká na měření zraku" (bez licencované hudby).
   Vibe: teplý, moderní, mírně lo-fi „behind the scenes" — jde dopředu, ale klidně.
   Struktura: teplý pad (C dur) → jemný beat + shaker od 1. kroku → ping na každém
   přechodu kroku (stoupavá melodie 01→02→03) → světlejší akord u loga (outro).
   Výstup: public/music-zakulisi.wav (44,1 kHz / 16 bit / stereo, 24 s).
   Spuštění: node scripts/make-audio-zakulisi.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 24;
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 29;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* Klíčové časy — musí sedět s src/ReelZakulisi.tsx */
const T_S1 = 2.4;
const T_S2 = 8.4;
const T_S3 = 14.2;
const T_OUT = 19.0;

/* ---------- Plucknutá nota (teplé arpeggio) ---------- */
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

/* ---------- Zvon / ping (přechody kroků, logo) ---------- */
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

/* ---------- Shaker / hi-hat (jemný, „profi" groove) ---------- */
const shaker = (at, gain, pan = 0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.12 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 55);
    const v = rnd() * env * gain;
    L[s0 + j] += v * (1 - Math.max(0, pan));
    R[s0 + j] += v * (1 + Math.min(0, pan));
  }
};

/* ---------- Teplý pad (C dur — vstřícný, důvěryhodný) ---------- */
const padFreqs = [130.81, 164.81, 196.0, 261.63]; // C3 E3 G3 C4
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 1.4);
  if (t > DUR - 1.6) env *= Math.max(0, (DUR - t) / 1.6);
  /* před 1. krokem komorní, pak se otevře */
  const open = t < T_S1 ? 0.7 : Math.min(1, 0.7 + (t - T_S1) / 4);
  const lfo = 1 + 0.05 * Math.sin(TWO_PI * 0.12 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.2 * Math.sin(TWO_PI * f * 2 * t + 0.3);
  s = (s / padFreqs.length) * 0.06 * env * lfo * open;
  L[i] += s;
  R[i] += s * 0.94;
}

/* ---------- Groove: kick + shaker od 1. kroku do outra ---------- */
const BPM = 92;
const beat = 60 / BPM;
for (let t = T_S1, b = 0; t < T_OUT; t += beat / 2, b++) {
  if (b % 2 === 0) kick(t, 0.16);
  shaker(t, b % 2 === 0 ? 0.04 : 0.07, b % 4 < 2 ? 0.3 : -0.3);
}

/* ---------- Teplé arpeggio (C dur pentatonika) od 1. kroku ---------- */
const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C D E G A C
const pattern = [0, 2, 4, 3, 5, 4, 2, 1];
let step = 0;
for (let t = T_S1; t < T_OUT - 0.3; t += beat / 2) {
  const f = scale[pattern[step % pattern.length]];
  pluck(t, f, 0.07, 6, step % 2 ? 0.28 : -0.28);
  step++;
}

/* ---------- Ping na každém přechodu kroku: stoupavá melodie 01→02→03 ---------- */
[[T_S1, 523.25], [T_S2, 659.25], [T_S3, 783.99]].forEach(([at, f]) => {
  bell(at, f, 0.2, 3.4);
  bell(at + 0.04, f * 2, 0.09, 2.4);
  kick(at, 0.22);
});

/* ---------- Outro: světlejší akord u loga (C dur rozklad) ---------- */
kick(T_OUT, 0.24);
[392.0, 523.25, 659.25, 783.99].forEach((f, i) => bell(T_OUT + 0.08 + i * 0.06, f, 0.17, 3.0));
bell(T_OUT + 1.6, 1046.5, 0.1, 2.4);
/* doznění arpeggia i v outru, ať konec „dýchá" */
for (let t = T_OUT + 0.2, s2 = 0; t < DUR - 1.0; t += beat / 2, s2++) {
  const f = scale[[0, 4, 2, 5][s2 % 4]];
  pluck(t, f, 0.05, 6, s2 % 2 ? 0.28 : -0.28);
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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-zakulisi.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
