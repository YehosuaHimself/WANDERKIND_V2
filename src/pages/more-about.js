import { navigate } from '../lib/router.js';
export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>ABOUT WANDERKIND</h1>
    </div>
    <div style="padding:20px 24px 40px;display:flex;flex-direction:column;gap:20px;">

      <div style="padding:28px 0 4px;">
        <div class="h-label">MANIFESTO</div>
        <h2 style="font-family:var(--font-mono);font-size:26px;font-weight:900;line-height:1.15;letter-spacing:-0.5px;color:var(--ink);margin-top:10px;">Walk.<br/>Trust.<br/>Belong.</h2>
        <p style="font-size:15px;color:var(--ink2);margin-top:14px;line-height:1.75;">
          WANDERKIND is a movement for long-distance walkers who believe the road offers more than just miles — it offers community, shelter, and a different kind of belonging.
        </p>
      </div>

      <div class="wk-card" style="border-color:var(--amber-line);">
        <div class="h-label" style="margin-bottom:10px;">THE WAY</div>
        <p style="font-size:14px;color:var(--ink2);line-height:1.7;">From complete stranger to LEGENDE — eleven tiers of trust, earned step by step on the road. Nights hosted, borders crossed, stamps collected. Your walk writes your standing.</p>
      </div>

      <div class="wk-card">
        <div class="h-label" style="margin-bottom:10px;">WANDERHOST</div>
        <p style="font-size:14px;color:var(--ink2);line-height:1.7;">Hosts open their homes, gardens, and floors to verified walkers. No money changes hands. The only currency is trust built on the road.</p>
      </div>

      <div class="wk-card">
        <div class="h-label" style="margin-bottom:10px;">STAMPS & PASSES</div>
        <p style="font-size:14px;color:var(--ink2);line-height:1.7;">Collect stamps as you move through the world — place stamps, event stamps, community stamps. Your passport of the road.</p>
      </div>

      <div style="border-top:1px solid var(--border-lt);padding-top:20px;">
        <div class="row-list" style="border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
          ${[
            ['ph-envelope','Contact & Feedback','more/feedback'],
            ['ph-file-text','Legal & Imprint','more/legal/imprint'],
            ['ph-shield','Privacy Policy','more/legal/privacy-policy'],
            ['ph-scroll','Terms of Service','more/legal/terms'],
            ['ph-hand-heart','Contribute','more/contribute'],
          ].map(([icon,label,route])=>`
            <div class="row-item" data-r="${route}">
              <i class="ph ${icon}" style="font-size:20px;color:var(--ink3);width:24px;flex-shrink:0;"></i>
              <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;letter-spacing:1.5px;">${label}</span>
              <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
            </div>`).join('')}
        </div>
      </div>

      <div style="text-align:center;padding-top:8px;">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--ink3);">WANDERKIND · THE ROAD IS YOUR HOME</div>
      </div>
    </div>
  `;
  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelectorAll('[data-r]').forEach(r => r.addEventListener('click', () => navigate(r.dataset.r)));
  return el;
}
