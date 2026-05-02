import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';

const TIER_COLORS={wanderkind:'#9B8E7E',wunderkind:'#9B8E7E',wandersmann:'#C8762A',ehrenmann:'#C8762A',pilger:'#C8762A',apostel:'#D4A017',lehrer:'#D4A017',meister:'#B8860B',grossmeister:'#B8860B',legende:'#27864A',koenig:'#27864A'};
const TIER_NEXT={wanderkind:'wandersmann',wunderkind:'wandersmann',wandersmann:'apostel',ehrenmann:'apostel',pilger:'apostel',apostel:'lehrer',lehrer:'meister',meister:'legende',legende:'koenig'};
const TIER_NIGHTS={wanderkind:0,wandersmann:30,apostel:180,lehrer:270,meister:365,legende:750,koenig:1000};

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  el.style.cssText = 'min-height:100%;';

  const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const name  = p?.trail_name || 'Wanderer';
  const tier  = p?.tier || 'wanderkind';
  const tc    = TIER_COLORS[tier] || '#9B8E7E';
  const wkId  = p?.wanderkind_id || ('WK-' + user.id.slice(0,6).toUpperCase());
  const nights = p?.night_count || 0;
  const stamps = p?.stamps_count || 0;
  const hosted = p?.hosted_count || 0;
  const nextTier = TIER_NEXT[tier];
  const nextNights = nextTier ? TIER_NIGHTS[nextTier] : null;
  const progress = nextNights ? Math.min(100, Math.round((nights / nextNights) * 100)) : 100;
  const profileUrl = `https://wanderkind.love/#me/profile/${user.id}`;
  const qrUrl = `https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=${encodeURIComponent(profileUrl)}&choe=UTF-8&chld=M|2`;

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>WANDERKIND PASS</h1>
    </div>
    <div style="padding:20px 24px 40px;display:flex;flex-direction:column;align-items:center;gap:20px;">

      <!-- The Pass -->
      <div style="width:100%;max-width:340px;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(26,18,10,0.14);">
        <!-- Top band -->
        <div style="background:${tc};padding:18px 22px 14px;display:flex;align-items:flex-start;justify-content:space-between;">
          <div>
            <div style="font-family:var(--font-mono);font-size:10px;font-weight:800;letter-spacing:3px;color:rgba(255,255,255,0.7);">WANDERKIND</div>
            <div style="font-size:22px;font-weight:900;color:#fff;margin-top:4px;letter-spacing:-0.3px;">${name}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.7);">TIER</div>
            <div style="font-family:var(--font-mono);font-size:13px;font-weight:800;color:#fff;margin-top:2px;">${tier.toUpperCase()}</div>
          </div>
        </div>
        <!-- Body -->
        <div style="background:var(--surface);padding:18px 22px;">
          <div style="display:flex;align-items:center;gap:18px;">
            <!-- QR -->
            <img src="${qrUrl}" style="width:80px;height:80px;border-radius:8px;flex-shrink:0;" onerror="this.style.display='none'" />
            <!-- Stats -->
            <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div><div style="font-family:var(--font-mono);font-size:18px;font-weight:800;color:var(--ink);">${nights}</div><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:1.5px;color:var(--ink3);">NIGHTS</div></div>
              <div><div style="font-family:var(--font-mono);font-size:18px;font-weight:800;color:var(--ink);">${stamps}</div><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:1.5px;color:var(--ink3);">STAMPS</div></div>
              <div><div style="font-family:var(--font-mono);font-size:18px;font-weight:800;color:var(--ink);">${hosted}</div><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:1.5px;color:var(--ink3);">HOSTED</div></div>
              <div><div style="font-family:var(--font-mono);font-size:12px;font-weight:800;color:${tc};">${wkId}</div><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:1.5px;color:var(--ink3);">ID</div></div>
            </div>
          </div>
        </div>
        <!-- Footer -->
        <div style="background:var(--surface-alt);padding:12px 22px;border-top:1px solid var(--border-lt);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:11px;color:var(--ink3);">wanderkind.love</div>
            <div style="font-size:11px;color:var(--ink3);font-family:var(--font-mono);">${new Date().getFullYear()}</div>
          </div>
        </div>
      </div>

      <!-- Progress to next tier -->
      ${nextTier ? `
      <div style="width:100%;max-width:340px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--ink3);">PROGRESS</div>
          <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:${tc};">${nights}/${nextNights} NIGHTS → ${nextTier.toUpperCase()}</div>
        </div>
        <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${progress}%;background:${tc};border-radius:3px;transition:width 0.6s ease;"></div>
        </div>
      </div>` : `
      <div style="text-align:center;font-family:var(--font-mono);font-size:11px;letter-spacing:2px;color:${tc};">MAXIMUM TIER REACHED</div>`}

      <!-- Actions -->
      <div style="width:100%;max-width:340px;display:flex;flex-direction:column;gap:10px;">
        <button class="wk-btn secondary" id="share-pass"><i class="ph ph-share-network"></i> SHARE PASS</button>
      </div>
    </div>
  `;

  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#share-pass').addEventListener('click', () => {
    if (navigator.share) navigator.share({ title:`${name} · WANDERKIND ${tier.toUpperCase()}`, url: profileUrl });
    else navigator.clipboard?.writeText(profileUrl);
  });

  return el;
}
