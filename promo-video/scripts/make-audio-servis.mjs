/* Soundtrack k Reelu „Brýle jako nové" (servis a opravy) — bez licencované hudby.
   Charakter: šikovná dílna. Tichý pad v G dur, marimbové arpeggio, jemné
   tikání hodin (protože slibujeme „na počkání") a čtyři cvaknutí přesně tam,
   kde na lístku doskočí fajfka. Razítko = tupá rána s doznívajícím akordem.
   Žádná dramatika, žádné strašení, konec je klidné rozuzlení u loga.

   Časy sedí s src/ReelServis.tsx (absolutní sekundy, mřížka 0,625 s = 96 BPM):
     0,00  háček „Ohnuté brýle? Nevyhazujte je." — jeden světlý chime
     2,50  závada 01 — cvaknutí fajfky, nastupuje marimba a tikot
     5,00  závada 02 — cvaknutí
     7,50  závada 03 — cvaknutí
    10,00  závada 04 — cvaknutí
    12,50  RAZÍTKO „hotovo" — rána + otevřený akord, tikot končí
    16,25  CTA / brandová karta — rozuzlení, ping u loga
    20,00  konec

   Výstup: public/music-servis.wav (44,1 kHz / 16 bit / stereo, 20 s).
   Spuštění: node scripts/make-audio-servis.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = Number(process.env.DUR ?? 20.0);
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 1991;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* Klíčové časy — musí sedět s src/ReelServis.tsx */
const T_ITEMS = [2.5, 5.0, 7.5, 10.0];
const T_STAMP = 12.5;
const T_CTA = 16.25;

/* ---------- Marimba (měkký dřevěný tón, rychlé doznění) ---------- */
const marimba = (at, freq, gain, decay = 7, pan = 0) => {
  const s0 = Math.round(at * SR);
  if (s0 < 0) return;
  for (let j = 0; j < 1.4 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 420));
    const s =
      (Math.sin(TWO_PI * freq * t) +
        0.34 * Math.sin(TWO_PI * freq * 4 * t) * Math.exp(-t * 16) +
        0.1 * Math.sin(TWO_PI * freq * 9.2 * t) * Math.exp(-t * 30)) *
      env *
      gain;
    L[s0 + j] += s * (1 - Math.max(0, pan));
    R[s0 + j] += s * (1 + Math.min(0, pan));
  }
};

/* ---------- Světlý zvon (chime u háčku, ping u loga) ---------- */
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

/* ---------- Cvaknutí (fajfka na lístku) ---------- */
const click = (at, gain, pan = 0) => {
  const s0 = Math.round(at * SR);
  if (s0 < 0) return;
  for (let j = 0; j < 0.11 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 90);
    const s = (rnd() * 0.6 + Math.sin(TWO_PI * 2100 * t) * 0.5) * env * gain;
    L[s0 + j] += s * (1 - Math.max(0, pan));
    R[s0 + j] += s * (1 + Math.min(0, pan));
  }
};

/* ---------- Tikot hodin — připomínka slibu „na počkání" ---------- */
const tick = (at, gain) => {
  const s0 = Math.round(at * SR);
  if (s0 < 0) return;
  for (let j = 0; j < 0.06 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 140);
    const s = (rnd() * 0.35 + Math.sin(TWO_PI * 3400 * t) * 0.3) * env * gain;
    L[s0 + j] += s * 0.75;
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

/* ---------- Rána razítka (tupý dřevěný úder) ---------- */
const thud = (at, gain) => {
  const s0 = Math.round(at * SR);
  if (s0 < 0) return;
  for (let j = 0; j < 0.55 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const body = Math.sin(TWO_PI * (110 * Math.exp(-t * 22) + 62) * t) * Math.exp(-t * 11);
    const wood = rnd() * Math.exp(-t * 60) * 0.5;
    const s = (body + wood) * gain;
    L[s0 + j] += s;
    R[s0 + j] += s * 0.97;
  }
};

/* ---------- Teplý swell (nádech před razítkem a před CTA) ---------- */
const swell = (at, len, freqs, gain) => {
  const s0 = Math.round(at * SR);
  const n = Math.round(len * SR);
  for (let j = 0; j < n && s0 + j < N; j++) {
    if (s0 + j < 0) continue;
    const t = (s0 + j) / SR; // absolutní čas — fáze musí navazovat na pad
    const p = j / n;
    const env = Math.sin(Math.PI * p) ** 1.6;
    let s = 0;
    for (const f of freqs) s += Math.sin(TWO_PI * f * t) + 0.2 * Math.sin(TWO_PI * f * 2 * t);
    s = (s / freqs.length) * env * gain;
    L[s0 + j] += s;
    R[s0 + j] += s * 0.95;
  }
};

/* ---------- Pad bed (G dur — vlídný, praktický, celá stopa) ---------- */
const padFreqs = [98.0, 146.83, 196.0, 293.66]; // G2 D3 G3 D4
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 1.6);
  if (t > DUR - 2.2) env *= Math.max(0, (DUR - t) / 2.2);
  /* od razítka se pad lehce otevře — „a je to" */
  const open = t < T_STAMP ? 1 : Math.min(1.24, 1 + (t - T_STAMP) / 5);
  const lfo = 1 + 0.05 * Math.sin(TWO_PI * 0.11 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.22 * Math.sin(TWO_PI * f * 2 * t + 0.5);
  s = (s / padFreqs.length) * 0.05 * env * lfo * open;
  L[i] += s;
  R[i] += s * 0.94;
}

/* ---------- Háček: jeden světlý chime, ať otázka zazvoní ---------- */
bell(0.2, 587.33, 0.15, 2.6); // D5
marimba(0.28, 196.0, 0.1, 6); // G3

/* ---------- Marimbové arpeggio od první závady po razítko ---------- */
const BPM = 96;
const beat = 60 / BPM; // 0,625 s
const scale = [196.0, 220.0, 246.94, 293.66, 329.63, 392.0]; // G3 A3 B3 D4 E4 G4
const pattern = [0, 3, 2, 4, 1, 3, 5, 2];
let step = 0;
for (let t = T_ITEMS[0]; t < DUR - 1.6; t += beat / 2) {
  const f = scale[pattern[step % pattern.length]];
  /* u razítka a CTA arpeggio ustoupí, ať vynikne rána a pak logo */
  const duck = t >= T_STAMP && t < T_STAMP + 1.2 ? 0.45 : t >= T_CTA ? 0.6 : 1;
  const g = 0.082 * duck * (0.75 + 0.25 * Math.sin(step * 0.6));
  marimba(t, f, g, 7, step % 2 ? 0.28 : -0.28);
  step++;
}

/* ---------- Klidný puls (jedna doba), od první závady po CTA ---------- */
for (let t = T_ITEMS[0]; t < T_CTA; t += beat) kick(t, 0.12);

/* ---------- Tikot: „na počkání" — jen v úseku závad, pak ustane ---------- */
for (let t = T_ITEMS[0] + beat / 2; t < T_STAMP; t += beat / 2) tick(t, 0.075);

/* ---------- Čtyři fajfky: cvaknutí + stoupající tón G4 → A4 → B4 → D5 ---------- */
const checkNotes = [392.0, 440.0, 493.88, 587.33];
T_ITEMS.forEach((at, i) => {
  /* fajfka doskočí ve videu 8 snímků (0,133 s) po nástupu řádku */
  const a = at + 0.133;
  click(a, 0.3, i % 2 ? 0.3 : -0.3);
  kick(at, 0.2);
  marimba(a + 0.02, checkNotes[i], 0.17, 5.5);
});

/* ---------- Razítko: nádech, rána, otevřený akord ---------- */
swell(T_STAMP - 0.7, 2.4, [196.0, 293.66, 392.0], 0.08);
thud(T_STAMP + 0.1, 0.34);
[392.0, 493.88, 587.33].forEach((f, i) => marimba(T_STAMP + 0.42 + i * 0.07, f, 0.15, 4.5));

/* ---------- CTA: rozuzlení u loga + vysoká tečka ---------- */
kick(T_CTA, 0.22);
swell(T_CTA - 0.4, 2.6, [196.0, 293.66, 392.0], 0.062);
[392.0, 493.88, 587.33, 783.99].forEach((f, i) => bell(T_CTA + 0.1 + i * 0.06, f, 0.13, 3.0));
bell(T_CTA + 1.9, 1174.66, 0.08, 2.4); // D6 — tečka za sdělením

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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', process.env.OUT ?? 'music-servis.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
