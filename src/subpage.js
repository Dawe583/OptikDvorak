/* ============================================================
   OPTIK DVOŘÁK — PODSTRÁNKY (plný motion engine)
   Akce, Měření zraku, O nás. Sdílí pohybový systém s homepage
   (Lenis, preloader, custom kurzor, scroll-progress, reveals,
   parallax, split nadpisy, marquee, magnetická tlačítka) — efekty
   běží na všech zařízeních bez výjimky (viz CLAUDE.md).
   ============================================================ */

import './css/tokens.css';
import './css/base.css';
import './style.css';
import './css/subpage.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/bricolage-grotesque';

import { initCookies } from './js/cookies.js';
import * as M from './js/motion-core.js';

document.documentElement.classList.add('js');

/* Skryj hero prvky ještě před prvním paintem (intro je rozanimuje). */
M.prepHero();

(async () => {
  await M.registerEase();
  M.initSmoothScroll();

  M.initAnchors();
  M.initMobileMenu();
  M.initHeader();
  M.initScrollProgress();
  M.initPreloader();
  M.initSplitHeadings();
  M.initReveals();
  M.initCurtains();
  M.initParallax();
  M.initGiantDrift();
  M.initRules();
  M.initMarquee();
  M.initCounters();
  M.initLiquidButtons();
  M.initHoverMotion();
  M.initFooterScrub();
  M.initStickyCta();
  M.initHours();
  M.initYear();

  initCookies();

  document.fonts && document.fonts.ready.then(() => M.ScrollTrigger.refresh());
  window.addEventListener('load', () => M.ScrollTrigger.refresh());
})();
