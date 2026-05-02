import { signInWithEmail, sendMagicLink } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastError, toastSuccess } from '../lib/toast.js';

export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:var(--screen-px);">
      <div style="margin-bottom:var(--sp-2xl);text-align:center;">
        <div class="label" style="margin-bottom:var(--sp-sm);">WANDERKIND</div>
        <h1 style="font-family:var(--font-mono);font-size:var(--text-h2);font-weight:900;letter-spacing:-0.5px;color:var(--ink);">Walk. Trust. Belong.</h1>
        <p style="color:var(--ink3);margin-top:var(--sp-sm);font-size:var(--text-sm);">Sign in to continue your journey</p>
      </div>

      <div class="wk-card" style="display:flex;flex-direction:column;gap:var(--sp-md);">
        <div>
          <label class="h-label" for="signin-email">Email</label>
          <input class="wk-input" id="signin-email" type="email" placeholder="your@email.com" autocomplete="email" />
        </div>
        <div>
          <label class="h-label" for="signin-password">Password</label>
          <input class="wk-input" id="signin-password" type="password" placeholder="••••••••" autocomplete="current-password" />
        </div>
        <button class="wk-btn primary" id="signin-btn">Sign In</button>
        <button class="wk-btn ghost" id="magic-btn">Send Magic Link</button>
      </div>

      <p style="text-align:center;margin-top:var(--sp-lg);color:var(--ink3);font-size:var(--text-sm);">
        No account? <a href="#auth/signup" style="color:var(--amber);font-weight:600;">Create one</a>
      </p>
    </div>
  `;

  el.querySelector('#signin-btn').addEventListener('click', async () => {
    const email    = el.querySelector('#signin-email').value.trim();
    const password = el.querySelector('#signin-password').value;
    if (!email || !password) return toastError('Enter email and password');
    const btn = el.querySelector('#signin-btn');
    btn.disabled = true; btn.textContent = 'Signing in…';
    const { error } = await signInWithEmail(email, password);
    btn.disabled = false; btn.textContent = 'Sign In';
    if (error) return toastError(error.message);
    navigate('myway', { replace: true });
  });

  el.querySelector('#magic-btn').addEventListener('click', async () => {
    const email = el.querySelector('#signin-email').value.trim();
    if (!email) return toastError('Enter your email first');
    const btn = el.querySelector('#magic-btn');
    btn.disabled = true; btn.textContent = 'Sending…';
    const { error } = await sendMagicLink(email);
    btn.disabled = false; btn.textContent = 'Send Magic Link';
    if (error) return toastError(error.message);
    toastSuccess('Check your inbox — magic link sent');
  });

  return el;
}
