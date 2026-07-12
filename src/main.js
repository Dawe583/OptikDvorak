import './style.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/inter-tight';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   LENIS SMOOTH SCROLL, běží na všech zařízeních
   ============================================================ */
const lenis = new Lenis({
  duration: 1.15,
  smoothWheel: true,
  syncTouch: true,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* Kotvy: plynulý scroll s offsetem pod fixní header */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -80 });
  });
});

/* ============================================================
   HEADER: pozadí po odscrollování
   ============================================================ */
const header = document.getElementById('header');
const sentinel = document.getElementById('header-sentinel');
new IntersectionObserver(
  ([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting),
  { rootMargin: '0px' }
).observe(sentinel);

/* ============================================================
   ANIMACE, všude bez výjimky
   ============================================================ */

/* --- Hero intro: nadpis po řádcích, pak zbytek --- */
gsap.set('.line__inner', { yPercent: 110 });
gsap.set('[data-intro]', { y: 26, opacity: 0 });
gsap.set('[data-intro-media]', { opacity: 0, scale: 0.96 });

gsap.timeline({ defaults: { ease: 'power4.out' } })
  .to('.line__inner', { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.15)
  .to('[data-intro]', { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.55)
  .to('[data-intro-media]', { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, 0.4);

/* --- Reveal on scroll --- */
gsap.utils.toArray('[data-reveal]').forEach((el) => {
  gsap.fromTo(
    el,
    { y: 44, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.95,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    }
  );
});

/* --- Reveal skupin se stagger efektem --- */
gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
  gsap.fromTo(
    group.children,
    { y: 36, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.85,
      stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 86%', once: true },
    }
  );
});

/* --- Parallax obrázků (scrub) --- */
gsap.utils.toArray('[data-parallax]').forEach((img) => {
  gsap.fromTo(
    img,
    { yPercent: -5 },
    {
      yPercent: 5,
      ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    }
  );
});

/* --- Obří nadpisy: jemný horizontální drift (scrub) --- */
gsap.utils.toArray('.giant').forEach((el) => {
  gsap.fromTo(
    el,
    { x: 30 },
    {
      x: -30,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
    }
  );
});

/* --- Magnetická tlačítka --- */
document.querySelectorAll('.btn-outline, .header__cta').forEach((btn) => {
  const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
  const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    xTo((e.clientX - r.left - r.width / 2) * 0.18);
    yTo((e.clientY - r.top - r.height / 2) * 0.3);
  });
  btn.addEventListener('mouseleave', () => {
    xTo(0);
    yTo(0);
  });
});

/* ============================================================
   BADGE „NYNÍ OTEVŘENO“
   Po–Čt 8:30–17:00, Pá 8:30–16:00, So+Ne zavřeno
   ============================================================ */
const badge = document.getElementById('open-badge');
if (badge) {
  const now = new Date();
  const day = now.getDay(); // 0 = Ne
  const mins = now.getHours() * 60 + now.getMinutes();
  const open = 8 * 60 + 30;
  const close = day === 5 ? 16 * 60 : 17 * 60;
  const isOpen = day >= 1 && day <= 5 && mins >= open && mins < close;
  badge.textContent = isOpen ? 'Nyní otevřeno' : 'Nyní zavřeno, objednejte se online';
  badge.classList.toggle('is-open', isOpen);
}

/* ============================================================
   REZERVAČNÍ FORMULÁŘ
   Lokální náhled: validace + potvrzení bez odeslání.
   Produkce: přidat data-netlify="true" na <form>, nebo
   action="https://formspree.io/f/XXXX" method="POST" a smazat preventDefault.
   ============================================================ */
const form = document.getElementById('booking-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (form.company.value) return; // honeypot: bot, tiše ignorovat

    let valid = true;
    ['f-name', 'f-phone', 'f-service'].forEach((id) => {
      const input = document.getElementById(id);
      const field = input.closest('.form__field');
      const bad = !input.value.trim();
      field.classList.toggle('is-invalid', bad);
      if (bad) valid = false;
    });
    if (!valid) return;

    // ponytail: lokální náhled jen ukáže potvrzení, endpoint doplníme při nasazení
    document.getElementById('form-success').hidden = false;
    form.querySelector('button[type="submit"]').disabled = true;
  });
}

/* Footer mini-form: předvyplní telefon a sroluje na hlavní formulář */
const footerForm = document.getElementById('footer-form');
if (footerForm) {
  footerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('ft-phone').value.trim();
    if (phone) document.getElementById('f-phone').value = phone;
    lenis.scrollTo('#kontakt', { offset: -80 });
    document.getElementById('f-name').focus({ preventScroll: true });
  });
}

/* Rok v patičce */
document.getElementById('year').textContent = String(new Date().getFullYear());
