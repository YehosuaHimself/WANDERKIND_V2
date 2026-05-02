import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

export default async function render(path) {
  const momentId = path.replace('memories/', '');
  const el = document.createElement('div');

  const { data: m } = await supabase
    .from('moments').select('*, profiles(trail_name,avatar_url)').eq('id', momentId).single();

  if (!m) {
    el.innerHTML = `<div class="wk-header"><button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button><h1>MEMORY</h1></div>
      <div class="wk-empty"><p>Memory not found.</p></div>`;
    el.querySelector('#back').addEventListener('click', () => navigate('memories'));
    return el;
  }

  const name = m.profiles?.trail_name || 'Wanderer';
  const avatar = m.profiles?.avatar_url || '';

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>MEMORY</h1>
    </div>
    ${m.image_url ? `<img src="${m.image_url}" style="width:100%;max-height:400px;object-fit:cover;" />` : ''}
    <div style="padding:var(--screen-px);">
      <div style="display:flex;align-items:center;gap:var(--sp-sm);margin-bottom:var(--sp-md);">
        <div style="width:36px;height:36px;border-radius:18px;overflow:hidden;background:var(--amber-bg);
          display:flex;align-items:center;justify-content:center;">
          ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;"/>` : `<i class="ph ph-user" style="color:var(--amber);"></i>`}
        </div>
        <div>
          <div style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:600;">${name}</div>
          <div style="font-size:var(--text-caption);color:var(--ink3);">${new Date(m.created_at).toLocaleDateString()}</div>
        </div>
      </div>
      ${m.caption ? `<p style="font-size:var(--text-body);line-height:1.7;color:var(--ink);">${m.caption}</p>` : ''}
      ${m.location ? `<div class="h-label" style="margin-top:var(--sp-md);">${m.location}</div>` : ''}
    </div>`;

  el.querySelector('#back').addEventListener('click', () => navigate('memories'));
  return el;
}
