/* Soundtrack k REEL D „Rodina od 1991" (bez licencované hudby),
   dle scénáře: teplý, nostalgický, prémiový. Emoční kotva = count-up 1991→2026.
   Struktura: teplý durový pad → jemné tikot­y hodin přes odpočet let (2,2–4 s)
   → rozkvetlý akord na „35 let" (4,4 s) → klidné arpeggio (rodina)
   → citový vzestup na „Staráme se o váš zrak." (10,4 s) → teplý ping (logo 15 s).
   Výstup: public/music-rodina.wav (44,1 kHz / 16 bit / stereo, 18 s).
   Spuštění: node scripts/make-audio-rodina.mjs */
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

/* Klíčové časy — musí sedět s src/ReelRodina.tsx */
const T_COUNT = 2.2;
const T_COUNT_END = 4.0;
const T_35 = 4.4;
const T_RODINA = 6.2;
const T_CARE = 10.4;
const T_OUT = 15.0;

/* ---------- Plucknutá nota (jemné piano) ---------- */
const pluck = (at, freq, gain, decay = 5, pan = 0) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 2.0 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 220));
    const s =
      (Math.sin(TWO_PI * freq * t) + 0.3 * Math.sin(TWO_PI * freq * 2 * t) + 0.1 * Math.sin(TWO_PI * freq * 3 * t)) *
      env *
      gain;
    L[s0 + j] += s * (1 - Math.max(0, pan));
    R[s0 + j] += s * (1 + Math.min(0, pan));
  }
};

/* ---------- Zvon / ping ---------- */
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
  for (let j = 0; j < 0.5 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (52 * Math.exp(-t * 11) + 38) * t) * Math.exp(-t * 11) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- Tikot hodin (čas plyne přes count-up let) ---------- */
const tick = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.05 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 300);
    const v = (rnd() * 0.4 + Math.sin(TWO_PI * 3200 * t) * 0.6) * env * gain;
    L[s0 + j] += v * 0.9;
    R[s0 + j] += v;
  }
};

/* ---------- Teplý durový pad (C dur — vřelý, důvěrný) ---------- */
const padFreqs = [130.81, 164.81, 196.0, 261.63]; // C3 E3 G3 C4
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 2.4); // pomalý teplý náběh
  if (t > DUR - 2.5) env *= Math.max(0, (DUR - t) / 2.5);
  /* citový vzestup na „Staráme se o váš zrak." */
  const lift = t >= T_CARE ? Math.min(1.35, 1 + (t - T_CARE) / 10) : 1;
  const lfo = 1 + 0.05 * Math.sin(TWO_PI * 0.1 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.2 * Math.sin(TWO_PI * f * 2 * t + 0.3);
  s = (s / padFreqs.length) * 0.06 * env * lfo * lift;
  L[i] += s;
  R[i] += s * 0.94;
}

/* ---------- Tikot hodin přes count-up 1991→2026 (2,2–4 s) ---------- */
for (let t = T_COUNT; t < T_COUNT_END + 0.05; t += 0.1) tick(t, 0.32);

/* ---------- Rozkvetlý akord na „35 let" (Cmaj9 = teplé rozuzlení) ---------- */
kick(T_35, 0.22);
[261.63, 329.63, 392.0, 493.88, 587.33].forEach((f, i) => bell(T_35 + 0.03 + i * 0.05, f, 0.15, 2.8)); // C4 E4 G4 B4 D5

/* ---------- Klidné arpeggio (rodina 6,2 s), C dur pentatonika ---------- */
const scale = [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0]; // G3 A3 C4 D4 E4 G4 A4
const pattern = [2, 4, 5, 4, 3, 5, 6, 4];
const BPM = 72;
const beat = 60 / BPM;
let step = 0;
for (let t = T_RODINA; t < DUR - 1.4; t += beat / 2) {
  const f = scale[pattern[step % pattern.length]];
  /* na citovém vrcholu hlasitější */
  const lift = t >= T_CARE ? 1.3 : 1;
  pluck(t, f, 0.07 * lift, 5, step % 2 ? 0.28 : -0.28);
  step++;
}

/* ---------- Jemný puls: rodina tiše, závěr tepleji ---------- */
for (let t = T_RODINA; t < T_OUT; t += beat) kick(t, 0.1);

/* ---------- Závěrečný teplý PING u loga (Cmaj rozklad) ---------- */
kick(T_OUT, 0.2);
[261.63, 329.63, 392.0, 523.25].forEach((f, i) => bell(T_OUT + 0.1 + i * 0.07, f, 0.16, 3.0)); // C4 E4 G4 C5
bell(T_OUT + 1.6, 783.99, 0.09, 2.4); // vysoká tečka

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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-rodina.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
