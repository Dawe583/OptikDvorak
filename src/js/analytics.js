/* ============================================================
   OPTIK DVOŘÁK — ANALYTIKA (GA4, gated souhlasem)
   Google Analytics 4 se načte POUZE po udělení souhlasu s
   analytickými cookies (viz cookies.js). Měří klíčové konverzní
   události: klik na telefon, klik na CTA, odeslání poptávky.

   >>> NASAZENÍ: vložte své GA4 měřicí ID do GA_ID (formát
       "G-XXXXXXXXXX"). Prázdné = analytika je vypnutá (jen
       lokální dataLayer, nic se neodesílá). <<<
   ============================================================ */

const GA_ID = ''; // např. 'G-XXXXXXXXXX'

let loaded = false;

function loadGA() {
  if (loaded || !GA_ID) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true });
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
}

function analyticsAllowed() {
  try {
    const c = JSON.parse(localStorage.getItem('cookie_consent'));
    return !!(c && c.analytics);
  } catch { return false; }
}

/* Odeslání události — funguje i bez GA (jen se uloží do dataLayer). */
export function track(event, params) {
  if (window.gtag) window.gtag('event', event, params || {});
  else { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event, ...(params || {}) }); }
}

export function initAnalytics() {
  if (analyticsAllowed()) loadGA();
  // Souhlas udělený později (cookies.js vysílá 'od-consent')
  window.addEventListener('od-consent', (e) => { if (e.detail && e.detail.analytics) loadGA(); });

  // Konverzní události
  document.addEventListener('click', (e) => {
    const tel = e.target.closest('a[href^="tel:"]');
    if (tel) { track('phone_click', { value: tel.getAttribute('href').replace('tel:', '') }); return; }
    const cta = e.target.closest('.header__cta, .sticky-cta, .mobile-bar__primary, .btn-solid, .btn-outline, .btn-square');
    if (cta) track('cta_click', { label: (cta.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48) });
  }, { capture: true });

  // Odeslaná poptávka (formuláře vysílají 'od-lead')
  window.addEventListener('od-lead', () => track('generate_lead', { form: 'booking' }));
}
