/* Soundtrack k 11s reelu „Hook" (kompozice reel-hook).
   Struktura kopíruje střih: napínavý riser → ÚDER v doostření (0,95 s) →
   tikot během problémů → ÚDER ve zvratu (3,45 s) → hnací puls + hi-haty
   přes značku a služby → akcent na CTA → doznění.
   Výstup: public/music-hook.wav — spuštění: npm run audio:hook */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 11;
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

const SNAP = 0.95; // doostření (T_SNAP)
const TURN = 3.45; // zvrat (T_TURN)
const CTA = 8.5; // CTA

/* ---------- Riser 0 → SNAP (napětí háčku) ---------- */
let lp = 0;
for (let i = 0; i < Math.round(SNAP * SR); i++) {
  const t = i / SR;
  const p = t / SNAP;
  const env = Math.pow(p, 2.2) * 0.55;
  const n = rnd();
  const a = 0.03 + 0.55 * Math.pow(p, 2);
  lp += a * (n - lp);
  const noise = (n - lp) * env * 0.6;
  const f = 120 * Math.pow(2, p * 2.4);
  const tone = Math.sin(TWO_PI * f * t) * env * 0.2;
  L[i] += noise + tone * 0.9;
  R[i] += noise * 0.9 + tone;
}

/* ---------- Údery ---------- */
const impact = (at, gain) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 1.4 * SR; j++) {
    const idx = s0 + j;
    if (idx >= N) break;
    const t = j / SR;
    const sub = Math.sin(TWO_PI * (48 * Math.exp(-t * 4) + 30) * t) * Math.exp(-t * 4.5);
    const click = rnd() * Math.exp(-t * 65) * 0.6;
    const v = (sub + click) * gain;
    L[idx] += v;
    R[idx] += v;
  }
};
impact(SNAP, 0.5);
impact(TURN, 0.46);

/* ---------- Tikot během problémů (SNAP → TURN) ---------- */
for (let start = SNAP + 0.3; start < TURN - 0.1; start += 0.735) {
  const s0 = Math.round(start * SR);
  for (let j = 0; j < 0.09 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * 1400 * t) * Math.exp(-t * 60) * 0.12;
    L[s0 + j] += v;
    R[s0 + j] += v * 0.9;
  }
}

/* ---------- Pad po TURN (A dur, důvěryhodné teplo) ---------- */
const pad = [110, 164.81, 220, 277.18];
for (let i = Math.round(TURN * SR); i < N; i++) {
  const t = i / SR;
  const since = t - TURN;
  let env = Math.min(1, since / 0.7);
  if (t > DUR - 1.0) env *= Math.max(0, (DUR - t) / 1.0);
  const lfo = 1 + 0.05 * Math.sin(TWO_PI * 0.2 * t);
  let s = 0;
  for (const f of pad) s += Math.sin(TWO_PI * f * t) + 0.3 * Math.sin(TWO_PI * f * 2 * t + 0.4);
  s = (s / pad.length) * 0.06 * env * lfo;
  L[i] += s;
  R[i] += s * 0.92;
}

/* ---------- Hnací puls 120 BPM od TURN ---------- */
const beat = 60 / 120;
for (let start = TURN; start < DUR - 0.7; start += beat) {
  const s0 = Math.round(start * SR);
  for (let j = 0; j < 0.16 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (52 * Math.exp(-t * 9) + 40) * t) * Math.exp(-t * 22) * 0.22;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
}

/* ---------- Hi-haty (osminy) od TURN ---------- */
for (let start = TURN; start < DUR - 0.7; start += beat / 2) {
  const s0 = Math.round(start * SR);
  let hp = 0;
  for (let j = 0; j < 0.04 * SR && s0 + j < N; j++) {
    const n = rnd();
    hp = 0.7 * hp + 0.3 * n;
    const v = (n - hp) * Math.exp(-(j / SR) * 100) * 0.06;
    L[s0 + j] += v * 0.8;
    R[s0 + j] += v;
  }
}

/* ---------- Akcent na CTA ---------- */
impact(CTA, 0.3);

/* ---------- Zápis WAV ---------- */
const bytes = new DataView(new ArrayBuffer(44 + N * 4));
const wr = (o, s) => {
  for (let i = 0; i < s.length; i++) bytes.setUint8(o + i, s.charCodeAt(i));
};
wr(0, 'RIFF');
bytes.setUint32(4, 36 + N * 4, true);
wr(8, 'WAVE');
wr(12, 'fmt ');
bytes.setUint32(16, 16, true);
bytes.setUint16(20, 1, true);
bytes.setUint16(22, 2, true);
bytes.setUint32(24, SR, true);
bytes.setUint32(28, SR * 4, true);
bytes.setUint16(32, 4, true);
bytes.setUint16(34, 16, true);
wr(36, 'data');
bytes.setUint32(40, N * 4, true);
for (let i = 0; i < N; i++) {
  bytes.setInt16(44 + i * 4, clamp(L[i]) * 32767, true);
  bytes.setInt16(46 + i * 4, clamp(R[i]) * 32767, true);
}
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music-hook.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
