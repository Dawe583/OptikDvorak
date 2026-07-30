/* Soundtrack k Reelu „Zpátky do školy" (bez licencované hudby).
   Vypravěčský oblouk: tichá zkouška → zjištění → uklidnění → pozvání.
   Harmonie jde z A moll (nejistota u „dítě vám to neřekne") do C dur
   (nabídka, brandová karta), aby konec vyzněl vlídně, ne strašidelně.
   Struktura (časy sedí s src/ReelSkola.tsx → CUES):
     0,35 / 0,95 / 1,55 / 2,15  ťuknutí u každého řádku tabule
     3,6   poslední řádek se zaostří — swell a zvon
     4,2   přejezd zvýrazňovače
     6,1   zhasne se, přijde poznání (A moll, měkký úder)
     9,7   tři signály — tři tiché tepy
    13,7   nabídka — harmonie se rozjasní do C dur
    16,5   brandová karta — rozklad C dur + vysoká tečka
   Výstup: public/music-skola.wav (44,1 kHz / 16 bit / stereo, 21 s).
   Spuštění: node scripts/make-audio-skola.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 21;
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 41;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* Klíčové časy — musí sedět s CUES v src/ReelSkola.tsx */
const RADKY = [0.35, 0.95, 1.55, 2.15];
const T_OSTRO = 3.6;
const T_ZVYRAZ = 4.2;
const T_POZNANI = 6.1;
const T_ZNAKY = 9.7;
const T_NABIDKA = 13.7;
const T_OUT = 16.5;
const T_FADE = 19.4; // reel končí ve 20,5 s

/* ---------- Pluck ---------- */
const pluck = (at, freq, gain, decay = 5.5, pan = 0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 1.8 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 260));
    const s =
      (Math.sin(TWO_PI * freq * t) +
        0.26 * Math.sin(TWO_PI * freq * 2 * t) +
        0.1 * Math.sin(TWO_PI * freq * 3 * t)) *
      env *
      gain;
    L[s0 + j] += s * (1 - Math.max(0, pan));
    R[s0 + j] += s * (1 + Math.min(0, pan));
  }
};

/* ---------- Zvon ---------- */
const bell = (at, freq, gain, decay = 3.0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 3 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 400));
    const s =
      (Math.sin(TWO_PI * freq * t) +
        0.5 * Math.sin(TWO_PI * freq * 2.01 * t) +
        0.2 * Math.sin(TWO_PI * freq * 3 * t)) *
      env *
      gain;
    L[s0 + j] += s;
    R[s0 + j] += s;
  }
};

/* ---------- Měkký úder ---------- */
const kick = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.45 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (54 * Math.exp(-t * 12) + 40) * t) * Math.exp(-t * 11) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- Ťuknutí ukazovátka o tabuli ---------- */
const tuk = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.09 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 90);
    const v = (rnd() * 0.5 + Math.sin(TWO_PI * 1400 * t) * 0.4 + Math.sin(TWO_PI * 520 * t) * 0.3) * env * gain;
    L[s0 + j] += v * 0.94;
    R[s0 + j] += v;
  }
};

/* ---------- Přejezd zvýrazňovače (krátký šum s obálkou) ---------- */
const skrt = (at, len, gain) => {
  const s0 = Math.round(at * SR);
  let lp = 0;
  for (let j = 0; j < len * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.sin(Math.PI * Math.min(1, t / len)) ** 1.4;
    const n = rnd();
    lp = 0.82 * lp + 0.18 * n;
    const v = (n - lp) * env * gain;
    L[s0 + j] += v * (1 - t / len);
    R[s0 + j] += v * (t / len);
  }
};

/* ---------- Pad s měnící se harmonií ---------- */
const pad = (od, doKdy, freqs, gain, nabeh = 0.8) => {
  const s0 = Math.round(od * SR);
  const s1 = Math.round(doKdy * SR);
  for (let i = s0; i < s1 && i < N; i++) {
    const t = i / SR;
    const uvnitr = t - od;
    let env = Math.min(1, uvnitr / nabeh);
    const zbyva = doKdy - t;
    if (zbyva < 0.9) env *= Math.max(0, zbyva / 0.9);
    const lfo = 1 + 0.05 * Math.sin(TWO_PI * 0.12 * t);
    let s = 0;
    for (const f of freqs) s += Math.sin(TWO_PI * f * t) + 0.2 * Math.sin(TWO_PI * f * 2 * t + 0.4);
    s = (s / freqs.length) * gain * env * lfo;
    L[i] += s;
    R[i] += s * 0.93;
  }
};

/* ---------- Harmonický oblouk ---------- */
/* tabule: tiché, věcné C dur (jen dvě noty, aby to znělo „ještě se nic nestalo") */
pad(0, T_POZNANI + 0.6, [130.81, 196.0], 0.05, 1.4); // C3 G3
/* poznání: A moll = zvážnění */
pad(T_POZNANI, T_NABIDKA + 0.5, [110.0, 220.0, 261.63, 329.63], 0.055, 1.0); // A2 A3 C4 E4
/* nabídka a karta: C dur = rozjasnění, vlídný konec */
pad(T_NABIDKA, DUR - 0.4, [130.81, 196.0, 261.63, 329.63], 0.058, 1.0); // C3 G3 C4 E4

/* ---------- Tabule: ťuknutí u každého řádku ---------- */
RADKY.forEach((t, i) => {
  tuk(t, 0.3 - i * 0.03);
  pluck(t, [261.63, 329.63, 392.0, 523.25][i], 0.055, 6, i % 2 ? 0.2 : -0.2);
});

/* ---------- Zaostření posledního řádku ---------- */
/* krátké nadechnutí těsně před tím */
skrt(T_OSTRO - 0.5, 0.5, 0.03);
kick(T_OSTRO, 0.26);
[523.25, 659.25, 783.99].forEach((f, i) => bell(T_OSTRO + 0.05 + i * 0.05, f, 0.15, 2.4));
/* přejezd zvýrazňovače */
skrt(T_ZVYRAZ, 0.85, 0.055);

/* ---------- Zhasnutí a poznání ---------- */
kick(T_POZNANI, 0.34);
bell(T_POZNANI + 0.05, 440.0, 0.13, 2.8); // A4
pluck(T_POZNANI + 0.9, 329.63, 0.07, 5); // E4
pluck(T_POZNANI + 1.8, 261.63, 0.07, 5, 0.2); // C4

/* ---------- Tři signály: tři tiché tepy ---------- */
[T_ZNAKY + 0.4, T_ZNAKY + 1.0, T_ZNAKY + 1.6].forEach((t, i) => {
  kick(t, 0.18);
  pluck(t, [329.63, 392.0, 440.0][i], 0.06, 5.5, i % 2 ? 0.22 : -0.22);
});

/* ---------- Nabídka: rozjasnění ---------- */
kick(T_NABIDKA, 0.28);
[523.25, 659.25].forEach((f, i) => bell(T_NABIDKA + 0.06 + i * 0.06, f, 0.14, 2.6));
const scale = [261.63, 293.66, 329.63, 392.0, 440.0]; // C dur pentatonika
[0, 0.42, 0.84, 1.26, 1.68, 2.1].forEach((d, i) => {
  pluck(T_NABIDKA + 0.5 + d, scale[i % scale.length], 0.055, 5.5, i % 2 ? 0.24 : -0.24);
});

/* ---------- Brandová karta: rozklad C dur + vysoká tečka ---------- */
kick(T_OUT, 0.24);
[261.63, 329.63, 392.0, 523.25].forEach((f, i) => bell(T_OUT + 0.08 + i * 0.06, f, 0.16, 2.8));
bell(T_OUT + 1.7, 1046.5, 0.09, 2.2); // C6

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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-skola.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
