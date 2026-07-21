/* Soundtrack k REEL E „Zákulisí — co tě čeká na měření zraku" (bez licencované hudby).
   TEMATICKÝ design — zvuky přímo z optiky, ne generický podkres:
   · „ratchet" tikání kolečka zkušebních čoček (foropter) jako perkusní textura,
   · „autofokus" sweep (stoupající šum) před každým střihem → CVAK čočky na střihu,
   · teplý filcový klavír s motivem nad progresí C → G/B → Am7 → Fmaj7,
   · klesající basová linka C–B–A–F (důvěra, klid),
   · sidechain „dýchání" padu s kopákem, swing shaker,
   · outro: rozklad Cadd9 = „svět se zaostřil".
   Tempo 100 BPM → takt = 2,4 s = přesně délka háčku; střihy sedí na dobu.
   Výstup: public/music-zakulisi.wav (44,1 kHz / 16 bit / stereo, 28 s).
   Spuštění: node scripts/make-audio-zakulisi.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 28;
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 47;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* Klíčové časy — musí sedět s src/ReelZakulisi.tsx */
const T_S1 = 2.4;
const T_S2 = 8.4;
const T_S3 = 14.2;
const T_OUT = 23.0;

const BPM = 100;
const BEAT = 60 / BPM; // 0,6 s
const BAR = BEAT * 4; // 2,4 s — takt = délka háčku

/* ---------- Filcový klavír (dva rozladěné oscilátory, měkký nástup) ---------- */
const felt = (at, freq, gain, decay = 2.2, pan = 0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 2.6 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 380));
    const s =
      (Math.sin(TWO_PI * freq * 0.9985 * t) +
        Math.sin(TWO_PI * freq * 1.0015 * t) +
        0.32 * Math.sin(TWO_PI * freq * 2 * t) +
        0.08 * Math.sin(TWO_PI * freq * 3 * t)) *
      0.5 *
      env *
      gain;
    L[s0 + j] += s * (1 - Math.max(0, pan));
    R[s0 + j] += s * (1 + Math.min(0, pan));
  }
};

/* ---------- Zvon / ping (střihy, outro) ---------- */
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
const kickTimes = [];
const kick = (at, gain) => {
  kickTimes.push(at);
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.4 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (55 * Math.exp(-t * 12) + 40) * t) * Math.exp(-t * 12) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- Shaker (swing na osminách) ---------- */
const shaker = (at, gain, pan = 0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.1 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = rnd() * Math.exp(-t * 60) * gain;
    L[s0 + j] += v * (1 - Math.max(0, pan));
    R[s0 + j] += v * (1 + Math.min(0, pan));
  }
};

/* ---------- CVAK čočky (zaklapnutí do obruby foropteru) ---------- */
const click = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.05 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = (rnd() * 0.6 + Math.sin(TWO_PI * 2400 * t) * 0.5) * Math.exp(-t * 260) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v * 0.92;
  }
  for (let j = 0; j < 0.1 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * 300 * Math.exp(-t * 9) * t) * Math.exp(-t * 45) * gain * 0.7;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- „Ratchet" — tikání kolečka zkušebních čoček (perkusní textura) ---------- */
const ratchet = (at, n, gain, pan = 0.3) => {
  for (let i = 0; i < n; i++) {
    const s0 = Math.round((at + i * 0.048) * SR);
    const g = gain * (1 - i * 0.14);
    for (let j = 0; j < 0.025 * SR && s0 + j < N; j++) {
      const t = j / SR;
      const v = (rnd() * 0.5 + Math.sin(TWO_PI * 1750 * t) * 0.4) * Math.exp(-t * 420) * g;
      L[s0 + j] += v * (1 - Math.max(0, pan));
      R[s0 + j] += v * (1 + Math.min(0, pan));
    }
  }
};

/* ---------- „Autofokus" sweep — stoupající šum + tón do střihu ---------- */
const sweep = (endAt, gain = 1) => {
  const dur = 0.85;
  const s0 = Math.round((endAt - dur) * SR);
  for (let j = 0; j < dur * SR && s0 + j < N; j++) {
    if (s0 + j < 0) continue;
    const p = j / (dur * SR);
    const t = j / SR;
    const f = 480 * Math.pow(5.5, p); // 480 Hz → ~2640 Hz
    const v = (rnd() * 0.045 * p * p + Math.sin(TWO_PI * f * t) * 0.02 * p) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v * 0.9;
  }
};

/* ---------- Pad s akordovou progresí (překryvné nástupy, bez lupanců) ---------- */
const CHORDS = {
  C: [130.81, 164.81, 196.0, 293.66], // Cadd9
  GB: [123.47, 146.83, 196.0, 246.94], // G/B
  Am: [110.0, 130.81, 164.81, 196.0], // Am7
  F: [174.61, 220.0, 261.63, 329.63], // Fmaj7
};
const pad = (at, until, freqs, gain) => {
  const s0 = Math.round(at * SR);
  const len = Math.min(Math.round((until - at + 0.35) * SR), N - s0);
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const tt = at + t;
    const atk = Math.min(1, t / 0.3);
    const rel = Math.min(1, Math.max(0, (until + 0.35 - tt) / 0.35));
    const lfo = 1 + 0.05 * Math.sin(TWO_PI * 0.14 * tt);
    let s = 0;
    for (const f of freqs) s += Math.sin(TWO_PI * f * tt) + 0.18 * Math.sin(TWO_PI * f * 2 * tt + 0.3);
    s = (s / freqs.length) * gain * atk * rel * lfo;
    L[s0 + j] += s;
    R[s0 + j] += s * 0.94;
  }
};

/* ---------- Bas (sub + 2. harmonická, ať je slyšet i z telefonu) ---------- */
const bass = (at, freq, gain, decay = 2.8) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 1.4 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 200));
    const v = (Math.sin(TWO_PI * freq * t) + 0.5 * Math.sin(TWO_PI * freq * 2 * t)) * env * gain;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ================== ARANŽ ================== */

/* Intro (0–2,4 s): tichý C pad + teaser motivu, autofokus najíždí do KROKU 1 */
pad(0, T_S1, CHORDS.C, 0.035);
felt(0.6, 329.63, 0.045, 2.0, -0.2); // E4
felt(1.2, 392.0, 0.045, 2.0, 0.2); // G4

/* Progrese C → G/B → Am7 → Fmaj7, takt = 2,4 s, od KROKU 1 do outra */
const PROG = ['C', 'GB', 'Am', 'F'];
const BASS_ROOT = {C: 65.41, GB: 61.74, Am: 55.0, F: 43.65};
for (let bar = 0, t = T_S1; t < T_OUT - 0.01; t += BAR, bar++) {
  const ch = PROG[bar % 4];
  pad(t, Math.min(t + BAR, T_OUT), CHORDS[ch], 0.055);
  bass(t, BASS_ROOT[ch], 0.16); // doba 1 — kořen
  bass(t + 2 * BEAT, BASS_ROOT[ch] * 2, 0.09, 5); // doba 3 — oktáva, kratší
}

/* Kopák na doby 1 a 3, shaker swing na osminách */
for (let t = T_S1; t < T_OUT - 0.01; t += 2 * BEAT) kick(t, 0.15);
for (let i = 0, t = T_S1; t < T_OUT - 0.01; t += BEAT / 2, i++) {
  const swingT = i % 2 === 1 ? t + 0.045 : t; // offbeaty lehce pozdě = swing
  shaker(swingT, i % 2 === 0 ? 0.032 : 0.058, i % 4 < 2 ? 0.32 : -0.32);
}

/* Melodie — filcový klavír, 4taktová fráze (beat → nota), 2× dokola */
const MELODY = [
  [0, 329.63], [2, 392.0], [3, 440.0], [4, 392.0], [6, 329.63], [7, 293.66],
  [8, 261.63], [10, 329.63], [11, 392.0], [12, 440.0], [14, 392.0], [15, 329.63],
];
for (let loop = 0; loop < 3; loop++) {
  const base = T_S1 + loop * 16 * BEAT;
  for (const [b, f] of MELODY) {
    const t = base + b * BEAT;
    if (t >= T_OUT - 0.3) break;
    felt(t, f, 0.08, 2.2, b % 4 < 2 ? -0.18 : 0.18);
    if (loop === 1) felt(t, f * 2, 0.028, 2.6, 0); // 2. průchod: oktáva navrch = gradace
  }
}

/* Tikání kolečka čoček — fill na konci taktů (tematická perkuse) */
ratchet(4.5, 4, 0.05, 0.35);
ratchet(9.3, 4, 0.05, -0.35);
ratchet(13.94, 5, 0.055, 0.35); // těsně před KROKEM 3 — „doladění dioptrie"
ratchet(17.7, 4, 0.045, -0.35);
ratchet(21.46, 4, 0.045, 0.35);

/* Střihy: autofokus sweep → CVAK čočky + stoupající zvon (C5 → E5 → G5) */
sweep(T_S1); click(T_S1, 0.5); bell(T_S1, 523.25, 0.17, 3.4);
sweep(T_S2); click(T_S2, 0.5); bell(T_S2, 659.25, 0.17, 3.4);
sweep(T_S3); click(T_S3, 0.5); bell(T_S3, 783.99, 0.17, 3.4);

/* Outro (19 s): „svět se zaostřil" — rozklad Cadd9 + dlouhý pad + finální tón */
sweep(T_OUT, 0.7); click(T_OUT, 0.42);
kick(T_OUT, 0.2);
pad(T_OUT, DUR - 1.2, [130.81, 164.81, 196.0, 261.63, 293.66], 0.06);
bass(T_OUT, 65.41, 0.17, 1.6);
[523.25, 659.25, 783.99, 1174.66].forEach((f, i) => bell(T_OUT + 0.1 + i * 0.09, f, 0.16, 2.8)); // C5 E5 G5 D6
felt(T_OUT + 0.55, 659.25, 0.09, 1.4, 0); // E5 — závěrečná nota motivu
bell(T_OUT + 2.1, 1567.98, 0.07, 2.2); // G6 jiskra
bell(T_OUT + 3.1, 2093.0, 0.045, 2.0); // C7 — poslední „hvězdička"

/* ---------- Sidechain: pad+bas „dýchá" s kopákem ---------- */
const duck = new Float32Array(N).fill(1);
for (const kt of kickTimes) {
  const s0 = Math.round(kt * SR);
  const len = Math.round(0.26 * SR);
  for (let j = 0; j < len && s0 + j < N; j++) {
    const p = j / len;
    const g = 0.6 + 0.4 * p * p;
    if (g < duck[s0 + j]) duck[s0 + j] = g;
  }
}
for (let i = 0; i < N; i++) {
  L[i] *= duck[i];
  R[i] *= duck[i];
}

/* ---------- Master fade + zápis WAV ---------- */
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let g = Math.min(1, t / 0.25);
  if (t > DUR - 1.4) g *= Math.max(0, (DUR - t) / 1.4);
  L[i] *= g;
  R[i] *= g;
}
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));

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
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB, peak ${peak.toFixed(2)}`);
