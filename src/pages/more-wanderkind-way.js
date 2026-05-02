import { navigate } from '../lib/router.js';

const TIERS = [
  { name:'WANDERKIND',   nights:0,    color:'#9B8E7E', desc:'You stepped onto the road. The journey begins.' },
  { name:'WUNDERKIND',   nights:7,    color:'#9B8E7E', desc:'A week of mornings waking in unknown places.' },
  { name:'WANDERSMANN',  nights:30,   color:'#C8762A', desc:'A month on the road. The world has changed its shape.' },
  { name:'EHRENMANN',    nights:60,   color:'#C8762A', desc:'Trusted by strangers. That says everything.' },
  { name:'PILGER',       nights:100,  color:'#C8762A', desc:'One hundred nights. You are not the same person who started.' },
  { name:'APOSTEL',      nights:180,  color:'#D4A017', desc:'Half a year of motion. The road is no longer foreign.' },
  { name:'LEHRER',       nights:270,  color:'#D4A017', desc:'You teach by example. Others walk better for knowing you.' },
  { name:'MEISTER',      nights:365,  color:'#B8860B', desc:'A full year on the road. Rare. Real. Earned.' },
  { name:'GROSSMEISTER', nights:500,  color:'#B8860B', desc:'Five hundred nights. The road knows your step.' },
  { name:'LEGENDE',      nights:750,  color:'#27864A', desc:'Stories are told of you at waypoints and host tables.' },
  { name:'KÖNIG',        nights:1000, color:'#27864A', desc:'A thousand nights. You are the way.' },
];

export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>THE WANDERKIND WAY</h1>
    </div>
    <div style="padding:20px 24px 48px;">

      <div style="padding:8px 0 20px;">
        <div class="h-label" style="margin-bottom:8px;">THE PATH</div>
        <p style="font-size:15px;color:var(--ink2);line-height:1.75;">
          There are no shortcuts. The tiers below are earned in nights on the road —
          in real beds, real floors, real weather. Each level opens new trust, new access,
          new community.
        </p>
      </div>

      <!-- Tier timeline -->
      <div style="position:relative;padding-left:28px;">
        <!-- vertical line -->
        <div style="position:absolute;left:7px;top:8px;bottom:8px;width:2px;background:var(--border);border-radius:1px;"></div>

        ${TIERS.map((t,i) => `
          <div style="position:relative;margin-bottom:${i<TIERS.length-1?'24':'0'}px;">
            <!-- dot -->
            <div style="position:absolute;left:-23px;top:4px;width:14px;height:14px;border-radius:7px;background:${t.color};border:2.5px solid var(--bg);box-shadow:0 0 0 2px ${t.color}30;"></div>
            <div>
              <div style="display:flex;align-items:baseline;gap:10px;">
                <span style="font-family:var(--font-mono);font-size:13px;font-weight:800;letter-spacing:1.5px;color:${t.color};">${t.name}</span>
                <span style="font-family:var(--font-mono);font-size:10px;color:var(--ink3);letter-spacing:1px;">${t.nights === 0 ? 'START' : t.nights + ' NIGHTS'}</span>
              </div>
              <p style="font-size:13px;color:var(--ink2);margin-top:4px;line-height:1.6;">${t.desc}</p>
            </div>
          </div>`).join('')}
      </div>

      <div style="margin-top:28px;padding-top:24px;border-top:1px solid var(--border-lt);">
        <div class="h-label" style="margin-bottom:8px;">THE RULES</div>
        ${[
          'Nights are verified by hosts — they must confirm your stay.',
          'Self-reported nights are not counted. The road doesn\'t lie.',
          'Trust can be lost. Serious violations reset your standing.',
          'The journey is the destination. There is no final tier — there is only the next step.',
        ].map((rule,i) => `
          <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px;">
            <div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--amber);flex-shrink:0;padding-top:1px;">${String(i+1).padStart(2,'0')}</div>
            <p style="font-size:13px;color:var(--ink2);line-height:1.65;margin:0;">${rule}</p>
          </div>`).join('')}
      </div>

      <button class="wk-btn secondary" style="margin-top:20px;" id="my-journey">
        <i class="ph ph-path"></i> VIEW MY JOURNEY
      </button>
    </div>
  `;
  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#my-journey').addEventListener('click', () => navigate('me/journey'));
  return el;
}
