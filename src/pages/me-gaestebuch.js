import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  const { data: entries } = await supabase.from('gaestebuch').select('*, profiles!gaestebuch_author_id_fkey(trail_name,avatar_url)').eq('profile_id', user.id).order('created_at', { ascending: false });
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>GÄSTEBUCH</h1>
    </div>
    <div style="padding:var(--screen-px);display:flex;flex-direction:column;gap:var(--sp-md);">
      ${!entries || entries.length === 0 ? `
        <div class="wk-empty"><div class="icon">📖</div><p>Entries from fellow wanderers will appear here.</p></div>` :
        entries.map(e => `
          <div class="wk-card">
            <div style="display:flex;align-items:center;gap:var(--sp-sm);margin-bottom:var(--sp-sm);">
              <div style="width:32px;height:32px;border-radius:16px;background:var(--amber-bg);display:flex;align-items:center;justify-content:center;overflow:hidden;">
                ${e.profiles?.avatar_url ? `<img src="${e.profiles.avatar_url}" style="width:100%;height:100%;object-fit:cover;"/>` : `<i class="ph ph-user" style="color:var(--amber);font-size:14px;"></i>`}
              </div>
              <div>
                <div style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:600;">${e.profiles?.trail_name || 'Wanderer'}</div>
                <div style="font-size:var(--text-caption);color:var(--ink3);">${new Date(e.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <p style="font-size:var(--text-sm);color:var(--ink2);line-height:1.6;">${e.content}</p>
          </div>`).join('')}
    </div>`;
  el.querySelector('#back').addEventListener('click', () => navigate('me'));
  return el;
}
