/* Tematický soundtrack k edukativnímu reelu (bez licencované hudby):
   čistý pentatonický pluck bed + stoupající „pop" na každý ze 3 tipů
   (C5→E5→G5 = uspokojivé odpočítání 1-2-3) + chime resolve na CTA.
   Světlejší, „premium/clean" nálada — jiná než temný teaser.
   Výstup: public/music-edukace.wav (44,1 kHz / 16 bit / stereo, 20 s).
   Spuštění: node scripts/make-audio-edukace.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = Number(process.env.DUR ?? 20);
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

/* Klíčové časy — musí sedět s src/ReelEdukace.tsx */
const T_TIPS = (process.env.TIPS ?? '3.2,7.6,12.0').split(',').map(Number);
const T_CTA = Number(process.env.CTA ?? 16.4);

/* ---------- Plucknutá nota (attack + exp decay + 2. harmonická) ---------- */
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

/* ---------- Světlý zvon (pop na tip) — delší, čistý ---------- */
const bell = (at, freq, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 2.4 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 3.2) * (1 - Math.exp(-t * 400));
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

/* ---------- Pad bed (C dur, celý track) ---------- */
const padFreqs = [130.81, 164.81, 196.0, 261.63]; // C3 E3 G3 C4
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 1.5); // fade in
  if (t > DUR - 2) env *= Math.max(0, (DUR - t) / 2); // fade out
  const lfo = 1 + 0.06 * Math.sin(TWO_PI * 0.15 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.25 * Math.sin(TWO_PI * f * 2 * t + 0.5);
  s = (s / padFreqs.length) * 0.05 * env * lfo;
  L[i] += s;
  R[i] += s * 0.94;
}

/* ---------- Pentatonický pluck arpeggio (C dur pentatonika) ---------- */
const BPM = 96;
const beat = 60 / BPM;
const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C4 D4 E4 G4 A4 C5
const pattern = [0, 2, 4, 3, 2, 4, 5, 3];
let step = 0;
for (let t = 1.0; t < DUR - 1.6; t += beat / 2) {
  const f = scale[pattern[step % pattern.length]];
  const g = 0.11 * (0.7 + 0.3 * Math.sin(step * 0.5)); // jemná dynamika
  pluck(t, f, g, 6, (step % 2 ? 0.25 : -0.25));
  step++;
}

/* ---------- Měkký puls od 1. tipu ---------- */
for (let t = T_TIPS[0]; t < DUR - 1.0; t += beat) kick(t, 0.16);

/* ---------- POP na každý tip: stoupající C5 → E5 → G5 ---------- */
const tipNotes = [523.25, 659.25, 783.99];
T_TIPS.forEach((at, i) => {
  kick(at, 0.28); // důraz
  bell(at, tipNotes[Math.min(i, tipNotes.length - 1)], 0.26);
});

/* ---------- CTA: chime resolve (Cmaj akord) ---------- */
[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(T_CTA + i * 0.05, f, 0.16));
kick(T_CTA, 0.24);

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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', process.env.OUT ?? 'music-edukace.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
