/* ============================================================
   OPTIK DVOŘÁK — SDÍLENÝ MOTION ENGINE
   Ambientní část pohybového systému (Lenis, preloader, custom
   kurzor, scroll-progress, reveals, parallax, split nadpisy,
   marquee, magnetická tlačítka, header, sticky CTA). Používá ho
   subpage.js, aby na podstránkách běžely stejné efekty jako na
   homepage — na všech zařízeních bez výjimky (viz CLAUDE.md).
   ============================================================ */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

export { gsap, ScrollTrigger, Observer };

/* Motion běží všude bez výjimky (trvalé rozhodnutí klienta).
   NIKDY nevracet matchMedia / prefers-reduced-motion gaty. */
export const prefersReduced = false;
export const D = { micro: 0.2, ui: 0.5, reveal: 0.9, hero: 1.2, curtain: 0.7 };

export let lenis = null;
let velTS = 1; // cíl timeScale marquee podle rychlosti scrollu

/* ---------- Podpisová křivka „eo" (shodná s CSS var(--eo)) ---------- */
export async function registerEase() {
  try {
    const mod = await import('gsap/CustomEase');
    gsap.registerPlugin(mod.CustomEase);
    mod.CustomEase.create('eo', '0.16,1,0.3,1');
    gsap.defaults({ ease: 'eo' });
  } catch {
    try { gsap.registerEase('eo', gsap.parseEase('power3.out')); } catch { /* noop */ }
    gsap.defaults({ ease: 'eo' });
  }
}

/* ---------- Lenis smooth scroll ---------- */
export function initSmoothScroll() {
  gsap.registerPlugin(ScrollTrigger, Observer);
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, syncTouch: true });
  lenis.on('scroll', ({ velocity }) => {
    velTS = gsap.utils.clamp(-4, 4, 1 + (velocity || 0) * 0.05);
    ScrollTrigger.update();
  });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/* ---------- Výchozí stavy hero (zabrání probliknutí před intro) ---------- */
export function prepHero() {
  gsap.set('.line__inner', { yPercent: 110 });
  gsap.set('[data-intro]', { y: 26, opacity: 0 });
  gsap.set('[data-intro-media]', { opacity: 0, scale: 0.96 });
}

/* ---------- Kotvy ---------- */
export function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const focusTarget = () => {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      };
      if (lenis) lenis.scrollTo(target, { offset: -68, duration: 1.1, onComplete: focusTarget });
      else { target.scrollIntoView(); focusTarget(); }
    });
  });
}

/* ---------- Header: scrolled / hide-on-down / invert na tmavém ---------- */
export function initHeader() {
  const header = document.getElementById('header');
  const sentinel = document.getElementById('header-sentinel');
  if (!header) return;

  if (sentinel) {
    new IntersectionObserver(
      ([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting),
      { rootMargin: '0px' }
    ).observe(sentinel);
  } else {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  ScrollTrigger.create({
    start: 'top top',
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      if (self.direction === 1 && y > 260) header.classList.add('header--hidden');
      else header.classList.remove('header--hidden');
    },
  });

  gsap.utils.toArray('[data-dark-section]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 58px',
      end: 'bottom 58px',
      onToggle: (self) => header.classList.toggle('header--on-dark', self.isActive),
    });
  });
}

/* ---------- Mobilní fullscreen menu ---------- */
export function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  let open = false;
  const focusable = () => menu.querySelectorAll('a[href], button:not([disabled])');
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Navigace');
  const bg = ['#top', '.footer', '.header__logo', '.mobile-bar']
    .map((s) => document.querySelector(s))
    .filter(Boolean);

  const setOpen = (state) => {
    open = state;
    document.body.classList.toggle('menu-open', state);
    toggle.setAttribute('aria-expanded', String(state));
    toggle.setAttribute('aria-label', state ? 'Zavřít menu' : 'Otevřít menu');
    menu.setAttribute('aria-hidden', String(!state));
    bg.forEach((el) => { if (state) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    if (state) {
      if (lenis) lenis.stop(); else document.documentElement.style.overflow = 'hidden';
      focusable()[0]?.focus?.();
    } else {
      if (lenis) lenis.start(); else document.documentElement.style.overflow = '';
    }
  };

  toggle.addEventListener('click', () => setOpen(!open));
  menu.querySelectorAll('[data-menu-link]').forEach((a) => {
    a.addEventListener('click', () => { if (open) setOpen(false); });
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { setOpen(false); toggle.focus(); return; }
    if (e.key === 'Tab') {
      const f = focusable();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches && open) setOpen(false); });
}

/* ---------- Scroll progress ---------- */
export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress__bar');
  if (!bar) return;
  gsap.to(bar, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 'top top', end: 'max', scrub: 0.3 },
  });
}

/* ---------- Preloader ---------- */
export function initPreloader() {
  const pre = document.querySelector('.preloader');
  if (!pre) { startHero(); return; }
  if (sessionStorage.getItem('od-seen')) {
    pre.remove();
    startHero();
    return;
  }
  sessionStorage.setItem('od-seen', '1');
  const num = pre.querySelector('.preloader__num');
  const counter = { v: 0 };
  const tl = gsap.timeline();
  tl.to('.preloader__bar span', { scaleX: 1, duration: D.hero, ease: 'power2.inOut' })
    .to(counter, {
      v: 100,
      duration: D.hero,
      ease: 'power2.inOut',
      onUpdate: () => { if (num) num.textContent = `${Math.round(counter.v)} %`; },
    }, 0)
    .to(pre, { yPercent: -100, duration: D.curtain, ease: 'power4.inOut' }, '+=0.1')
    .add(() => pre.remove())
    .add(startHero, '-=0.35');
}

export function startHero() {
  const tl = gsap.timeline({ defaults: { ease: 'eo' } });
  tl.to('.line__inner', {
      yPercent: 0, duration: 1.1, stagger: 0.12,
      onComplete: () => document.querySelectorAll('.hero__title, .subhero__title').forEach((el) => el.classList.add('is-intro-done')),
    }, 0.1)
    .to('[data-intro]', { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.5)
    .to('[data-intro-media]', { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, 0.35);

  const media = document.querySelector('[data-intro-media] img, [data-intro-media] video');
  if (media) gsap.fromTo(media, { scale: 1.12 }, { scale: 1.0, duration: 10, ease: 'none' });
}

/* ---------- Reveal on scroll (batched) ---------- */
export function initReveals() {
  gsap.set('[data-reveal]', { y: 44, opacity: 0 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: D.reveal, ease: 'eo', stagger: 0.1, overwrite: true }),
  });

  gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
    gsap.set(group.children, { y: 36, opacity: 0 });
    ScrollTrigger.create({
      trigger: group,
      start: 'top 86%',
      once: true,
      onEnter: () => gsap.to(group.children, { y: 0, opacity: 1, duration: 0.85, stagger: 0.09, ease: 'eo' }),
    });
  });
}

/* ---------- Curtain reveal (clip-path) ---------- */
export function initCurtains() {
  const items = gsap.utils.toArray('[data-curtain]');
  if (!items.length) return;
  items.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => el.classList.add('is-revealed'),
    });
  });
}

/* ---------- Parallax vrstvy ---------- */
export function initParallax() {
  gsap.utils.toArray('[data-parallax]').forEach((img) => {
    const speed = parseFloat(img.dataset.speed || '1');
    gsap.fromTo(
      img,
      { yPercent: -(speed * 8) },
      {
        yPercent: speed * 8,
        ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      }
    );
  });
}

/* ---------- Obří nadpisy: jemný svislý parallax + reveal ---------- */
export function initGiantDrift() {
  gsap.utils.toArray('.giant').forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: 14, opacity: 0.35 },
      {
        yPercent: -8,
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 38%', scrub: 0.6, invalidateOnRefresh: true },
      }
    );
  });
}

/* ---------- Hairline řezy: draw-on ---------- */
export function initRules() {
  const rules = gsap.utils.toArray('.rule[data-draw]');
  rules.forEach((r) => {
    gsap.to(r, { scaleX: 1, duration: 0.9, ease: 'eo', scrollTrigger: { trigger: r, start: 'top 92%', once: true } });
  });
}

/* ---------- Split nadpisy (masková reveal po slovech) ---------- */
function splitWords(el) {
  const wrap = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (part === '') return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const outer = document.createElement('span');
        outer.className = 'split-word';
        const inner = document.createElement('span');
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      Array.from(node.childNodes).forEach(wrap);
    }
  };
  Array.from(el.childNodes).forEach(wrap);
  return el.querySelectorAll('.split-word > span');
}

export function initSplitHeadings() {
  gsap.utils.toArray('[data-split], .section-head .giant, .about__copy h2, .reach__copy h2').forEach((h) => {
    const inners = splitWords(h);
    if (!inners.length) return;
    gsap.set(inners, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: h,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(inners, {
        yPercent: 0, duration: 0.9, ease: 'eo', stagger: 0.05,
        onComplete: () => h.classList.add('is-split-done'),
      }),
    });
  });
}

/* ---------- Marquee ticker (reaguje na rychlost scrollu) ---------- */
export function initMarquee() {
  const tweens = [];
  gsap.utils.toArray('.marquee__track').forEach((track) => {
    track.innerHTML += track.innerHTML;
    const dur = parseFloat(track.dataset.dur || '26');
    tweens.push(gsap.to(track, { xPercent: -50, duration: dur, ease: 'none', repeat: -1 }));
  });
  if (!tweens.length) return;

  let activeCount = 0;
  gsap.utils.toArray('.marquee').forEach((m) => {
    const track = m.querySelector('.marquee__track');
    const tween = tweens.find((t) => t.targets()[0] === track);
    if (!tween) return;
    tween.pause();
    ScrollTrigger.create({
      trigger: m, start: 'top bottom', end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive) { tween.play(); activeCount++; }
        else { tween.pause(); activeCount = Math.max(0, activeCount - 1); }
      },
    });
  });

  let hoverTS = null;
  gsap.ticker.add(() => {
    if (activeCount === 0) return;
    velTS += (1 - velTS) * 0.04;
    const base = velTS === 0 ? 0.001 : velTS;
    const ts = hoverTS != null ? hoverTS : base;
    tweens.forEach((t) => t.timeScale(ts));
  });

  document.querySelectorAll('.marquee').forEach((m) => {
    m.addEventListener('mouseenter', () => { hoverTS = 0.15; });
    m.addEventListener('mouseleave', () => { hoverTS = null; velTS = 1; });
  });
}

/* ---------- Počítadla — odometer (rolující číslice) ---------- */
export function initCounters() {
  const yearsEl = document.querySelector('[data-years]');
  if (yearsEl) yearsEl.dataset.count = String(new Date().getFullYear() - 1991);

  gsap.utils.toArray('[data-count]').forEach((el) => {
    const end = Math.round(parseFloat(el.dataset.count) || 0);
    const digits = String(end).split('');

    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = String(end);
    el.parentNode.insertBefore(sr, el);

    el.classList.add('odometer');
    el.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    const reels = [];
    digits.forEach((ch) => {
      const digit = document.createElement('span');
      digit.className = 'odometer__digit';
      const reel = document.createElement('span');
      reel.className = 'odometer__reel';
      for (let i = 0; i <= 9; i++) {
        const n = document.createElement('span');
        n.textContent = String(i);
        reel.appendChild(n);
      }
      digit.appendChild(reel);
      el.appendChild(digit);
      reels.push({ reel, target: Number(ch) });
    });

    gsap.set(reels.map((r) => r.reel), { yPercent: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        reels.forEach((r, idx) => {
          gsap.to(r.reel, { yPercent: -(r.target * 10), duration: 1.1 + idx * 0.35, ease: 'power4.out' });
        });
      },
    });
  });
}

/* ---------- Liquid buttony: kruhová výplň od místa vstupu kurzoru ---------- */
export function initLiquidButtons() {
  document.querySelectorAll('.btn-outline').forEach((btn) => {
    const set = (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--lx', `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty('--ly', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    btn.addEventListener('mouseenter', set);
    btn.addEventListener('mouseleave', set);
  });
}

/* ---------- Custom kurzor + magnetická tlačítka (jen desktop s myší) ---------- */
export function initHoverMotion() {
  const mm = gsap.matchMedia();

  mm.add('(hover: hover) and (pointer: fine)', () => {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.innerHTML = '<span class="cursor-ring__label">Objednat</span>';
    document.body.append(dot, ring);
    document.body.style.cursor = 'none';

    const dx = gsap.quickTo(dot, 'x', { duration: 0.14, ease: 'power3' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.14, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

    let shown = false;
    const move = (e) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      if (!shown) { shown = true; gsap.to([dot, ring], { opacity: 1, duration: 0.3 }); }
    };
    const onWinLeave = () => { shown = false; gsap.to([dot, ring], { opacity: 0, duration: 0.3 }); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', onWinLeave);

    const hoverTargets = 'a, button, .pcard, input, select, textarea, [data-cursor]';
    const onOver = (e) => {
      const t = e.target.closest(hoverTargets);
      if (!t) return;
      // „view" (žlutý OBJEDNAT) kurzor jen na explicitně označených prvcích,
      // NE na kartách (.pcard) — tam ať kurzor zůstane jen jemný kroužek.
      if (t.matches('[data-cursor="view"]')) ring.classList.add('is-view');
      else ring.classList.add('is-hover');
    };
    const onOut = (e) => {
      const t = e.target.closest(hoverTargets);
      if (!t) return;
      ring.classList.remove('is-hover', 'is-view');
    };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    const magnets = [];
    document.querySelectorAll('.btn-outline, .header__cta, .btn-solid').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'eo' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'eo' });
      const onMove = (e) => {
        const r = btn.getBoundingClientRect();
        xTo(gsap.utils.clamp(-14, 14, (e.clientX - r.left - r.width / 2) * 0.28));
        yTo(gsap.utils.clamp(-14, 14, (e.clientY - r.top - r.height / 2) * 0.4));
      };
      const onLeave = () => { xTo(0); yTo(0); };
      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
      magnets.push([btn, onMove, onLeave]);
    });

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseleave', onWinLeave);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      dot.remove(); ring.remove();
      document.body.style.cursor = '';
      magnets.forEach(([btn, onMove, onLeave]) => { btn.removeEventListener('mousemove', onMove); btn.removeEventListener('mouseleave', onLeave); });
    };
  });
}

/* ---------- Footer wordmark scrub ---------- */
export function initFooterScrub() {
  const mark = document.querySelector('.footer__wordmark');
  if (!mark) return;
  gsap.fromTo(
    mark,
    { yPercent: 40, opacity: 0.25 },
    { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 55%', scrub: true } }
  );
}

/* ---------- Sticky CTA pill ---------- */
export function initStickyCta() {
  const pill = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.subhero, .hero');
  const contact = document.getElementById('objednat') || document.getElementById('kontakt');
  if (!pill || !hero) return;

  const show = () => gsap.to(pill, { opacity: 1, y: 0, scale: 1, duration: D.ui, ease: 'eo' });
  const hide = () => gsap.to(pill, { opacity: 0, y: 24, scale: 0.9, duration: 0.4, ease: 'eo' });

  ScrollTrigger.create({ trigger: hero, start: 'bottom top', onEnter: show, onLeaveBack: hide });
  if (contact) ScrollTrigger.create({ trigger: contact, start: 'top 80%', onEnter: hide, onLeaveBack: show });
}

/* ---------- Živá otevírací doba ---------- */
export function initHours() {
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
    let text, shortText;

    if (openNow) {
      text = `Otevřeno · zavírá v ${fmt(closeFor(day))}`;
      shortText = `Otevřeno · do ${fmt(closeFor(day))}`;
    } else {
      let d = day;
      const sameDay = isWeekday(day) && mins < OPEN;
      if (!sameDay) { for (let i = 1; i <= 7; i++) { const nd = (day + i) % 7; if (isWeekday(nd)) { d = nd; break; } } }
      const when = sameDay ? 'dnes' : (d === (day + 1) % 7 ? 'zítra' : days[d]);
      text = `Zavřeno · otevíráme ${when} v ${fmt(OPEN)}`;
      shortText = `Zavřeno · ${when} v ${fmt(OPEN)}`;
    }

    const badge = document.getElementById('open-badge');
    if (badge) { badge.textContent = text; badge.classList.toggle('is-open', openNow); }
    const status = document.getElementById('header-status');
    if (status) status.textContent = `// ${shortText}`;
    const menuStatus = document.getElementById('menu-status');
    if (menuStatus) menuStatus.textContent = `// ${shortText}`;
  };

  update();
  setInterval(update, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
}

/* ---------- Autoplay videa (self-hosted webm) na všech zařízeních ---------- */
export function initHeroVideo() {
  gsap.utils.toArray('.subhero__video, .sub-videoband video').forEach((v) => {
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    if (v.readyState >= 2) play();
    else v.addEventListener('canplay', play, { once: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) v.pause(); else play(); });
  });
}

/* ---------- Video pozadí na konverzní CTA (lazy-load ve viewportu) ---------- */
export function initReachVideo() {
  gsap.utils.toArray('.reach__video').forEach((video) => {
    const src = video.querySelector('source[data-src]');
    new IntersectionObserver((entries, io) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      if (src && !src.src) src.src = src.dataset.src;
      video.load();
      const play = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
      if (video.readyState >= 2) play();
      else video.addEventListener('canplay', play, { once: true });
      video.classList.add('is-on');
    }, { rootMargin: '200px 0px' }).observe(video);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else if (video.classList.contains('is-on')) video.play().catch(() => {});
    });
  });
}

/* ---------- Formuláře (poptávka na podstránce) ----------
   Web3Forms endpoint: po vygenerování access key sem vložte klíč
   (shodný s main.js). Prázdný = jen lokální potvrzení. */
const WEB3FORMS_KEY = '';

export function initForms() {
  const form = document.getElementById('booking-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.company && form.company.value) return; // honeypot
    let valid = true;
    let firstInvalid = null;
    ['f-name', 'f-phone', 'f-service'].forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;
      const field = input.closest('.form__field');
      if (!field) return;
      const bad = !input.value.trim();
      field.classList.toggle('is-invalid', bad);
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad) { valid = false; if (!firstInvalid) firstInvalid = input; }
    });
    if (!valid) {
      form.classList.remove('is-shaking');
      void form.offsetWidth;
      form.classList.add('is-shaking');
      firstInvalid?.focus();
      return;
    }
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    const netError = document.getElementById('form-net-error');
    if (netError) netError.hidden = true;

    if (WEB3FORMS_KEY) {
      try {
        const data = new FormData(form);
        data.append('access_key', WEB3FORMS_KEY);
        data.append('subject', 'Nová poptávka z webu Optik Dvořák');
        const ctrl = new AbortController();
        const kill = setTimeout(() => ctrl.abort(), 10000);
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data, signal: ctrl.signal });
        clearTimeout(kill);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        if (netError) netError.hidden = false;
        return;
      }
    }

    submitBtn.classList.remove('is-loading');
    const ok = document.getElementById('form-success');
    if (ok) {
      ok.classList.add('is-visible');
      ok.setAttribute('tabindex', '-1');
      ok.focus({ preventScroll: true });
    }
    try { window.dispatchEvent(new CustomEvent('od-lead')); } catch { /* noop */ }
  });

  /* Inline validace při opuštění pole (jemný micro-detail) */
  form.querySelectorAll('input[required], select[required]').forEach((input) => {
    input.addEventListener('blur', () => {
      const field = input.closest('.form__field');
      if (!field) return;
      const bad = !input.value.trim();
      field.classList.toggle('is-invalid', bad);
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    });
    input.addEventListener('input', () => {
      const field = input.closest('.form__field');
      if (field && field.classList.contains('is-invalid') && input.value.trim()) {
        field.classList.remove('is-invalid');
        input.setAttribute('aria-invalid', 'false');
      }
    });
  });
}

/* ---------- Rok v patičce ---------- */
export function initYear() {
  document.querySelectorAll('#year').forEach((y) => { y.textContent = String(new Date().getFullYear()); });
}
