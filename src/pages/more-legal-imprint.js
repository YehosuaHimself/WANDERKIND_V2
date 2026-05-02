export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>IMPRINT</h1>
    </div>
    <div style="padding:24px;display:flex;flex-direction:column;gap:16px;max-width:560px;">
      <div class="wk-card">
        <div class="h-label" style="margin-bottom:10px;">RESPONSIBLE</div>
        <p style="font-size:14px;color:var(--ink2);line-height:1.8;">
          WANDERKIND<br/>
          hello@wanderkind.love<br/>
          wanderkind.love
        </p>
      </div>
      <div class="wk-card">
        <div class="h-label" style="margin-bottom:10px;">DISCLAIMER</div>
        <p style="font-size:13px;color:var(--ink2);line-height:1.75;">
          WANDERKIND is a platform for the long-distance walking community.
          We facilitate connections between walkers and hosts but bear no responsibility
          for the content of user profiles or the outcome of stays arranged through the platform.
          Use of this service is at your own risk.
        </p>
      </div>
      <div style="padding:8px 0;text-align:center;">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--ink3);">WANDERKIND · ${new Date().getFullYear()}</div>
      </div>
    </div>`;
  el.querySelector('#back').addEventListener('click', () => history.back());
  return el;
}
