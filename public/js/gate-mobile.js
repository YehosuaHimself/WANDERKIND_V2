/**
 * gate-mobile.js — WANDERKIND PWA Install Gate
 *
 * iOS: slide-up modal with 3-step Add to Home Screen walkthrough + bouncing arrow
 * Android Chrome/Edge: triggers native beforeinstallprompt dialog
 * Android Samsung/Firefox: manual menu instructions
 * Desktop: completely silent, never shows
 *
 * Skips if already installed (standalone mode).
 * 7-day dismissal cooldown via localStorage.
 *
 * Call initMobileGate() once after DOMContentLoaded.
 */
export function initMobileGate() {
  // 1. Already installed?
  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches;
  if (isStandalone) return;

  // 2. Device detection
  const ua = navigator.userAgent || '';
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  if (!isIOS && !isAndroid) return; // desktop — never show

  // 3. 7-day dismissal cooldown
  const DISMISS_KEY = 'wk_gate_dismissed_at';
  const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
  const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
  if (Date.now() - dismissedAt < COOLDOWN_MS) return;

  // 4. Android native prompt
  const deferredPrompt = window._wkDeferredPrompt || null;
  const isAndroidNative = isAndroid && !!deferredPrompt;

  // 5. Inject styles
  if (!document.getElementById('wk-gate-styles')) {
    const s = document.createElement('style');
    s.id = 'wk-gate-styles';
    s.textContent = `
      @keyframes wk-gate-in {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      @keyframes wk-bounce-arrow {
        0%,100% { transform: translateY(0); }
        50%      { transform: translateY(8px); }
      }
      @keyframes wk-fade-in {
        from { opacity: 0; } to { opacity: 1; }
      }
      #wk-gate-backdrop {
        position:fixed;inset:0;background:rgba(6,10,21,.75);
        backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
        z-index:9998;animation:wk-fade-in .25s ease forwards;
      }
      #wk-gate-modal {
        position:fixed;left:0;right:0;bottom:0;z-index:9999;
        max-width:480px;margin:0 auto;
        background:linear-gradient(160deg,#0d1530 0%,#080e1f 100%);
        border-top:1px solid rgba(201,168,76,.25);
        border-radius:20px 20px 0 0;padding:28px 24px 36px;
        font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif;
        color:#e8e4d9;
        animation:wk-gate-in .45s cubic-bezier(.22,1,.36,1) forwards;
        box-shadow:0 -8px 40px rgba(0,0,0,.6);
      }
      #wk-gate-modal .wk-handle {
        width:36px;height:4px;background:rgba(255,255,255,.15);
        border-radius:2px;margin:0 auto 20px;
      }
      #wk-gate-modal .wk-close {
        position:absolute;top:16px;right:16px;
        background:rgba(255,255,255,.08);border:none;
        color:rgba(255,255,255,.5);width:30px;height:30px;border-radius:50%;
        font-size:16px;cursor:pointer;display:flex;align-items:center;
        justify-content:center;padding:0;transition:background .2s,color .2s;
      }
      #wk-gate-modal .wk-close:hover { background:rgba(255,255,255,.15);color:#fff; }
      #wk-gate-modal .wk-wordmark {
        font-size:11px;letter-spacing:.18em;text-transform:uppercase;
        color:#c9a84c;margin-bottom:8px;font-weight:500;
      }
      #wk-gate-modal .wk-headline {
        font-size:22px;font-weight:700;letter-spacing:-.02em;
        color:#f0ece2;margin-bottom:6px;line-height:1.25;
      }
      #wk-gate-modal .wk-sub {
        font-size:14px;color:rgba(232,228,217,.55);margin-bottom:24px;line-height:1.5;
      }
      #wk-gate-modal .wk-steps {
        display:flex;flex-direction:column;gap:14px;margin-bottom:28px;
      }
      #wk-gate-modal .wk-step {
        display:flex;align-items:center;gap:14px;
      }
      #wk-gate-modal .wk-step-icon {
        width:36px;height:36px;min-width:36px;border-radius:10px;
        background:rgba(201,168,76,.1);display:flex;align-items:center;
        justify-content:center;
      }
      #wk-gate-modal .wk-step-text {
        font-size:14px;color:rgba(232,228,217,.85);line-height:1.4;
      }
      #wk-gate-modal .wk-step-text strong { color:#f0ece2;font-weight:600; }
      #wk-gate-modal .wk-cta {
        width:100%;padding:15px;
        background:linear-gradient(135deg,#c9a84c,#b8943f);
        border:none;border-radius:12px;color:#0d1530;
        font-size:16px;font-weight:700;cursor:pointer;
        transition:opacity .2s,transform .15s;
        -webkit-tap-highlight-color:transparent;
      }
      #wk-gate-modal .wk-cta:active { opacity:.85;transform:scale(.98); }
      #wk-gate-modal .wk-already {
        display:block;text-align:center;margin-top:14px;
        font-size:13px;color:rgba(232,228,217,.35);
        text-decoration:none;cursor:pointer;
        -webkit-tap-highlight-color:transparent;
      }
      #wk-gate-modal .wk-already:hover { color:rgba(232,228,217,.6); }
      #wk-gate-arrow {
        position:fixed;bottom:0;left:50%;transform:translateX(-50%);
        z-index:10000;display:flex;flex-direction:column;align-items:center;
        pointer-events:none;animation:wk-fade-in .4s .5s ease both;
      }
      #wk-gate-arrow .wk-arrow-label {
        background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);
        color:#c9a84c;font-size:11px;letter-spacing:.12em;text-transform:uppercase;
        padding:5px 10px;border-radius:20px;margin-bottom:6px;
        font-family:-apple-system,BlinkMacSystemFont,sans-serif;white-space:nowrap;
      }
      #wk-gate-arrow svg { animation:wk-bounce-arrow 1.4s ease-in-out infinite; }
    `;
    document.head.appendChild(s);
  }

  // 6. Build modal
  const backdrop = document.createElement('div');
  backdrop.id = 'wk-gate-backdrop';

  const modal = document.createElement('div');
  modal.id = 'wk-gate-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Install WANDERKIND');

  if (isIOS) {
    modal.innerHTML = `
      <div class="wk-handle"></div>
      <button class="wk-close" aria-label="Dismiss">&#x2715;</button>
      <div class="wk-wordmark">WANDERKIND</div>
      <div class="wk-headline">Add to your home screen</div>
      <div class="wk-sub">For the full trail experience &#8212; offline maps, fast load, no browser chrome.</div>
      <div class="wk-steps">
        <div class="wk-step">
          <div class="wk-step-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10M6 9l4 4 4-4" stroke="#c9a84c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="3" y="14" width="14" height="3" rx="1.5" fill="#c9a84c" opacity=".3"/>
            </svg>
          </div>
          <div class="wk-step-text">Tap the <strong>Share</strong> button at the bottom of Safari</div>
        </div>
        <div class="wk-step">
          <div class="wk-step-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="3" stroke="#c9a84c" stroke-width="1.6"/>
              <path d="M10 7v6M7 10h6" stroke="#c9a84c" stroke-width="1.7" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="wk-step-text">Scroll down and tap <strong>&#8220;Add to Home Screen&#8221;</strong></div>
        </div>
        <div class="wk-step">
          <div class="wk-step-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4.5 4.5L16 6" stroke="#c9a84c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="wk-step-text">Tap <strong>&#8220;Add&#8221;</strong> in the top-right corner</div>
        </div>
      </div>
      <a class="wk-already" tabindex="0">Already added? Open the app &#8594;</a>
    `;
  } else if (isAndroidNative) {
    modal.innerHTML = `
      <div class="wk-handle"></div>
      <button class="wk-close" aria-label="Dismiss">&#x2715;</button>
      <div class="wk-wordmark">WANDERKIND</div>
      <div class="wk-headline">Install the app</div>
      <div class="wk-sub">Add WANDERKIND to your home screen for the full offline trail experience.</div>
      <button class="wk-cta" id="wk-install-btn">Add to Home Screen</button>
      <a class="wk-already" tabindex="0">Maybe later</a>
    `;
  } else {
    modal.innerHTML = `
      <div class="wk-handle"></div>
      <button class="wk-close" aria-label="Dismiss">&#x2715;</button>
      <div class="wk-wordmark">WANDERKIND</div>
      <div class="wk-headline">Add to your home screen</div>
      <div class="wk-sub">Get the full app experience &#8212; fast, offline-ready, no browser bar.</div>
      <div class="wk-steps">
        <div class="wk-step">
          <div class="wk-step-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="4.5" r="1.2" fill="#c9a84c"/>
              <circle cx="10" cy="10" r="1.2" fill="#c9a84c"/>
              <circle cx="10" cy="15.5" r="1.2" fill="#c9a84c"/>
            </svg>
          </div>
          <div class="wk-step-text">Tap the <strong>&#8942; Menu</strong> button in your browser</div>
        </div>
        <div class="wk-step">
          <div class="wk-step-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="3" stroke="#c9a84c" stroke-width="1.6"/>
              <path d="M10 7v6M7 10h6" stroke="#c9a84c" stroke-width="1.7" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="wk-step-text">Tap <strong>&#8220;Add to home screen&#8221;</strong></div>
        </div>
        <div class="wk-step">
          <div class="wk-step-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4.5 4.5L16 6" stroke="#c9a84c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="wk-step-text">Tap <strong>&#8220;Add&#8221;</strong> to confirm</div>
        </div>
      </div>
      <a class="wk-already" tabindex="0">Already added? Open the app &#8594;</a>
    `;
  }

  document.body.appendChild(backdrop);
  document.body.appendChild(modal);

  // 7. iOS bouncing arrow pointing at Safari share button
  if (isIOS) {
    const arrow = document.createElement('div');
    arrow.id = 'wk-gate-arrow';
    arrow.innerHTML = `
      <div class="wk-arrow-label">Tap Share below</div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 14l7 7 7-7" stroke="#c9a84c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    document.body.appendChild(arrow);
  }

  // 8. Events
  function dismiss(save = true) {
    if (save) localStorage.setItem(DISMISS_KEY, String(Date.now()));
    backdrop.remove();
    modal.remove();
    document.getElementById('wk-gate-arrow')?.remove();
  }

  modal.querySelector('.wk-close')?.addEventListener('click', () => dismiss(true));
  backdrop.addEventListener('click', () => dismiss(true));
  modal.querySelector('.wk-already')?.addEventListener('click', () => dismiss(true));

  if (isAndroidNative) {
    document.getElementById('wk-install-btn')?.addEventListener('click', async () => {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        window._wkDeferredPrompt = null;
        dismiss(outcome === 'accepted');
      } catch { dismiss(false); }
    });
  }

  window.addEventListener('appinstalled', () => dismiss(false), { once: true });

  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') { dismiss(true); document.removeEventListener('keydown', onKey); }
  });
}
