import { supabase } from '../lib/supabase.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';
export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:var(--screen-px);">
      <div style="margin-bottom:var(--sp-2xl);">
        <div class="label" style="margin-bottom:var(--sp-sm);">WANDERKIND</div>
        <h1 style="font-family:var(--font-mono);font-size:var(--text-h2);font-weight:900;color:var(--ink);">Reset password</h1>
      </div>
      <div class="wk-card" style="display:flex;flex-direction:column;gap:var(--sp-md);">
        <div>
          <label class="h-label">Email</label>
          <input class="wk-input" id="email" type="email" placeholder="your@email.com" />
        </div>
        <button class="wk-btn primary" id="send-btn">SEND RESET LINK</button>
        <button class="wk-btn ghost" id="back-btn">BACK TO SIGN IN</button>
      </div>
    </div>`;
  el.querySelector('#send-btn').addEventListener('click', async () => {
    const email = el.querySelector('#email').value.trim();
    if (!email) return toastError('Enter your email');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/#auth/callback`
    });
    if (error) return toastError(error.message);
    toastSuccess('Reset link sent — check your inbox');
  });
  el.querySelector('#back-btn').addEventListener('click', () => navigate('auth/signin'));
  return el;
}
