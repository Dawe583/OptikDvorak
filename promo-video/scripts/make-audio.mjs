/* Syntetický soundtrack k 10s teaseru (bez licencované hudby):
   riser → impakt v momentě zaklapnutí loga → puls + pad → akcent na CTA.
   Výstup: public/music.wav (44,1 kHz / 16 bit / stereo, 10 s).
   Spuštění: node scripts/make-audio.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 10;
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 7;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* Klíčové časy (musí sedět s src/Teaser.tsx) */
const LOCK = 2.6; // logo zaklapne
const CTA = 8.2; // nástup CTA

/* ---------- Riser 0 → LOCK: stoupající šum + tón ---------- */
let riserLp = 0;
for (let i = 0; i < Math.round(LOCK * SR); i++) {
  const t = i / SR;
  const p = t / LOCK; // 0..1
  const env = Math.pow(p, 2.4) * 0.5;
  /* šumový sweep — filtr se otevírá */
  const n = rnd();
  const a = 0.02 + 0.5 * Math.pow(p, 2);
  riserLp += a * (n - riserLp);
  const noise = (n - riserLp) * env * 0.5;
  /* stoupající tón */
  const f = 110 * Math.pow(2, p * 2.2);
  const tone = Math.sin(TWO_PI * f * t) * env * 0.18;
  L[i] += noise + tone * 0.9;
  R[i] += noise * 0.9 + tone;
}

/* ---------- Impakt v LOCK ---------- */
const impact = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 1.2 * SR; j++) {
    const idx = s0 + j;
    if (idx >= N) break;
    const t = j / SR;
    const sub = Math.sin(TWO_PI * (46 * Math.exp(-t * 4) + 30) * t) * Math.exp(-t * 5);
    const click = rnd() * Math.exp(-t * 70) * 0.5;
    const v = (sub + click) * gain;
    L[idx] += v;
    R[idx] += v;
  }
};
impact(LOCK, 0.42);
impact(CTA, 0.3);

/* ---------- Pad po LOCK (A dur) ---------- */
const padFreqs = [110, 164.81, 220, 277.18];
for (let i = Math.round(LOCK * SR); i < N; i++) {
  const t = i / SR;
  const since = t - LOCK;
  let env = Math.min(1, since / 0.8);
  if (t > DUR - 1.2) env *= Math.max(0, (DUR - t) / 1.2);
  const lfo = 1 + 0.05 * Math.sin(TWO_PI * 0.2 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.3 * Math.sin(TWO_PI * f * 2 * t + 0.4);
  s = (s / padFreqs.length) * 0.06 * env * lfo;
  L[i] += s;
  R[i] += s * 0.92;
}

/* ---------- Puls 100 BPM od LOCK ---------- */
const beat = 60 / 100;
for (let start = LOCK; start < DUR - 0.9; start += beat) {
  const s0 = Math.round(start * SR);
  for (let j = 0; j < 0.18 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (50 * Math.exp(-t * 9) + 38) * t) * Math.exp(-t * 24) * 0.2;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
}

/* ---------- Hi-haty (osminy) od 4,4 s ---------- */
for (let start = 4.4; start < DUR - 0.9; start += beat / 2) {
  const s0 = Math.round(start * SR);
  let lp = 0;
  for (let j = 0; j < 0.045 * SR && s0 + j < N; j++) {
    const n = rnd();
    lp = 0.7 * lp + 0.3 * n;
    const v = (n - lp) * Math.exp(-(j / SR) * 95) * 0.055;
    L[s0 + j] += v * 0.8;
    R[s0 + j] += v;
  }
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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
