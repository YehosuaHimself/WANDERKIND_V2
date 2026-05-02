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

/** Ensure a profile row exists for this user. Creates one if missing. */
export async function ensureProfile(user) {
  if (!user) return;
  // Check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();
  if (existing) return;
  // Create profile from user_metadata
  const meta = user.user_metadata || {};
  await supabase.from('profiles').upsert({
    id: user.id,
    trail_name: meta.trail_name || meta.name || 'Wanderer',
    role: meta.role || 'walker',
    tier: 'wanderkind',
  });
}

export async function initAuth() {
  // Handle PKCE code exchange: if URL has ?code=, Supabase needs to process it.
  // We redirect to auth/callback page FIRST so the spinner shows, then getSession()
  // will have time to exchange. We clear the code from the URL immediately.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('code') || urlParams.has('token_hash')) {
    window.history.replaceState({}, '', window.location.pathname);
    // Point the hash router at callback so it shows a spinner
    if (!location.hash.startsWith('#auth/callback')) {
      location.hash = '#auth/callback';
    }
  }

  const { data: { session } } = await supabase.auth.getSession();
  _session = session;

  supabase.auth.onAuthStateChange(async (_event, session) => {
    const wasNull = !_session;
    _session = session;
    notifyListeners(session);

    if (session && _event === 'SIGNED_IN') {
      await ensureProfile(session.user);
      // If we were unauthenticated and are now signed in, navigate to app
      if (wasNull) navigate('myway', { replace: true });
    }

    if (!session) {
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: meta,
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
  return { error };
}
