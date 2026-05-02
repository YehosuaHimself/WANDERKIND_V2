import { navigate } from '../lib/router.js';
const PASSES = [
  { key:'wanderkind', label:'WANDERKIND PASS', color:'#C8762A', desc:'The core pass — shelter, community, trust.' },
  { key:'food',       label:'FOOD PASS',        color:'#27864A', desc:'Meals shared on the road.' },
  { key:'hospitality',label:'HOSPITALITY PASS', color:'#8B1A2B', desc:'Beds, floors, and open doors.' },
  { key:'water',      label:'WATER PASS',        color:'#4CA8C9', desc:'Fresh water at every waypoint.' },
];
export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>MY PASSES</h1>
    </div>
    <div style="padding:var(--screen-px);display:flex;flex-direction:column;gap:var(--sp-md);">
      ${PASSES.map(p => `
        <div class="wk-card" data-pass="${p.key}" style="cursor:pointer;border-left:4px solid ${p.color};">
          <div style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:700;letter-spacing:2px;color:${p.color};">${p.label}</div>
          <div style="font-size:var(--text-sm);color:var(--ink2);margin-top:4px;">${p.desc}</div>
        </div>`).join('')}
    </div>`;
  el.querySelector('#back').addEventListener('click', () => navigate('me'));
  el.querySelectorAll('[data-pass]').forEach(c => c.addEventListener('click', () => navigate(`me/pass/${c.dataset.pass}`)));
  return el;
}
