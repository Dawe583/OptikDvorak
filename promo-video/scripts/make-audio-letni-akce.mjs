/* Soundtrack k Reelu „Letní dvojka" (bez licencované hudby).
   Nálada: světlá, letní, o kus energičtější než ostatní Reels — je to
   výkonnostní reklama, ne prohlídka. D dur, 104 BPM.
   Struktura (časy sedí s src/ReelLetniAkce.tsx → CUES):
     0,0  háček (mhouření) — tichý pad + tep
     2,3  vyjde slunce — otevře se pad, naskočí šejkr
     4,5  nabídka — riser
     5,7  DOPAD velkého čísla — úder + zvonkohra
     9,0  pro koho — tři cinknutí na tři odrážky
    12,0  platnost — zdvih, hustší puls
    13,6  brandová karta — rozklad D dur + vysoká tečka
   Výstup: public/music-letni-akce.wav (44,1 kHz / 16 bit / stereo, 18,5 s).
   Spuštění: node scripts/make-audio-letni-akce.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 18.5;
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

/* Klíčové časy — musí sedět s CUES v src/ReelLetniAkce.tsx */
const T_SLUNCE = 2.3;
const T_NABIDKA = 4.5;
const T_CISLO = 5.7;
const T_PRO_KOHO = 9.0;
const T_PLATNOST = 12.0;
const T_OUT = 13.6;
const T_FADE = 17.0; // reel končí v 18,0 s

/* ---------- Plucknutá nota ---------- */
const pluck = (at, freq, gain, decay = 5.5, pan = 0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 1.6 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 260));
    const s =
      (Math.sin(TWO_PI * freq * t) +
        0.28 * Math.sin(TWO_PI * freq * 2 * t) +
        0.11 * Math.sin(TWO_PI * freq * 3 * t)) *
      env *
      gain;
    L[s0 + j] += s * (1 - Math.max(0, pan));
    R[s0 + j] += s * (1 + Math.min(0, pan));
  }
};

/* ---------- Zvon / cinknutí ---------- */
const bell = (at, freq, gain, decay = 3.2) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 3 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 400));
    const s =
      (Math.sin(TWO_PI * freq * t) +
        0.5 * Math.sin(TWO_PI * freq * 2.01 * t) +
        0.22 * Math.sin(TWO_PI * freq * 3 * t)) *
      env *
      gain;
    L[s0 + j] += s;
    R[s0 + j] += s;
  }
};

/* ---------- Kick ---------- */
const kick = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.45 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (58 * Math.exp(-t * 12) + 41) * t) * Math.exp(-t * 11) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- Šejkr / hi-hat ---------- */
const shaker = (at, gain) => {
  const s0 = Math.round(at * SR);
  let lp = 0;
  for (let j = 0; j < 0.05 * SR && s0 + j < N; j++) {
    const n = rnd();
    lp = 0.72 * lp + 0.28 * n;
    const v = (n - lp) * Math.exp(-(j / SR) * 90) * gain;
    L[s0 + j] += v * 0.85;
    R[s0 + j] += v;
  }
};

/* ---------- Riser (napětí před dopadem čísla) ---------- */
const riser = (od, doKdy, gain) => {
  const s0 = Math.round(od * SR);
  const s1 = Math.round(doKdy * SR);
  let lp = 0;
  for (let i = s0; i < s1 && i < N; i++) {
    const p = (i - s0) / (s1 - s0);
    const t = i / SR;
    const n = rnd();
    const a = 0.02 + 0.5 * Math.pow(p, 2);
    lp += a * (n - lp);
    const sum = (n - lp) * Math.pow(p, 2.2) * gain;
    const ton = Math.sin(TWO_PI * 220 * Math.pow(2, p * 1.6) * t) * Math.pow(p, 3) * gain * 0.5;
    L[i] += sum + ton * 0.9;
    R[i] += sum * 0.92 + ton;
  }
};

/* ---------- Pad D dur ---------- */
const padFreqs = [146.83, 220.0, 293.66, 369.99]; // D3 A3 D4 F#4
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 1.2);
  if (t > T_FADE) env *= Math.max(0, (DUR - 0.5 - t) / (DUR - 0.5 - T_FADE));
  /* než vyjde slunce, je pad přidušený */
  const open = t < T_SLUNCE ? 0.55 : Math.min(1, 0.55 + (t - T_SLUNCE) / 2.4);
  const lfo = 1 + 0.05 * Math.sin(TWO_PI * 0.14 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.2 * Math.sin(TWO_PI * f * 2 * t + 0.4);
  s = (s / padFreqs.length) * 0.055 * env * lfo * open;
  L[i] += s;
  R[i] += s * 0.93;
}

const BPM = 104;
const beat = 60 / BPM;

/* ---------- Háček: tichý tep, ať to hned někam jde ---------- */
for (let t = 0.35; t < T_SLUNCE; t += beat) kick(t, 0.1);

/* ---------- Slunce vyjde: šejkr od 2,3 s, puls zesílí ---------- */
bell(T_SLUNCE, 587.33, 0.14, 2.6); // D5
for (let t = T_SLUNCE; t < T_FADE; t += beat / 2) {
  const hlasitost = t < T_CISLO ? 0.05 : t < T_OUT ? 0.075 : 0.045;
  shaker(t, hlasitost);
}
for (let t = T_SLUNCE; t < T_NABIDKA; t += beat) kick(t, 0.15);

/* ---------- Nabídka: riser do dopadu čísla ---------- */
riser(T_NABIDKA, T_CISLO, 0.09);

/* ---------- DOPAD čísla: úder + rozjasnění ---------- */
kick(T_CISLO, 0.42);
[587.33, 880.0, 1174.66].forEach((f, i) => bell(T_CISLO + 0.04 + i * 0.05, f, 0.2, 2.4));
for (let t = T_CISLO; t < T_PRO_KOHO; t += beat) kick(t, 0.2);

/* ---------- Arpeggio D dur pentatonika od dopadu ---------- */
const scale = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33]; // D4 E4 F#4 A4 B4 D5
const pattern = [0, 2, 4, 3, 5, 4, 2, 1];
let step = 0;
for (let t = T_CISLO; t < T_FADE; t += beat / 2) {
  const lift = t >= T_OUT ? 0.5 : t >= T_PLATNOST ? 1.15 : 1;
  pluck(t, scale[pattern[step % pattern.length]], 0.07 * lift, 5.5, step % 2 ? 0.25 : -0.25);
  step++;
}

/* ---------- Pro koho: tři cinknutí přesně na tři odrážky ---------- */
[9.35, 9.77, 10.19].forEach((t, i) => {
  bell(t, [659.25, 739.99, 880.0][i], 0.13, 2.6);
  kick(t, 0.16);
});

/* ---------- Platnost: zdvih, ať je cítit „stihni to" ---------- */
kick(T_PLATNOST, 0.3);
bell(T_PLATNOST, 987.77, 0.12, 2.2); // B5
for (let t = T_PLATNOST; t < T_OUT; t += beat / 2) kick(t, 0.17);

/* ---------- Brandová karta: rozklad D dur + vysoká tečka ---------- */
kick(T_OUT, 0.26);
[293.66, 369.99, 440.0, 587.33].forEach((f, i) => bell(T_OUT + 0.08 + i * 0.06, f, 0.17, 2.8));
bell(T_OUT + 1.7, 1174.66, 0.09, 2.2); // D6

/* ---------- Doznění ---------- */
for (let i = Math.round(T_FADE * SR); i < N; i++) {
  const t = i / SR;
  const g = Math.max(0, 1 - (t - T_FADE) / (DUR - 0.5 - T_FADE));
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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-letni-akce.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
