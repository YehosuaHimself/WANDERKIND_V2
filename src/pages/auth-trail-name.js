import { navigate } from '../lib/router.js';
export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:var(--screen-px);">
      <div style="margin-bottom:var(--sp-2xl);">
        <div class="label" style="margin-bottom:var(--sp-sm);">1 OF 4</div>
        <h1 style="font-family:var(--font-mono);font-size:var(--text-h1);font-weight:900;color:var(--ink);">What shall we call you on the road?</h1>
        <p style="color:var(--ink3);margin-top:var(--sp-sm);">Your trail name. Not your real name — your road name.</p>
      </div>
      <div class="wk-card" style="display:flex;flex-direction:column;gap:var(--sp-md);">
        <div>
          <label class="h-label">Trail Name</label>
          <input class="wk-input" id="trail-name" type="text" placeholder="e.g. Pilgrim, Dusty, Wanderer…" autocomplete="off" />
        </div>
        <button class="wk-btn primary" id="next-btn">CONTINUE</button>
      </div>
    </div>`;
  el.querySelector('#next-btn').addEventListener('click', () => {
    const name = el.querySelector('#trail-name').value.trim();
    if (!name) return;
    sessionStorage.setItem('wk_trail_name', name);
    navigate('auth/role-select');
  });
  return el;
}
