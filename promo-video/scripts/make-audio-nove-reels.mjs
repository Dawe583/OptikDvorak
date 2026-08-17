/* Soundtracky ke čtyřem Reels z léta 2026 — děti, čočky, multifokály, benefity.
   Všechny mají stejnou stavbu (háček 0–2,5 s, čtyři body po 3,125 s, CTA od 15 s,
   konec v 18,75 s), takže má smysl je vyrobit jedním skriptem. Liší se tóninou,
   rejstříkem a barvou nástrojů, aby to na profilu neznělo pořád stejně.

   Žádná licencovaná hudba — všechno se počítá tady ze sinusovek.

   Časy sedí s src/ReelDeti.tsx, ReelCocky.tsx, ReelMultifokaly.tsx a
   ReelBenefity.tsx (absolutní sekundy, mřížka 0,625 s = 96 BPM):
     0,000  háček — jeden světlý chime
     2,500  bod 01 — akcent + nastupuje arpeggio a klidný puls
     5,625  bod 02 — akcent
     8,750  bod 03 — akcent
    11,875  bod 04 — akcent
    15,000  CTA — rozuzlení, ping u loga
    18,750  konec

   Výstup: public/music-deti.wav, music-cocky-kruh.wav, music-multi.wav,
           music-benefity-karty.wav (44,1 kHz / 16 bit / stereo, 18,75 s).
   Spuštění: node scripts/make-audio-nove-reels.mjs */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const DUR = 18.75;
const TWO_PI = Math.PI * 2;
const clamp = (v) => Math.max(-1, Math.min(1, v));

const T_BEATS = [2.5, 5.625, 8.75, 11.875];
const T_CTA = 15.0;
const BPM = 96;
const beat = 60 / BPM; // 0,625 s

/* ---------- Čtyři povahy ----------
   pad    = ležící akord (základ, celou stopu)
   scale  = tóny arpeggia
   accent = čtyři stoupající tóny na čtyři body
   final  = rozklad u loga
   tone   = barva plucknutého tónu: 'marimba' (dřevo) nebo 'glass' (sklo, jasnější) */
const REELS = [
  {
    out: 'music-deti.wav',
    label: 'děti — D dur, hravé, zvonkohra',
    seed: 91,
    tone: 'glass',
    pad: [146.83, 220.0, 293.66, 369.99],            // D3 A3 D4 F#4
    scale: [293.66, 329.63, 369.99, 440.0, 493.88, 587.33],
    pattern: [0, 3, 2, 5, 1, 4, 3, 2],
    accent: [587.33, 659.25, 739.99, 880.0],         // D5 E5 F#5 A5
    final: [587.33, 739.99, 880.0, 1174.66],
    hook: 587.33,
    padGain: 0.046,
    pluckGain: 0.078,
  },
  {
    out: 'music-cocky-kruh.wav',
    label: 'čočky — A dur, vzdušné, vysoký rejstřík',
    seed: 47,
    tone: 'glass',
    pad: [110.0, 164.81, 220.0, 277.18],             // A2 E3 A3 C#4
    scale: [440.0, 493.88, 554.37, 659.25, 739.99, 880.0],
    pattern: [0, 2, 4, 1, 3, 5, 2, 0],
    accent: [440.0, 554.37, 659.25, 880.0],          // A4 C#5 E5 A5
    final: [554.37, 659.25, 880.0, 1108.73],
    hook: 880.0,
    padGain: 0.042,
    pluckGain: 0.07,
  },
  {
    out: 'music-multi.wav',
    label: 'multifokály — G dur, teplé, klidné',
    seed: 63,
    tone: 'marimba',
    pad: [98.0, 146.83, 196.0, 293.66],              // G2 D3 G3 D4
    scale: [196.0, 220.0, 246.94, 293.66, 329.63, 392.0],
    pattern: [0, 3, 1, 4, 2, 5, 3, 1],
    accent: [392.0, 440.0, 493.88, 587.33],          // G4 A4 B4 D5
    final: [392.0, 493.88, 587.33, 783.99],
    hook: 392.0,
    padGain: 0.052,
    pluckGain: 0.082,
  },
  {
    out: 'music-benefity-karty.wav',
    label: 'benefity — C dur, svižné, praktické',
    seed: 128,
    tone: 'marimba',
    pad: [130.81, 164.81, 196.0, 261.63],            // C3 E3 G3 C4
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    pattern: [0, 2, 3, 5, 4, 2, 3, 1],
    accent: [523.25, 587.33, 659.25, 783.99],        // C5 D5 E5 G5
    final: [523.25, 659.25, 783.99, 1046.5],
    hook: 523.25,
    padGain: 0.05,
    pluckGain: 0.085,
  },
  {
    out: 'music-recenze.wav',
    label: 'recenze — F dur, vřelé, poděkování',
    seed: 26,
    tone: 'marimba',
    pad: [87.31, 130.81, 174.61, 261.63],            // F2 C3 F3 C4
    scale: [174.61, 196.0, 220.0, 261.63, 293.66, 349.23],
    pattern: [0, 2, 4, 1, 3, 5, 2, 0],
    accent: [349.23, 392.0, 440.0, 523.25],          // F4 G4 A4 C5
    final: [349.23, 440.0, 523.25, 698.46],
    hook: 349.23,
    padGain: 0.05,
    pluckGain: 0.08,
  },
  {
    out: 'music-slunecni.wav',
    label: 'sluneční — E dur, letní, jasné',
    seed: 77,
    tone: 'glass',
    pad: [82.41, 123.47, 164.81, 246.94],            // E2 B2 E3 B3
    scale: [329.63, 369.99, 415.3, 493.88, 554.37, 659.25],
    pattern: [0, 3, 1, 5, 2, 4, 3, 0],
    accent: [659.25, 739.99, 830.61, 987.77],        // E5 F#5 G#5 B5
    final: [493.88, 659.25, 830.61, 987.77],
    hook: 659.25,
    padGain: 0.044,
    pluckGain: 0.072,
  },
  {
    out: 'music-vyrobci.wav',
    label: 'výrobci — D moll, věcné, důvěryhodné',
    seed: 111,
    tone: 'marimba',
    pad: [73.42, 110.0, 146.83, 220.0],              // D2 A2 D3 A3
    scale: [146.83, 174.61, 196.0, 220.0, 261.63, 293.66],
    pattern: [0, 2, 1, 4, 3, 5, 2, 1],
    accent: [293.66, 349.23, 392.0, 440.0],          // D4 F4 G4 A4
    final: [293.66, 349.23, 440.0, 587.33],
    hook: 293.66,
    padGain: 0.054,
    pluckGain: 0.078,
  },
  {
    out: 'music-poctivost.wav',
    label: 'poctivost — C dur, tiché, prostorné',
    seed: 1991,
    tone: 'glass',
    pad: [65.41, 98.0, 130.81, 196.0],               // C2 G2 C3 G3
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    pattern: [0, 4, 2, 5, 1, 3, 4, 0],
    accent: [261.63, 329.63, 392.0, 523.25],         // C4 E4 G4 C5
    final: [329.63, 392.0, 523.25, 659.25],
    hook: 523.25,
    padGain: 0.048,
    pluckGain: 0.058,
  },
];

function render(cfg) {
  const N = Math.round(SR * DUR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);

  let seed = cfg.seed;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x3fffffff - 1;
  };

  /* plucknutý tón — dřevo (marimba) nebo sklo (zvonkohra) */
  const pluck = (at, freq, gain, decay, pan = 0) => {
    const s0 = Math.round(at * SR);
    if (s0 < 0) return;
    const glass = cfg.tone === 'glass';
    for (let j = 0; j < 1.8 * SR && s0 + j < N; j++) {
      const t = j / SR;
      const env = Math.exp(-t * decay) * (1 - Math.exp(-t * (glass ? 500 : 420)));
      const s = glass
        ? (Math.sin(TWO_PI * freq * t) +
            0.4 * Math.sin(TWO_PI * freq * 2.76 * t) * Math.exp(-t * 9) +
            0.12 * Math.sin(TWO_PI * freq * 5.4 * t) * Math.exp(-t * 18)) *
          env * gain
        : (Math.sin(TWO_PI * freq * t) +
            0.34 * Math.sin(TWO_PI * freq * 4 * t) * Math.exp(-t * 16) +
            0.1 * Math.sin(TWO_PI * freq * 9.2 * t) * Math.exp(-t * 30)) *
          env * gain;
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
        (Math.sin(TWO_PI * freq * t) + 0.5 * Math.sin(TWO_PI * freq * 2.01 * t) + 0.25 * Math.sin(TWO_PI * freq * 3 * t)) *
        env * gain;
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

  /* ležící akord přes celou stopu */
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let env = Math.min(1, t / 1.6);
    if (t > DUR - 2.0) env *= Math.max(0, (DUR - t) / 2.0);
    const open = t < T_CTA ? 1 : Math.min(1.2, 1 + (t - T_CTA) / 5);
    const lfo = 1 + 0.05 * Math.sin(TWO_PI * 0.12 * t);
    let s = 0;
    for (const f of cfg.pad) s += Math.sin(TWO_PI * f * t) + 0.22 * Math.sin(TWO_PI * f * 2 * t + 0.5);
    s = (s / cfg.pad.length) * cfg.padGain * env * lfo * open;
    L[i] += s;
    R[i] += s * 0.94;
  }

  /* háček — jeden světlý chime */
  bell(0.2, cfg.hook, 0.15, 2.6);
  pluck(0.28, cfg.pad[1], 0.09, 6);

  /* arpeggio od prvního bodu po konec */
  let step = 0;
  for (let t = T_BEATS[0]; t < DUR - 1.4; t += beat / 2) {
    const f = cfg.scale[cfg.pattern[step % cfg.pattern.length]];
    const duck = t >= T_CTA ? 0.6 : 1;
    const g = cfg.pluckGain * duck * (0.75 + 0.25 * Math.sin(step * 0.55));
    pluck(t, f, g, cfg.tone === 'glass' ? 5.5 : 7, step % 2 ? 0.26 : -0.26);
    step++;
  }

  /* klidný puls */
  for (let t = T_BEATS[0]; t < T_CTA; t += beat) kick(t, 0.12);

  /* čtyři body — akcent, stoupající */
  T_BEATS.forEach((at, i) => {
    kick(at, 0.2);
    bell(at + 0.02, cfg.accent[i], 0.16, 3.2);
  });

  /* CTA — rozuzlení u loga */
  kick(T_CTA, 0.22);
  swell(T_CTA - 0.4, 2.6, [cfg.pad[0] * 2, cfg.pad[2], cfg.pad[3]], 0.06);
  cfg.final.forEach((f, i) => bell(T_CTA + 0.1 + i * 0.06, f, 0.13, 3.0));
  bell(T_CTA + 1.9, cfg.final[3] * 1.5, 0.075, 2.4); // tečka za sdělením

  /* velmi tichý „vzduch", ať stopa není sterilní */
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let env = Math.min(1, t / 2.5);
    if (t > DUR - 2.0) env *= Math.max(0, (DUR - t) / 2.0);
    const s = rnd() * 0.0035 * env;
    L[i] += s;
    R[i] += s * 0.9;
  }

  /* zápis WAV */
  const bytes = new DataView(new ArrayBuffer(44 + N * 4));
  const wr = (o, s) => { for (let i = 0; i < s.length; i++) bytes.setUint8(o + i, s.charCodeAt(i)); };
  wr(0, 'RIFF'); bytes.setUint32(4, 36 + N * 4, true); wr(8, 'WAVE');
  wr(12, 'fmt '); bytes.setUint32(16, 16, true); bytes.setUint16(20, 1, true);
  bytes.setUint16(22, 2, true); bytes.setUint32(24, SR, true);
  bytes.setUint32(28, SR * 4, true); bytes.setUint16(32, 4, true); bytes.setUint16(34, 16, true);
  wr(36, 'data'); bytes.setUint32(40, N * 4, true);
  let peak = 0;
  for (let i = 0; i < N; i++) {
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    bytes.setInt16(44 + i * 4, clamp(L[i]) * 32767, true);
    bytes.setInt16(46 + i * 4, clamp(R[i]) * 32767, true);
  }
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', cfg.out);
  mkdirSync(dirname(out), {recursive: true});
  writeFileSync(out, Buffer.from(bytes.buffer));
  console.log(`OK: ${cfg.out.padEnd(20)} ${(bytes.byteLength / 1e6).toFixed(1)} MB  špička ${(peak).toFixed(3)}  (${cfg.label})`);
}

for (const cfg of REELS) render(cfg);
