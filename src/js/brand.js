/* ============================================================
   OPTIK DVOŘÁK — BRAND MARK
   Vloží vektorovou značku (brýle) do loga v hlavičce na všech
   stránkách, aby byl brand konzistentní (homepage, podstránky,
   právní stránky). Značka je dekorativní (aria-hidden), textové
   logo zůstává i bez JS.
   ============================================================ */

const MARK =
  '<svg class="header__mark" viewBox="0 0 184 84" fill="none" aria-hidden="true">' +
  '<circle cx="56" cy="44" r="26" stroke="currentColor" stroke-width="6"/>' +
  '<circle cx="128" cy="44" r="26" stroke="currentColor" stroke-width="6"/>' +
  '<path d="M83 39c6-8 12-8 18 0" stroke="#F5C518" stroke-width="6" stroke-linecap="round"/>' +
  '<path d="M32 35 12 27" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>' +
  '<path d="M152 35 172 27" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>' +
  '</svg>';

export function initBrandMark() {
  document.querySelectorAll('.header__logo').forEach((logo) => {
    if (logo.querySelector('.header__mark')) return;
    logo.insertAdjacentHTML('afterbegin', MARK);
  });
}
