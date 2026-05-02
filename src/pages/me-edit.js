import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const el = document.createElement('div');

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back-btn"><i class="ph ph-arrow-left"></i></button>
      <h1>EDIT PROFILE</h1>
    </div>
    <div style="padding:var(--screen-px);display:flex;flex-direction:column;gap:var(--sp-md);">
      <div>
        <label class="h-label">Trail Name</label>
        <input class="wk-input" id="trail-name" value="${profile?.trail_name || ''}" placeholder="Your trail name" />
      </div>
      <div>
        <label class="h-label">Bio</label>
        <textarea class="wk-input" id="bio" rows="4" placeholder="A few words about your way…" style="resize:vertical;">${profile?.bio || ''}</textarea>
      </div>
      <div>
        <label class="h-label">Home Town</label>
        <input class="wk-input" id="hometown" value="${profile?.hometown || ''}" placeholder="Where you come from" />
      </div>
      <div>
        <label class="h-label">Languages</label>
        <input class="wk-input" id="languages" value="${profile?.languages?.join(', ') || ''}" placeholder="e.g. English, Deutsch, Español" />
      </div>
      <button class="wk-btn primary" id="save-btn">SAVE CHANGES</button>
      <button class="wk-btn ghost" id="cancel-btn">CANCEL</button>
    </div>`;

  el.querySelector('#back-btn').addEventListener('click',   () => navigate('me'));
  el.querySelector('#cancel-btn').addEventListener('click', () => navigate('me'));

  el.querySelector('#save-btn').addEventListener('click', async () => {
    const btn = el.querySelector('#save-btn');
    btn.disabled = true; btn.textContent = 'Saving…';

    const updates = {
      id: user.id,
      trail_name: el.querySelector('#trail-name').value.trim(),
      bio:        el.querySelector('#bio').value.trim(),
      hometown:   el.querySelector('#hometown').value.trim(),
      languages:  el.querySelector('#languages').value.split(',').map(s => s.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    btn.disabled = false; btn.textContent = 'SAVE CHANGES';

    if (error) return toastError(error.message);
    toastSuccess('Profile saved');
    navigate('me', { replace: true });
  });

  return el;
}
