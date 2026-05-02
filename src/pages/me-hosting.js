import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  const { data: listing } = await supabase.from('host_listings').select('*').eq('user_id', user.id).single();
  const ITEMS = [
    ['ph-list-bullets',   'REQUESTS',      'me/hosting/requests'],
    ['ph-users',          'GUESTS',        'me/hosting/guests'],
    ['ph-calendar',       'CALENDAR',      'me/hosting/calendar'],
    ['ph-toggle-right',   'AVAILABILITY',  'me/hosting/availability'],
    ['ph-star',           'AMENITIES',     'me/hosting/amenities'],
    ['ph-scroll',         'HOUSE RULES',   'me/hosting/house-rules'],
    ['ph-tag',            'PRICING',       'me/hosting/pricing'],
    ['ph-images',         'PHOTOS',        'me/hosting/photos'],
    ['ph-sign-in',        'CHECK-IN INFO', 'me/hosting/check-in'],
    ['ph-sign-out',       'CHECK-OUT',     'me/hosting/check-out'],
    ['ph-key',            'DOOR PIN',      'me/hosting/door-pin'],
    ['ph-book-open',      'GÄSTEBUCH',     'me/hosting/gaestebuch'],
    ['ph-chart-bar',      'STATS',         'me/hosting/stats'],
    ['ph-pencil',         'EDIT LISTING',  'me/hosting/listing-edit'],
    ['ph-shield-check',   'VERIFICATION',  'me/hosting/verification'],
  ];
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>MY HOSTING</h1>
    </div>
    <div style="padding:var(--screen-px);">
      <div class="wk-card" style="margin-bottom:var(--sp-md);display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div class="h-label">Status</div>
          <div style="font-family:var(--font-mono);font-weight:700;font-size:var(--text-sm);
            color:${listing?.is_active ? 'var(--green)' : 'var(--ink3)'};">
            ${listing?.is_active ? 'HOSTING ACTIVE' : 'HOSTING PAUSED'}
          </div>
        </div>
        <button id="toggle-btn" style="padding:8px 16px;border-radius:var(--r-btn);
          background:${listing?.is_active ? 'var(--green-bg)' : 'var(--amber-bg)'};
          color:${listing?.is_active ? 'var(--green)' : 'var(--amber)'};
          border:1px solid ${listing?.is_active ? 'var(--green)' : 'var(--border-dark)'};
          font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:1px;cursor:pointer;">
          ${listing?.is_active ? 'PAUSE' : 'ACTIVATE'}
        </button>
      </div>
      <div class="row-list" style="border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
        ${ITEMS.map(([icon,label,route]) => `
          <div class="row-item" data-r="${route}">
            <i class="${icon}" style="font-size:20px;color:var(--amber);width:24px;flex-shrink:0;"></i>
            <span style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:600;letter-spacing:1.5px;">${label}</span>
            <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
          </div>`).join('')}
      </div>
    </div>`;
  el.querySelector('#back').addEventListener('click', () => navigate('me'));
  el.querySelectorAll('[data-r]').forEach(r => r.addEventListener('click', () => navigate(r.dataset.r)));
  el.querySelector('#toggle-btn').addEventListener('click', async () => {
    const newState = !listing?.is_active;
    await supabase.from('host_listings').upsert({ user_id: user.id, is_active: newState });
    navigate('me/hosting/dashboard', { replace: true });
  });
  return el;
}
