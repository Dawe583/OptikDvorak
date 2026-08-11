/* Soundtrack k Reelu „Nekupujte nové brýle" (servis a opravy).
   Bez licencované hudby — všechno se počítá tady, tón po tónu.

   Dramaturgie: začátek je lehce „rozviklaný" (nota s vibratem = povolený
   šroubek), v sekci problémů tři sestupné tóny, pak zrychlující se tikání
   utahovaného šroubku, ostré CVAK v momentě dotažení a od něj už jen čistý,
   srovnaný C dur. Konec je klidné rozuzlení u loga.

   Časy sedí s src/ReelServis.tsx (absolutní sekundy):
     0,00  háček „Nekupujte nové brýle." — rozviklaná nota
     2,80  sekce problémů, nasazuje se puls a arpeggio
     2,90  povolený šroubek   (E4)
     3,52  ohnutá obruba      (D4)
     4,14  prasklý silon      (C4)
     4,85  „Kvůli žádné z nich nemusíte kupovat nové." — tichý akcent
     5,60  sekce opravy
     5,95  začíná se točit šroubkem — zrychlující se tikání
     6,85  CVAK: šroubek dotažen, brýle se srovnají — akord a záblesk
     9,00  střih na reálnou fotku opravy
    12,00  seznam „Co všechno opravíme"
    12,50  01 · 13,00  02 · 13,50  03 · 14,00  04   (C5 D5 E5 G5)
    14,55  poctivá poznámka „úplně všechno spravit nejde"
    15,40  střih na panorama prodejny
    18,40  CTA / brandová karta — rozuzlení, ping u loga
    22,60  konec

   Výstup: public/music-servis.wav (44,1 kHz / 16 bit / stereo, 22,6 s).
   Spuštění: node scripts/make-audio-servis.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = Number(process.env.DUR ?? 22.6);
const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

let seed = 226;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

/* Klíčové časy — musí sedět s src/ReelServis.tsx */
const T_PROB = 2.8;
const T_FAULTS = [2.9, 3.52, 4.14];
const T_CLOSE = 4.85;
const T_FIX = 5.6;
const T_TURN = 5.95;
const T_SNAP = 6.85;
const T_PHOTO = 9.0;
const T_LIST = 12.0;
const T_ITEMS = [12.5, 13.0, 13.5, 14.0];
const T_HONEST = 14.55;
const T_PANO = 15.4;
const T_CTA = 18.4;

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

/* ---------- Světlý zvon (akcenty, střihy, ping u loga) ---------- */
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

/* ---------- Rozviklaná nota — vibrato jako „něco je povolené" ---------- */
const wobble = (at, freq, gain, len = 2.2) => {
  const s0 = Math.round(at * SR);
  if (s0 < 0) return;
  const n = Math.round(len * SR);
  for (let j = 0; j < n && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 1.5) * (1 - Math.exp(-t * 90));
    const vib = 1 + 0.014 * Math.sin(TWO_PI * 5.4 * t) + 0.006 * Math.sin(TWO_PI * 11.3 * t);
    const s = (Math.sin(TWO_PI * freq * vib * t) + 0.3 * Math.sin(TWO_PI * freq * 2 * vib * t)) * env * gain;
    L[s0 + j] += s;
    R[s0 + j] += s * 0.92;
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

/* ---------- Tik nářadí (krátký filtrovaný šum + dřevěný tón) ---------- */
const tick = (at, gain, pitch = 2100, pan = 0) => {
  const s0 = Math.round(at * SR);
  if (s0 < 0) return;
  let lp = 0;
  for (let j = 0; j < 0.09 * SR && s0 + j < N; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 90);
    lp += (rnd() - lp) * 0.55; // jednoduchá dolní propust, ať to necvaká sterilně
    const s = (lp * 0.8 + Math.sin(TWO_PI * pitch * t) * 0.35) * env * gain;
    L[s0 + j] += s * (1 - Math.max(0, pan));
    R[s0 + j] += s * (1 + Math.min(0, pan));
  }
};

/* ---------- Teplý swell (nádech před opravou / CTA) ---------- */
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

/* ---------- Pad bed (C dur, celý track) ----------
   Do okamžiku dotažení je pad o kousek rozladěný — podprahově „nesedí to".
   Od CVAKu je ladění čisté a pad se lehce otevře. */
const padFreqs = [130.81, 164.81, 196.0, 261.63]; // C3 E3 G3 C4
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let env = Math.min(1, t / 1.8);
  if (t > DUR - 2.2) env *= Math.max(0, (DUR - t) / 2.2);
  const detune = t < T_SNAP ? 1 + 0.0032 * Math.sin(TWO_PI * 0.8 * t) : 1;
  const open = t < T_SNAP ? 1 : Math.min(1.2, 1 + (t - T_SNAP) / 8);
  const lfo = 1 + 0.055 * Math.sin(TWO_PI * 0.13 * t);
  let s = 0;
  for (const f of padFreqs) s += Math.sin(TWO_PI * f * detune * t) + 0.22 * Math.sin(TWO_PI * f * 2 * t + 0.5);
  s = (s / padFreqs.length) * 0.05 * env * lfo * open;
  L[i] += s;
  R[i] += s * 0.94;
}

/* ---------- Háček: rozviklaná nota místo čistého tónu ---------- */
wobble(0.3, 392.0, 0.13); // G4, vibrato = povolený šroubek
pluck(0.35, 196.0, 0.07, 5);
tick(0.95, 0.05, 1500, -0.3);
tick(1.62, 0.045, 1400, 0.3);

/* ---------- Tichý pentatonický pluck od sekce problémů ---------- */
const BPM = 84;
const beat = 60 / BPM;
const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C4 D4 E4 G4 A4 C5
const pattern = [0, 2, 4, 3, 2, 5, 4, 3];
let step = 0;
for (let t = T_PROB; t < DUR - 1.6; t += beat / 2) {
  const f = scale[pattern[step % pattern.length]];
  /* po dotažení o něco jistěji, u CTA zase ustoupí padu */
  const lift = t >= T_SNAP && t < T_CTA ? 1.2 : 1;
  const g = 0.08 * lift * (0.75 + 0.25 * Math.sin(step * 0.5));
  pluck(t, f, g, 6, step % 2 ? 0.25 : -0.25);
  step++;
}

/* ---------- Klidný puls (jedna doba), od problémů po CTA ---------- */
for (let t = T_PROB; t < T_CTA; t += beat) kick(t, 0.12);

/* ---------- Tři závady: sestupně E4 → D4 → C4, každá s tikem ---------- */
const faultNotes = [329.63, 293.66, 261.63];
T_FAULTS.forEach((at, i) => {
  kick(at, 0.2);
  tick(at, 0.09, 1800, i % 2 ? 0.25 : -0.25);
  bell(at, faultNotes[i], 0.17, 3.6);
});

/* ---------- Uzavírací věta v sekci problémů — tichý akcent ---------- */
kick(T_CLOSE, 0.15);
pluck(T_CLOSE, 196.0, 0.085, 4, -0.2); // G3

/* ---------- Střih na opravu: nádech ---------- */
kick(T_FIX, 0.18);
swell(T_FIX, 1.5, [196.0, 246.94, 293.66], 0.05); // G–B–D, napětí před rozuzlením

/* ---------- Utahování šroubku: zrychlující se tikání až k CVAKu ---------- */
{
  let t = T_TURN;
  let gap = 0.115;
  while (t < T_SNAP - 0.02) {
    tick(t, 0.075, 1900 + rnd() * 260, rnd() * 0.5);
    gap *= 0.9; // zrychluje — je slyšet, že se to blíží k dotažení
    t += gap;
  }
}

/* ---------- CVAK: šroubek dotažen, brýle srovnány ---------- */
tick(T_SNAP, 0.5, 2600);
tick(T_SNAP + 0.012, 0.32, 1200);
kick(T_SNAP, 0.28);
[523.25, 659.25, 783.99].forEach((f, i) => bell(T_SNAP + 0.03 + i * 0.05, f, 0.16, 2.6)); // C dur
swell(T_SNAP, 2.4, [261.63, 329.63, 392.0], 0.08);

/* ---------- Střihy na fotku a panorama: měkký akcent ---------- */
[T_PHOTO, T_PANO].forEach((at, i) => {
  kick(at, 0.19);
  bell(at + 0.02, [440.0, 523.25][i], 0.1, 2.8);
});

/* ---------- Seznam oprav: čtyři stoupající tóny ---------- */
kick(T_LIST, 0.2);
const itemNotes = [523.25, 587.33, 659.25, 783.99]; // C5 D5 E5 G5
T_ITEMS.forEach((at, i) => {
  tick(at, 0.06, 2200, i % 2 ? 0.3 : -0.3);
  bell(at, itemNotes[i], 0.14, 3.4);
});

/* ---------- Poctivá poznámka: jeden tichý, nižší tón ---------- */
pluck(T_HONEST, 220.0, 0.075, 4.5, 0.2); // A3 — přiznání, ne fanfára

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
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', process.env.OUT ?? 'music-servis.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.from(bytes.buffer));
console.log('OK:', out, `${(bytes.byteLength / 1e6).toFixed(1)} MB`);
