import { navigate } from '../lib/router.js';
import { getUser } from '../lib/auth.js';

const TILES = [
  { key: 'offering',      label: 'YOUR OFFERING',        icon: 'ph-hand-heart',          route: 'more/wanderhost',       desc: 'Host wanderers on your path' },
  { key: 'pass',          label: 'WANDERKIND PASS',       icon: 'ph-ticket',               route: 'more/passes',           desc: 'Your passes and privileges' },
  { key: 'journey',       label: 'WANDERKIND JOURNEY',    icon: 'ph-path',                 route: 'more/journey',          desc: 'Your 11 tiers of the way' },
  { key: 'stamps',        label: 'STAMPS & VISAS',        icon: 'ph-seal',                 route: 'more/stamps',           desc: 'Collect moments on the road' },
  { key: 'packlist',      label: 'PACKLIST & TIPS',       icon: 'ph-backpack',             route: 'more/packlist',         desc: 'What to carry, what to leave' },
  { key: 'write',         label: 'WRITE',                 icon: 'ph-pencil-line',          route: null,                    desc: 'Coming soon', disabled: true },
  { key: 'hitchhike',     label: 'HITCHHIKE',             icon: 'ph-thumbs-up',            route: 'more/tramp-mode',       desc: 'Signal for a ride' },
  { key: 'host-push',     label: 'HOST PUSH',             icon: 'ph-bell-ringing',         route: 'more/host-push',        desc: 'Notify nearby wanderers' },
  { key: 'verification',  label: 'VERIFICATION',          icon: 'ph-shield-check',         route: 'more/verification',     desc: 'Build trust in the community' },
  { key: 'emergency',     label: 'EMERGENCY & CONTACTS',  icon: 'ph-first-aid-kit',        route: 'more/emergency',        desc: 'Safety and emergency info' },
  { key: 'trust',         label: 'TRUST & SETTINGS',      icon: 'ph-gear-six',             route: 'more/settings',         desc: 'Privacy, data, preferences' },
  { key: 'about',         label: 'ABOUT',                 icon: 'ph-info',                 route: 'more/about',            desc: 'The wanderkind story' },
];

export default async function render() {
  const el = document.createElement('div');

  el.innerHTML = `
    <div class="wk-header"><h1>MORE</h1></div>
    <div style="padding:var(--sp-sm) var(--screen-px) var(--sp-lg);">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-sm);margin-top:var(--sp-sm);">
        ${TILES.map(t => `
          <div class="more-tile${t.disabled ? ' tile-disabled' : ''}" data-route="${t.route || ''}" style="
            background:var(--surface);
            border:1px solid var(--border-lt);
            border-radius:var(--r-lg);
            padding:var(--sp-md);
            cursor:${t.disabled ? 'default' : 'pointer'};
            opacity:${t.disabled ? '0.35' : '1'};
            transition:background 0.12s,transform 0.1s;
            display:flex;flex-direction:column;gap:var(--sp-sm);
          ">
            <span style="font-size:28px;color:var(--amber);"><i class="${t.icon}"></i></span>
            <div>
              <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:2px;color:var(--ink);line-height:1.3;">${t.label}</div>
              <div style="font-size:11px;color:var(--ink3);margin-top:2px;line-height:1.4;">${t.desc}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;

  el.querySelectorAll('.more-tile:not(.tile-disabled)').forEach(tile => {
    tile.addEventListener('click', () => {
      const route = tile.dataset.route;
      if (route) navigate(route);
    });
    tile.addEventListener('mouseenter', () => { tile.style.background = 'var(--amber-bg)'; });
    tile.addEventListener('mouseleave', () => { tile.style.background = 'var(--surface)'; });
    tile.addEventListener('mousedown',  () => { tile.style.transform = 'scale(0.97)'; });
    tile.addEventListener('mouseup',    () => { tile.style.transform = ''; });
  });

  return el;
}
