/* ============================================================
   OPTIK DVOŘÁK — PRÁVNÍ STRÁNKY JS
   Sdílený header, cookie consent, rok. Bez těžkého motion.
   ============================================================ */

import './css/tokens.css';
import './css/base.css';
import './css/legal.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/bricolage-grotesque';

import { initCookies } from './js/cookies.js';
import { initPageTransitions } from './js/page-transition.js';
import { initBrandMark } from './js/brand.js';
import { initAnalytics } from './js/analytics.js';

document.documentElement.classList.add('js');

initBrandMark();
initAnalytics();

/* Header pozadí po odscrollování */
const header = document.getElementById('header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Rok v patičce */
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

initCookies();
initPageTransitions();
