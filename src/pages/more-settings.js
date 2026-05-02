import { navigate } from '../lib/router.js';
export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>TRUST & SETTINGS</h1>
    </div>
    <div style="padding:var(--screen-px);">
      <div class="row-list" style="border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
        ${[
          ['ph-bell','Notifications','more/settings/notifications'],
          ['ph-translate','Language','more/settings/language'],
          ['ph-paint-brush','Appearance','more/settings/appearance'],
          ['ph-lock','Privacy','more/privacy'],
          ['ph-file-text','Legal','more/legal'],
        ].map(([icon,label,route]) => `
          <div class="row-item" data-r="${route}">
            <i class="${icon}" style="font-size:20px;color:var(--amber);width:24px;flex-shrink:0;"></i>
            <span style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:600;letter-spacing:1.5px;">${label}</span>
            <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
          </div>`).join('')}
      </div>
    </div>`;
  el.querySelector('#back').addEventListener('click', () => navigate('more'));
  el.querySelectorAll('[data-r]').forEach(r => r.addEventListener('click', () => navigate(r.dataset.r)));
  return el;
}
