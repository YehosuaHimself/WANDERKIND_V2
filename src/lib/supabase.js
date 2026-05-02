import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = 'https://gjzhwpzgvdpkflgjesmb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqemh3cHpndmRwa2ZsZ2plc21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Mzc3OTUsImV4cCI6MjA5MjAxMzc5NX0.oHaNuCWu3FpMml2QhTpO7vFGxbgBEGo0mjKj5OUU7nI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    storageKey: 'wk-auth',
  },
  realtime: { params: { eventsPerSecond: 2 } },
});

/** Current session user or null */
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Upload a file blob to the avatars bucket.
 *  Path MUST start with userId/ to satisfy RLS.
 *  Falls back to base64 data URL if upload fails. */
export async function uploadAvatar(userId, blob, filename) {
  const path = `${userId}/${filename}`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { upsert: true, contentType: blob.type || 'image/jpeg' });

  if (!error) {
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  }
  // Fallback: base64 — persists across sessions
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror   = reject;
    reader.readAsDataURL(blob);
  });
}
