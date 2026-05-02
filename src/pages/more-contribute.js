import { navigate } from '../lib/router.js';
export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>CONTRIBUTE</h1>
    </div>
    <div style="padding:20px 24px 40px;display:flex;flex-direction:column;gap:20px;">

      <div>
        <div class="h-label" style="margin-bottom:4px;">BUILD THE ROAD</div>
        <p style="font-size:14px;color:var(--ink2);line-height:1.75;">WANDERKIND grows through the people who walk it. There are many ways to contribute.</p>
      </div>

      ${[
        { icon:'ph-map-trifold', accent:'#C8762A', title:'ADD A ROUTE', body:'Know a trail that deserves more walkers? Document it in MY WAY and share it with the community.' },
        { icon:'ph-house-line', accent:'#27864A', title:'BECOME A HOST', body:'Open your door to a verified wanderer. Start in YOUR OFFERING in the menu above.' },
        { icon:'ph-stamp', accent:'#6B21A8', title:'CREATE A STAMP', body:'Running an event or a waypoint? Create a custom stamp for walkers who pass through.' },
        { icon:'ph-code', accent:'#2E6DA4', title:'CONTRIBUTE CODE', body:'WANDERKIND is open source. Pull requests, bug reports, and feature suggestions welcome on GitHub.' },
        { icon:'ph-megaphone', accent:'#E67E22', title:'SPREAD THE WORD', body:'Share your journey. Every walker who joins the road makes the network stronger.' },
      ].map(c=>`
        <div class="wk-card" style="border-left:4px solid ${c.accent}20;border-color:${c.accent}25;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <div style="width:36px;height:36px;border-radius:18px;background:${c.accent}14;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="ph ${c.icon}" style="font-size:18px;color:${c.accent};"></i>
            </div>
            <div style="font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:1.5px;color:${c.accent};">${c.title}</div>
          </div>
          <p style="font-size:13px;color:var(--ink2);line-height:1.65;margin:0;">${c.body}</p>
        </div>`).join('')}

      <div style="text-align:center;padding-top:8px;">
        <a href="mailto:hello@wanderkind.love" style="color:var(--amber);font-size:13px;font-weight:600;">hello@wanderkind.love</a>
      </div>
    </div>
  `;
  el.querySelector('#back').addEventListener('click', () => history.back());
  return el;
}
