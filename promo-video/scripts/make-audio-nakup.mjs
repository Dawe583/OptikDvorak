/* Soundtrack k REELU „celkový nákup u nás" (src/ReelNakup.tsx) — bez licencované
   hudby, celé syntetizované, ve stejném duchu jako make-audio-edukace.mjs
   a make-audio-rodina.mjs. Nálada: teplá a vlídná, ale s jasným rytmem,
   aby se dalo počítat na čtyři kroky.

   ČASOVÁ MŘÍŽKA — musí sedět s src/ReelNakup.tsx.
   Doba 1 doby = 0,65 s (92,3 BPM), každý předěl padne přesně na dobu:
      0,00  háček           teplý pad, bez rytmu (4 doby)
      2,60  KROK 01         nastupuje puls + arpeggio, zvon C5   (6 dob)
      6,50  KROK 02         zvon D5                              (6 dob)
     10,40  KROK 03         zvon E5                              (6 dob)
     14,30  KROK 04         zvon G5                              (6 dob)
     18,20  PROČ U NÁS      rozkvetlý akord Cmaj9, pad se zvedne (5 dob)
     21,45  CTA             chime resolve u brandové karty       (5 dob)
     24,70  konec videa (NAKUP_DURATION = 1482 snímků při 60 fps)

   Výstup: public/music-nakup.wav (44,1 kHz / 16 bit / stereo, 25 s).
   Spuštění: node scripts/make-audio-nakup.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 25;
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 37;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* Klíčové časy (viz hlavička) */
const BEAT = 0.65; // 92,3 BPM
const T_STEPS = [2.6, 6.5, 10.4, 14.3];
const T_WHY = 18.2;
const T_CTA = 21.45;
const T_END = 24.7;

/* ---------- Plucknutá nota (měkké piano) ---------- */
const pluck = (at, freq, gain, decay = 5, pan = 0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 2.0 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 240));
    const s =
      (Math.sin(TWO_PI * freq * t) + 0.3 * Math.sin(TWO_PI * freq * 2 * t) + 0.1 * Math.sin(TWO_PI * freq * 3 * t)) *
      env *
      gain;
    L[s0 + j] += s * (1 - Math.max(0, pan));
    R[s0 + j] += s * (1 + Math.min(0, pan));
  }
};

/* ---------- Zvon / ping (označuje krok) ---------- */
const bell = (at, freq, gain, decay = 3.0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 3.2 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 400));
    const s =
      (Math.sin(TWO_PI * freq * t) + 0.5 * Math.sin(TWO_PI * freq * 2.01 * t) + 0.22 * Math.sin(TWO_PI * freq * 3 * t)) *
      env *
      gain;
    L[s0 + j] += s;
    R[s0 + j] += s;
  }
};

/* ---------- Měkký sub kick ---------- */
const kick = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.45 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (54 * Math.exp(-t * 12) + 39) * t) * Math.exp(-t * 12) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- Shaker (filtrovaný šum — drží krok) ---------- */
let hp = 0;
const shaker = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.14 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 42) * (1 - Math.exp(-t * 900));
    const n = rnd();
    hp = 0.72 * hp + 0.28 * n; // jednoduchý dolní průměr → z rozdílu vznikne „vzduch"
    const v = (n - hp) * env * gain;
    L[s0 + j] += v * 0.95;
    R[s0 + j] += v;
  }
};

/* ---------- Teplý durový pad (C dur, celá stopa) ---------- */
const padFreqs = [130.81, 164.81, 196.0, 261.63]; // C3 E3 G3 C4
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 1.6); // vlídný náběh
  if (t > T_END - 2.2) env *= Math.max(0, (T_END - t) / 2.2);
  /* na „proč u nás" se pad zvedne — emoční vrchol před CTA */
  const lift = t >= T_WHY ? Math.min(1.3, 1 + (t - T_WHY) / 9) : 1;
  const lfo = 1 + 0.05 * Math.sin(TWO_PI * 0.12 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.22 * Math.sin(TWO_PI * f * 2 * t + 0.4);
  s = (s / padFreqs.length) * 0.055 * env * lfo * lift;
  L[i] += s;
  R[i] += s * 0.93;
}

/* ---------- Shaker na osminách: od 1. kroku do konce cesty ---------- */
for (let t = T_STEPS[0]; t < T_CTA + 0.9; t += BEAT / 2) {
  const onBeat = Math.abs((t - T_STEPS[0]) / BEAT - Math.round((t - T_STEPS[0]) / BEAT)) < 0.01;
  shaker(t, onBeat ? 0.10 : 0.055);
}

/* ---------- Puls: kick na každou dobu, silnější na začátku taktu ---------- */
let b = 0;
for (let t = T_STEPS[0]; t < T_CTA; t += BEAT, b++) {
  kick(t, b % 2 === 0 ? 0.19 : 0.11);
}

/* ---------- Arpeggio přes celou cestu (C dur pentatonika) ---------- */
const scale = [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0]; // G3 A3 C4 D4 E4 G4 A4
const pattern = [2, 4, 5, 4, 3, 5, 6, 4];
let step = 0;
for (let t = T_STEPS[0]; t < T_END - 1.2; t += BEAT / 2) {
  const f = scale[pattern[step % pattern.length]];
  /* přes „proč u nás" a CTA hraje tepleji a řidčeji */
  const late = t >= T_WHY;
  if (late && step % 2 === 1) {
    step++;
    continue;
  }
  pluck(t, f, (late ? 0.085 : 0.07) * (0.75 + 0.25 * Math.sin(step * 0.6)), 5, step % 2 ? 0.3 : -0.3);
  step++;
}

/* ---------- Označení čtyř kroků: stoupající žebřík C5 → D5 → E5 → G5 ---------- */
const stepNotes = [523.25, 587.33, 659.25, 783.99];
T_STEPS.forEach((at, i) => {
  kick(at, 0.28);
  bell(at, stepNotes[i], 0.24, 3.2);
  bell(at + 0.02, stepNotes[i] * 2, 0.07, 4.0); // jiskra o oktávu výš
});

/* ---------- „Proč u nás": rozkvetlý akord Cmaj9 ---------- */
kick(T_WHY, 0.26);
[261.63, 329.63, 392.0, 493.88, 587.33].forEach((f, i) => bell(T_WHY + 0.03 + i * 0.05, f, 0.15, 2.6));

/* ---------- CTA: teplý chime resolve u brandové karty ---------- */
kick(T_CTA, 0.24);
[261.63, 329.63, 392.0, 523.25].forEach((f, i) => bell(T_CTA + 0.08 + i * 0.07, f, 0.16, 2.8));
bell(T_CTA + 1.7, 783.99, 0.09, 2.2); // vysoká tečka na konec

/* ---------- Zápis WAV ---------- */
const bytes = new DataView(new ArrayBuffer(44 + N * 4));
const wr = (o, s) => { for (let i = 0; i < s.length; i++) bytes.setUint8(o + i, s.charCodeAt(i)); };
wr(0, 'RIFF'); bytes.setUint32(4, 36 + N * 4, true); wr(8, 'WAVE');
wr(12, 'fmt '); bytes.setUint32(16, 16, true); bytes.setUint16(20, 1, true);
bytes.setUint16(22, 2, true); bytes.setUint32(24, SR, true);
bytes.setUint32(28, SR * 4, true); bytes.setUint16(32, 4, true); bytes.setUint16(34, 16, true);
wr(36, 'data'); bytes.setUint32(40, N * 4, true);
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
for (let i = 0; i < N; i++) {
  bytes.setInt16(44 + i * 4, clamp(L[i]) * 32767, true);
  bytes.setInt16(46 + i * 4, clamp(R[i]) * 32767, true);
}
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-nakup.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`, `peak ${peak.toFixed(3)}`);
