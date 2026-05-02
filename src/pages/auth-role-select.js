import { navigate } from '../lib/router.js';
export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:var(--screen-px);">
      <div style="margin-bottom:var(--sp-2xl);">
        <div class="label" style="margin-bottom:var(--sp-sm);">2 OF 4</div>
        <h1 style="font-family:var(--font-mono);font-size:var(--text-h2);font-weight:900;color:var(--ink);">How do you walk?</h1>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--sp-sm);">
        ${[
          { key:'wanderer', label:'WANDERER', desc:'I walk, I trust, I receive.' },
          { key:'host',     label:'HOST',     desc:'I open my door to those on the road.' },
          { key:'both',     label:'BOTH',     desc:'I walk and I host.' },
        ].map(r => `
          <div class="wk-card role-card" data-role="${r.key}" style="cursor:pointer;transition:border-color 0.15s,background 0.15s;">
            <div style="font-family:var(--font-mono);font-weight:700;font-size:var(--text-sm);letter-spacing:2px;">${r.label}</div>
            <div style="color:var(--ink3);font-size:var(--text-sm);margin-top:4px;">${r.desc}</div>
          </div>`).join('')}
      </div>
    </div>`;
  el.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
      sessionStorage.setItem('wk_role', card.dataset.role);
      navigate('auth/signup');
    });
  });
  return el;
}
