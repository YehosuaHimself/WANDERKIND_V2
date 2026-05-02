import { supabase, uploadAvatar } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');

  const { data: profile } = await supabase.from('profiles').select('gallery_urls').eq('id', user.id).single();
  const gallery = profile?.gallery_urls || [];

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back-btn"><i class="ph ph-arrow-left"></i></button>
      <h1>GALLERY</h1>
    </div>
    <div style="padding:var(--screen-px);">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:var(--sp-md);">
        <!-- Add photo tile -->
        <div id="add-photo" style="aspect-ratio:1;background:var(--surface-alt);border:1px dashed var(--border-dark);
          border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;cursor:pointer;
          flex-direction:column;gap:4px;color:var(--amber);">
          <i class="ph ph-camera" style="font-size:24px;"></i>
          <span style="font-size:9px;font-family:var(--font-mono);letter-spacing:1px;">ADD</span>
        </div>
        ${gallery.map(url => `
          <div style="aspect-ratio:1;border-radius:var(--r-sm);overflow:hidden;">
            <img src="${url}" style="width:100%;height:100%;object-fit:cover;" />
          </div>`).join('')}
      </div>
      ${gallery.length === 0 ? `<div class="wk-empty" style="padding:var(--sp-xl) 0;">
        <div class="icon">📷</div>
        <p>Your road photos will appear here.</p>
      </div>` : ''}
    </div>
    <input type="file" id="gallery-input" accept="image/*" capture="environment" style="display:none;" />`;

  el.querySelector('#back-btn').addEventListener('click', () => navigate('me'));
  el.querySelector('#add-photo').addEventListener('click', () => el.querySelector('#gallery-input').click());

  el.querySelector('#gallery-input').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    const url = await uploadAvatar(user.id, file, `gallery_${Date.now()}.jpg`);
    const newGallery = [url, ...gallery];
    const { error } = await supabase.from('profiles').upsert({ id: user.id, gallery_urls: newGallery });
    if (error) return toastError(error.message);
    toastSuccess('Photo added');
    navigate('me/gallery', { replace: true });
  });

  return el;
}
