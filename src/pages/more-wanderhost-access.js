import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { toastSuccess } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  const { data: p } = await supabase.from('profiles').select('require_verification,instant_booking,advance_notice_days').eq('id', user.id).single();

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>ACCESS CONTROL</h1>
    </div>
    <div style="padding:20px 24px 40px;display:flex;flex-direction:column;gap:14px;">
      <div class="wk-card" style="display:flex;flex-direction:column;gap:16px;">
        <div class="h-label">BOOKING</div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);">Instant booking</div>
            <div style="font-size:12px;color:var(--ink3);margin-top:2px;">Walkers can book without prior approval</div>
          </div>
          <label class="wk-toggle">
            <input type="checkbox" id="instant" ${p?.instant_booking?'checked':''}/>
            <div class="wk-toggle-track"></div><div class="wk-toggle-thumb"></div>
          </label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);">Require verification</div>
            <div style="font-size:12px;color:var(--ink3);margin-top:2px;">Only verified walkers can request</div>
          </div>
          <label class="wk-toggle">
            <input type="checkbox" id="verify-req" ${p?.require_verification!==false?'checked':''}/>
            <div class="wk-toggle-track"></div><div class="wk-toggle-thumb"></div>
          </label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:14px;color:var(--ink);">Advance notice (days)</span>
          <select class="wk-input" id="notice" style="width:80px;padding:8px 12px;">
            ${[0,1,2,3,5,7].map(n=>`<option value="${n}"${(p?.advance_notice_days||1)===n?' selected':''}>${n===0?'Same day':n+'d'}</option>`).join('')}
          </select>
        </div>
      </div>
      <button class="wk-btn primary" id="save">SAVE</button>
    </div>`;

  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#save').addEventListener('click', async () => {
    await supabase.from('profiles').update({
      instant_booking: el.querySelector('#instant').checked,
      require_verification: el.querySelector('#verify-req').checked,
      advance_notice_days: +el.querySelector('#notice').value,
    }).eq('id', user.id);
    toastSuccess('Access settings saved');
  });
  return el;
}
