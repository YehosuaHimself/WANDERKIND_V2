import { navigate } from '../lib/router.js';
export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>REQUEST A STAY</h1>
    </div>
    <div style="padding:24px;display:flex;flex-direction:column;gap:16px;">
      <div style="padding:20px 0 8px;">
        <div class="h-label" style="margin-bottom:8px;">FIND A HOST</div>
        <p style="font-size:14px;color:var(--ink2);line-height:1.75;">Reach out directly to hosts in the community. Browse walkers who are currently offering shelter.</p>
      </div>
      <button class="wk-btn primary" id="go-ways"><i class="ph ph-compass"></i> BROWSE ROUTES & HOSTS</button>
      <button class="wk-btn ghost" id="go-msg"><i class="ph ph-chat-circle"></i> OPEN MESSAGES</button>
    </div>`;
  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#go-ways').addEventListener('click', () => navigate('myway'));
  el.querySelector('#go-msg').addEventListener('click', () => navigate('messages'));
  return el;
}
