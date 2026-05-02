import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { toastSuccess } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  el.style.cssText = 'min-height:100%;';

  const { data: p } = await supabase.from('profiles')
    .select('trail_name,wanderkind_id,avatar_url,bio,tier').eq('id', user.id).single();
  const name = p?.trail_name || 'Wanderer';
  const wkId = p?.wanderkind_id || ('WK-' + user.id.slice(0,6).toUpperCase());
  const profileUrl = `https://wanderkind.love/#me/profile/${user.id}`;
  const qrUrl = `https://chart.googleapis.com/chart?chs=160x160&cht=qr&chl=${encodeURIComponent(profileUrl)}&choe=UTF-8&chld=M|2`;

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>SHARE PROFILE</h1>
    </div>
    <div style="padding:28px 24px 40px;display:flex;flex-direction:column;align-items:center;gap:20px;">

      <!-- Profile card preview -->
      <div style="width:100%;max-width:320px;background:var(--surface);border:1px solid var(--border-lt);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-lg);">
        <div style="height:80px;background:linear-gradient(135deg,var(--amber) 0%,#8B5E2A 100%);"></div>
        <div style="padding:0 20px 20px;margin-top:-36px;">
          <div style="width:72px;height:72px;border-radius:36px;border:3px solid var(--surface);overflow:hidden;background:var(--surface-alt);display:flex;align-items:center;justify-content:center;margin-bottom:10px;">
            ${p?.avatar_url ? `<img src="${p.avatar_url}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="ph ph-user" style="font-size:28px;color:var(--amber);"></i>`}
          </div>
          <div style="font-size:18px;font-weight:800;color:var(--ink);">${name}</div>
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--amber);letter-spacing:1.5px;margin-top:3px;">${wkId}</div>
          ${p?.bio ? `<p style="font-size:13px;color:var(--ink2);margin-top:8px;line-height:1.6;">${p.bio.slice(0,100)}${p.bio.length>100?'…':''}</p>` : ''}
          <div style="display:flex;justify-content:center;margin-top:16px;padding-top:16px;border-top:1px solid var(--border-lt);">
            <img src="${qrUrl}" style="width:120px;height:120px;border-radius:8px;" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>

      <!-- Link -->
      <div style="width:100%;max-width:320px;background:var(--surface-alt);border:1px solid var(--border-lt);border-radius:var(--r-lg);padding:12px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;" id="copy-link">
        <i class="ph ph-link" style="font-size:18px;color:var(--amber);flex-shrink:0;"></i>
        <div style="flex:1;min-width:0;font-size:12px;color:var(--ink2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${profileUrl}</div>
        <i class="ph ph-copy" style="font-size:16px;color:var(--ink3);flex-shrink:0;"></i>
      </div>

      <!-- Actions -->
      <div style="width:100%;max-width:320px;display:flex;flex-direction:column;gap:10px;">
        <button class="wk-btn primary" id="native-share"><i class="ph ph-share-network"></i> SHARE PROFILE</button>
        <button class="wk-btn secondary" id="copy-btn"><i class="ph ph-copy"></i> COPY LINK</button>
        <button class="wk-btn ghost" id="qr-btn"><i class="ph ph-qr-code"></i> SHOW FULL QR CODE</button>
      </div>
    </div>
  `;

  el.querySelector('#back').addEventListener('click', () => history.back());

  const copyFn = () => navigator.clipboard?.writeText(profileUrl).then(() => toastSuccess('Profile link copied'));
  el.querySelector('#copy-link').addEventListener('click', copyFn);
  el.querySelector('#copy-btn').addEventListener('click', copyFn);
  el.querySelector('#native-share').addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: `${name} on WANDERKIND`, text: `Walk with me.`, url: profileUrl });
    } else copyFn();
  });
  el.querySelector('#qr-btn').addEventListener('click', () => {
    const { navigate: nav } = window._wkNav || {};
    import('../lib/router.js').then(m => m.navigate('me/qr-code'));
  });

  return el;
}
