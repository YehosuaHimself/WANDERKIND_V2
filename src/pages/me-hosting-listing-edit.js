import { navigate } from '../lib/router.js';
export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>LISTING EDIT</h1>
    </div>
    <div class="wk-empty" style="padding:var(--sp-3xl) var(--screen-px);">
      <div class="icon">🏠</div>
      <p>Hosting listing edit coming soon.</p>
    </div>`;
  el.querySelector('#back').addEventListener('click', () => navigate('me/hosting/dashboard'));
  return el;
}
