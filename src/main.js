/* ============================================================
   OPTIK DVOŘÁK — HOMEPAGE JS
   GSAP + Lenis motion systém běžící na všech zařízeních bez výjimky,
   custom kurzor, marquee reagující na scroll, živá otevírací doba,
   cookie consent. Podpisová křivka „eo" sladěná s CSS.
   ============================================================ */

import './css/tokens.css';
import './css/base.css';
import './style.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/bricolage-grotesque';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { initCookies } from './js/cookies.js';
import { initPageTransitions } from './js/page-transition.js';
import { initBrandMark, initBrandLogos } from './js/brand.js';
import { initAnalytics } from './js/analytics.js';

const root = document.documentElement;
root.classList.add('js');

/* Motion běží všude bez výjimky (trvalé rozhodnutí klienta, viz CLAUDE.md).
   Konstanta false drží gaty mrtvé; NIKDY nevracet matchMedia. */
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
}

function boot() {
  initBrandMark();
  initBrandLogos();
  initMobileMenu();
  initAnchors();
  initHeader();
  initScrollProgress();
  initHeroSlideshow();
  initPreloader();
  initSplitHeadings();
  initReveals();
  initCurtains();
  initParallax();
  initGiantDrift();
  initRules();
  initProcessPin();
  initVideoMask();
  initCounters();
  initMarquee();
  initCarousels();
  initRing();
  initGalleryLightbox();
  initAccordion();
  initHours();
  initStickyCta();
  initReachGlow();
  initReachVideo();
  initFooterScrub();
  initScrollSpy();
  initForms();
  initLiquidButtons();
  initInstaFeed();
  initSectionWipes();
  initHoverMotion();
  initYear();

  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
  initCookies();
  initPageTransitions();
  initAnalytics();
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
      // Po doscrollování přesuň fokus na cílovou sekci (WCAG 2.4.3)
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

  gsap.utils.toArray('[data-dark-section], [data-hero-dark]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 58px',
      end: 'bottom 58px',
      onToggle: (self) => header.classList.toggle('header--on-dark', self.isActive),
    });
  });

  // Hero je tmavý a začíná pod hlavičkou → header musí být invertovaný hned od startu
  if (document.querySelector('[data-hero-dark]')) header.classList.add('header--on-dark');
}

/* ---------- Mobilní fullscreen menu ---------- */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  let open = false;
  const focusable = () => menu.querySelectorAll('a[href], button:not([disabled])');
  // Izolace pozadí pro asistivní technologie (mimo burger, který zavírá)
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

  // Zavřít po kliknutí na odkaz (necháme proběhnout kotvu/přechod)
  menu.querySelectorAll('[data-menu-link]').forEach((a) => {
    a.addEventListener('click', () => { if (open) setOpen(false); });
  });

  // Escape + focus trap
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

  // Zavřít při přechodu na desktop
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches && open) setOpen(false); });
}

/* ---------- Scroll progress (horní ukazatel) ---------- */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress__bar');
  if (!bar) return;
  if (prefersReduced) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return;
  }
  gsap.to(bar, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 'top top', end: 'max', scrub: 0.3 },
  });
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

function startHero() {
  if (prefersReduced) return; // hero je ve výchozím stavu viditelné
  const tl = gsap.timeline({ defaults: { ease: 'eo' } });
  tl.to('.line__inner', {
      yPercent: 0, duration: 1.1, stagger: 0.12,
      onComplete: () => document.querySelectorAll('.hero__title, .subhero__title').forEach((el) => el.classList.add('is-intro-done')),
    }, 0.1)
    .to('[data-intro]', { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.5);
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

/* ---------- Obří nadpisy: drift + skew podle rychlosti (všechna zařízení) ---------- */
function initGiantDrift() {
  if (prefersReduced) return;
  // Žádné naklánění (skew) ani boční posun — jen jemný svislý parallax
  // a měkký reveal při vstupu do viewportu. Běží na všech zařízeních.
  gsap.utils.toArray('.giant').forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: 14, opacity: 0.35 },
      {
        yPercent: -8,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'top 38%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      }
    );
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

/* ---------- Liquid buttony: kruhová výplň od místa vstupu kurzoru ---------- */
function initLiquidButtons() {
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

/* ---------- Instagram feed: živě natáhne poslední příspěvky i reely ----------
   Zdroj se nastavuje přes data-insta-feed na <section class="insta"> — vlož URL
   JSON feedu z behold.so (zdarma). Když je prázdný nebo se nepodaří načíst,
   zůstanou statické dlaždice v HTML (obnovované přes `npm run ig:refresh`). */
async function initInstaFeed() {
  const sec = document.querySelector('.insta');
  const wrap = sec?.querySelector('.insta__cards');
  if (!wrap) return;

  // Zdroje podle priority: živý feed (behold.so) → lokální JSON (npm run ig:refresh).
  // Když se nic nenačte, zůstanou statické karty v HTML.
  const live = (sec.dataset.instaFeed || '').trim();
  const sources = [live, '/data/instagram.json'].filter(Boolean);

  let data = null;
  for (const src of sources) {
    try {
      const res = await fetch(src, { headers: { accept: 'application/json' } });
      if (!res.ok) continue;
      const j = await res.json();
      const has = (Array.isArray(j) ? j.length : (j.posts || j.data || []).length) > 0;
      if (has) { data = j; break; }
    } catch { /* zkus další zdroj */ }
  }
  if (!data) return; // ponech statické karty

  const list = (Array.isArray(data) ? data : data.posts || data.data || []).slice(0, 6);
  const avatar = (!Array.isArray(data) && data.profilePictureUrl) || '/img/logo-mark.svg';
  const cards = list.map((p) => ({
    url: p.permalink || p.url || p.link || 'https://www.instagram.com/optik.dvorak/',
    // Preferuj stabilní CDN Beholdu (sizes.*.mediaUrl); thumbnailUrl z IG CDN může vypršet.
    img: p.sizes?.medium?.mediaUrl || p.sizes?.large?.mediaUrl || p.sizes?.small?.mediaUrl
      || p.sizes?.full?.mediaUrl || p.thumbnailUrl || p.mediaUrl || p.img || p.image || p.display_url,
    video: String(p.mediaType || p.media_type || p.type || '').toUpperCase().includes('VIDEO'),
    caption: String(p.prunedCaption || p.caption || '').replace(/\s+/g, ' ').trim(),
  })).filter((c) => c.img);
  if (!cards.length) return;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clip = (s, n) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, '')}…` : s);
  const IG = '<svg class="ig-card__ig" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none"/></svg>';

  wrap.innerHTML = cards.map((c) => `
    <article class="ig-card">
      <header class="ig-card__head">
        <img class="ig-card__avatar" src="${esc(avatar)}" alt="" width="34" height="34" loading="lazy" />
        <span class="ig-card__handle">optik.dvorak</span>
        ${IG}
      </header>
      <a class="ig-card__media" href="${esc(c.url)}" target="_blank" rel="noopener" aria-label="Příspěvek Optik Dvořák na Instagramu">
        <img src="${esc(c.img)}" alt="Příspěvek z Instagramu Optik Dvořák" loading="lazy" />
        ${c.video ? '<span class="ig-card__badge" aria-hidden="true">▶</span>' : ''}
      </a>
      <div class="ig-card__body">
        ${c.caption ? `<p class="ig-card__cap">${esc(clip(c.caption, 140))}</p>` : ''}
        <a class="ig-card__link" href="${esc(c.url)}" target="_blank" rel="noopener">Zobrazit na Instagramu <span aria-hidden="true">↗</span></a>
      </div>
    </article>`).join('');

  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
}

/* ---------- Section wipes: tmavé sekce se „rozevřou" při příjezdu ---------- */
function initSectionWipes() {
  gsap.utils.toArray('[data-dark-section]').forEach((sec) => {
    gsap.fromTo(sec,
      { clipPath: 'inset(6% 4% 6% 4% round 26px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top 88%', end: 'top 32%', scrub: true },
      });
  });
}

/* ---------- 3D ring carousel (lookbook): autoplay rotace, drag
   se setrvačností, šipky otáčí o krok, hloubkové stínování ---------- */
function initRing() {
  const ring = document.querySelector('.ring');
  const stage = ring?.querySelector('.ring__stage');
  if (!ring || !stage) return;
  const items = gsap.utils.toArray(stage.children);
  const n = items.length;
  if (n < 3) return;
  const stepDeg = 360 / n;

  let radius = 0;
  const layout = () => {
    const w = items[0].offsetWidth || 280;
    radius = Math.round(w / 2 / Math.tan(Math.PI / n)) + 46;
    items.forEach((el, i) => {
      el.style.transform = `translate(-50%, -50%) rotateY(${i * stepDeg}deg) translateZ(${radius}px)`;
    });
  };

  items.forEach((el) => {
    el.setAttribute('role', 'group');
    el.setAttribute('aria-roledescription', 'slide');
  });

  const state = { rot: 0 };
  const lastF = new Array(n).fill(-1);
  const apply = () => {
    stage.style.transform = `translateZ(${-radius}px) rotateY(${state.rot}deg)`;
    items.forEach((el, i) => {
      const a = (((i * stepDeg + state.rot) % 360) + 360) % 360;
      const f = Math.round(((Math.cos((a * Math.PI) / 180) + 1) / 2) * 100) / 100; // 1 = vpředu
      if (f === lastF[i]) return; // beze změny nepřepisovat styly (filter je drahý)
      lastF[i] = f;
      el.style.opacity = String(0.22 + f * 0.78);
      el.style.filter = `brightness(${0.55 + f * 0.45}) saturate(${0.6 + f * 0.4})`;
      el.style.zIndex = String(Math.round(f * 100));
      el.setAttribute('aria-hidden', f < 0.5 ? 'true' : 'false');
    });
  };

  layout();
  apply();

  const spin = gsap.to(state, { rot: '-=360', duration: 46, ease: 'none', repeat: -1, onUpdate: apply, paused: true });
  let userPaused = false;

  /* Točí se jen ve viewportu; mimo něj se šetří GPU vrstvy */
  ScrollTrigger.create({
    trigger: ring,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      ring.classList.toggle('is-live', self.isActive);
      if (self.isActive && !userPaused) spin.play();
      else spin.pause();
    },
  });

  Observer.create({
    target: ring,
    type: 'pointer,touch',
    dragMinimum: 4,
    preventDefault: true,
    onPress: () => spin.pause(),
    onDrag: (self) => { state.rot += self.deltaX * 0.26; apply(); },
    onRelease: (self) => {
      gsap.to(state, {
        rot: state.rot + self.velocityX * 0.055,
        duration: 1.1,
        ease: 'power3.out',
        onUpdate: apply,
        onComplete: () => { if (!userPaused) spin.play(); },
      });
    },
  });

  const sec = ring.closest('section');
  const nudge = (dir) => {
    spin.pause();
    gsap.to(state, { rot: `+=${dir * stepDeg}`, duration: 0.7, ease: 'eo', onUpdate: apply, onComplete: () => { if (!userPaused) spin.play(); } });
  };
  sec?.querySelector('[data-carousel-prev]')?.addEventListener('click', () => nudge(1));
  sec?.querySelector('[data-carousel-next]')?.addEventListener('click', () => nudge(-1));

  /* WCAG 2.2.2: tlačítko pro zastavení automatické rotace */
  const btns = sec?.querySelector('.carousel__btns');
  if (btns) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'carousel__btn';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-label', 'Pozastavit automatické otáčení');
    toggle.textContent = '⏸';
    toggle.addEventListener('click', () => {
      userPaused = !userPaused;
      toggle.setAttribute('aria-pressed', String(userPaused));
      toggle.setAttribute('aria-label', userPaused ? 'Spustit automatické otáčení' : 'Pozastavit automatické otáčení');
      toggle.textContent = userPaused ? '▶' : '⏸';
      if (userPaused) spin.pause();
      else spin.play();
    });
    btns.appendChild(toggle);
  }

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { lastF.fill(-1); layout(); apply(); }, 150);
  });
}

/* ---------- Video mask: pinned sekce, scroll řídí currentTime videa,
   nápis roste; video prosvítá skrz písmena SVG masky ---------- */
function initVideoMask() {
  const sec = document.querySelector('.videomask');
  if (!sec) return;
  const words = gsap.utils.toArray('.videomask__word', sec);
  const N = words.length || 1;

  gsap.set(words, { transformOrigin: 'center' });

  /* Slova se přes scroll prolínají (OSTŘE → VIDĚT → STYL) a rostou.
     Vždy je aspoň jedno slovo vidět. */
  const seg = 1 / N;
  const setWords = (p) => {
    words.forEach((w, i) => {
      const lp = (p - i * seg) / seg;             // 0..1 v aktivním okně slova
      const riseIn = i > 0, fallOut = i < N - 1;
      let op = 0;
      if (lp >= (riseIn ? -0.06 : -1) && lp <= (fallOut ? 1.06 : 2)) {
        if (riseIn && lp < 0.16) op = (lp + 0.06) / 0.22;
        else if (fallOut && lp > 0.84) op = (1.06 - lp) / 0.22;
        else op = 1;
      }
      gsap.set(w, { opacity: gsap.utils.clamp(0, 1, op), scale: 0.9 + gsap.utils.clamp(0, 1, lp) * 0.36 });
    });
  };
  setWords(0);

  ScrollTrigger.create({
    trigger: sec,
    start: 'top top',
    end: '+=' + Math.max(160, N * 90) + '%',
    pin: true,
    scrub: true,
    onUpdate: (self) => setWords(self.progress),
  });
}

/* ---------- Počítadla — odometer (rolující číslice) ---------- */
function initCounters() {
  const yearsEl = document.querySelector('[data-years]');
  if (yearsEl) yearsEl.dataset.count = String(new Date().getFullYear() - 1991);

  gsap.utils.toArray('[data-count]').forEach((el) => {
    const end = Math.round(parseFloat(el.dataset.count) || 0);
    const digits = String(end).split('');

    if (prefersReduced) { el.textContent = String(end); return; }

    // Přístupnost: reálné číslo pro čtečky, vizuální reels skryté před AT
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = String(end);
    el.parentNode.insertBefore(sr, el);

    // Postav odometer: pro každou číslici reel 0–9
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
          gsap.to(r.reel, {
            yPercent: -(r.target * 10),
            duration: 1.1 + idx * 0.35,
            ease: 'power4.out',
          });
        });
      },
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

  // Pauza běhu mimo viewport (šetří výkon)
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
    if (activeCount === 0) return; // nic viditelného → žádná práce
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
    const menuStatus = document.getElementById('menu-status');
    if (menuStatus) menuStatus.textContent = `// ${shortText}`;
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

/* ---------- Video pozadí na konverzní CTA (lazy-load ve viewportu) ---------- */
function initReachVideo() {
  const video = document.querySelector('.reach__video');
  if (!video) return;
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
/* Web3Forms endpoint: po vygenerování access key (web3forms.com, e-mail
   optika.americka@seznam.cz) sem vložte klíč. Prázdný = jen lokální potvrzení.
   Klíč je veřejný záměrně — skutečná ochrana proti zneužití je v dashboardu
   Web3Forms zapnout „Allowed Domains" jen pro optikdvorak.cz. */
const WEB3FORMS_KEY = '';

function initForms() {
  const form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.company && form.company.value) return; // honeypot
      let valid = true;
      let firstInvalid = null;
      ['f-name', 'f-phone', 'f-email'].forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        const field = input.closest('.form__field');
        if (!field) return;
        const val = input.value.trim();
        // e-mail navíc kontroluje základní formát
        const bad = !val || (id === 'f-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
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
          if (netError) netError.hidden = false;
          return;
        }
      }

      const ok = document.getElementById('form-success');
      if (ok) {
        ok.classList.add('is-visible');
        ok.setAttribute('tabindex', '-1');
        ok.focus({ preventScroll: true });
      }
      try { window.dispatchEvent(new CustomEvent('od-lead')); } catch { /* noop */ }
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

    // 3D tilt karet služeb — jemné naklopení podle pozice kurzoru
    document.querySelectorAll('.pcard').forEach((card) => {
      const media = card.querySelector('.pcard__media');
      if (!media) return;
      const rxTo = gsap.quickTo(media, 'rotationX', { duration: 0.5, ease: 'eo' });
      const ryTo = gsap.quickTo(media, 'rotationY', { duration: 0.5, ease: 'eo' });
      gsap.set(media, { transformPerspective: 700 });
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        ryTo(((e.clientX - r.left) / r.width - 0.5) * 7);
        rxTo(((e.clientY - r.top) / r.height - 0.5) * -5);
      });
      card.addEventListener('mouseleave', () => { rxTo(0); ryTo(0); });
    });

    // Magnetická tlačítka
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

/* ---------- Hero video (self-hosted webm z fotek) ---------- */
function initHeroSlideshow() {
  const slides = gsap.utils.toArray('.hero__slide');
  if (slides.length < 2) return;
  let i = 0;
  const HOLD = 5200; // jak dlouho zůstane fotka, než se prolne do další
  const advance = () => {
    slides[i].classList.remove('is-active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('is-active');
  };
  let timer = setInterval(advance, HOLD);
  // Šetři výkon a data, když je záložka skrytá
  document.addEventListener('visibilitychange', () => {
    clearInterval(timer);
    if (!document.hidden) timer = setInterval(advance, HOLD);
  });
}

/* ---------- Split nadpisy (masková reveal po slovech / znacích) ---------- */
function splitWords(el, chars = false) {
  const wrap = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (part === '') return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const outer = document.createElement('span');
        outer.className = 'split-word';
        if (chars) {
          // znak po znaku uvnitř slova — jemnější prémiový reveal
          [...part].forEach((ch) => {
            const c = document.createElement('span');
            c.className = 'split-char';
            c.textContent = ch;
            outer.appendChild(c);
          });
        } else {
          const inner = document.createElement('span');
          inner.textContent = part;
          outer.appendChild(inner);
        }
        frag.appendChild(outer);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      Array.from(node.childNodes).forEach(wrap);
    }
  };
  Array.from(el.childNodes).forEach(wrap);
  return el.querySelectorAll(chars ? '.split-char' : '.split-word > span');
}

function initSplitHeadings() {
  if (prefersReduced) return;
  gsap.utils.toArray('.section-head .giant, .about__copy h2, .reach__copy h2, .brands__head h2').forEach((h) => {
    const charMode = h.classList.contains('giant');
    const inners = splitWords(h, charMode);
    if (!inners.length) return;
    gsap.set(inners, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: h,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(inners, {
        yPercent: 0, duration: charMode ? 0.8 : 0.9, ease: 'eo',
        stagger: charMode ? 0.02 : 0.05,
        onComplete: () => h.classList.add('is-split-done'),
      }),
    });
  });
}

/* ---------- Curtain reveal (clip-path) ---------- */
function initCurtains() {
  const items = gsap.utils.toArray('[data-curtain]');
  if (!items.length) return;
  if (prefersReduced) { items.forEach((el) => el.classList.add('is-revealed')); return; }
  items.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => el.classList.add('is-revealed'),
    });
  });
}

/* ---------- Proces: pin (desktop) + postupná aktivace (mobil) ---------- */
function initProcessPin() {
  if (prefersReduced) return;
  const section = document.querySelector('.process');
  const steps = gsap.utils.toArray('.process .step');
  const bar = document.querySelector('.process__progress span');
  if (!section || steps.length < 2) return;

  const mm = gsap.matchMedia();

  // Desktop: připnutá sekce + scrub aktivace s tlumením neaktivních
  mm.add('(min-width: 1024px)', () => {
    section.classList.add('is-pinning');
    const setActive = (p) => {
      if (bar) gsap.set(bar, { scaleX: gsap.utils.clamp(0, 1, p) });
      const active = Math.min(steps.length - 1, Math.floor(p * steps.length + 0.0001));
      steps.forEach((s, i) => {
        const on = i <= active && p > 0;
        s.classList.toggle('is-active', on);
        gsap.set(s, { opacity: on ? 1 : 0.32 });
      });
    };
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=' + steps.length * 200,
      pin: true,
      scrub: true,
      onUpdate: (self) => setActive(self.progress),
      onLeaveBack: () => setActive(0),
    });
    setActive(0);
    return () => {
      st.kill();
      section.classList.remove('is-pinning');
      steps.forEach((s) => { s.classList.remove('is-active'); gsap.set(s, { opacity: 1 }); });
    };
  });

  // Mobil/tablet: bez pinu — progress bar + rozsvěcení čísel kroků (žádné tlumení, ať nekoliduje s reveal)
  mm.add('(max-width: 1023px)', () => {
    section.classList.add('is-activating');
    const barTween = bar
      ? gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top 70%', end: 'bottom 55%', scrub: true } })
      : null;
    const triggers = steps.map((s) =>
      ScrollTrigger.create({
        trigger: s,
        start: 'top 80%',
        end: 'bottom 45%',
        onToggle: (self) => s.classList.toggle('is-active', self.isActive),
      })
    );
    return () => {
      section.classList.remove('is-activating');
      steps.forEach((s) => s.classList.remove('is-active'));
      barTween && barTween.scrollTrigger && barTween.scrollTrigger.kill();
      barTween && barTween.kill();
      triggers.forEach((t) => t.kill());
    };
  });
}

/* ---------- Footer wordmark scrub ---------- */
function initFooterScrub() {
  if (prefersReduced) return;
  const mark = document.querySelector('.footer__wordmark');
  if (!mark) return;
  gsap.fromTo(
    mark,
    { yPercent: 40, opacity: 0.25 },
    { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 55%', scrub: true } }
  );
}

/* ---------- Scrollspy: aktivní odkaz v navigaci ---------- */
function initScrollSpy() {
  const links = gsap.utils.toArray('.header__nav a[data-nav]');
  if (!links.length) return;
  const map = new Map();
  links.forEach((a) => {
    const id = a.getAttribute('href');
    if (id && id.startsWith('#') && id.length > 1) {
      const sec = document.querySelector(id);
      if (sec) map.set(sec, a);
    }
  });
  if (!map.size) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.remove('is-current'));
        map.get(e.target)?.classList.add('is-current');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  map.forEach((_a, sec) => io.observe(sec));
}

/* ---------- Carousely (lookbook + recenze): drag, šipky, autoplay, progress ---------- */
function initCarousels() {
  gsap.utils.toArray('[data-carousel]').forEach((rail) => {
    const section = rail.closest('section') || document;
    const prev = section.querySelector('[data-carousel-prev]');
    const next = section.querySelector('[data-carousel-next]');
    const progress = section.querySelector('[data-carousel-progress] span');
    const slides = Array.from(rail.children);
    if (!slides.length) return;

    const step = () => {
      const a = slides[0].getBoundingClientRect();
      const b = slides[1] ? slides[1].getBoundingClientRect() : a;
      return (slides[1] ? b.left - a.left : a.width) || a.width;
    };
    const maxScroll = () => rail.scrollWidth - rail.clientWidth;

    const update = () => {
      const max = maxScroll();
      const p = max > 0 ? rail.scrollLeft / max : 0;
      if (progress) progress.style.transform = `scaleX(${gsap.utils.clamp(0.06, 1, p || 0.06)})`;
      if (prev) prev.disabled = rail.scrollLeft <= 4;
      if (next) next.disabled = rail.scrollLeft >= max - 4;
    };
    rail.addEventListener('scroll', () => { window.requestAnimationFrame(update); }, { passive: true });

    const go = (dir) => {
      const max = maxScroll();
      let target = rail.scrollLeft + dir * step();
      if (dir > 0 && rail.scrollLeft >= max - 4) target = 0; // smyčka na začátek
      rail.scrollTo({ left: gsap.utils.clamp(0, max, target), behavior: prefersReduced ? 'auto' : 'smooth' });
    };
    prev && prev.addEventListener('click', () => go(-1));
    next && next.addEventListener('click', () => go(1));

    // Drag-to-scroll (pointer)
    let down = false, startX = 0, startLeft = 0, moved = false;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = true; moved = false;
      startX = e.clientX; startLeft = rail.scrollLeft;
      rail.classList.add('is-dragging');
    });
    rail.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      rail.scrollLeft = startLeft - dx;
    });
    const release = () => { if (!down) return; down = false; rail.classList.remove('is-dragging'); };
    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
    rail.addEventListener('pointerleave', release);
    // Zabraň kliknutí po dragu
    rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

    // Autoplay + přístupné tlačítko pauza/přehrát (WCAG 2.2.2)
    const delay = parseInt(rail.dataset.autoplay || '0', 10);
    if (delay > 0 && !prefersReduced) {
      let timer = null, userPaused = false, inView = false, hovered = false;
      const sync = () => {
        const run = inView && !userPaused && !hovered && !document.hidden;
        if (run && !timer) timer = window.setInterval(() => go(1), delay);
        else if (!run && timer) { window.clearInterval(timer); timer = null; }
      };
      rail.addEventListener('pointerenter', () => { hovered = true; sync(); });
      rail.addEventListener('pointerleave', () => { hovered = false; sync(); });
      rail.addEventListener('pointerdown', () => { hovered = true; sync(); });
      rail.addEventListener('focusin', () => { hovered = true; sync(); });
      rail.addEventListener('focusout', () => { hovered = false; sync(); });
      document.addEventListener('visibilitychange', sync);
      ScrollTrigger.create({ trigger: rail, start: 'top 90%', end: 'bottom 10%', onToggle: (self) => { inView = self.isActive; sync(); } });

      const btns = section.querySelector('.carousel__btns');
      if (btns) {
        const pp = document.createElement('button');
        pp.type = 'button';
        pp.className = 'carousel__btn carousel__toggle';
        pp.setAttribute('aria-pressed', 'false');
        pp.setAttribute('aria-label', 'Pozastavit automatické posouvání');
        pp.innerHTML = '<span aria-hidden="true">❚❚</span>';
        pp.addEventListener('click', () => {
          userPaused = !userPaused;
          pp.setAttribute('aria-pressed', String(userPaused));
          pp.setAttribute('aria-label', userPaused ? 'Spustit automatické posouvání' : 'Pozastavit automatické posouvání');
          pp.firstChild.textContent = userPaused ? '►' : '❚❚';
          sync();
        });
        btns.insertBefore(pp, btns.firstChild);
      }
    }

    update();
    window.addEventListener('resize', update);
  });
}

/* ---------- Galerie lightbox ---------- */
function initGalleryLightbox() {
  const triggers = gsap.utils.toArray('[data-lightbox]');
  if (!triggers.length) return;

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Náhled fotografie');
  box.innerHTML = '<button type="button" class="lightbox__close" aria-label="Zavřít náhled">✕</button><img alt="" />';
  document.body.appendChild(box);
  const img = box.querySelector('img');
  const closeBtn = box.querySelector('.lightbox__close');
  let lastFocused = null;
  const bg = ['#top', '.footer', '.header'].map((s) => document.querySelector(s)).filter(Boolean);

  const open = (src, alt) => {
    img.src = src; img.alt = alt || '';
    lastFocused = document.activeElement;
    box.classList.add('is-open');
    bg.forEach((el) => el.setAttribute('inert', ''));
    if (lenis) lenis.stop();
    closeBtn.focus();
  };
  const close = () => {
    box.classList.remove('is-open');
    img.src = '';
    bg.forEach((el) => el.removeAttribute('inert'));
    if (lenis) lenis.start();
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  triggers.forEach((t) => {
    t.addEventListener('click', () => {
      const full = t.dataset.full || t.querySelector('img')?.src;
      const alt = t.querySelector('img')?.alt;
      if (full) open(full, alt);
    });
  });
  closeBtn.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') { close(); return; }
    // Jediný fokusovatelný prvek = zavírací tlačítko → drž fokus uvnitř
    if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
  });
}

/* ---------- Rok v patičce ---------- */
function initYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
}
