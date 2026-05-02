import { supabase } from './supabase.js';
import { navigate } from './router.js';

let _session = null;
let _listeners = [];

export function onAuthChange(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function notifyListeners(session) {
  _listeners.forEach(fn => fn(session));
}

export function getSession() { return _session; }
export function getUser()    { return _session?.user ?? null; }

export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  _session = session;

  supabase.auth.onAuthStateChange((_event, session) => {
    _session = session;
    notifyListeners(session);

    if (!session) {
      // Signed out — redirect to signin unless already there
      if (!location.hash.startsWith('#auth/')) {
        navigate('auth/signin', { replace: true });
      }
    }
  });

  return session;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signUpWithEmail(email, password, meta = {}) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: meta } });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${location.origin}/#auth/callback` },
  });
  return { error };
}
