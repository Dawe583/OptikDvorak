/* ============================================================
   COOKIE CONSENT (sdílené: homepage i právní stránky)
   - Lišta se zobrazí, dokud návštěvník nerozhodne.
   - Kategorie: nezbytné (vždy), analytické, marketingové.
   - Volba se ukládá do localStorage ('cookie_consent').
   - Souhlas gatuje vložený náhled Map Google.
   ============================================================ */

const KEY = 'cookie_consent';

const T = {
  bannerTitle: 'Používáme soubory cookie',
  bannerText:
    'Nezbytné soubory cookie zajišťují správné fungování našeho webu a používáme je vždy. ' +
    'Analytické a marketingové soubory cookie, včetně vloženého náhledu Map Google, nastavíme pouze s vaším souhlasem.',
  accept: 'Přijmout vše',
  reject: 'Odmítnout volitelné',
  settings: 'Nastavení cookies',
  modalTitle: 'Nastavení souborů cookie',
  save: 'Uložit volbu',
  acceptAll: 'Přijmout vše',
  more: 'Více v Zásadách používání cookies',
  cats: [
    { key: 'necessary', name: 'Nezbytné', locked: true, desc: 'Nutné pro základní fungování webu a zapamatování vaší volby. Nelze vypnout.' },
    { key: 'analytics', name: 'Analytické', locked: false, desc: 'Pomáhají nám anonymně měřit návštěvnost a vylepšovat web (např. Google Analytics).' },
    { key: 'marketing', name: 'Marketingové', locked: false, desc: 'Umožňují relevantnější obsah a měření reklamy na stránkách třetích stran.' },
  ],
};

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function write(consent) {
  try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch { /* ignore */ }
}

function applyMaps(consent) {
  document.querySelectorAll('[data-map]').forEach((mount) => {
    if (mount.dataset.loaded) return;
    if (consent && (consent.analytics || consent.marketing)) {
      loadMap(mount);
    }
  });
}
function loadMap(mount) {
  const src = mount.dataset.src;
  if (!src || mount.dataset.loaded) return;
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = mount.dataset.title || 'Mapa';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.setAttribute('allowfullscreen', '');
  mount.innerHTML = '';
  mount.appendChild(iframe);
  mount.dataset.loaded = 'true';
}

/* ---------- Banner ---------- */
function buildBanner() {
  const el = document.createElement('div');
  el.className = 'cookie';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', T.bannerTitle);
  el.innerHTML = `
    <p class="cookie__title">${T.bannerTitle}</p>
    <p class="cookie__text">${T.bannerText} <a href="/cookies.html">Zásady cookies</a>.</p>
    <div class="cookie__actions">
      <button class="cookie__btn cookie__btn--reject" data-cc="reject">${T.reject}</button>
      <button class="cookie__btn cookie__btn--accept" data-cc="accept">${T.accept}</button>
      <button class="cookie__btn cookie__btn--settings" data-cc="settings">${T.settings}</button>
    </div>`;
  return el;
}

/* ---------- Nastavení (modal) ---------- */
function buildModal() {
  const el = document.createElement('div');
  el.className = 'cookie-modal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', T.modalTitle);
  const rows = T.cats.map((c) => `
    <div class="cookie-row">
      <div>
        <h4>${c.name}</h4>
        <p>${c.desc}</p>
      </div>
      <label class="cookie-switch">
        <input type="checkbox" data-cat="${c.key}" ${c.locked ? 'checked disabled' : ''} />
        <span aria-hidden="true"></span>
        <span class="visually-hidden">${c.name}</span>
      </label>
    </div>`).join('');
  el.innerHTML = `
    <div class="cookie-modal__box">
      <h3>${T.modalTitle}</h3>
      ${rows}
      <p style="margin-top:1rem;font-size:0.85rem"><a href="/cookies.html">${T.more}</a></p>
      <div class="cookie-modal__actions">
        <button class="cookie__btn cookie__btn--reject" data-cc="save">${T.save}</button>
        <button class="cookie__btn cookie__btn--accept" data-cc="accept-modal">${T.acceptAll}</button>
      </div>
    </div>`;
  return el;
}

export function initCookies() {
  const banner = buildBanner();
  const modal = buildModal();
  document.body.appendChild(banner);
  document.body.appendChild(modal);

  const existing = read();
  if (existing) applyMaps(existing);
  else setTimeout(() => banner.classList.add('is-visible'), 900);

  function persist(consent) {
    consent.ts = 'set';
    write(consent);
    banner.classList.remove('is-visible');
    modal.classList.remove('is-open');
    applyMaps(consent);
  }
  function openModal() {
    const c = read() || { necessary: true, analytics: false, marketing: false };
    modal.querySelectorAll('[data-cat]').forEach((input) => {
      if (input.dataset.cat === 'necessary') return;
      input.checked = !!c[input.dataset.cat];
    });
    modal.classList.add('is-open');
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cc]');
    if (btn) {
      const a = btn.dataset.cc;
      if (a === 'accept' || a === 'accept-modal') persist({ necessary: true, analytics: true, marketing: true });
      else if (a === 'reject') persist({ necessary: true, analytics: false, marketing: false });
      else if (a === 'settings') openModal();
      else if (a === 'save') {
        const c = { necessary: true, analytics: false, marketing: false };
        modal.querySelectorAll('[data-cat]').forEach((input) => { c[input.dataset.cat] = input.checked; });
        persist(c);
      }
      return;
    }
    // Odkaz „Nastavení cookies" v patičce
    if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); openModal(); return; }
    // Klik do ztmavení modalu = zavřít
    if (e.target === modal) modal.classList.remove('is-open');
    // Jednorázové načtení mapy z placeholderu (implicitní souhlas jen pro mapu)
    const mapBtn = e.target.closest('[data-map-load]');
    if (mapBtn) { const mount = mapBtn.closest('[data-map]'); if (mount) loadMap(mount); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('is-open');
  });
}
