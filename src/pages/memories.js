import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

export default async function render() {
  const el = document.createElement('div');

  el.innerHTML = `
    <div class="wk-header">
      <h1>MEMORIES</h1>
    </div>
    <div id="moments-feed" style="padding:var(--screen-px);display:flex;flex-direction:column;gap:var(--sp-md);">
      <div class="wk-spinner"></div>
    </div>
    <button id="create-moment" style="
      position:fixed;bottom:calc(var(--nav-h) + 16px);right:16px;
      width:52px;height:52px;border-radius:26px;
      background:var(--amber);color:var(--white);
      border:none;cursor:pointer;font-size:24px;
      box-shadow:0 4px 12px rgba(200,118,42,0.35);
      display:flex;align-items:center;justify-content:center;
      z-index:50;
    "><i class="ph ph-plus"></i></button>
  `;

  // Load moments
  const user = getUser();
  const { data: moments } = await supabase
    .from('moments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  const feed = el.querySelector('#moments-feed');
  if (!moments || moments.length === 0) {
    feed.innerHTML = `
      <div class="wk-empty">
        <div class="icon">📸</div>
        <p>Moments from your journey — photos, stories, and memories — will live here.</p>
      </div>`;
  } else {
    feed.innerHTML = moments.map(m => `
      <div class="wk-card" style="cursor:pointer;" data-id="${m.id}">
        ${m.image_url ? `<img src="${m.image_url}" style="width:100%;border-radius:var(--r-md);margin-bottom:var(--sp-sm);object-fit:cover;max-height:240px;" />` : ''}
        <p style="font-size:var(--text-sm);color:var(--ink);">${m.caption || ''}</p>
        <div style="margin-top:var(--sp-sm);color:var(--ink3);font-size:var(--text-caption);font-family:var(--font-mono);">
          ${new Date(m.created_at).toLocaleDateString()}
        </div>
      </div>`).join('');
  }

  el.querySelector('#create-moment').addEventListener('click', () => navigate('memories/create'));
  return el;
}
