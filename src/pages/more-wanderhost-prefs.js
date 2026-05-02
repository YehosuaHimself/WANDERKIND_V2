import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { toastSuccess } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  const { data: p } = await supabase.from('profiles').select('max_guests,accept_dogs,accept_smokers,min_tier').eq('id', user.id).single();

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>HOST PREFERENCES</h1>
    </div>
    <div style="padding:20px 24px 40px;display:flex;flex-direction:column;gap:14px;">
      <div class="wk-card" style="display:flex;flex-direction:column;gap:14px;">
        <div class="h-label">CAPACITY</div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:14px;color:var(--ink);">Max guests per night</span>
          <select class="wk-input" id="max-guests" style="width:80px;padding:8px 12px;">
            ${[1,2,3,4,5,6,8,10].map(n=>`<option value="${n}"${p?.max_guests===n?' selected':''}>${n}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:14px;color:var(--ink);">Minimum tier required</span>
          <select class="wk-input" id="min-tier" style="width:130px;padding:8px 12px;">
            ${['wanderkind','wandersmann','apostel','meister'].map(t=>`<option value="${t}"${p?.min_tier===t?' selected':''}>${t.toUpperCase()}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="wk-card" style="display:flex;flex-direction:column;gap:14px;">
        <div class="h-label">HOUSE RULES</div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:14px;color:var(--ink);">Allow dogs</span>
          <label class="wk-toggle">
            <input type="checkbox" id="dogs" ${p?.accept_dogs?'checked':''}/>
            <div class="wk-toggle-track"></div><div class="wk-toggle-thumb"></div>
          </label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:14px;color:var(--ink);">Allow smoking</span>
          <label class="wk-toggle">
            <input type="checkbox" id="smokers" ${p?.accept_smokers?'checked':''}/>
            <div class="wk-toggle-track"></div><div class="wk-toggle-thumb"></div>
          </label>
        </div>
      </div>
      <button class="wk-btn primary" id="save">SAVE PREFERENCES</button>
    </div>`;

  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#save').addEventListener('click', async () => {
    await supabase.from('profiles').update({
      max_guests: +el.querySelector('#max-guests').value,
      min_tier: el.querySelector('#min-tier').value,
      accept_dogs: el.querySelector('#dogs').checked,
      accept_smokers: el.querySelector('#smokers').checked,
    }).eq('id', user.id);
    toastSuccess('Preferences saved');
  });
  return el;
}
