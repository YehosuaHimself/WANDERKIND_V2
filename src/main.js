import { initAuth, getUser } from './lib/auth.js';
import { initRouter, defineRoute, navigate } from './lib/router.js';

function guarded(loader) {
  return async () => {
    if (!getUser()) { navigate('auth/signin', { replace: true }); return { default: () => document.createElement('div') }; }
    return loader();
  };
}

// ── AUTH ──────────────────────────────────────────────────────────
defineRoute('auth/welcome',       () => import('./pages/auth-welcome.js'));
defineRoute('auth/signin',        () => import('./pages/auth-signin.js'));
defineRoute('auth/signup',        () => import('./pages/auth-signup.js'));
defineRoute('auth/callback',      () => import('./pages/auth-callback.js'));
defineRoute('auth/trail-name',    () => import('./pages/auth-trail-name.js'));
defineRoute('auth/role-select',   () => import('./pages/auth-role-select.js'));
defineRoute('auth/forgot-password',()=> import('./pages/auth-forgot-password.js'));

// ── MAIN TABS ─────────────────────────────────────────────────────
defineRoute('myway',     guarded(() => import('./pages/myway.js')));
defineRoute('memories',  guarded(() => import('./pages/memories.js')));
defineRoute('more',      guarded(() => import('./pages/more.js')));
defineRoute('messages',  guarded(() => import('./pages/messages.js')));
defineRoute('me',        guarded(() => import('./pages/me.js')));

// ── MEMORIES ─────────────────────────────────────────────────────
defineRoute('memories/create',      guarded(() => import('./pages/memories-create.js')));
defineRoute('memories/create-story',guarded(() => import('./pages/memories-create.js')));
// dynamic: memories/:id — matched via prefix
defineRoute('memories/',            guarded(() => import('./pages/memories-detail.js')));

// ── MESSAGES ─────────────────────────────────────────────────────
defineRoute('messages/new',         guarded(() => import('./pages/messages-new.js')));
defineRoute('messages/group/create',guarded(() => import('./pages/messages-new.js')));
defineRoute('messages/group/',      guarded(() => import('./pages/messages-conversation.js')));
defineRoute('messages/',            guarded(() => import('./pages/messages-conversation.js')));

// ── ME ────────────────────────────────────────────────────────────
defineRoute('me/journey',           guarded(() => import('./pages/me-journey.js')));
defineRoute('me/edit',              guarded(() => import('./pages/me-edit.js')));
defineRoute('me/gallery',           guarded(() => import('./pages/me-gallery.js')));
defineRoute('me/verification',      guarded(() => import('./pages/me-verification.js')));
defineRoute('me/stamps-overview',   guarded(() => import('./pages/me-stamps.js')));
defineRoute('me/stamp/',            guarded(() => import('./pages/me-stamps.js')));
defineRoute('me/gaestebuch',        guarded(() => import('./pages/me-gaestebuch.js')));
defineRoute('me/passes',            guarded(() => import('./pages/me-passes.js')));
defineRoute('me/pass/food',         guarded(() => import('./pages/me-pass-food.js')));
defineRoute('me/pass/hospitality',  guarded(() => import('./pages/me-pass-hospitality.js')));
defineRoute('me/pass/wanderkind',   guarded(() => import('./pages/me-pass-wanderkind.js')));
defineRoute('me/pass/water',        guarded(() => import('./pages/me-pass-water.js')));
defineRoute('me/emergency-contacts',guarded(() => import('./pages/me-emergency.js')));
defineRoute('me/qr-code',           guarded(() => import('./pages/me-qr.js')));
defineRoute('me/profile/',          guarded(() => import('./pages/me-profile.js')));
defineRoute('me/delete-account',    guarded(() => import('./pages/more-about.js')));
// Hosting
defineRoute('me/hosting/dashboard', guarded(() => import('./pages/me-hosting.js')));
defineRoute('me/hosting/requests',  guarded(() => import('./pages/me-hosting-requests.js')));
defineRoute('me/hosting/guests',    guarded(() => import('./pages/me-hosting-guests.js')));
defineRoute('me/hosting/calendar',  guarded(() => import('./pages/me-hosting-calendar.js')));
defineRoute('me/hosting/availability',guarded(()=> import('./pages/me-hosting-availability.js')));
defineRoute('me/hosting/amenities', guarded(() => import('./pages/me-hosting-amenities.js')));
defineRoute('me/hosting/house-rules',guarded(()=> import('./pages/me-hosting-house-rules.js')));
defineRoute('me/hosting/pricing',   guarded(() => import('./pages/me-hosting-pricing.js')));
defineRoute('me/hosting/photos',    guarded(() => import('./pages/me-hosting-photos.js')));
defineRoute('me/hosting/check-in',  guarded(() => import('./pages/me-hosting-check-in.js')));
defineRoute('me/hosting/check-out', guarded(() => import('./pages/me-hosting-check-out.js')));
defineRoute('me/hosting/door-pin',  guarded(() => import('./pages/me-hosting-door-pin.js')));
defineRoute('me/hosting/gaestebuch',guarded(() => import('./pages/me-hosting-gaestebuch.js')));
defineRoute('me/hosting/stats',     guarded(() => import('./pages/me-hosting-stats.js')));
defineRoute('me/hosting/listing-edit',guarded(()=> import('./pages/me-hosting-listing-edit.js')));
defineRoute('me/hosting/verification',guarded(()=> import('./pages/me-hosting-verification.js')));

// ── MORE ─────────────────────────────────────────────────────────
defineRoute('more/verification',    guarded(() => import('./pages/more-verification.js')));
defineRoute('more/settings',        guarded(() => import('./pages/more-settings.js')));
defineRoute('more/settings/appearance',guarded(()=> import('./pages/more-settings-appearance.js')));
defineRoute('more/settings/language',  guarded(()=> import('./pages/more-settings-language.js')));
defineRoute('more/settings/notifications',guarded(()=>import('./pages/more-settings-notifications.js')));
defineRoute('more/tramp-mode',      guarded(() => import('./pages/more-tramp.js')));
defineRoute('more/emergency',       guarded(() => import('./pages/more-emergency.js')));
defineRoute('more/about',           guarded(() => import('./pages/more-about.js')));
defineRoute('more/journey',         guarded(() => import('./pages/more-journey.js')));
defineRoute('more/wanderhost',      guarded(() => import('./pages/more-wanderhost.js')));
defineRoute('more/wanderhost-prefs',guarded(() => import('./pages/more-wanderhost-prefs.js')));
defineRoute('more/wanderhost-access',guarded(()=> import('./pages/more-wanderhost-access.js')));
defineRoute('more/wanderhost-notifications',guarded(()=>import('./pages/more-wanderhost-notifications.js')));
defineRoute('more/host-push',       guarded(() => import('./pages/more-host-push.js')));
defineRoute('more/packlist',        guarded(() => import('./pages/more-packlist.js')));
defineRoute('more/passes',          guarded(() => import('./pages/more-passes.js')));
defineRoute('more/stamps',          guarded(() => import('./pages/more-stamps.js')));
defineRoute('more/group-walk',      guarded(() => import('./pages/more-group-walk.js')));
defineRoute('more/book',            guarded(() => import('./pages/more-book.js')));
defineRoute('more/ways',            guarded(() => import('./pages/more-ways.js')));
defineRoute('more/legal/imprint',   guarded(() => import('./pages/more-legal-imprint.js')));
defineRoute('more/legal/privacy-policy',guarded(()=>import('./pages/more-legal-privacy.js')));
defineRoute('more/legal/terms',     guarded(() => import('./pages/more-legal-terms.js')));
defineRoute('more/feedback',        guarded(() => import('./pages/more-feedback.js')));
defineRoute('more/scan',            guarded(() => import('./pages/more-scan.js')));
defineRoute('more/contribute',      guarded(() => import('./pages/more-contribute.js')));
defineRoute('more/share-profile',   guarded(() => import('./pages/more-share.js')));
defineRoute('more/wanderkind-way',  guarded(() => import('./pages/more-wanderkind-way.js')));
defineRoute('messages/new',         guarded(() => import('./pages/messages-new.js')));

// ── OFFLINE ───────────────────────────────────────────────────────
window.addEventListener('online',  () => document.body.classList.remove('offline'));
window.addEventListener('offline', () => document.body.classList.add('offline'));
if (!navigator.onLine) document.body.classList.add('offline');

// ── SERVICE WORKER ────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

// ── BOOT ──────────────────────────────────────────────────────────
async function boot() {
  const session = await initAuth();
  const hash = location.hash.replace(/^#\/?/, '');
  if (!session && !hash.startsWith('auth/')) navigate('auth/signin', { replace: true });
  initRouter();
}
boot();
