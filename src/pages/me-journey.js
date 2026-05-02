import { navigate } from '../lib/router.js';

const TIERS = [
  { name:'WANDERKIND',    nights: 0,   desc:'Every journey starts with a single step.' },
  { name:'WUNDERKIND',    nights: 7,   desc:'A week on the road — you felt it.' },
  { name:'WANDERSMANN',   nights: 30,  desc:'A month of mornings in strange places.' },
  { name:'EHRENMANN',     nights: 60,  desc:'Trusted by those you never knew.' },
  { name:'PILGER',        nights: 100, desc:'The road is no longer strange.' },
  { name:'APOSTEL',       nights: 180, desc:'You carry the way in your body.' },
  { name:'LEHRER',        nights: 270, desc:'Others walk better because of you.' },
  { name:'MEISTER',       nights: 365, desc:'A year of nights. A life changed.' },
  { name:'GROSSMEISTER',  nights: 500, desc:'The road knows your name.' },
  { name:'LEGENDE',       nights: 750, desc:'Stories are told of you at hostels.' },
  { name:'KÖNIG',         nights: 1000,desc:'You are the way.' },
];

export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back-btn"><i class="ph ph-arrow-left"></i></button>
      <h1>YOUR JOURNEY</h1>
    </div>
    <div style="padding:var(--screen-px);">
      <div class="wk-card" style="margin-bottom:var(--sp-lg);border-color:var(--gold-border);background:var(--gold-bg);">
        <div class="h-label">The Way</div>
        <p style="font-size:var(--text-sm);color:var(--ink2);line-height:1.7;">
          Your journey is measured in nights — nights you walked, slept in a stranger's home,
          or trusted the road. Each tier is earned through presence, not payment.
        </p>
      </div>

      <div class="h-label">11 Tiers of Mastery</div>
      <div style="display:flex;flex-direction:column;gap:var(--sp-sm);">
        ${TIERS.map((t, i) => `
          <div style="display:flex;gap:var(--sp-md);align-items:flex-start;padding:var(--sp-md);
            background:var(--surface);border:1px solid var(--border-lt);border-radius:var(--r-md);">
            <div style="width:32px;height:32px;border-radius:16px;background:var(--amber-bg);
              border:1px solid var(--border-dark);display:flex;align-items:center;justify-content:center;
              font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--amber);flex-shrink:0;">${i+1}</div>
            <div>
              <div style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:700;letter-spacing:1.5px;color:var(--ink);">${t.name}</div>
              <div style="font-size:var(--text-caption);color:var(--amber);font-family:var(--font-mono);margin:2px 0;">${t.nights}+ nights</div>
              <div style="font-size:var(--text-caption);color:var(--ink3);">${t.desc}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;

  el.querySelector('#back-btn').addEventListener('click', () => navigate('me'));
  return el;
}
