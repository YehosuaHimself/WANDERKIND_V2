import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  el.style.cssText = 'min-height:100%;';

  const { data: p } = await supabase.from('profiles').select('trail_name,wanderkind_id,tier').eq('id', user.id).single();
  const name = p?.trail_name || 'Wanderer';
  const wkId = p?.wanderkind_id || ('WK-' + user.id.slice(0,6).toUpperCase());
  const profileUrl = `https://wanderkind.love/#me/profile/${user.id}`;
  const qrUrl = `https://chart.googleapis.com/chart?chs=160x160&cht=qr&chl=${encodeURIComponent(profileUrl)}&choe=UTF-8&chld=M|2`;

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>HOSPITALITY PASS</h1>
    </div>
    <div style="padding:24px 24px 40px;display:flex;flex-direction:column;align-items:center;gap:20px;">
      <!-- Pass card -->
      <div style="width:100%;max-width:320px;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(26,18,10,0.12);">
        <div style="background:#8B1A2B;padding:20px 22px;display:flex;align-items:center;gap:16px;">
          <div style="width:52px;height:52px;border-radius:26px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;">
            <i class="ph ph-house-line" style="font-size:26px;color:#fff;"></i>
          </div>
          <div>
            <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2.5px;color:rgba(255,255,255,0.75);">WANDERKIND</div>
            <div style="font-size:17px;font-weight:900;color:#fff;margin-top:2px;">HOSPITALITY PASS</div>
          </div>
        </div>
        <div style="background:var(--surface);padding:20px 22px;display:flex;align-items:center;gap:16px;">
          <img src="${qrUrl}" style="width:80px;height:80px;border-radius:8px;flex-shrink:0;" onerror="this.style.display='none'" />
          <div>
            <div style="font-size:16px;font-weight:800;color:var(--ink);">${name}</div>
            <div style="font-family:var(--font-mono);font-size:11px;color:#8B1A2B;letter-spacing:1.5px;margin-top:4px;">${wkId}</div>
          </div>
        </div>
        <div style="background:#8B1A2B12;padding:14px 22px;border-top:1px solid #8B1A2B22;">
          <div style="font-size:12px;color:var(--ink2);line-height:1.6;">Beds, floors, gardens — open doors along the way</div>
        </div>
      </div>
      <div class="wk-card" style="width:100%;max-width:320px;">
        <div class="h-label" style="margin-bottom:8px;">HOW TO USE</div>
        <p style="font-size:13px;color:var(--ink2);line-height:1.7;margin:0;">Verified access to WANDERHOST homes. Present this pass when arriving at a host's door.</p>
      </div>
    </div>
  `;

  el.querySelector('#back').addEventListener('click', () => history.back());
  return el;
}
