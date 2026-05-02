import { signUpWithEmail } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastError, toastSuccess } from '../lib/toast.js';

export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:var(--screen-px);">
      <div style="margin-bottom:var(--sp-2xl);text-align:center;">
        <div class="label" style="margin-bottom:var(--sp-sm);">WANDERKIND</div>
        <h1 style="font-family:var(--font-mono);font-size:var(--text-h2);font-weight:900;color:var(--ink);">Begin your journey</h1>
      </div>

      <div class="wk-card" style="display:flex;flex-direction:column;gap:var(--sp-md);">
        <div>
          <label class="h-label" for="su-name">Trail Name</label>
          <input class="wk-input" id="su-name" type="text" placeholder="How shall we call you?" autocomplete="nickname" />
        </div>
        <div>
          <label class="h-label" for="su-email">Email</label>
          <input class="wk-input" id="su-email" type="email" placeholder="your@email.com" autocomplete="email" />
        </div>
        <div>
          <label class="h-label" for="su-password">Password</label>
          <div style="position:relative;">
            <input class="wk-input" id="su-password" type="password" placeholder="8+ characters" autocomplete="new-password" style="padding-right:48px;" />
            <button id="toggle-su-pw" type="button" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;color:var(--ink3);font-size:18px;display:flex;align-items:center;transition:color 0.15s;" aria-label="Show password">
              <i class="ph ph-eye" id="toggle-su-pw-icon"></i>
            </button>
          </div>
        </div>
        <button class="wk-btn primary" id="signup-btn">Create Account</button>
      </div>

      <p style="text-align:center;margin-top:var(--sp-lg);color:var(--ink3);font-size:var(--text-sm);">
        Already a wanderer? <a href="#auth/signin" style="color:var(--amber);font-weight:600;">Sign in</a>
      </p>
    </div>
  `;

  // Password toggle
  let suPwVisible = false;
  const suPwInput = el.querySelector('#su-password');
  const suToggleBtn = el.querySelector('#toggle-su-pw');
  const suToggleIcon = el.querySelector('#toggle-su-pw-icon');
  if (suToggleBtn) {
    suToggleBtn.addEventListener('click', () => {
      suPwVisible = !suPwVisible;
      suPwInput.type = suPwVisible ? 'text' : 'password';
      suToggleIcon.className = suPwVisible ? 'ph ph-eye-slash' : 'ph ph-eye';
      suToggleBtn.style.color = suPwVisible ? 'var(--amber)' : 'var(--ink3)';
    });
  }

  el.querySelector('#signup-btn').addEventListener('click', async () => {
    const name     = el.querySelector('#su-name').value.trim();
    const email    = el.querySelector('#su-email').value.trim();
    const password = el.querySelector('#su-password').value;
    if (!name || !email || !password) return toastError('Fill in all fields');
    if (password.length < 8) return toastError('Password must be 8+ characters');
    const btn = el.querySelector('#signup-btn');
    btn.disabled = true; btn.textContent = 'Creating…';
    const { error } = await signUpWithEmail(email, password, { trail_name: name });
    btn.disabled = false; btn.textContent = 'Create Account';
    if (error) return toastError(error.message);
    toastSuccess('Welcome! Check your email to confirm.');
    navigate('myway', { replace: true });
  });

  return el;
}
