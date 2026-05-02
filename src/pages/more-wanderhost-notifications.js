import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { toastSuccess } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  const { data: p } = await supabase.from('profiles').select('notify_new_request,notify_messages,notify_reviews').eq('id', user.id).single();

  const opts = [
    ['notify_new_request', 'New hosting requests', 'When a walker requests to stay'],
    ['notify_messages',    'New messages',          'Direct messages from walkers or hosts'],
    ['notify_reviews',     'Reviews & ratings',     'When someone leaves you a review'],
  ];

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>HOST NOTIFICATIONS</h1>
    </div>
    <div style="padding:20px 24px 40px;display:flex;flex-direction:column;gap:14px;">
      <div class="wk-card" style="display:flex;flex-direction:column;gap:16px;">
        <div class="h-label">NOTIFY ME WHEN</div>
        ${opts.map(([key,label,sub])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:14px;font-weight:600;color:var(--ink);">${label}</div>
              <div style="font-size:12px;color:var(--ink3);margin-top:2px;">${sub}</div>
            </div>
            <label class="wk-toggle">
              <input type="checkbox" id="${key}" ${p?.[key]!==false?'checked':''}/>
              <div class="wk-toggle-track"></div><div class="wk-toggle-thumb"></div>
            </label>
          </div>`).join('')}
      </div>
      <button class="wk-btn primary" id="save">SAVE</button>
    </div>`;

  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#save').addEventListener('click', async () => {
    const update = {};
    opts.forEach(([key]) => { update[key] = el.querySelector(`#${key}`).checked; });
    await supabase.from('profiles').update(update).eq('id', user.id);
    toastSuccess('Notification settings saved');
  });
  return el;
}
