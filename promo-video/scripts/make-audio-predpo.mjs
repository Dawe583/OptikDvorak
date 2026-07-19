/* Soundtrack k REEL B „Před/po — wow moment" (bez licencované hudby),
   dle scénáře: napětí + odpočet 3-2-1 → CVAK (nasazení brýlí, zaostření)
   → teplé rozuzlení → závěrečný ping u loga.
   Struktura: temný napjatý pad → 3 tikot­y odpočtu (stoupající výška)
   → rostoucí šum → CVAK + jasný zvon → teplé arpeggio (tvář) → ping (logo).
   Výstup: public/music-predpo.wav (44,1 kHz / 16 bit / stereo, 15 s).
   Spuštění: node scripts/make-audio-predpo.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 15;
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 11;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* Klíčové časy — musí sedět s src/ReelPredPo.tsx */
const T_C3 = 2.0;
const T_C2 = 2.9;
const T_C1 = 3.8;
const T_CLICK = 4.8;
const T_FACE = 8.0;
const T_OUT = 11.8;

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

/* ---------- CVAK — krátký šumový transient (nasazení brýlí) ---------- */
const click = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.06 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 220);
    const v = (rnd() * 0.7 + Math.sin(TWO_PI * 2600 * t) * 0.5) * env * gain;
    L[s0 + j] += v;
    R[s0 + j] += v * 0.9;
  }
  for (let j = 0; j < 0.12 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * 320 * Math.exp(-t * 8) * t) * Math.exp(-t * 40) * gain * 0.8;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- Temný napjatý pad (A moll) ---------- */
const padFreqs = [110.0, 130.81, 164.81, 220.0]; // A2 C3 E3 A3
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 1.6);
  if (t > DUR - 2) env *= Math.max(0, (DUR - t) / 2);
  /* před cvakem tišší a zamlžený, po cvaku se otevře */
  const open = t < T_CLICK ? 0.62 : Math.min(1, 0.62 + (t - T_CLICK) / 3.5);
  const lfo = 1 + 0.06 * Math.sin(TWO_PI * 0.13 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.22 * Math.sin(TWO_PI * f * 2 * t + 0.4);
  s = (s / padFreqs.length) * 0.055 * env * lfo * open;
  L[i] += s;
  R[i] += s * 0.93;
}

/* ---------- Odpočet 3-2-1: stoupající výška = napětí ---------- */
[[T_C3, 587.33], [T_C2, 659.25], [T_C1, 739.99]].forEach(([at, f]) => {
  bell(at, f, 0.16, 4.5);
  kick(at, 0.16);
});

/* ---------- Rostoucí šum do cvaku (napětí 3,8 → 4,8 s) ---------- */
for (let i = Math.round((T_CLICK - 1.0) * SR); i < Math.round(T_CLICK * SR); i++) {
  const t = i / SR;
  const p = (t - (T_CLICK - 1.0)) / 1.0;
  const s = rnd() * 0.05 * p * p;
  L[i] += s;
  R[i] += s;
}

/* ---------- CVAK + rozjasnění (zaostření světa) ---------- */
click(T_CLICK, 0.8);
bell(T_CLICK + 0.06, 880.0, 0.24, 2.2); // A5 — svět se rozsvítí
bell(T_CLICK + 0.1, 1318.5, 0.14, 2.0); // vysoká jiskra
kick(T_CLICK, 0.34);

/* ---------- Teplé arpeggio od tváře (8 s), A moll pentatonika ---------- */
const scale = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0];
const pattern = [0, 2, 4, 3, 5, 4, 2, 3];
const BPM = 96;
const beat = 60 / BPM;
let step = 0;
for (let t = T_FACE; t < DUR - 1.2; t += beat / 2) {
  const f = scale[pattern[step % pattern.length]];
  const lift = t >= T_OUT ? 1.3 : 1;
  pluck(t, f, 0.085 * lift, 6, step % 2 ? 0.25 : -0.25);
  step++;
}
for (let t = T_FACE; t < T_OUT; t += beat) kick(t, 0.14);

/* ---------- Závěrečný PING u loga (Amaj rozklad) ---------- */
kick(T_OUT, 0.24);
[440.0, 554.37, 659.25, 880.0].forEach((f, i) => bell(T_OUT + 0.1 + i * 0.06, f, 0.17, 2.6));
bell(T_OUT + 1.4, 1318.5, 0.1, 2.0);

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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-predpo.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
