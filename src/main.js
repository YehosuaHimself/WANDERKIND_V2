import { initAuth, getUser } from './lib/auth.js';
import { initRouter, defineRoute, navigate } from './lib/router.js';

// ── Auth guard helper ─────────────────────────────────────────────
function guarded(loader) {
  return async () => {
    if (!getUser()) {
      navigate('auth/signin', { replace: true });
      return { default: () => document.createElement('div') };
    }
    return loader();
  };
}

// ── Register all routes ───────────────────────────────────────────
defineRoute('auth/signin',  () => import('./pages/auth-signin.js'));
defineRoute('auth/signup',  () => import('./pages/auth-signup.js'));
defineRoute('auth/callback',() => import('./pages/auth-callback.js'));

defineRoute('myway',     guarded(() => import('./pages/myway.js')));
defineRoute('memories',  guarded(() => import('./pages/memories.js')));
defineRoute('more',      guarded(() => import('./pages/more.js')));
defineRoute('messages',  guarded(() => import('./pages/messages.js')));
defineRoute('me',        guarded(() => import('./pages/me.js')));

// Sub-routes
defineRoute('me/journey',          guarded(() => import('./pages/me-journey.js')));
defineRoute('me/edit',             guarded(() => import('./pages/me-edit.js')));
defineRoute('me/gallery',          guarded(() => import('./pages/me-gallery.js')));
defineRoute('me/verification',     guarded(() => import('./pages/me-verification.js')));
defineRoute('me/hosting/dashboard',guarded(() => import('./pages/me-hosting.js')));
defineRoute('me/qr-code',          guarded(() => import('./pages/me-qr.js')));
defineRoute('more/verification',   guarded(() => import('./pages/more-verification.js')));
defineRoute('more/settings',       guarded(() => import('./pages/more-settings.js')));
defineRoute('more/tramp-mode',     guarded(() => import('./pages/more-tramp.js')));
defineRoute('more/emergency',      guarded(() => import('./pages/more-emergency.js')));
defineRoute('more/about',          guarded(() => import('./pages/more-about.js')));
defineRoute('more/journey',        guarded(() => import('./pages/more-journey.js')));
defineRoute('more/wanderhost',     guarded(() => import('./pages/more-wanderhost.js')));
defineRoute('more/host-push',      guarded(() => import('./pages/more-host-push.js')));
defineRoute('more/packlist',       guarded(() => import('./pages/more-packlist.js')));
defineRoute('more/passes',         guarded(() => import('./pages/more-passes.js')));
defineRoute('more/stamps',         guarded(() => import('./pages/more-stamps.js')));
defineRoute('messages/new',        guarded(() => import('./pages/messages-new.js')));

// ── Offline detection ─────────────────────────────────────────────
window.addEventListener('online',  () => document.body.classList.remove('offline'));
window.addEventListener('offline', () => document.body.classList.add('offline'));
if (!navigator.onLine) document.body.classList.add('offline');

// ── Service worker ────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ── Boot ──────────────────────────────────────────────────────────
async function boot() {
  const session = await initAuth();

  // If no session and not on an auth page → redirect to signin
  const hash = location.hash.replace(/^#\/?/, '');
  if (!session && !hash.startsWith('auth/')) {
    navigate('auth/signin', { replace: true });
  }

  initRouter();
}

boot();
