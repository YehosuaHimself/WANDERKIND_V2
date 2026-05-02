import { supabase } from '../lib/supabase.js';
import { navigate } from '../lib/router.js';
export default async function render(path) {
  const profileId = path.replace('me/profile/', '');
  const el = document.createElement('div');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', profileId).single();
  if (!profile) {
    el.innerHTML = `<div class="wk-header"><button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button><h1>PROFILE</h1></div><div class="wk-empty"><p>Profile not found.</p></div>`;
    el.querySelector('#back').addEventListener('click', () => history.back());
    return el;
  }
  el.innerHTML = `
    <div style="position:relative;height:160px;background:${profile.cover_url ? `url('${profile.cover_url}') center/cover` : 'var(--surface-alt)'};"></div>
    <div class="wk-header" style="position:absolute;top:0;left:0;right:0;background:transparent;border:none;">
      <button class="back-btn" id="back" style="background:rgba(250,246,239,0.8);border-radius:20px;"><i class="ph ph-arrow-left"></i></button>
    </div>
    <div style="padding:0 var(--screen-px);margin-top:-36px;">
      <div style="width:72px;height:72px;border-radius:36px;border:3px solid var(--bg);background:var(--surface-alt);overflow:hidden;margin-bottom:var(--sp-sm);">
        ${profile.avatar_url ? `<img src="${profile.avatar_url}" style="width:100%;height:100%;object-fit:cover;"/>` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--amber);font-size:28px;"><i class="ph ph-user"></i></div>`}
      </div>
      <h2 style="font-family:var(--font-mono);font-size:var(--text-h3);font-weight:700;">${profile.trail_name || 'Wanderer'}</h2>
      ${profile.bio ? `<p style="color:var(--ink2);font-size:var(--text-sm);margin-top:4px;">${profile.bio}</p>` : ''}
      <div style="margin-top:var(--sp-md);display:flex;gap:var(--sp-lg);">
        <div style="text-align:center;"><div style="font-family:var(--font-mono);font-size:var(--text-h3);font-weight:700;">${profile.night_count||0}</div><div class="label" style="font-size:8px;">Nights</div></div>
        <div style="text-align:center;"><div style="font-family:var(--font-mono);font-size:var(--text-h3);font-weight:700;">${profile.hosted_count||0}</div><div class="label" style="font-size:8px;">Hosted</div></div>
      </div>
      <button class="wk-btn primary" style="margin-top:var(--sp-lg);" id="msg-btn"><i class="ph ph-paper-plane-tilt"></i> Send Message</button>
    </div>`;
  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#msg-btn').addEventListener('click', () => navigate(`messages/${profileId}`));
  return el;
}
