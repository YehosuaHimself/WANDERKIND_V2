/**
 * Mobile Install Gate
 * Shown when user opens wanderkind.love on mobile browser (not installed PWA).
 * Blocks app access until installed.
 */
export function renderMobileGate() {
  // Hide the app shell entirely
  const app = document.getElementById('app');
  if (app) app.style.display = 'none';

  const gate = document.createElement('div');
  gate.id = 'mobile-gate';
  gate.style.cssText = `
    position:fixed;inset:0;
    background:#F5F0E8;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    overflow-y:auto;
    -webkit-overflow-scrolling:touch;
    z-index:9999;
  `;

  gate.innerHTML = `
    <div style="max-width:420px;margin:0 auto;padding:48px 24px 40px;min-height:100vh;display:flex;flex-direction:column;align-items:center;">

      <!-- Icon -->
      <div style="width:80px;height:80px;border-radius:20px;background:#2C2C2C;display:flex;align-items:center;justify-content:center;margin-bottom:20px;box-shadow:0 4px 24px rgba(0,0,0,0.18);">
        <img src="/icons/icon-192.png" alt="WANDERKIND" style="width:80px;height:80px;border-radius:20px;" onerror="this.style.display='none';this.parentNode.innerHTML='<span style=&quot;font-size:36px;&quot;>🥾</span>';" />
      </div>

      <!-- Label -->
      <div style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:3px;color:#C8762A;margin-bottom:12px;">WANDERKIND</div>

      <!-- Headline -->
      <h1 style="font-size:28px;font-weight:900;color:#1C1C1C;text-align:center;line-height:1.2;margin:0 0 12px;">
        Walk. Trust. Belong.
      </h1>

      <!-- Subtitle -->
      <p style="font-size:14px;color:#6B6B5A;text-align:center;line-height:1.6;margin:0 0 32px;max-width:300px;">
        On mobile, WANDERKIND runs only as an installed app — quiet, full-screen, always within reach. Add it to your home screen to begin.
      </p>

      <!-- Platform Tab Switcher -->
      <div id="platform-tabs" style="display:flex;background:#E8E2D8;border-radius:12px;padding:3px;width:100%;margin-bottom:24px;">
        <button id="tab-ios" onclick="window._wkTab('ios')" style="flex:1;padding:10px;border:none;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;background:#fff;color:#1C1C1C;box-shadow:0 1px 4px rgba(0,0,0,0.1);">
           iPhone / iPad
        </button>
        <button id="tab-android" onclick="window._wkTab('android')" style="flex:1;padding:10px;border:none;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;background:transparent;color:#9B8E7E;">
          🤖 Android
        </button>
      </div>

      <!-- iOS instructions -->
      <div id="steps-ios" style="width:100%;display:flex;flex-direction:column;gap:12px;">
        ${step(1, '<span style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border:1.5px solid #1C1C1C;border-radius:6px;font-size:13px;font-weight:600;">⬆ Share</span> button at the bottom of Safari.')}
        ${step(2, 'Scroll down and tap <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border:1.5px solid #1C1C1C;border-radius:6px;font-size:13px;font-weight:600;">Add to Home Screen</span>.')}
        ${step(3, 'Tap <span style="padding:3px 10px;border:1.5px solid #1C1C1C;border-radius:6px;font-size:13px;font-weight:600;">Add</span> in the top-right corner. WANDERKIND will appear on your home screen as an app — open it from there.')}
        ${note('On iPhone, this only works in Safari. Chrome / Firefox on iOS can\'t install web apps.')}
      </div>

      <!-- Android instructions -->
      <div id="steps-android" style="width:100%;display:flex;flex-direction:column;gap:12px;display:none;">
        ${step(1, 'Tap the <span style="padding:3px 10px;border:1.5px solid #1C1C1C;border-radius:6px;font-size:13px;font-weight:600;">⋮ Menu</span> in the top right of Chrome (or Edge / Brave).')}
        ${step(2, 'Tap <span style="padding:3px 10px;border:1.5px solid #1C1C1C;border-radius:6px;font-size:13px;font-weight:600;">Install app</span> or <span style="padding:3px 10px;border:1.5px solid #1C1C1C;border-radius:6px;font-size:13px;font-weight:600;">Add to Home screen</span>.')}
        ${step(3, 'Confirm with <span style="padding:3px 10px;border:1.5px solid #1C1C1C;border-radius:6px;font-size:13px;font-weight:600;">Install</span>. WANDERKIND launches like a native app.')}
        ${note('Some Android browsers (Samsung Internet, Firefox) place the option as "Add page to → Home screen".')}
      </div>

      <!-- Already installed -->
      <div style="margin-top:36px;text-align:center;">
        <p style="font-size:13px;color:#9B8E7E;margin-bottom:12px;">Already installed?</p>
        <button id="open-app-btn" style="
          padding:14px 32px;border-radius:12px;
          border:2px solid #1C1C1C;background:transparent;
          font-family:'Courier New',Courier,monospace;
          font-size:12px;font-weight:700;letter-spacing:2px;
          color:#1C1C1C;cursor:pointer;
          transition:all 0.2s;
        ">I'M IN THE APP — OPEN IT</button>
        <p id="open-msg" style="font-size:12px;color:#C0392B;margin-top:10px;display:none;">
          Open WANDERKIND from your home screen, not from the browser.
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top:40px;text-align:center;">
        <p style="font-size:11px;color:#B0A898;line-height:1.6;">
          Created by <strong style="color:#6B6B5A;">YEHOSHUA HIMSELF</strong><br/>
          Walk. Trust. Belong.
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(gate);

  // Auto-detect platform
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  window._wkTab = function(platform) {
    const ios = platform === 'ios';
    document.getElementById('steps-ios').style.display = ios ? 'flex' : 'none';
    document.getElementById('steps-android').style.display = ios ? 'none' : 'flex';
    const tabIos = document.getElementById('tab-ios');
    const tabAndroid = document.getElementById('tab-android');
    tabIos.style.background = ios ? '#fff' : 'transparent';
    tabIos.style.color = ios ? '#1C1C1C' : '#9B8E7E';
    tabIos.style.boxShadow = ios ? '0 1px 4px rgba(0,0,0,0.1)' : 'none';
    tabAndroid.style.background = ios ? 'transparent' : '#fff';
    tabAndroid.style.color = ios ? '#9B8E7E' : '#1C1C1C';
    tabAndroid.style.boxShadow = ios ? 'none' : '0 1px 4px rgba(0,0,0,0.1)';
  };
  window._wkTab(isIOS ? 'ios' : 'android');

  // "I'm in the app" — verify actually standalone, otherwise explain
  document.getElementById('open-app-btn').addEventListener('click', () => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (standalone) {
      // They somehow got here from within the installed app — let them through
      gate.remove();
      document.getElementById('app').style.display = '';
      window.dispatchEvent(new Event('wk-gate-passed'));
    } else {
      document.getElementById('open-msg').style.display = 'block';
    }
  });
}

function step(n, html) {
  return `
    <div style="display:flex;align-items:flex-start;gap:14px;background:#fff;border-radius:14px;padding:16px;">
      <div style="flex-shrink:0;width:32px;height:32px;border-radius:16px;background:#2C2C2C;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:14px;font-weight:700;color:#fff;">${n}</span>
      </div>
      <p style="margin:0;font-size:14px;color:#3C3C2C;line-height:1.55;padding-top:5px;">${html}</p>
    </div>`;
}

function note(text) {
  return `
    <div style="background:#FDF6E8;border:1.5px solid #E8C97A;border-radius:12px;padding:14px 16px;">
      <p style="margin:0;font-size:13px;color:#6B5A2A;line-height:1.55;">
        <strong style="color:#C8762A;">Note:</strong> ${text}
      </p>
    </div>`;
}
