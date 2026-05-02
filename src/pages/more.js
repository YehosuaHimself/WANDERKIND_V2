import { navigate } from '../lib/router.js';

const PAGE1 = [
  { label:'YOUR OFFERING',        icon:'ph-hand-heart',      route:'more/wanderhost',    accent:'#C8762A', bg:'rgba(200,118,42,0.08)' },
  { label:'WANDERKIND PASS',       icon:'ph-ticket',           route:'more/passes',        accent:'#C8762A', bg:'rgba(200,118,42,0.08)' },
  { label:'WANDERKIND JOURNEY',    icon:'ph-path',             route:'more/journey',       accent:'#2D6A4F', bg:'rgba(45,106,79,0.08)' },
  { label:'STAMPS & VISAS',        icon:'ph-seal',             route:'more/stamps',        accent:'#6B21A8', bg:'rgba(107,33,168,0.06)' },
  { label:'PACKLIST & TIPS',       icon:'ph-backpack',         route:'more/packlist',      accent:'#5A7A2B', bg:'rgba(90,122,43,0.08)' },
  { label:'WRITE',                 icon:'ph-pencil-line',      route:null,                 accent:'#9B8E7E', disabled:true },
  { label:'HITCHHIKE',             icon:'ph-thumbs-up',        route:'more/tramp-mode',    accent:'#E67E22', bg:'rgba(230,126,34,0.08)' },
  { label:'HOST PUSH',             icon:'ph-bell-ringing',     route:'more/host-push',     accent:'#C8762A', bg:'rgba(200,118,42,0.07)' },
];
const PAGE2 = [
  { label:'VERIFICATION',           icon:'ph-shield-check',     route:'more/verification',  accent:'#22863A', bg:'rgba(34,134,58,0.08)' },
  { label:'EMERGENCY & CONTACTS',   icon:'ph-first-aid-kit',    route:'more/emergency',     accent:'#C0392B', bg:'rgba(192,57,43,0.06)' },
  { label:'TRUST & SETTINGS',       icon:'ph-gear-six',         route:'more/settings',      accent:'#5C5147' },
  { label:'ABOUT',                  icon:'ph-info',             route:'more/about',         accent:'#9B8E7E' },
];
const PAGES = [
  { key:'features', label:'WANDERKIND',      tiles: PAGE1 },
  { key:'settings', label:'SETTINGS & ADMIN', tiles: PAGE2 },
];

export default async function render() {
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;flex-direction:column;height:100%;';
  let activePage = 0;

  function build() {
    el.innerHTML = `
      <div class="page-header">
        <div class="page-label dot">MORE</div>
        <div class="page-title">${PAGES[activePage].label}</div>
      </div>

      <div class="pager-wrap">
        <div class="pager-pages" id="pager-pages" style="transform:translateX(-${activePage * 100}%);">
          ${PAGES.map(p => `
            <div class="pager-page">
              <div class="tile-grid">
                ${p.tiles.map(t => `
                  <div class="tile${t.disabled ? ' disabled' : ''}" data-route="${t.route || ''}"
                    style="background:${t.bg || 'var(--surface)'};border-color:${t.accent ? t.accent + '20' : 'var(--border-lt)'};">
                    <div class="tile-icon-circle" style="background:${t.accent ? t.accent + '16' : 'var(--amber-bg)'};">
                      <i class="${t.icon}" style="color:${t.accent || 'var(--amber)'}; font-size:22px;"></i>
                    </div>
                    <div class="tile-label" style="color:${t.accent || 'var(--ink)'};">${t.label}</div>
                  </div>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="page-dots" style="padding-left:48px;">
        ${PAGES.map((p,i) => `<button class="page-dot${i===activePage?' active':''}" data-dot="${i}"></button>`).join('')}
      </div>
    `;
    bind();
  }

  function bind() {
    el.querySelectorAll('.tile:not(.disabled)').forEach(t => {
      t.addEventListener('click', () => { if (t.dataset.route) navigate(t.dataset.route); });
    });
    el.querySelectorAll('[data-dot]').forEach(btn => {
      btn.addEventListener('click', () => { activePage = +btn.dataset.dot; updatePager(); });
    });
    const pager = el.querySelector('.pager-wrap');
    if (pager) {
      let sx = 0;
      pager.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive:true });
      pager.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - sx;
        if (dx < -40 && activePage < PAGES.length-1) activePage++;
        else if (dx > 40 && activePage > 0) activePage--;
        updatePager();
      }, { passive:true });
    }
  }

  function updatePager() {
    const pages = el.querySelector('#pager-pages');
    if (pages) pages.style.transform = `translateX(-${activePage * 100}%)`;
    const title = el.querySelector('.page-title');
    if (title) title.textContent = PAGES[activePage].label;
    el.querySelectorAll('.page-dot').forEach((d,i) => d.classList.toggle('active', i===activePage));
  }

  build();
  return el;
}
