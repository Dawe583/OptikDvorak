/* Soundtrack k Reelu „Projdi si naši optiku" (bez licencované hudby).
   Nálada: světlá, přívětivá, klidná — jde se na návštěvu, ne na výprodej.
   Struktura (časy sedí s src/ReelProhlidka.tsx → CUES):
     0,0  háček — tichý teplý pad + nádech
     2,3  vstup do prodejny — měkký impuls, rozjede se „krok" a arpeggio
     7,2  stěna obrouček — jemný zvonek na střihu
    10,1  pult / nápis OPTIK DVOŘÁK — zvonek + hustší puls
    13,0  stůl na výběr brýlí — arpeggio se zjemní (intimní moment)
    15,5  brandová karta — rozklad A dur + vysoká tečka
   Výstup: public/music-prohlidka.wav (44,1 kHz / 16 bit / stereo, 21 s).
   Spuštění: node scripts/make-audio-prohlidka.mjs */
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

let seed = 11;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* Klíčové časy — musí sedět s src/ReelProhlidka.tsx (export CUES) */
const T_DOLLY = 2.3;
const T_WALL = 7.2;
const T_PULT = 10.1;
const T_STUL = 13.0;
const T_OUT = 15.5;
const T_FADE = 19.6; // konec reelu je v 20,5 s — dozvuk musí být do té doby dole

/* ---------- Plucknutá nota (teplá, krátká) ---------- */
const pluck = (at, freq, gain, decay = 5.5, pan = 0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 1.6 * SR && s0 + j < N; j++) {
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

/* ---------- Zvon / ping (akcent na střihu) ---------- */
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

/* ---------- Měkký sub kick („krok" prodejnou) ---------- */
const kick = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.4 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (55 * Math.exp(-t * 12) + 40) * t) * Math.exp(-t * 12) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- Šumový nádech (vzduch v prostoru) ---------- */
const air = (at, len, gain) => {
  const s0 = Math.round(at * SR);
  let lp = 0;
  for (let j = 0; j < len * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.sin(Math.PI * Math.min(1, t / len)) ** 2;
    const n = rnd();
    lp += 0.05 * (n - lp);
    const v = lp * env * gain;
    L[s0 + j] += v;
    R[s0 + j] += v * 0.85;
  }
};

/* ---------- Pad A dur (teplý, otevřený — „jsi vítán") ---------- */
const padFreqs = [110.0, 164.81, 220.0, 277.18]; // A2 E3 A3 C#4
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 1.6); // pomalý náběh
  if (t > T_FADE) env *= Math.max(0, (DUR - 0.4 - t) / (DUR - 0.4 - T_FADE));
  /* před vstupem do prodejny tišeji, po vstupu se pad otevře */
  const open = t < T_DOLLY ? 0.66 : Math.min(1, 0.66 + (t - T_DOLLY) / 3.5);
  const lfo = 1 + 0.06 * Math.sin(TWO_PI * 0.11 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.2 * Math.sin(TWO_PI * f * 2 * t + 0.4);
  s = (s / padFreqs.length) * 0.058 * env * lfo * open;
  L[i] += s;
  R[i] += s * 0.93;
}

/* ---------- Háček: nádech před vstupem ---------- */
air(0.2, 1.9, 0.05);
pluck(0.35, 220.0, 0.075, 4.5, -0.2); // A3
pluck(1.25, 329.63, 0.07, 4.5, 0.2); // E4

/* ---------- Vstup do prodejny (2,3 s) ---------- */
air(T_DOLLY - 0.55, 0.85, 0.055);
kick(T_DOLLY, 0.3);
bell(T_DOLLY + 0.05, 659.25, 0.13, 2.6); // E5 — dveře se otevřou

/* ---------- Arpeggio A dur pentatonika od vstupu ---------- */
const scale = [220.0, 246.94, 277.18, 329.63, 369.99, 440.0]; // A3 B3 C#4 E4 F#4 A4
const pattern = [0, 2, 3, 5, 4, 3, 1, 2];
const BPM = 88;
const beat = 60 / BPM;
let step = 0;
for (let t = T_DOLLY; t < T_FADE; t += beat / 2) {
  /* u stolu (od 13 s) je to intimnější, na kartě už jen doznívá */
  let lift = 1;
  if (t >= T_PULT && t < T_STUL) lift = 1.2;
  if (t >= T_STUL && t < T_OUT) lift = 0.8;
  if (t >= T_OUT) lift = 0.45;
  pluck(t, scale[pattern[step % pattern.length]], 0.075 * lift, 5.5, step % 2 ? 0.25 : -0.25);
  step++;
}

/* ---------- „Krok" prodejnou: klidný puls, u pultu hustší ---------- */
for (let t = T_DOLLY; t < T_PULT; t += beat) kick(t, 0.13);
for (let t = T_PULT; t < T_STUL; t += beat / 2) kick(t, 0.15);
for (let t = T_STUL; t < T_OUT; t += beat) kick(t, 0.11);

/* ---------- Akcenty na střizích ---------- */
bell(T_WALL, 880.0, 0.1, 2.4); // A5
kick(T_WALL, 0.18);
bell(T_PULT, 554.37, 0.12, 2.6); // C#5
kick(T_PULT, 0.2);
bell(T_STUL, 739.99, 0.1, 2.8); // F#5 — teplý, tišší moment
air(T_STUL - 0.3, 0.9, 0.035);

/* ---------- Brandová karta: rozklad A dur + vysoká tečka ---------- */
kick(T_OUT, 0.24);
[440.0, 554.37, 659.25, 880.0].forEach((f, i) => bell(T_OUT + 0.1 + i * 0.06, f, 0.16, 2.6));
bell(T_OUT + 1.7, 1318.5, 0.09, 2.0); // E6 — tečka u CTA

/* ---------- Doznění: hlavní fade celé stopy ---------- */
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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-prohlidka.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
