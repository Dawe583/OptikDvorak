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

/* ============================================================
   LOGA ZNAČEK — progresivní vylepšení sekce „Značky".
   Každá dlaždice .brandtile má data-brand="<slug>". Pokud v
   public/img/brands/ existuje <slug>.svg (nebo .png / .webp),
   logo se načte a nahradí textový název. Když soubor chybí,
   zůstane stylizovaný název a rozbitý obrázek se NIKDY nezobrazí.
   Načítá se líně — až se stěna značek přiblíží k viewportu.
   ============================================================ */
const LOGO_EXTS = ['svg', 'png', 'webp'];

function loadBrandLogo(tile) {
  const slug = tile.dataset.brand;
  if (!slug || tile.dataset.logoTried) return;
  tile.dataset.logoTried = '1';
  const name = tile.querySelector('.brandtile__name')?.textContent.trim() || slug;
  let ext = 0;
  const probe = new Image();
  probe.onload = () => {
    const img = document.createElement('img');
    img.className = 'brandtile__logo';
    img.src = probe.src;
    img.alt = name;
    img.loading = 'lazy';
    img.decoding = 'async';
    tile.insertBefore(img, tile.firstChild);
    tile.classList.add('has-logo');
  };
  probe.onerror = () => {
    ext += 1;
    if (ext < LOGO_EXTS.length) probe.src = `/img/brands/${slug}.${LOGO_EXTS[ext]}`;
  };
  probe.src = `/img/brands/${slug}.${LOGO_EXTS[0]}`;
}

export function initBrandLogos() {
  const tiles = document.querySelectorAll('.brandtile[data-brand]');
  if (!tiles.length) return;
  if (!('IntersectionObserver' in window)) {
    tiles.forEach(loadBrandLogo);
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      loadBrandLogo(entry.target);
      obs.unobserve(entry.target);
    });
  }, { rootMargin: '250px 0px' });
  tiles.forEach((tile) => io.observe(tile));
}
