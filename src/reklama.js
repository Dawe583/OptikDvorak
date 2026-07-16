/* ============================================================
   OPTIK DVOŘÁK — REKLAMNÍ SPOT (reklama.html)
   Kinematografický autoplay spot řízený jednou GSAP master
   timeline: hook → brand → služby → akce → důvěra → CTA.
   Finále s kontaktem zůstává stát (konverze), spot lze
   přeskakovat tečkami, šipkami, klikem i tlačítkem
   „Přeskočit na kontakt". Motion běží na všech zařízeních
   bez výjimky (viz CLAUDE.md).
   ============================================================ */

import './css/tokens.css';
import './css/base.css';
import './css/reklama.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/bricolage-grotesque';

import { gsap } from 'gsap';
import { initCookies } from './js/cookies.js';
import { initAnalytics, track } from './js/analytics.js';

const prefersReduced = false; // trvalé rozhodnutí klienta — motion všude
void prefersReduced;

/* Téma horní/spodní lišty podle scény (čitelnost na světlé/žluté/tmavé) */
const THEMES = ['dark', 'light', 'light', 'yellow', 'dark', 'dark'];

/* ---------- Podpisová křivka „eo" ---------- */
async function registerEase() {
  try {
    const mod = await import('gsap/CustomEase');
    gsap.registerPlugin(mod.CustomEase);
    mod.CustomEase.create('eo', '0.16,1,0.3,1');
  } catch {
    try { gsap.registerEase('eo', gsap.parseEase('power3.out')); } catch { /* noop */ }
  }
  gsap.defaults({ ease: 'eo' });
}

/* ---------- Split znaků do masek (pro data-chars) ----------
   Znaky jednoho slova se balí do .char-word, aby se slovo
   nikdy nezalomilo uprostřed. */
function splitChars(el) {
  const wrap = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (part === '') return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const word = document.createElement('span');
        word.className = 'char-word';
        for (const ch of part) {
          const mask = document.createElement('span');
          mask.className = 'char-mask';
          const inner = document.createElement('span');
          inner.textContent = ch;
          mask.appendChild(inner);
          word.appendChild(mask);
        }
        frag.appendChild(word);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      Array.from(node.childNodes).forEach(wrap);
    }
  };
  Array.from(el.childNodes).forEach(wrap);
  return el.querySelectorAll('.char-mask > span');
}

/* ---------- Živá otevírací doba (badge v CTA + status nahoře) ---------- */
function initHours() {
  const days = ['v neděli', 'v pondělí', 'v úterý', 've středu', 've čtvrtek', 'v pátek', 'v sobotu'];
  const OPEN = 8 * 60 + 30;
  const closeFor = (d) => (d === 5 ? 16 * 60 : 17 * 60);
  const isWeekday = (d) => d >= 1 && d <= 5;
  const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

  const update = () => {
    const now = new Date();
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    const openNow = isWeekday(day) && mins >= OPEN && mins < closeFor(day);
    let text;
    if (openNow) {
      text = `Otevřeno · zavíráme v ${fmt(closeFor(day))}`;
    } else {
      let d = day;
      const sameDay = isWeekday(day) && mins < OPEN;
      if (!sameDay) { for (let i = 1; i <= 7; i++) { const nd = (day + i) % 7; if (isWeekday(nd)) { d = nd; break; } } }
      const when = sameDay ? 'dnes' : (d === (day + 1) % 7 ? 'zítra' : days[d]);
      text = `Zavřeno · otevíráme ${when} v ${fmt(OPEN)}`;
    }
    const badge = document.getElementById('open-badge');
    if (badge) { badge.textContent = text; badge.classList.toggle('is-open', openNow); }
    const status = document.getElementById('ad-status');
    if (status) status.textContent = `// ${text}`;
  };

  update();
  setInterval(update, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
}

/* ---------- Sestavení spotu ---------- */
function buildSpot() {
  const ad = document.getElementById('ad');
  const scenes = gsap.utils.toArray('.scene');
  const wipe = document.querySelector('.ad-wipe');
  const progressBar = document.querySelector('.ad-progress__bar');
  const dots = gsap.utils.toArray('.ad-dots button');
  const skipBtn = document.getElementById('ad-skip');
  const replayBtn = document.getElementById('ad-replay');

  /* Split nadpisů + výchozí stavy (tweens si je při seeku samy vrací) */
  const charsOf = new Map();
  document.querySelectorAll('[data-chars]').forEach((el) => charsOf.set(el, splitChars(el)));
  gsap.set('.char-mask > span', { yPercent: 112 });
  gsap.set('[data-line]', { y: 26, opacity: 0 });
  gsap.set('.svc', { clipPath: 'inset(0 0 100% 0)' });
  gsap.set('.svc__media img', { scale: 1.25 });
  gsap.set('.trust-stars span', { scale: 0, rotate: -30, transformOrigin: '50% 50%' });
  gsap.set('.pupil', { scale: 0.55, opacity: 0 });
  gsap.set('.cta-actions .ad-btn', { y: 30, opacity: 0 });

  const years = new Date().getFullYear() - 1991;
  const yearsEl = document.getElementById('years-num');
  const counter = { v: 0 };

  const master = gsap.timeline({ paused: true, defaults: { ease: 'eo' } });
  const sceneTimes = [];

  const chars = (scope) => {
    const el = scope.querySelector('[data-chars]');
    return el ? charsOf.get(el) : null;
  };
  const lines = (scope) => scope.querySelectorAll('[data-line]');

  /* Přechodová stěrka: zakryje výměnu scén.
     Záměrně jen .set/.to (žádné fromTo) — immediateRender by
     stěrku vykreslil roztaženou už na startu spotu. */
  gsap.set(wipe, { scaleX: 0, transformOrigin: '0% 50%' });
  const transitionTo = (from, to) => {
    master.set(wipe, { transformOrigin: '0% 50%', scaleX: 0 }, '+=0');
    master.to(wipe, { scaleX: 1, duration: 0.45, ease: 'power4.in' });
    master.set(scenes[from], { autoAlpha: 0 });
    master.set(scenes[to], { autoAlpha: 1 });
    sceneTimes[to] = master.duration();
    master.addLabel(`s${to}`);
    master.set(wipe, { transformOrigin: '100% 50%' });
    master.to(wipe, { scaleX: 0, duration: 0.5, ease: 'power4.out' });
  };

  /* --- SCÉNA 1 · HOOK --- */
  sceneTimes[0] = 0;
  master.addLabel('s0');
  master.set(scenes[0], { autoAlpha: 1 });
  master.to('.pupil', { scale: 1, opacity: 1, duration: 1.4, ease: 'power3.out' }, 0.15);
  master.to('.pupil span', { scale: 1.35, duration: 1.1, ease: 'power2.inOut', yoyo: true, repeat: 2 }, 0.6);
  master.to(chars(scenes[0]), { yPercent: 0, duration: 0.9, stagger: 0.028 }, 0.35);
  master.to(lines(scenes[0]), { y: 0, opacity: 1, duration: 0.7 }, 1.3);
  master.to({}, { duration: 1.9 }); // podržení scény

  /* --- SCÉNA 2 · BRAND --- */
  transitionTo(0, 1);
  {
    const [l1, l2] = scenes[1].querySelectorAll('[data-chars]');
    master.to(scenes[1].querySelector('.scene__eyebrow'), { keyframes: [{ opacity: 0, duration: 0 }, { opacity: 0.7, duration: 0.5 }] }, '-=0.2');
    master.to(charsOf.get(l1), { yPercent: 0, duration: 0.9, stagger: 0.04 }, '-=0.45');
    master.to(charsOf.get(l2), { yPercent: 0, duration: 0.9, stagger: 0.04 }, '-=0.75');
    master.to(counter, {
      v: years, duration: 1.5, ease: 'power2.out',
      onUpdate: () => { if (yearsEl) yearsEl.textContent = String(Math.round(counter.v)); },
    }, '-=0.5');
    master.to(lines(scenes[1]), { y: 0, opacity: 1, duration: 0.7 }, '-=1.0');
    master.to({}, { duration: 1.7 });
  }

  /* --- SCÉNA 3 · SLUŽBY --- */
  transitionTo(1, 2);
  master.to(chars(scenes[2]), { yPercent: 0, duration: 0.8, stagger: 0.02 }, '-=0.35');
  master.to('.svc', { clipPath: 'inset(0 0 0% 0)', duration: 0.9, stagger: 0.18, ease: 'power3.inOut' }, '-=0.55');
  master.to('.svc__media img', { scale: 1.02, duration: 3.6, ease: 'power1.out', stagger: 0.18 }, '<');
  master.to({}, { duration: 1.6 });

  /* --- SCÉNA 4 · AKCE --- */
  transitionTo(2, 3);
  master.to(scenes[3].querySelector('.deal-tag'), { y: 0, opacity: 1, duration: 0.55 }, '-=0.3');
  master.to(chars(scenes[3]), { yPercent: 0, duration: 1.0, stagger: 0.09, ease: 'power4.out' }, '-=0.4');
  master.fromTo('.deal-big', { scale: 0.86 }, { scale: 1, duration: 1.1, ease: 'power3.out' }, '<');
  master.to([scenes[3].querySelector('.deal-title'), scenes[3].querySelector('.deal-extra'), scenes[3].querySelector('.deal-note')],
    { y: 0, opacity: 1, duration: 0.7, stagger: 0.14 }, '-=0.6');
  master.to({}, { duration: 1.8 });

  /* --- SCÉNA 5 · DŮVĚRA --- */
  transitionTo(3, 4);
  master.to('.trust-stars span', { scale: 1, rotate: 0, duration: 0.6, stagger: 0.09, ease: 'back.out(2.2)' }, '-=0.3');
  master.to(lines(scenes[4]), { y: 0, opacity: 1, duration: 0.65, stagger: 0.16 }, '-=0.25');
  master.to({}, { duration: 1.9 });

  /* --- SCÉNA 6 · CTA (finále, zůstává stát) --- */
  transitionTo(4, 5);
  master.to(scenes[5].querySelector('.scene__eyebrow'), { keyframes: [{ opacity: 0, duration: 0 }, { opacity: 0.7, duration: 0.5 }] }, '-=0.25');
  master.to(chars(scenes[5]), { yPercent: 0, duration: 0.9, stagger: 0.025 }, '-=0.4');
  master.to('.cta-actions .ad-btn', { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 }, '-=0.45');
  master.to(lines(scenes[5]), { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 }, '-=0.4');
  /* jemné dýchání hlavního CTA, ať finále žije */
  master.to('.ad-btn--solid', { scale: 1.03, duration: 0.9, ease: 'power1.inOut', yoyo: true, repeat: 3 }, '+=0.3');

  /* ---------- Progres, téma lišt, aktivní tečka ---------- */
  const syncUi = () => {
    const t = master.time();
    let idx = 0;
    for (let i = 0; i < sceneTimes.length; i++) if (t >= sceneTimes[i] - 0.24) idx = i;
    if (progressBar) progressBar.style.transform = `scaleX(${master.progress()})`;
    if (ad.dataset.theme !== THEMES[idx]) ad.dataset.theme = THEMES[idx];
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    const done = master.progress() > 0.999;
    if (replayBtn) replayBtn.hidden = !done;
    if (skipBtn) skipBtn.hidden = done;
  };
  master.eventCallback('onUpdate', syncUi);
  master.eventCallback('onComplete', syncUi);

  /* ---------- Ovládání ---------- */
  const currentIdx = () => {
    const t = master.time();
    let idx = 0;
    for (let i = 0; i < sceneTimes.length; i++) if (t >= sceneTimes[i] - 0.24) idx = i;
    return idx;
  };
  const goTo = (i, label) => {
    const clamped = Math.max(0, Math.min(scenes.length - 1, i));
    master.play(sceneTimes[clamped] + 0.001);
    if (label) track('ad_interaction', { label });
  };

  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i, `dot_${i}`)));
  skipBtn?.addEventListener('click', () => goTo(scenes.length - 1, 'skip_to_cta'));
  replayBtn?.addEventListener('click', () => { master.play(0); track('ad_interaction', { label: 'replay' }); });

  /* Klik do plochy = další scéna (mimo odkazy/tlačítka a finále) */
  document.getElementById('ad-stage')?.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;
    if (currentIdx() >= scenes.length - 1) return;
    goTo(currentIdx() + 1, 'stage_next');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goTo(currentIdx() + 1, 'key_next');
    else if (e.key === 'ArrowLeft') goTo(currentIdx() - 1, 'key_prev');
    else if (e.key === ' ' && !e.target.closest('a, button, input, textarea')) {
      e.preventDefault();
      if (master.progress() > 0.999) master.play(0);
      else master.paused(!master.paused());
    }
  });

  /* Pauza, když je karta na pozadí */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) master.pause();
    else if (master.progress() < 0.999) master.play();
  });

  /* Konverzní eventy z CTA */
  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => track('ad_cta_click', { label: el.dataset.track }));
  });

  master.play(0.001);
}

/* ---------- Start ---------- */
(async () => {
  await registerEase();
  initCookies();
  initAnalytics();
  initHours();
  buildSpot();
})();
