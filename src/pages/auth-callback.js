import { navigate } from '../lib/router.js';
import { supabase } from '../lib/supabase.js';

export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--sp-md);">
      <div class="wk-spinner"></div>
      <p style="font-family:var(--font-mono);font-size:var(--text-sm);color:var(--ink3);">Signing you in…</p>
    </div>`;

  // Supabase handles the token exchange automatically via detectSessionInUrl
  setTimeout(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    navigate(session ? 'myway' : 'auth/signin', { replace: true });
  }, 1500);

  return el;
}
