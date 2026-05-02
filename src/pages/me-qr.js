import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { toastSuccess } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  el.style.cssText = 'min-height:100%;';

  const { data: p } = await supabase.from('profiles')
    .select('trail_name,wanderkind_id,avatar_url,tier').eq('id', user.id).single();
  const name  = p?.trail_name || 'Wanderer';
  const wkId  = p?.wanderkind_id || ('WK-' + user.id.slice(0,6).toUpperCase());
  const tier  = (p?.tier || 'wanderkind').toUpperCase();
  const profileUrl = `https://wanderkind.love/#me/profile/${user.id}`;

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>MY QR CODE</h1>
    </div>
    <div style="padding:28px 24px 40px;display:flex;flex-direction:column;align-items:center;gap:24px;">

      <!-- QR card -->
      <div style="width:100%;max-width:320px;background:var(--surface);border:1px solid var(--border-lt);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-lg);">
        <!-- Header strip -->
        <div style="background:var(--amber);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-family:var(--font-mono);font-size:11px;font-weight:800;letter-spacing:3px;color:#fff;">WANDERKIND</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:rgba(255,255,255,0.8);letter-spacing:1.5px;">${tier}</div>
        </div>
        <!-- QR code display -->
        <div style="padding:24px;display:flex;flex-direction:column;align-items:center;gap:16px;">
          <div id="qr-container" style="width:200px;height:200px;background:var(--surface-alt);border-radius:12px;display:flex;align-items:center;justify-content:center;">
            <div class="wk-spinner"></div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:18px;font-weight:800;color:var(--ink);">${name}</div>
            <div style="font-family:var(--font-mono);font-size:12px;color:var(--amber);letter-spacing:2px;margin-top:4px;">${wkId}</div>
          </div>
        </div>
        <!-- Footer -->
        <div style="background:var(--surface-alt);padding:12px 20px;text-align:center;">
          <div style="font-size:11px;color:var(--ink3);">Show this to your host for instant verification</div>
        </div>
      </div>

      <!-- Actions -->
      <div style="width:100%;max-width:320px;display:flex;flex-direction:column;gap:10px;">
        <button class="wk-btn secondary" id="copy-btn"><i class="ph ph-copy"></i> COPY PROFILE LINK</button>
        <button class="wk-btn ghost" id="share-btn"><i class="ph ph-share-network"></i> SHARE</button>
      </div>

      <!-- Explanation -->
      <div class="wk-card" style="width:100%;max-width:320px;">
        <div class="h-label" style="margin-bottom:8px;">HOW IT WORKS</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${[
            ['ph-qr-code', 'Your host scans this code to verify your WANDERKIND identity'],
            ['ph-shield-check', 'Your tier, nights walked, and stamps are instantly visible'],
            ['ph-lock', 'No personal data is shared without your consent'],
          ].map(([icon,text])=>`
            <div style="display:flex;gap:10px;align-items:flex-start;">
              <i class="ph ${icon}" style="font-size:16px;color:var(--amber);flex-shrink:0;margin-top:2px;"></i>
              <span style="font-size:12px;color:var(--ink2);line-height:1.6;">${text}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;

  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#copy-btn').addEventListener('click', () => {
    navigator.clipboard?.writeText(profileUrl).then(() => toastSuccess('Profile link copied'));
  });
  el.querySelector('#share-btn').addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: `${name} on WANDERKIND`, url: profileUrl });
    } else {
      navigator.clipboard?.writeText(profileUrl).then(() => toastSuccess('Link copied'));
    }
  });

  // Generate QR code using Google Charts API (no library needed)
  const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(profileUrl)}&choe=UTF-8&chld=M|2`;
  const img = document.createElement('img');
  img.src = qrUrl;
  img.style.cssText = 'width:200px;height:200px;border-radius:8px;';
  img.onload = () => { el.querySelector('#qr-container').innerHTML = ''; el.querySelector('#qr-container').appendChild(img); };
  img.onerror = () => {
    el.querySelector('#qr-container').innerHTML = `
      <div style="text-align:center;padding:16px;">
        <i class="ph ph-qr-code" style="font-size:48px;color:var(--amber);"></i>
        <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:1.5px;color:var(--ink3);margin-top:8px;">${wkId}</div>
      </div>`;
  };

  return el;
}
