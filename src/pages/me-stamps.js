import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  const { data: stamps } = await supabase.from('stamps').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>STAMPS & VISAS</h1>
    </div>
    <div style="padding:var(--screen-px);">
      ${!stamps || stamps.length === 0 ? `
        <div class="wk-empty"><div class="icon">🏅</div><p>Stamps you collect on the road will appear here.</p></div>` :
        `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--sp-sm);">
          ${stamps.map(s => `
            <div style="aspect-ratio:1;background:var(--amber-bg);border:1px solid var(--border-dark);
              border-radius:var(--r-lg);display:flex;flex-direction:column;align-items:center;
              justify-content:center;gap:4px;padding:var(--sp-sm);cursor:pointer;" data-id="${s.id}">
              <span style="font-size:28px;">${s.emoji || '🏅'}</span>
              <span style="font-family:var(--font-mono);font-size:8px;letter-spacing:1px;text-align:center;color:var(--ink2);">${s.name || ''}</span>
            </div>`).join('')}
        </div>`}
    </div>`;
  el.querySelector('#back').addEventListener('click', () => navigate('me'));
  el.querySelectorAll('[data-id]').forEach(c => c.addEventListener('click', () => navigate(`me/stamp/${c.dataset.id}`)));
  return el;
}
