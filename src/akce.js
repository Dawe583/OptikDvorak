/* ============================================================
   OPTIK DVOŘÁK — STRÁNKA AKCÍ (lehký JS)
   Sdílený header, reveal on scroll, cookie consent, rok.
   ============================================================ */

import './css/tokens.css';
import './css/base.css';
import './css/akce.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/inter-tight';

import { initCookies } from './js/cookies.js';

document.documentElement.classList.add('js');

/* Motion všude bez výjimky (viz CLAUDE.md) — nikdy nevracet matchMedia. */
const prefersReduced = false;

/* Header pozadí po odscrollování */
const header = document.getElementById('header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Reveal on scroll (bez GSAP) */
if (!prefersReduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
}

/* Rok v patičce */
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

initCookies();
