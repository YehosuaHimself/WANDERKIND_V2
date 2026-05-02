import { navigate } from '../lib/router.js';

const PAGE1 = [
  { key:'offering',  label:'YOUR OFFERING',        icon:'ph-hand-heart',      route:'more/wanderhost',    accent:'#C8762A', bg:'rgba(200,118,42,0.08)' },
  { key:'pass',      label:'WANDERKIND PASS',       icon:'ph-ticket',           route:'more/passes',        accent:'#C8762A', bg:'rgba(200,118,42,0.08)' },
  { key:'journey',   label:'WANDERKIND JOURNEY',    icon:'ph-path',             route:'more/journey',       accent:'#2D6A4F', bg:'rgba(45,106,79,0.08)' },
  { key:'stamps',    label:'STAMPS & VISAS',        icon:'ph-seal',             route:'more/stamps',        accent:'#6B21A8', bg:'rgba(107,33,168,0.06)' },
  { key:'packlist',  label:'PACKLIST & TIPS',       icon:'ph-backpack',         route:'more/packlist',      accent:'#5A7A2B', bg:'rgba(90,122,43,0.08)' },
  { key:'write',     label:'WRITE',                 icon:'ph-pencil-line',      route:null,                 accent:'#9B8E7E', disabled:true },
  { key:'hitchhike', label:'HITCHHIKE',             icon:'ph-thumbs-up',        route:'more/tramp-mode',    accent:'#E67E22', bg:'rgba(230,126,34,0.08)' },
  { key:'hostpush',  label:'HOST PUSH',             icon:'ph-bell-ringing',     route:'more/host-push',     accent:'#C8762A', bg:'rgba(200,118,42,0.07)' },
];

const PAGE2 = [
  { key:'verif',    label:'VERIFICATION',           icon:'ph-shield-check',     route:'more/verification',  accent:'#22863A', bg:'rgba(34,134,58,0.08)' },
  { key:'emerg',    label:'EMERGENCY & CONTACTS',   icon:'ph-first-aid-kit',    route:'more/emergency',     accent:'#C0392B', bg:'rgba(192,57,43,0.06)' },
  { key:'trust',    label:'TRUST & SETTINGS',       icon:'ph-gear-six',         route:'more/settings',      accent:'#5C5147' },
  { key:'about',    label:'ABOUT',                  icon:'ph-info',             route:'more/about',         accent:'#9B8E7E' },
];

const PAGES = [
  { key:'features', label:'WANDERKIND', tiles: PAGE1 },
  { key:'settings', label:'SETTINGS & ADMIN', tiles: PAGE2 },
];

export default async function render() {
  const el = document.createElement('div');
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.height = '100%';

  let activePage = 0;

  function tileHTML(t) {
    return `
      <div class="more-tile${t.disabled ? ' tile-disabled' : ''}" data-route="${t.route || ''}" style="
        background:${t.bg || 'var(--surface)'};
        border:1px solid rgba(200,118,42,0.12);
        border-radius:14px;padding:14px;cursor:${t.disabled ? 'default' : 'pointer'};
        opacity:${t.disabled ? '0.35' : '1'};transition:background 0.12s,transform 0.1s;
        display:flex;flex-direction:column;gap:var(--sp-sm);
        box-shadow:0 1px 3px rgba(0,0,0,0.04);
      ">
        <div style="width:40px;height:40px;border-radius:20px;background:${t.accent ? t.accent + '18' : 'var(--amber-bg)'};display:flex;align-items:center;justify-content:center;margin-bottom:2px;">
          <i class="${t.icon}" style="font-size:20px;color:${t.accent || 'var(--amber)'};"></i>
        </div>
        <div style="font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:1.5px;color:${t.accent || 'var(--ink)'};line-height:1.3;">${t.label}</div>
      </div>`;
  }

  function pageHTML(page) {
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px;">
        ${page.tiles.map(tileHTML).join('')}
      </div>`;
  }

  function dotsHTML() {
    return PAGES.map((p, i) => `
      <button data-dot="${i}" style="
        width:${activePage === i ? '20px' : '8px'};height:8px;border-radius:4px;border:none;cursor:pointer;padding:0;transition:all 0.2s;
        background:${activePage === i ? 'var(--amber)' : 'var(--border)'};
      "></button>`).join('');
  }

  function build() {
    el.innerHTML = `
      <!-- Header -->
      <div style="padding:8px 16px 12px;border-bottom:1px solid var(--border-lt);">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:6px;height:6px;border-radius:3px;background:var(--amber);"></div>
          <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:3px;color:var(--amber);font-weight:600;">MORE</span>
        </div>
        <h1 style="font-size:22px;font-weight:800;color:var(--ink);margin:4px 0 0;">${PAGES[activePage].label}</h1>
      </div>

      <!-- Swipeable pages (two visible via touch) -->
      <div id="more-pager" style="flex:1;overflow:hidden;position:relative;">
        <div id="more-pages" style="display:flex;height:100%;transition:transform 0.3s ease;transform:translateX(-${activePage * 100}%);">
          ${PAGES.map(p => `<div style="min-width:100%;overflow-y:auto;">${pageHTML(p)}</div>`).join('')}
        </div>
      </div>

      <!-- Dots -->
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;height:32px;padding-bottom:4px;padding-left:60px;">
        ${dotsHTML()}
      </div>
    `;

    bind();
  }

  function bind() {
    // Tile clicks
    el.querySelectorAll('.more-tile:not(.tile-disabled)').forEach(tile => {
      tile.addEventListener('click', () => { const r = tile.dataset.route; if (r) navigate(r); });
      tile.addEventListener('mouseenter', () => { tile.style.transform = 'scale(1.02)'; });
      tile.addEventListener('mouseleave', () => { tile.style.transform = ''; });
    });

    // Dot clicks
    el.querySelectorAll('[data-dot]').forEach(btn => {
      btn.addEventListener('click', () => {
        activePage = parseInt(btn.dataset.dot);
        updatePager();
      });
    });

    // Touch swipe
    const pager = el.querySelector('#more-pager');
    if (pager) {
      let startX = 0;
      pager.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      pager.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        if (dx < -40 && activePage < PAGES.length - 1) activePage++;
        else if (dx > 40 && activePage > 0) activePage--;
        updatePager();
      }, { passive: true });
    }
  }

  function updatePager() {
    const pages = el.querySelector('#more-pages');
    if (pages) pages.style.transform = `translateX(-${activePage * 100}%)`;
    const header = el.querySelector('h1');
    if (header) header.textContent = PAGES[activePage].label;
    const dots = el.querySelector('div[style*="padding-left:60px"]');
    if (dots) dots.innerHTML = dotsHTML();
    dots?.querySelectorAll('[data-dot]').forEach(btn => {
      btn.addEventListener('click', () => {
        activePage = parseInt(btn.dataset.dot);
        updatePager();
      });
    });
  }

  build();
  return el;
}
