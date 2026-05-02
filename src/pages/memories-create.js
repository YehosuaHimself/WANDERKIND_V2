import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  let selectedFile = null;
  let previewUrl = null;

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-x"></i></button>
      <h1>NEW MEMORY</h1>
      <button id="post-btn" style="margin-left:auto;background:var(--amber);color:var(--white);
        border:none;border-radius:var(--r-btn);padding:8px 16px;cursor:pointer;
        font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:1.5px;">POST</button>
    </div>
    <div style="padding:var(--screen-px);display:flex;flex-direction:column;gap:var(--sp-md);">
      <div id="photo-area" style="width:100%;aspect-ratio:1;border-radius:var(--r-lg);
        background:var(--surface-alt);border:2px dashed var(--border-dark);
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        cursor:pointer;gap:var(--sp-sm);color:var(--ink3);overflow:hidden;">
        <i class="ph ph-camera" style="font-size:40px;color:var(--amber);"></i>
        <span style="font-family:var(--font-mono);font-size:var(--text-label);letter-spacing:2px;">TAP TO ADD PHOTO</span>
      </div>
      <input type="file" id="photo-input" accept="image/*" capture="environment" style="display:none;" />
      <div>
        <label class="h-label">Caption</label>
        <textarea class="wk-input" id="caption" rows="3" placeholder="What happened here…"
          style="resize:none;"></textarea>
      </div>
      <div>
        <label class="h-label">Location (optional)</label>
        <input class="wk-input" id="location" placeholder="Where were you?" />
      </div>
    </div>`;

  el.querySelector('#back').addEventListener('click', () => navigate('memories'));
  el.querySelector('#photo-area').addEventListener('click', () => el.querySelector('#photo-input').click());

  el.querySelector('#photo-input').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    selectedFile = file;
    previewUrl = URL.createObjectURL(file);
    const area = el.querySelector('#photo-area');
    area.innerHTML = `<img src="${previewUrl}" style="width:100%;height:100%;object-fit:cover;" />`;
  });

  el.querySelector('#post-btn').addEventListener('click', async () => {
    const caption  = el.querySelector('#caption').value.trim();
    const location = el.querySelector('#location').value.trim();
    if (!caption && !selectedFile) return toastError('Add a photo or caption');

    const btn = el.querySelector('#post-btn');
    btn.disabled = true; btn.textContent = 'Posting…';

    let image_url = null;
    if (selectedFile) {
      try {
        const { uploadAvatar } = await import('../lib/supabase.js');
        image_url = await uploadAvatar(user.id, selectedFile, `moment_${Date.now()}.jpg`);
      } catch (e) { /* non-blocking */ }
    }

    const { error } = await supabase.from('moments').insert({
      user_id: user.id, caption, location: location || null, image_url,
    });

    if (error) { btn.disabled = false; btn.textContent = 'POST'; return toastError(error.message); }
    toastSuccess('Memory posted');
    navigate('memories', { replace: true });
  });

  return el;
}
