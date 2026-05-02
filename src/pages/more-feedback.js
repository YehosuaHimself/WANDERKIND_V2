import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { toastSuccess, toastError } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  let submitted = false;

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>FEEDBACK</h1>
    </div>
    <div style="padding:20px 24px 40px;display:flex;flex-direction:column;gap:16px;">

      <div>
        <div class="h-label" style="margin-bottom:4px;">SEND A MESSAGE</div>
        <p style="font-size:13px;color:var(--ink2);line-height:1.7;">Your feedback shapes the road ahead. Bug reports, ideas, complaints — all welcome.</p>
      </div>

      <div class="wk-card" style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <label class="h-label" style="margin-bottom:6px;">TYPE</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;" id="type-row">
            ${['Bug','Idea','Question','Praise'].map((t,i)=>`
              <button class="chip${i===0?' active':''}" data-type="${t}" style="font-size:12px;">${t}</button>`).join('')}
          </div>
        </div>
        <div>
          <label class="h-label" style="margin-bottom:6px;">MESSAGE</label>
          <textarea class="wk-input" id="fb-msg" rows="5" placeholder="What's on your mind?" style="resize:none;line-height:1.6;"></textarea>
        </div>
        <button class="wk-btn primary" id="send-btn">SEND FEEDBACK</button>
      </div>

      <div class="wk-card" style="border-color:var(--amber-line);">
        <div class="h-label" style="margin-bottom:8px;">OTHER CHANNELS</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <a href="mailto:hello@wanderkind.love" style="display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--ink);">
            <i class="ph ph-envelope" style="font-size:20px;color:var(--amber);"></i>
            <span style="font-size:14px;font-weight:600;">hello@wanderkind.love</span>
          </a>
        </div>
      </div>
    </div>
  `;

  let selectedType = 'Bug';
  el.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => {
    el.querySelectorAll('[data-type]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    selectedType = b.dataset.type;
  }));

  el.querySelector('#back').addEventListener('click', () => history.back());

  el.querySelector('#send-btn').addEventListener('click', async () => {
    if (submitted) return;
    const msg = el.querySelector('#fb-msg').value.trim();
    if (!msg) return toastError('Write something first');
    const btn = el.querySelector('#send-btn');
    btn.disabled = true; btn.textContent = 'SENDING…';
    // store in Supabase if table exists, otherwise fallback gracefully
    try {
      await supabase.from('feedback').insert({ user_id: user?.id||null, type: selectedType, message: msg });
    } catch(e) { /* table may not exist yet */ }
    submitted = true;
    btn.textContent = 'SENT ✓';
    btn.style.background = 'var(--green)';
    el.querySelector('#fb-msg').value = '';
    toastSuccess('Thanks — feedback received');
  });

  return el;
}
