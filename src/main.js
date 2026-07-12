/* ============================================================
   OPTIK DVOŘÁK — HOMEPAGE JS
   GSAP + Lenis motion systém běžící na všech zařízeních,
   custom kurzor, marquee reagující na scroll, živá otevírací doba,
   cookie consent. Podpisová křivka „eo" sladěná s CSS.
   ============================================================ */

import './css/tokens.css';
import './css/base.css';
import './style.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/inter-tight';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { initCookies } from './js/cookies.js';

const root = document.documentElement;
root.classList.add('js');

/* Motion běží všude bez výjimky (výslovné rozhodnutí klienta 2026-07-12).
   OS nastavení reduced-motion vědomě ignorujeme; konstanta drží mrtvé větve neaktivní. */
const prefersReduced = false;

gsap.registerPlugin(ScrollTrigger, Observer);

/* Podpisová křivka — shodná s CSS var(--eo). CustomEase je součástí gsap balíčku. */
(async () => {
  try {
    const mod = await import('gsap/CustomEase');
    gsap.registerPlugin(mod.CustomEase);
    mod.CustomEase.create('eo', '0.16,1,0.3,1');
    gsap.defaults({ ease: 'eo' });
  } catch {
    // Fallback: zaregistruj 'eo' jako alias, ať explicitní ease:'eo' napříč kódem funguje
    try { gsap.registerEase('eo', gsap.parseEase('power3.out')); } catch { /* noop */ }
    gsap.defaults({ ease: 'eo' });
  }
  boot();
})();

const D = { micro: 0.2, ui: 0.5, reveal: 0.9, hero: 1.2, curtain: 0.7 };

/* ---------- Lenis smooth scroll ---------- */
let lenis = null;
let velTS = 1; // cíl timeScale marquee podle rychlosti scrollu

if (!prefersReduced) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, syncTouch: true });
  lenis.on('scroll', ({ velocity }) => {
    velTS = gsap.utils.clamp(-4, 4, 1 + (velocity || 0) * 0.05);
    ScrollTrigger.update();
  });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* Zabránit probliknutí hero před intro animací (jen když běží pohyb) */
if (!prefersReduced) {
  gsap.set('.line__inner', { yPercent: 110 });
  gsap.set('[data-intro]', { y: 26, opacity: 0 });
  gsap.set('[data-intro-media]', { opacity: 0, scale: 0.96 });
}

function boot() {
  initAnchors();
  initHeader();
  initMobileMenu();
  initHeroVideo();
  initPreloader();
  initReveals();
  initParallax();
  initGiantDrift();
  initScrollProgress();
  initProcessPin();
  initCurtains();
  initHeroTilt();
  initFooterScrub();
  initRules();
  initCounters();
  initMarquee();
  initDragCarousels();
  initAccordion();
  initHours();
  initStickyCta();
  initReachGlow();
  initForms();
  initLightbox();
  initHoverMotion();
  initYear();

  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
  initCookies();
}

/* ---------- Kotvy ---------- */
function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -68, duration: 1.1 });
      else target.scrollIntoView();
    });
  });
}

/* ---------- Header: scrolled / hide-on-down / invert na tmavém ---------- */
function initHeader() {
  const header = document.getElementById('header');
  const sentinel = document.getElementById('header-sentinel');
  if (!header) return;

  if (sentinel) {
    new IntersectionObserver(
      ([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting),
      { rootMargin: '0px' }
    ).observe(sentinel);
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
function initMobileMenu() {
  const btn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  const links = menu.querySelectorAll('a');
  let open = false;

  const set = (v) => {
    if (v === open) return;
    open = v;
    btn.setAttribute('aria-expanded', String(v));
    btn.setAttribute('aria-label', v ? 'Zavřít menu' : 'Otevřít menu');
    btn.classList.toggle('is-open', v);
    document.documentElement.classList.toggle('menu-open', v);
    if (v) {
      menu.removeAttribute('inert');
      lenis?.stop();
      gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: D.curtain, ease: 'eo' });
      gsap.fromTo(menu.querySelectorAll('.mobile-menu__nav a, .mobile-menu__foot > *'),
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, delay: 0.15, ease: 'eo' });
    } else {
      menu.setAttribute('inert', '');
      lenis?.start();
      gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'eo' });
    }
  };

  btn.addEventListener('click', () => set(!open));
  // capture: zavřít dřív, než anchor handler spustí lenis.scrollTo (lenis musí běžet)
  links.forEach((a) => a.addEventListener('click', () => set(false), { capture: true }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

/* ---------- Preloader ---------- */
function initPreloader() {
  const pre = document.querySelector('.preloader');
  if (!pre) { startHero(); return; }
  if (prefersReduced || sessionStorage.getItem('od-seen')) {
    pre.remove();
    startHero();
    return;
  }
  sessionStorage.setItem('od-seen', '1');
  const tl = gsap.timeline();
  tl.to('.preloader__bar span', { scaleX: 1, duration: D.hero, ease: 'power2.inOut' })
    .to(pre, { yPercent: -100, duration: D.curtain, ease: 'power4.inOut' }, '+=0.1')
    .add(() => pre.remove())
    .add(startHero, '-=0.35');
}

function startHero() {
  if (prefersReduced) return; // hero je ve výchozím stavu viditelné
  const tl = gsap.timeline({ defaults: { ease: 'eo' } });
  tl.to('.line__inner', { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.1)
    .to('[data-intro]', { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.5)
    .to('[data-intro-media]', { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, 0.35);

  // Cinematický Ken Burns na hero médiu
  const media = document.querySelector('[data-intro-media] img, [data-intro-media] video');
  if (media) gsap.fromTo(media, { scale: 1.12 }, { scale: 1.0, duration: 10, ease: 'none' });
}

/* ---------- Reveal on scroll (batched) ---------- */
function initReveals() {
  if (prefersReduced) return;

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

/* ---------- Parallax vrstvy ---------- */
function initParallax() {
  if (prefersReduced) return;
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

/* ---------- Obří nadpisy: drift + skew podle rychlosti ---------- */
function initGiantDrift() {
  if (prefersReduced) return;
  gsap.utils.toArray('.giant').forEach((el) => {
    const skewTo = gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' });
    gsap.fromTo(
      el,
      { x: 26 },
      {
        x: -26,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => skewTo(gsap.utils.clamp(-6, 6, self.getVelocity() / -340)),
        },
      }
    );
  });
}

/* ---------- Žlutá lišta průběhu scrollu ---------- */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress span');
  if (!bar) return;
  gsap.fromTo(bar, { scaleX: 0 }, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3, invalidateOnRefresh: true },
  });
}

/* ---------- Pinned horizontální proces (scroll-hijack) ---------- */
function initProcessPin() {
  const sec = document.querySelector('.process');
  const track = sec?.querySelector('.process__grid');
  if (!sec || !track) return;
  const getDist = () => track.scrollWidth - document.documentElement.clientWidth;
  if (getDist() < 80) return; // track se vejde, není co posouvat

  gsap.to(track, {
    x: () => -(getDist() + 60),
    ease: 'none',
    scrollTrigger: {
      trigger: sec,
      start: 'top top',
      end: () => `+=${getDist()}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
}

/* ---------- Curtain reveal médií (clip-path zleva) ---------- */
function initCurtains() {
  const targets = gsap.utils.toArray('.pcard__media, .lenses__small img, .lenses__big, .note__photo img, .collage__strip img');
  targets.forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.1,
      ease: 'eo',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ---------- Hero mouse-parallax (media + glow sledují kurzor) ---------- */
function initHeroTilt() {
  const hero = document.querySelector('.hero');
  const media = document.querySelector('.hero__media');
  if (!hero || !media) return;
  const glow = document.querySelector('.hero__glow');
  const mx = gsap.quickTo(media, 'x', { duration: 0.8, ease: 'power3' });
  const my = gsap.quickTo(media, 'y', { duration: 0.8, ease: 'power3' });
  const gx = glow ? gsap.quickTo(glow, 'x', { duration: 1.2, ease: 'power3' }) : null;
  const gy = glow ? gsap.quickTo(glow, 'y', { duration: 1.2, ease: 'power3' }) : null;
  hero.addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    mx(nx * -18);
    my(ny * -12);
    gx?.(nx * 44);
    gy?.(ny * 32);
  });
}

/* ---------- Footer wordmark: scale-scrub při doscrollování ---------- */
function initFooterScrub() {
  const wm = document.querySelector('.footer__wordmark');
  if (!wm) return;
  wm.style.transformOrigin = '50% 100%';
  gsap.fromTo(wm, { scale: 0.82, yPercent: 16 }, {
    scale: 1,
    yPercent: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 0.5 },
  });
}

/* ---------- Hairline řezy: draw-on ---------- */
function initRules() {
  const rules = gsap.utils.toArray('.rule[data-draw]');
  if (prefersReduced) { gsap.set(rules, { scaleX: 1 }); return; }
  rules.forEach((r) => {
    gsap.to(r, { scaleX: 1, duration: 0.9, ease: 'eo', scrollTrigger: { trigger: r, start: 'top 92%', once: true } });
  });
}

/* ---------- Počítadla ---------- */
function initCounters() {
  const yearsEl = document.querySelector('[data-years]');
  if (yearsEl) yearsEl.dataset.count = String(new Date().getFullYear() - 1991);

  gsap.utils.toArray('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = el.dataset.dec ? 1 : 0;
    const suffix = el.dataset.suffix || '';
    const fmt = (v) => new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v) + suffix;
    if (prefersReduced) { el.textContent = fmt(end); return; }
    const o = { v: 0 };
    el.textContent = fmt(0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', snap: dec ? { v: 0.1 } : { v: 1 }, onUpdate: () => { el.textContent = fmt(o.v); } }),
    });
  });
}

/* ---------- Marquee ticker ---------- */
function initMarquee() {
  const tweens = [];
  gsap.utils.toArray('.marquee__track').forEach((track) => {
    track.innerHTML += track.innerHTML; // duplikace pro bezešvou smyčku
    const dur = parseFloat(track.dataset.dur || '26');
    const tween = gsap.to(track, { xPercent: -50, duration: dur, ease: 'none', repeat: -1 });
    if (prefersReduced) { tween.progress(0).pause(); return; }
    tweens.push(tween);
  });
  if (prefersReduced || !tweens.length) return;

  let hoverTS = null;
  gsap.ticker.add(() => {
    velTS += (1 - velTS) * 0.04; // plynulý návrat na baseline
    const base = velTS === 0 ? 0.001 : velTS;
    const ts = hoverTS != null ? hoverTS : base;
    tweens.forEach((t) => t.timeScale(ts));
  });

  document.querySelectorAll('.marquee').forEach((m) => {
    m.addEventListener('mouseenter', () => { hoverTS = 0.15; });
    m.addEventListener('mouseleave', () => { hoverTS = null; velTS = 1; });
  });
}

/* ---------- Drag carousely (lookbook + recenze): autoplay smyčka,
   tažením prstem/myší strip roztočíte, inercie ho vrátí na baseline ---------- */
function initDragCarousels() {
  [
    { sel: '.lookbook__rail', dur: 42 },
    { sel: '.reviews__rail', dur: 58 },
  ].forEach(({ sel, dur }) => {
    const rail = document.querySelector(sel);
    if (!rail) return;

    const originals = rail.children.length;
    rail.innerHTML += rail.innerHTML; // bezešvá smyčka
    // duplikáty schovat před čtečkami
    Array.from(rail.children).slice(originals).forEach((el) => el.setAttribute('aria-hidden', 'true'));

    const tween = gsap.to(rail, { xPercent: -50, duration: dur, ease: 'none', repeat: -1 });

    Observer.create({
      target: rail,
      type: 'pointer,touch',
      dragMinimum: 5,
      onDrag: (self) => tween.timeScale(gsap.utils.clamp(-9, 9, -self.deltaX * 0.4)),
      onDragEnd: () => gsap.to(tween, { timeScale: 1, duration: 1.4, ease: 'power3.out' }),
    });

    rail.addEventListener('mouseenter', () => { if (Math.abs(tween.timeScale()) <= 1.01) tween.timeScale(0.18); });
    rail.addEventListener('mouseleave', () => gsap.to(tween, { timeScale: 1, duration: 0.6, ease: 'power2.out' }));
  });
}

/* ---------- FAQ accordion ---------- */
function initAccordion() {
  const items = gsap.utils.toArray('.faq__item');
  items.forEach((item, i) => {
    const btn = item.querySelector('.faq__q');
    const panel = item.querySelector('.faq__panel');
    if (!btn || !panel) return;
    const pid = `faq-panel-${i}`;
    panel.id = pid;
    btn.setAttribute('aria-controls', pid);
    btn.setAttribute('aria-expanded', 'false');
    panel.setAttribute('inert', ''); // sbalený panel mimo tab-order a čtečku
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      items.forEach((other) => {
        if (other === item) return;
        other.classList.remove('is-open');
        const ob = other.querySelector('.faq__q');
        const op = other.querySelector('.faq__panel');
        ob?.setAttribute('aria-expanded', 'false');
        op?.setAttribute('inert', '');
        gsap.to(op, { height: 0, duration: prefersReduced ? 0 : D.ui, ease: 'eo' });
      });
      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) panel.setAttribute('inert', '');
      else panel.removeAttribute('inert');
      gsap.to(panel, { height: isOpen ? 0 : 'auto', duration: prefersReduced ? 0 : D.ui, ease: 'eo' });
    });
  });
}

/* ---------- Živá otevírací doba ---------- */
function initHours() {
  const days = ['v neděli', 'v pondělí', 'v úterý', 've středu', 've čtvrtek', 'v pátek', 'v sobotu'];
  const OPEN = 8 * 60 + 30;
  const closeFor = (d) => (d === 5 ? 16 * 60 : 17 * 60);
  const isWeekday = (d) => d >= 1 && d <= 5;
  const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

  const update = () => {
    const now = new Date();
    const day = now.getDay(); // 0 Ne … 6 So
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
  };

  update();
  setInterval(update, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
}

/* ---------- Sticky CTA pill ---------- */
function initStickyCta() {
  const pill = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero');
  const contact = document.getElementById('kontakt');
  if (!pill || !hero) return;
  if (prefersReduced) { gsap.set(pill, { opacity: 1, y: 0, scale: 1 }); return; }

  const show = () => gsap.to(pill, { opacity: 1, y: 0, scale: 1, duration: D.ui, ease: 'eo' });
  const hide = () => gsap.to(pill, { opacity: 0, y: 24, scale: 0.9, duration: 0.4, ease: 'eo' });

  ScrollTrigger.create({ trigger: hero, start: 'bottom top', onEnter: show, onLeaveBack: hide });
  if (contact) ScrollTrigger.create({ trigger: contact, start: 'top 80%', onEnter: hide, onLeaveBack: show });
}

/* ---------- Světlo za kurzorem na černé CTA ---------- */
function initReachGlow() {
  const reach = document.querySelector('.reach');
  if (!reach || prefersReduced) return;
  reach.addEventListener('pointermove', (e) => {
    const r = reach.getBoundingClientRect();
    reach.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    reach.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
}

/* ---------- Formuláře ---------- */
function initForms() {
  const form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', (e) => {
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
      const ok = document.getElementById('form-success');
      if (ok) ok.classList.add('is-visible');
      form.querySelector('button[type="submit"]').disabled = true;
    });
  }

  const footerForm = document.getElementById('footer-form');
  if (footerForm) {
    footerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = document.getElementById('ft-phone')?.value.trim();
      const main = document.getElementById('f-phone');
      if (phone && main) main.value = phone;
      const target = document.getElementById('kontakt');
      if (lenis && target) lenis.scrollTo(target, { offset: -68 });
      else target?.scrollIntoView();
      document.getElementById('f-name')?.focus({ preventScroll: true });
    });
  }
}

/* ---------- Lightbox pro fotky prodejny ---------- */
function initLightbox() {
  const triggers = document.querySelectorAll('[data-lightbox], [data-lightbox-src]');
  if (!triggers.length) return;

  const open = (src, alt) => {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Náhled fotografie');
    box.innerHTML = `<img src="${src}" alt="${alt || ''}" /><button class="lightbox__close" aria-label="Zavřít náhled">×</button>`;
    document.body.appendChild(box);
    lenis?.stop();
    gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'eo' });
    gsap.fromTo(box.querySelector('img'), { scale: 0.92 }, { scale: 1, duration: 0.5, ease: 'eo' });

    const close = () => {
      lenis?.start();
      gsap.to(box, { opacity: 0, duration: 0.25, ease: 'eo', onComplete: () => box.remove() });
      document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    box.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    box.querySelector('.lightbox__close').focus();
  };

  triggers.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const src = el.dataset.lightboxSrc || el.currentSrc || el.src;
      const alt = el.dataset.lightboxSrc ? el.querySelector('img')?.alt : el.alt;
      if (src) open(src, alt);
    });
  });
}

/* ---------- Custom kurzor + magnetická tlačítka (jen desktop) ---------- */
function initHoverMotion() {
  if (prefersReduced) return;
  const mm = gsap.matchMedia();

  mm.add('(hover: hover) and (pointer: fine)', () => {
    // Custom kurzor
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
      if (t.matches('[data-cursor="view"], .pcard')) ring.classList.add('is-view');
      else ring.classList.add('is-hover');
    };
    const onOut = (e) => {
      const t = e.target.closest(hoverTargets);
      if (!t) return;
      ring.classList.remove('is-hover', 'is-view');
    };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    // Magnetická tlačítka
    const magnets = [];
    document.querySelectorAll('.btn-outline, .header__cta, .btn-solid, .sticky-cta').forEach((btn) => {
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

/* ---------- Hero video (self-hosted webm z fotek) ---------- */
function initHeroVideo() {
  const v = document.querySelector('.hero__video');
  if (!v) return;
  if (prefersReduced) {
    // Bez pohybu: video schovat, ukázat fotku pod ním
    v.pause();
    v.removeAttribute('autoplay');
    v.style.display = 'none';
    return;
  }
  const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  if (v.readyState >= 2) play();
  else v.addEventListener('canplay', play, { once: true });
  // Šetři baterii/data, když je karta skrytá
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) v.pause();
    else if (v.style.display !== 'none') play();
  });
}

/* ---------- Rok v patičce ---------- */
function initYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
}
