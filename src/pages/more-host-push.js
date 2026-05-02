import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { toastSuccess, toastError } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');

  const { data: p } = await supabase.from('profiles').select('push_notifications_enabled,push_token').eq('id', user.id).single();
  const enabled = p?.push_notifications_enabled || false;

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>HOST PUSH</h1>
    </div>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:16px;">
      <div class="wk-card" style="border-color:${enabled?'var(--green)':'var(--border-lt)'};">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:48px;height:48px;border-radius:24px;background:${enabled?'var(--green-bg)':'var(--amber-bg)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="ph ph-bell-ringing" style="font-size:24px;color:${enabled?'var(--green)':'var(--amber)'};"></i>
          </div>
          <div style="flex:1;">
            <div style="font-family:var(--font-mono);font-size:12px;font-weight:700;letter-spacing:1.5px;color:${enabled?'var(--green)':'var(--ink)'};">${enabled?'PUSH ACTIVE':'PUSH OFF'}</div>
            <div style="font-size:13px;color:var(--ink2);margin-top:2px;">${enabled?'You\'ll be notified of hosting requests.':'Enable to receive hosting requests instantly.'}</div>
          </div>
          <label class="wk-toggle">
            <input type="checkbox" id="push-toggle" ${enabled?'checked':''} />
            <div class="wk-toggle-track"></div>
            <div class="wk-toggle-thumb"></div>
          </label>
        </div>
      </div>
      <div class="wk-card">
        <div class="h-label" style="margin-bottom:8px;">YOU'LL BE NOTIFIED WHEN</div>
        ${['A wanderer requests to stay with you','A guest sends you a message','Your hosting listing gets a review'].map(t=>`
          <div style="display:flex;align-items:center;gap:10px;padding:6px 0;">
            <i class="ph ph-check-circle" style="font-size:16px;color:var(--green);flex-shrink:0;"></i>
            <span style="font-size:13px;color:var(--ink2);">${t}</span>
          </div>`).join('')}
      </div>
    </div>`;

  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#push-toggle').addEventListener('change', async e => {
    const on = e.target.checked;
    if (on && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { e.target.checked = false; toastError('Permission denied'); return; }
    }
    await supabase.from('profiles').update({ push_notifications_enabled: on }).eq('id', user.id);
    toastSuccess(on ? 'Push notifications enabled' : 'Push notifications off');
  });

  return el;
}
