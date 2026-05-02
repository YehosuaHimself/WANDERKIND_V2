import { navigate } from '../lib/router.js';
import { toastError } from '../lib/toast.js';

export default async function render() {
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#000;';
  let stream = null;

  el.innerHTML = `
    <div style="position:relative;z-index:10;display:flex;align-items:center;padding:14px 16px;background:rgba(0,0,0,0.7);">
      <button id="back" style="background:none;border:none;cursor:pointer;color:#fff;font-size:24px;padding:4px;display:flex;"><i class="ph ph-x"></i></button>
      <span style="font-family:var(--font-mono);font-size:13px;font-weight:700;letter-spacing:2px;color:#fff;margin-left:14px;">SCAN QR CODE</span>
    </div>

    <div style="flex:1;position:relative;display:flex;align-items:center;justify-content:center;">
      <video id="scanner-video" autoplay playsinline muted style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></video>

      <!-- Viewfinder overlay -->
      <div style="position:relative;z-index:5;pointer-events:none;">
        <div style="width:240px;height:240px;position:relative;">
          <!-- corners -->
          <div style="position:absolute;top:0;left:0;width:32px;height:32px;border-top:3px solid var(--amber);border-left:3px solid var(--amber);border-radius:4px 0 0 0;"></div>
          <div style="position:absolute;top:0;right:0;width:32px;height:32px;border-top:3px solid var(--amber);border-right:3px solid var(--amber);border-radius:0 4px 0 0;"></div>
          <div style="position:absolute;bottom:0;left:0;width:32px;height:32px;border-bottom:3px solid var(--amber);border-left:3px solid var(--amber);border-radius:0 0 0 4px;"></div>
          <div style="position:absolute;bottom:0;right:0;width:32px;height:32px;border-bottom:3px solid var(--amber);border-right:3px solid var(--amber);border-radius:0 0 4px 0;"></div>
          <!-- scan line -->
          <div id="scan-line" style="position:absolute;left:8px;right:8px;height:2px;background:linear-gradient(to right,transparent,var(--amber),transparent);animation:scanLine 2s ease-in-out infinite;top:50%;"></div>
        </div>
        <div style="text-align:center;margin-top:20px;font-family:var(--font-mono);font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.7);">POINT AT A WANDERKIND QR CODE</div>
      </div>
    </div>

    <div id="cam-error" style="display:none;position:absolute;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;text-align:center;">
      <i class="ph ph-camera-slash" style="font-size:48px;color:var(--ink3);"></i>
      <p style="font-size:15px;color:var(--ink2);">Camera access is required to scan QR codes.</p>
      <button class="wk-btn secondary" style="width:auto;padding:12px 24px;" id="retry-btn">TRY AGAIN</button>
    </div>

    <style>@keyframes scanLine { 0%,100%{top:10%;} 50%{top:85%;} }</style>
  `;

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width:{ ideal:1280 }, height:{ ideal:720 } } });
      const video = el.querySelector('#scanner-video');
      video.srcObject = stream;
      el.querySelector('#cam-error').style.display = 'none';

      // Use BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        const detector = new BarcodeDetector({ formats: ['qr_code'] });
        const scanInterval = setInterval(async () => {
          if (!video.videoWidth) return;
          try {
            const barcodes = await detector.detect(video);
            if (barcodes.length) {
              clearInterval(scanInterval);
              const raw = barcodes[0].rawValue;
              stopCamera();
              handleQR(raw);
            }
          } catch(e) {}
        }, 400);
        el._scanInterval = scanInterval;
      }
    } catch(e) {
      el.querySelector('#cam-error').style.display = 'flex';
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach(t => t.stop());
    if (el._scanInterval) clearInterval(el._scanInterval);
  }

  function handleQR(raw) {
    // WANDERKIND QR codes encode either a profile ID or a WK-XXXX code
    if (raw.includes('wanderkind.love') || raw.startsWith('WK-') || raw.match(/^[0-9a-f-]{36}$/)) {
      const id = raw.replace(/.*\//, '').replace('WK-', '');
      navigate(`me/profile/${id}`);
    } else {
      toastError('Not a WANDERKIND QR code');
      startCamera();
    }
  }

  el.querySelector('#back').addEventListener('click', () => { stopCamera(); history.back(); });
  el.querySelector('#retry-btn').addEventListener('click', () => startCamera());

  startCamera();

  // cleanup on route change
  el._cleanup = stopCamera;
  return el;
}
