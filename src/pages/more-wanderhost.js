import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  el.style.cssText = 'min-height:100%;';

  const [{ data: profile }, { data: listing }] = await Promise.all([
    supabase.from('profiles').select('is_hosting,hosting_project_title,hosting_project_description,avatar_url,trail_name').eq('id', user.id).single(),
    supabase.from('host_listings').select('*').eq('user_id', user.id).single(),
  ]);

  const isActive = listing?.is_active ?? profile?.is_hosting ?? false;

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>YOUR OFFERING</h1>
    </div>

    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;">

      <!-- Status card -->
      <div class="wk-card" style="border-color:${isActive?'var(--green)':'var(--border-lt)'};background:${isActive?'var(--green-bg)':'var(--surface)'};">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div class="h-label" style="color:${isActive?'var(--green)':'var(--ink3)'};">${isActive?'HOSTING ACTIVE':'HOSTING PAUSED'}</div>
            <div style="font-size:13px;color:var(--ink2);margin-top:2px;">${isActive?'You are visible to wanderers searching for a host.':'Activate to open your doors to wanderers.'}</div>
          </div>
          <button id="toggle-btn" style="padding:10px 16px;border-radius:var(--r-btn);flex-shrink:0;
            background:${isActive?'var(--green)':'var(--amber)'};color:#fff;
            border:none;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:1px;cursor:pointer;
            box-shadow:${isActive?'0 2px 8px rgba(90,122,43,0.3)':'0 2px 8px rgba(200,118,42,0.3)'};transition:opacity 0.15s;">
            ${isActive?'PAUSE':'ACTIVATE'}
          </button>
        </div>
      </div>

      <!-- Manage section -->
      <div class="h-label">MANAGE</div>
      <div class="row-list" style="border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
        ${[
          ['ph-list-bullets',  'REQUESTS',      'me/hosting/requests'],
          ['ph-users',         'GUESTS',        'me/hosting/guests'],
          ['ph-calendar',      'CALENDAR',      'me/hosting/calendar'],
          ['ph-toggle-right',  'AVAILABILITY',  'me/hosting/availability'],
          ['ph-chart-bar',     'STATS',         'me/hosting/stats'],
        ].map(([icon,label,route])=>`
          <div class="row-item" data-r="${route}">
            <i class="ph ${icon}" style="font-size:20px;color:var(--amber);width:24px;flex-shrink:0;"></i>
            <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;letter-spacing:1.5px;">${label}</span>
            <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
          </div>`).join('')}
      </div>

      <!-- Listing setup -->
      <div class="h-label">YOUR LISTING</div>
      <div class="row-list" style="border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
        ${[
          ['ph-star',          'AMENITIES',     'me/hosting/amenities'],
          ['ph-scroll',        'HOUSE RULES',   'me/hosting/house-rules'],
          ['ph-tag',           'PRICING',       'me/hosting/pricing'],
          ['ph-images',        'PHOTOS',        'me/hosting/photos'],
          ['ph-sign-in',       'CHECK-IN',      'me/hosting/check-in'],
          ['ph-sign-out',      'CHECK-OUT',     'me/hosting/check-out'],
          ['ph-key',           'DOOR PIN',      'me/hosting/door-pin'],
          ['ph-pencil',        'EDIT LISTING',  'me/hosting/listing-edit'],
          ['ph-book-open',     'GÄSTEBUCH',     'me/hosting/gaestebuch'],
          ['ph-shield-check',  'VERIFICATION',  'me/hosting/verification'],
        ].map(([icon,label,route])=>`
          <div class="row-item" data-r="${route}">
            <i class="ph ${icon}" style="font-size:20px;color:var(--ink2);width:24px;flex-shrink:0;"></i>
            <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;letter-spacing:1.5px;">${label}</span>
            <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
          </div>`).join('')}
      </div>

      <!-- Prefs -->
      <div class="h-label">PREFERENCES</div>
      <div class="row-list" style="border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
        ${[
          ['ph-sliders',       'WANDERHOST PREFS',        'more/wanderhost-prefs'],
          ['ph-key-return',    'ACCESS CONTROL',          'more/wanderhost-access'],
          ['ph-bell-ringing',  'NOTIFICATIONS',           'more/wanderhost-notifications'],
        ].map(([icon,label,route])=>`
          <div class="row-item" data-r="${route}">
            <i class="ph ${icon}" style="font-size:20px;color:var(--ink2);width:24px;flex-shrink:0;"></i>
            <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;letter-spacing:1.5px;">${label}</span>
            <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
          </div>`).join('')}
      </div>

      <div style="height:16px;"></div>
    </div>
  `;

  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelectorAll('[data-r]').forEach(r => r.addEventListener('click', () => navigate(r.dataset.r)));

  el.querySelector('#toggle-btn').addEventListener('click', async () => {
    const btn = el.querySelector('#toggle-btn');
    btn.disabled = true; btn.style.opacity = '0.5';
    const newState = !isActive;
    const { error } = await supabase.from('host_listings').upsert({ user_id: user.id, is_active: newState }, { onConflict: 'user_id' });
    if (error) { toastError('Could not update hosting status'); btn.disabled = false; btn.style.opacity = '1'; return; }
    await supabase.from('profiles').update({ is_hosting: newState }).eq('id', user.id);
    toastSuccess(newState ? 'Hosting activated — you\'re visible to wanderers' : 'Hosting paused');
    navigate('more/wanderhost', { replace: true });
  });

  return el;
}
