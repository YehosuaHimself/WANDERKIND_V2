import { navigate } from '../lib/router.js';
export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;justify-content:space-between;padding:var(--sp-3xl) var(--screen-px) var(--sp-2xl);">
      <div>
        <div class="label" style="margin-bottom:var(--sp-lg);">WANDERKIND</div>
        <h1 style="font-family:var(--font-mono);font-size:var(--text-display);font-weight:900;letter-spacing:-1px;line-height:1;color:var(--ink);">Walk.<br/>Trust.<br/>Belong.</h1>
        <p style="margin-top:var(--sp-lg);color:var(--ink2);font-size:var(--text-body);line-height:1.7;max-width:300px;">
          Free shelter, real community, the road as it should be.
        </p>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--sp-sm);">
        <button class="wk-btn primary" id="start-btn">BEGIN YOUR JOURNEY</button>
        <button class="wk-btn ghost" id="signin-btn">I ALREADY WANDER</button>
      </div>
    </div>`;
  el.querySelector('#start-btn').addEventListener('click', () => navigate('auth/trail-name'));
  el.querySelector('#signin-btn').addEventListener('click', () => navigate('auth/signin'));
  return el;
}
