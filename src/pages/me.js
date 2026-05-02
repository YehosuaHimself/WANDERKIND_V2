import { supabase } from '../lib/supabase.js';
import { getUser, signOut } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');

  // Load profile
  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null };

  const name       = profile?.trail_name || profile?.full_name || user?.user_metadata?.trail_name || 'Wanderer';
  const avatar     = profile?.avatar_url || '';
  const cover      = profile?.cover_url  || '';
  const bio        = profile?.bio        || '';
  const nightCount = profile?.night_count || 0;

  el.innerHTML = `
    <!-- Cover -->
    <div style="position:relative;height:180px;background:${cover ? `url('${cover}') center/cover` : 'var(--surface-alt)'};cursor:pointer;" id="cover-area">
      ${!cover ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--ink3);flex-direction:column;gap:4px;">
        <i class="ph ph-image" style="font-size:32px;"></i>
        <span style="font-size:var(--text-caption);font-family:var(--font-mono);letter-spacing:1px;">ADD COVER</span>
      </div>` : ''}
    </div>

    <!-- Avatar + name -->
    <div style="padding:0 var(--screen-px);margin-top:-36px;position:relative;">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:var(--sp-md);">
        <div id="avatar-wrap" style="width:72px;height:72px;border-radius:36px;border:3px solid var(--bg);
          background:var(--surface-alt);overflow:hidden;cursor:pointer;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;color:var(--amber);font-size:28px;">
          ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="ph ph-user"></i>`}
        </div>
        <button class="wk-btn ghost" style="width:auto;padding:8px 16px;font-size:11px;" id="edit-profile-btn">EDIT PROFILE</button>
      </div>

      <h2 style="font-family:var(--font-mono);font-size:var(--text-h3);font-weight:700;color:var(--ink);">${name}</h2>
      ${bio ? `<p style="margin-top:4px;color:var(--ink2);font-size:var(--text-sm);">${bio}</p>` : ''}

      <!-- Stats row -->
      <div style="display:flex;gap:var(--sp-lg);margin-top:var(--sp-md);padding:var(--sp-md) 0;border-top:1px solid var(--border-lt);border-bottom:1px solid var(--border-lt);">
        <div style="text-align:center;">
          <div style="font-family:var(--font-mono);font-size:var(--text-h3);font-weight:700;color:var(--ink);">${nightCount}</div>
          <div class="label" style="font-size:8px;">Nights</div>
        </div>
        <div style="text-align:center;">
          <div style="font-family:var(--font-mono);font-size:var(--text-h3);font-weight:700;color:var(--ink);">${profile?.stamps_count || 0}</div>
          <div class="label" style="font-size:8px;">Stamps</div>
        </div>
        <div style="text-align:center;">
          <div style="font-family:var(--font-mono);font-size:var(--text-h3);font-weight:700;color:var(--ink);">${profile?.hosted_count || 0}</div>
          <div class="label" style="font-size:8px;">Hosted</div>
        </div>
      </div>

      <!-- Menu list -->
      <div class="row-list" style="margin:var(--sp-md) 0;border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
        ${[
          { icon:'ph-path',          label:'MY JOURNEY',     route:'me/journey'  },
          { icon:'ph-images',         label:'GALLERY',        route:'me/gallery'  },
          { icon:'ph-seal',           label:'STAMPS',         route:'me/stamps-overview' },
          { icon:'ph-book-open',      label:'GÄSTEBUCH',      route:'me/gaestebuch' },
          { icon:'ph-house',          label:'MY HOSTING',     route:'me/hosting/dashboard' },
          { icon:'ph-shield-check',   label:'VERIFICATION',   route:'me/verification' },
          { icon:'ph-qr-code',        label:'QR CODE',        route:'me/qr-code'  },
          { icon:'ph-sign-out',       label:'SIGN OUT',       route:'__signout__' },
        ].map(item => `
          <div class="row-item" data-route="${item.route}" style="border-radius:0;border-bottom:1px solid var(--border-lt);">
            <i class="${item.icon}" style="font-size:20px;color:var(--amber);width:24px;flex-shrink:0;"></i>
            <span style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:600;letter-spacing:1.5px;color:var(--ink);">${item.label}</span>
            <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
          </div>`).join('')}
      </div>
    </div>

    <!-- Hidden file inputs -->
    <input type="file" id="avatar-input" accept="image/*" capture="user" style="display:none;" />
    <input type="file" id="cover-input"  accept="image/*"                style="display:none;" />
  `;

  // Edit profile
  el.querySelector('#edit-profile-btn').addEventListener('click', () => navigate('me/edit'));

  // Avatar tap
  el.querySelector('#avatar-wrap').addEventListener('click', () => el.querySelector('#avatar-input').click());
  el.querySelector('#cover-area').addEventListener('click',  () => el.querySelector('#cover-input').click());

  // Avatar upload
  el.querySelector('#avatar-input').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file || !user) return;
    const { uploadAvatar } = await import('../lib/supabase.js');
    const url = await uploadAvatar(user.id, file, `avatar_${Date.now()}.jpg`);
    await supabase.from('profiles').upsert({ id: user.id, avatar_url: url });
    toastSuccess('Photo saved');
    navigate('me', { replace: true });
  });

  // Cover upload
  el.querySelector('#cover-input').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file || !user) return;
    const { uploadAvatar } = await import('../lib/supabase.js');
    const url = await uploadAvatar(user.id, file, `cover_${Date.now()}.jpg`);
    await supabase.from('profiles').upsert({ id: user.id, cover_url: url });
    toastSuccess('Cover saved');
    navigate('me', { replace: true });
  });

  // Row navigation
  el.querySelectorAll('.row-item[data-route]').forEach(row => {
    row.addEventListener('click', async () => {
      const route = row.dataset.route;
      if (route === '__signout__') {
        await signOut();
        navigate('auth/signin', { replace: true });
      } else {
        navigate(route);
      }
    });
  });

  return el;
}
