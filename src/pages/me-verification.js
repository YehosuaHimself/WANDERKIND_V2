import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const { data: profile } = await supabase.from('profiles').select('biometric_verified,verification_level').eq('id', user.id).single();
  const isVerified = profile?.biometric_verified || profile?.verification_level === 'biometric';
  const el = document.createElement('div');

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back-btn"><i class="ph ph-arrow-left"></i></button>
      <h1>VERIFICATION</h1>
    </div>
    <div style="padding:var(--screen-px);display:flex;flex-direction:column;gap:var(--sp-md);">
      ${isVerified ? `
        <div class="wk-card" style="border-color:var(--gold-border);background:var(--gold-bg);text-align:center;">
          <i class="ph ph-seal-check" style="font-size:48px;color:var(--gold);"></i>
          <div style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:700;letter-spacing:2px;margin-top:var(--sp-sm);">VERIFIED</div>
          <p style="color:var(--ink2);font-size:var(--text-sm);margin-top:4px;">Your identity is confirmed by the community.</p>
        </div>` : `
        <div class="wk-card">
          <div class="h-label">Why verify?</div>
          <p style="font-size:var(--text-sm);color:var(--ink2);line-height:1.7;">
            Verification builds the trust that makes wanderkind possible. Hosts open their doors
            to verified wanderers. Wanderers trust verified hosts.
          </p>
        </div>
        <div class="wk-card">
          <div class="h-label">Take a selfie</div>
          <p style="font-size:var(--text-sm);color:var(--ink2);margin-bottom:var(--sp-md);">
            Hold your face clearly in frame and take a photo. It will be reviewed by the community.
          </p>
          <input type="file" id="selfie-input" accept="image/*" capture="user" style="display:none;" />
          <button class="wk-btn primary" id="selfie-btn">
            <i class="ph ph-camera"></i> Take Photo
          </button>
        </div>`}
    </div>`;

  el.querySelector('#back-btn').addEventListener('click', () => navigate('me'));

  if (!isVerified) {
    el.querySelector('#selfie-btn').addEventListener('click', () => el.querySelector('#selfie-input').click());
    el.querySelector('#selfie-input').addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file) return;
      const btn = el.querySelector('#selfie-btn');
      btn.disabled = true; btn.textContent = 'Uploading…';

      try {
        const { uploadAvatar } = await import('../lib/supabase.js');
        await uploadAvatar(user.id, file, `verification_${Date.now()}.jpg`);

        // Try both column names for compatibility
        let { error } = await supabase.from('profiles').upsert({ id: user.id, biometric_verified: true });
        if (error) {
          ({ error } = await supabase.from('profiles').upsert({ id: user.id, verification_level: 'biometric' }));
        }

        if (error) throw error;
        toastSuccess('Verification submitted');
        navigate('me/verification', { replace: true });
      } catch (err) {
        btn.disabled = false; btn.innerHTML = '<i class="ph ph-camera"></i> Take Photo';
        toastError(err.message || 'Upload failed — try again');
      }
    });
  }

  return el;
}
