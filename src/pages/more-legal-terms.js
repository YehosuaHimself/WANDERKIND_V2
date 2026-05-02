export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>TERMS OF SERVICE</h1>
    </div>
    <div style="padding:24px;display:flex;flex-direction:column;gap:14px;max-width:560px;">
      ${[
        ['ACCEPTANCE', 'By using WANDERKIND you agree to these terms. If you do not agree, please do not use the platform.'],
        ['THE PLATFORM', 'WANDERKIND connects long-distance walkers with hosts. We facilitate but do not control the stays, agreements, or interactions between users.'],
        ['YOUR ACCOUNT', 'You are responsible for maintaining the security of your account. Provide accurate information. You must be 18 or older to use the platform.'],
        ['COMMUNITY STANDARDS', 'Treat every host and walker with respect. Fraud, harassment, or misuse of trust will result in account termination and potential tier reset. The road holds us all accountable.'],
        ['HOSTING', 'Hosts offer accommodation voluntarily. WANDERKIND does not guarantee availability, safety, or suitability of any listing. Walkers and hosts interact at their own discretion.'],
        ['TERMINATION', 'We reserve the right to suspend or terminate accounts that violate these terms or harm the community.'],
        ['CHANGES', 'We may update these terms. Continued use after changes constitutes acceptance.'],
      ].map(([title, body]) => `
        <div class="wk-card">
          <div class="h-label" style="margin-bottom:8px;">${title}</div>
          <p style="font-size:13px;color:var(--ink2);line-height:1.75;margin:0;">${body}</p>
        </div>`).join('')}
      <div style="padding:8px 0;text-align:center;">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--ink3);">WANDERKIND TERMS · ${new Date().getFullYear()}</div>
      </div>
    </div>`;
  el.querySelector('#back').addEventListener('click', () => history.back());
  return el;
}
