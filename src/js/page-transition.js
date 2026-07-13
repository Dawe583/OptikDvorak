/* ============================================================
   OPTIK DVOŘÁK — STRÁNKOVÉ PŘECHODY
   Signature „curtain" přechod mezi stránkami (homepage ↔ podstránky).
   Při kliknutí na interní odkaz spadne tmavá opona s wordmarkem a pak
   se naviguje. Robustní: přerušuje jen běžné levé kliknutí na interní
   odkazy, s časovým fallbackem — navigace se nikdy nezasekne.
   Bez pohybového gatu (běží všude, viz CLAUDE.md).
   ============================================================ */

export function initPageTransitions() {
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<span class="page-transition__mark"><span class="fw-1">Optik</span><span class="fw-2">Dvořák</span></span>';
  document.body.appendChild(overlay);

  /* bfcache návrat (tlačítko zpět) — schovej oponu, ať stránka není zakrytá */
  window.addEventListener('pageshow', (e) => { if (e.persisted) overlay.classList.remove('is-active'); });

  const eligible = (a) => {
    const href = a.getAttribute('href');
    if (!href) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (/^(mailto:|tel:|#)/i.test(href)) return false;
    let url;
    try { url = new URL(a.href, location.href); } catch { return false; }
    if (url.origin !== location.origin) return false;
    // odkaz v rámci stejné stránky (kotva) → řeší smooth-scroll, ne přechod
    if (url.pathname === location.pathname && url.hash) return false;
    return true;
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a || !eligible(a)) return;
    e.preventDefault();

    const dest = a.href;
    let navigated = false;
    const go = () => { if (navigated) return; navigated = true; window.location.href = dest; };

    overlay.classList.add('is-active');
    overlay.addEventListener('transitionend', go, { once: true });
    setTimeout(go, 650); // fallback, kdyby transitionend nedorazil
  });
}
