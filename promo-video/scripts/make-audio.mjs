/* Syntetický soundtrack k reklamnímu reelu (bez licencované hudby):
   teplý pad, měkký puls, whooshe na střihy a impakty na začátky scén.
   Výstup: public/music.wav (44,1 kHz / 16 bit / stereo, 16,6 s).
   Spuštění: node scripts/make-audio.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 16.6;
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

/* ---------- teplý pad (A dur, pomalý nástup, fade na konci) ---------- */
const padFreqs = [110, 164.81, 220, 277.18]; // A2 E3 A3 C#4
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 2.2); // nástup 2,2 s
  if (t > DUR - 1.4) env *= Math.max(0, (DUR - t) / 1.4); // fade out
  const lfo = 1 + 0.06 * Math.sin(TWO_PI * 0.15 * t);
  let s = 0;
  for (const f of padFreqs) {
    s += Math.sin(TWO_PI * f * t) + 0.35 * Math.sin(TWO_PI * f * 2 * t + 0.5);
  }
  s = (s / padFreqs.length) * 0.055 * env * lfo;
  L[i] += s;
  R[i] += (s * 0.9 + 0.1 * Math.sin(TWO_PI * 110 * t + 0.6) * 0.05 * env);
}

/* ---------- měkký kick puls, 96 BPM od 2,7 s ---------- */
const beat = 60 / 96;
for (let start = 2.7; start < DUR - 1.2; start += beat) {
  const s0 = Math.round(start * SR);
  const len = Math.round(0.16 * SR);
  for (let j = 0; j < len && s0 + j < N; j++) {
    const t = j / SR;
    const envK = Math.exp(-t * 26);
    const f = 52 * Math.exp(-t * 9) + 38;
    const v = Math.sin(TWO_PI * f * t) * envK * 0.22;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
}

/* ---------- jemné hi-haty (osminy) od 6,2 s ---------- */
let seed = 42;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};
for (let start = 6.2; start < DUR - 1.2; start += beat / 2) {
  const s0 = Math.round(start * SR);
  const len = Math.round(0.05 * SR);
  let hp = 0;
  for (let j = 0; j < len && s0 + j < N; j++) {
    const n = rnd();
    hp = 0.7 * hp + 0.3 * n; // low-pass
    const hi = n - hp; // poor-man high-pass
    const v = hi * Math.exp(-(j / SR) * 90) * 0.06;
    L[s0 + j] += v * 0.8;
    R[s0 + j] += v;
  }
}

/* ---------- whooshe na střihy + impakty na začátky scén ----------
   Střihy scén: 2,7 / 6,2 / 9,3 / 12,0 s (viz Promo.tsx). */
const whoosh = (center, gain = 0.24) => {
  const dur = 0.9;
  const s0 = Math.round((center - dur * 0.65) * SR);
  let lp = 0, lp2 = 0;
  for (let j = 0; j < dur * SR; j++) {
    const idx = s0 + j;
    if (idx < 0 || idx >= N) continue;
    const ph = j / (dur * SR); // 0..1
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, ph)), 2.2);
    const n = rnd();
    const a = 0.12 + 0.75 * ph; // otvírající se filtr
    lp = lp + a * (n - lp);
    lp2 = lp2 + a * 0.5 * (lp - lp2);
    const band = lp - lp2;
    const v = band * env * gain;
    L[idx] += v * (1 - ph * 0.5);
    R[idx] += v * (0.5 + ph * 0.5); // sweep zleva doprava
  }
};
const impact = (at, gain = 0.3) => {
  const s0 = Math.round(at * SR);
  for (let j = 0; j < 0.5 * SR; j++) {
    const idx = s0 + j;
    if (idx >= N) break;
    const t = j / SR;
    const env = Math.exp(-t * 9);
    const v = (Math.sin(TWO_PI * (58 * Math.exp(-t * 5) + 34) * t) * env +
      rnd() * Math.exp(-t * 60) * 0.4) * gain;
    L[idx] += v;
    R[idx] += v;
  }
};
[2.7, 6.2, 9.3, 12.0].forEach((c) => whoosh(c));
[2.7, 6.2, 9.3].forEach((c) => impact(c, 0.26));
impact(12.0, 0.34); // příchod CTA — nejsilnější

/* ---------- zápis WAV ---------- */
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
