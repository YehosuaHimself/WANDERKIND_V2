import { navigate } from '../lib/router.js';
import { supabase } from '../lib/supabase.js';
import { ensureProfile } from '../lib/auth.js';

export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--sp-md);padding:var(--screen-px);">
      <div class="wk-spinner"></div>
      <p style="font-family:var(--font-mono);font-size:var(--text-sm);color:var(--ink3);letter-spacing:1px;">SIGNING YOU IN…</p>
    </div>`;

  // Try to get session — Supabase may still be exchanging the PKCE code
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await ensureProfile(session.user);
    navigate('myway', { replace: true });
    return el;
  }

  // Subscribe to auth state — fires when PKCE exchange completes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      subscription.unsubscribe();
      await ensureProfile(session.user);
      navigate('myway', { replace: true });
    }
  });

  // Timeout safety valve — 15s then give up
  setTimeout(async () => {
    subscription.unsubscribe();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('auth/signin', { replace: true });
  }, 15000);

  return el;
}
