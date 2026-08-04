/* Soundtrack k Reelu „nalákání na měření zraku" (bez licencované hudby):
   klidný, čistý a důvěryhodný podklad — žádná dramatika, žádné strašení.
   Teplý pad v C dur, tichý pentatonický pluck, tři stoupající tóny na tři
   signály (C5 → D5 → E5) a měkký akordový swell na cenovou kartu; závěr
   je rozuzlení u loga.

   Časy sedí s src/ReelMereni.tsx (absolutní sekundy):
     0,00  háček „Kdy jste si naposledy nechali změřit zrak?" — jemný chime
     2,40  začíná sekce rozpoznání, nasazuje se puls a arpeggio
     2,95  signál 01  (C5)
     4,35  signál 02  (D5)
     5,75  signál 03  (E5)
     7,25  uzavírací věta „Není to diagnóza…" — tichý akcent
     8,40  střih na prodejnu (recepce)
    11,00  střih na konzultační stůl
    13,60  střih na panorama
    16,20  cenová karta „…měření zraku zdarma." — teplý swell
    19,00  CTA / brandová karta — rozuzlení, ping u loga
    23,00  konec

   Výstup: public/music-mereni.wav (44,1 kHz / 16 bit / stereo, 23 s).
   Spuštění: node scripts/make-audio-mereni.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = Number(process.env.DUR ?? 23.0);
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

/* Klíčové časy — musí sedět s src/ReelMereni.tsx */
const T_SIG = 2.4;
const T_SIGNALS = [2.95, 4.35, 5.75];
const T_CLOSE = 7.25;
const T_CUTS = [8.4, 11.0, 13.6];
const T_PRICE = 16.2;
const T_CTA = 19.0;

/* ---------- Plucknutá nota (attack + exp decay + harmonické) ---------- */
const pluck = (at, freq, gain, decay = 6, pan = 0) => {
  const s0 = Math.round(at * SR);
  if (s0 < 0) return;
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

/* ---------- Světlý zvon (signály, střihy, ping u loga) ---------- */
const bell = (at, freq, gain, decay = 3.2) => {
  const s0 = Math.round(at * SR);
  if (s0 < 0) return;
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

/* ---------- Měkký sub kick (klidný puls, ne beat) ---------- */
const kick = (at, gain) => {
  const s0 = Math.round(at * SR);
  if (s0 < 0) return;
  for (let j = 0; j < 0.4 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const v = Math.sin(TWO_PI * (55 * Math.exp(-t * 12) + 40) * t) * Math.exp(-t * 12) * gain;
    L[s0 + j] += v;
    R[s0 + j] += v;
  }
};

/* ---------- Teplý swell (nádech před cenovou kartou / CTA) ---------- */
const swell = (at, len, freqs, gain) => {
  const s0 = Math.round(at * SR);
  const n = Math.round(len * SR);
  for (let j = 0; j < n && s0 + j < N; j++) {
    if (s0 + j < 0) continue;
    const t = (s0 + j) / SR; // absolutní čas — fáze musí navazovat na pad
    const p = j / n;
    const env = Math.sin(Math.PI * p) ** 1.6; // plynulý nádech a doznění
    let s = 0;
    for (const f of freqs) s += Math.sin(TWO_PI * f * t) + 0.2 * Math.sin(TWO_PI * f * 2 * t);
    s = (s / freqs.length) * env * gain;
    L[s0 + j] += s;
    R[s0 + j] += s * 0.95;
  }
};

/* ---------- Pad bed (C dur — klidný, důvěryhodný, celý track) ---------- */
const padFreqs = [130.81, 164.81, 196.0, 261.63]; // C3 E3 G3 C4
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 1.8); // pomalý fade in
  if (t > DUR - 2.2) env *= Math.max(0, (DUR - t) / 2.2); // fade out
  /* pad se od cenové karty lehce otevře — „dobrá zpráva" */
  const open = t < T_PRICE ? 1 : Math.min(1.22, 1 + (t - T_PRICE) / 6);
  const lfo = 1 + 0.055 * Math.sin(TWO_PI * 0.13 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.22 * Math.sin(TWO_PI * f * 2 * t + 0.5);
  s = (s / padFreqs.length) * 0.05 * env * lfo * open;
  L[i] += s;
  R[i] += s * 0.94;
}

/* ---------- Háček: jeden jemný chime, ať otázka „zazvoní" ---------- */
bell(0.25, 523.25, 0.16, 2.6); // C5
pluck(0.3, 261.63, 0.08, 5);

/* ---------- Tichý pentatonický pluck od sekce rozpoznání ---------- */
const BPM = 84;
const beat = 60 / BPM;
const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C4 D4 E4 G4 A4 C5
const pattern = [0, 2, 4, 3, 2, 5, 4, 3];
let step = 0;
for (let t = T_SIG; t < DUR - 1.6; t += beat / 2) {
  const f = scale[pattern[step % pattern.length]];
  /* od cenové karty o něco jistěji, u CTA zase ustoupí padu */
  const lift = t >= T_PRICE && t < T_CTA + 1.4 ? 1.25 : 1;
  const g = 0.085 * lift * (0.75 + 0.25 * Math.sin(step * 0.5));
  pluck(t, f, g, 6, step % 2 ? 0.25 : -0.25);
  step++;
}

/* ---------- Klidný puls (jedna doba), od rozpoznání po CTA ---------- */
for (let t = T_SIG; t < T_CTA; t += beat) kick(t, 0.13);

/* ---------- Tři signály: stoupající C5 → D5 → E5 ---------- */
const sigNotes = [523.25, 587.33, 659.25];
T_SIGNALS.forEach((at, i) => {
  kick(at, 0.22);
  bell(at, sigNotes[i], 0.2, 3.4);
});

/* ---------- Uzavírací věta „Není to diagnóza…" — tichý akcent ---------- */
kick(T_CLOSE, 0.16);
pluck(T_CLOSE, 196.0, 0.09, 4, -0.2); // G3

/* ---------- Střihy na prodejnu: měkký akcent, ať sedí obraz se zvukem ---------- */
T_CUTS.forEach((at, i) => {
  kick(at, 0.2);
  bell(at + 0.02, [392.0, 440.0, 523.25][i], 0.11, 2.8);
});

/* ---------- Cenová karta: teplý swell + Cmaj9 rozklad („zdarma") ---------- */
swell(T_PRICE - 0.6, 2.2, [261.63, 329.63, 392.0], 0.075);
kick(T_PRICE, 0.24);
[523.25, 659.25, 783.99].forEach((f, i) => bell(T_PRICE + 0.85 + i * 0.06, f, 0.15, 2.8));

/* ---------- CTA: rozuzlení u loga + vysoká tečka ---------- */
kick(T_CTA, 0.24);
swell(T_CTA - 0.4, 2.6, [261.63, 392.0, 523.25], 0.06);
[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(T_CTA + 0.1 + i * 0.06, f, 0.15, 3.0));
bell(T_CTA + 1.9, 1318.5, 0.085, 2.4); // E6 — tečka za sdělením

/* ---------- Velmi tichý „vzduch" (šum), aby stopa nebyla sterilní ---------- */
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 2.5);
  if (t > DUR - 2.2) env *= Math.max(0, (DUR - t) / 2.2);
  const s = rnd() * 0.0035 * env;
  L[i] += s;
  R[i] += s * 0.9;
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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', process.env.OUT ?? 'music-mereni.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
