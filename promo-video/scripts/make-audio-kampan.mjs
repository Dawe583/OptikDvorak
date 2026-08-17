/* Soundtracky ke kampani pěti Reelů (čočky, škola, multifokály, řidiči, benefity).
   Nic licencovaného — všechno se počítá tady, tón po tónu, stejnou technikou
   jako u předchozích Reelů, aby celá série zněla jako jedna rodina.

   Stavba každé stopy je stejná:
     · teplý pad v C dur pod celou stopou (pomalý nádech, pomalý závěr)
     · tichý pentatonický pluck od druhé scény dál
     · klidný puls na dobu (ne beat, jen tep) od druhé scény po CTA
     · měkký akcent na každém střihu, aby zvuk seděl s obrazem
     · teplý swell a rozložený akord na scéně s nabídkou („to podstatné")
     · rozuzlení a vysoká tečka u loga

   Liší se tempo, výška akcentů a to, která scéna nese nabídku — každý Reel
   má jinou dramaturgii, ale společný zvuk.

   Časy scén musí sedět s komponentami v src/. Když se změní délka scény,
   změňte ji na obou místech.

   Spuštění: node scripts/make-audio-kampan.mjs
   Výstup:   public/music-cocky.wav a spol. (44,1 kHz / 16 bit / stereo) */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

/* Scény každého Reelu: délky v sekundách, přechod 0,4 s se překrývá. */
const TRANS = 0.4;
const starts = (durations) => {
  const out = [];
  let acc = 0;
  durations.forEach((d, i) => {
    out.push(acc);
    acc += d - TRANS;
  });
  return out;
};
const total = (durations) => durations.reduce((a, b) => a + b, 0) - TRANS * (durations.length - 1);

const REELS = [
  {
    out: 'music-cocky.wav',
    durations: [3.4, 3.2, 3.4, 4.0, 3.6, 3.2, 4.2],
    offer: 4, // „Zkušební pár zdarma."
    bpm: 84,
    seed: 11,
    /* pět kroků aplikace — stoupající tóny uvnitř scény 3 */
    ladder: {scene: 3, at: [0.5, 0.95, 1.4, 1.85, 2.3], notes: [523.25, 587.33, 659.25, 698.46, 783.99]},
  },
  {
    out: 'music-skola.wav',
    durations: [3.2, 4.4, 3.4, 3.4, 3.4, 3.0, 4.2],
    offer: 3, // „…měření zraku zdarma."
    bpm: 80,
    seed: 22,
    /* tři pozorování ve scéně 1 */
    ladder: {scene: 1, at: [0.55, 1.55, 2.55], notes: [523.25, 587.33, 659.25]},
  },
  {
    out: 'music-multifokal.wav',
    durations: [3.2, 3.4, 3.8, 3.4, 3.2, 3.0, 4.2],
    offer: 2, // „1 + 1"
    bpm: 82,
    seed: 33,
    ladder: null,
  },
  {
    out: 'music-ridic.wav',
    durations: [3.4, 3.4, 3.4, 3.4, 3.2, 3.0, 4.2],
    offer: 2, // „−30 %"
    bpm: 86,
    seed: 44,
    ladder: null,
  },
  {
    out: 'music-benefity.wav',
    durations: [3.4, 3.6, 3.4, 3.4, 3.2, 3.0, 4.2],
    offer: 1, // čtyři loga programů
    bpm: 88,
    seed: 55,
    /* čtyři dlaždice se objevují po sobě */
    ladder: {scene: 1, at: [0.7, 0.95, 1.2, 1.45], notes: [523.25, 659.25, 783.99, 1046.5]},
  },
];

const build = (cfg) => {
  const DUR = total(cfg.durations);
  const CUTS = starts(cfg.durations);
  const N = Math.round(SR * DUR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);

  let seed = cfg.seed;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x3fffffff - 1;
  };

  const pluck = (at, freq, gain, decay = 6, pan = 0) => {
    const s0 = Math.round(at * SR);
    if (s0 < 0) return;
    for (let j = 0; j < 1.6 * SR && s0 + j < N; j++) {
      const t = j / SR;
      const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 260));
      const s =
        (Math.sin(TWO_PI * freq * t) +
          0.28 * Math.sin(TWO_PI * freq * 2 * t) +
          0.12 * Math.sin(TWO_PI * freq * 3 * t)) *
        env *
        gain;
      L[s0 + j] += s * (1 - Math.max(0, pan));
      R[s0 + j] += s * (1 + Math.min(0, pan));
    }
  };

  const bell = (at, freq, gain, decay = 3.2) => {
    const s0 = Math.round(at * SR);
    if (s0 < 0) return;
    for (let j = 0; j < 3 * SR && s0 + j < N; j++) {
      const t = j / SR;
      const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 400));
      const s =
        (Math.sin(TWO_PI * freq * t) +
          0.5 * Math.sin(TWO_PI * freq * 2.01 * t) +
          0.25 * Math.sin(TWO_PI * freq * 3 * t)) *
        env *
        gain;
      L[s0 + j] += s;
      R[s0 + j] += s;
    }
  };

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

  const T_OFFER = CUTS[cfg.offer];
  const T_CTA = CUTS[CUTS.length - 1];
  const T_BODY = CUTS[1];

  /* ---------- Pad bed (C dur) ---------- */
  const padFreqs = [130.81, 164.81, 196.0, 261.63]; // C3 E3 G3 C4
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let env = Math.min(1, t / 1.8);
    if (t > DUR - 2.2) env *= Math.max(0, (DUR - t) / 2.2);
    /* od scény s nabídkou se pad lehce otevře — „dobrá zpráva" */
    const open = t < T_OFFER ? 1 : Math.min(1.22, 1 + (t - T_OFFER) / 6);
    const lfo = 1 + 0.055 * Math.sin(TWO_PI * 0.13 * t);
    let s = 0;
    for (const f of padFreqs) s += Math.sin(TWO_PI * f * t) + 0.22 * Math.sin(TWO_PI * f * 2 * t + 0.5);
    s = (s / padFreqs.length) * 0.05 * env * lfo * open;
    L[i] += s;
    R[i] += s * 0.94;
  }

  /* ---------- Háček: jedno jemné cinknutí ---------- */
  bell(0.25, 523.25, 0.15, 2.6);
  pluck(0.3, 261.63, 0.08, 5);

  /* ---------- Pentatonický pluck od druhé scény ---------- */
  const beat = 60 / cfg.bpm;
  const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
  const pattern = [0, 2, 4, 3, 2, 5, 4, 3];
  let step = 0;
  for (let t = T_BODY; t < DUR - 1.6; t += beat / 2) {
    const f = scale[pattern[step % pattern.length]];
    const lift = t >= T_OFFER && t < T_CTA ? 1.22 : 1;
    const g = 0.08 * lift * (0.75 + 0.25 * Math.sin(step * 0.5));
    pluck(t, f, g, 6, step % 2 ? 0.25 : -0.25);
    step++;
  }

  /* ---------- Klidný puls ---------- */
  for (let t = T_BODY; t < T_CTA; t += beat) kick(t, 0.12);

  /* ---------- Akcent na každém střihu ---------- */
  const cutNotes = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
  CUTS.slice(1, -1).forEach((at, i) => {
    kick(at, 0.19);
    bell(at + 0.02, cutNotes[i % cutNotes.length], 0.1, 2.8);
  });

  /* ---------- Stoupající řada tam, kde obraz odpočítává položky ---------- */
  if (cfg.ladder) {
    const base = CUTS[cfg.ladder.scene];
    cfg.ladder.at.forEach((off, i) => {
      bell(base + off, cfg.ladder.notes[i], 0.13, 3.4);
      kick(base + off, 0.1);
    });
  }

  /* ---------- Nabídka: teplý swell + rozložený Cmaj ---------- */
  swell(T_OFFER - 0.6, 2.4, [261.63, 329.63, 392.0], 0.078);
  kick(T_OFFER, 0.24);
  [523.25, 659.25, 783.99].forEach((f, i) => bell(T_OFFER + 0.85 + i * 0.06, f, 0.15, 2.8));

  /* ---------- CTA: rozuzlení u loga + vysoká tečka ---------- */
  kick(T_CTA, 0.24);
  swell(T_CTA - 0.4, 2.6, [261.63, 392.0, 523.25], 0.06);
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(T_CTA + 0.1 + i * 0.06, f, 0.15, 3.0));
  bell(T_CTA + 1.9, 1318.5, 0.085, 2.4);

  /* ---------- Velmi tichý „vzduch" ---------- */
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
  const out = join(OUT_DIR, cfg.out);
  writeFileSync(out, Buffer.from(bytes.buffer));
  console.log(`OK: ${cfg.out}  ${DUR.toFixed(1)} s  ${(bytes.byteLength / 1e6).toFixed(1)} MB`);
};

mkdirSync(OUT_DIR, {recursive: true});
for (const cfg of REELS) build(cfg);
