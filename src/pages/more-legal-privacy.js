export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>PRIVACY POLICY</h1>
    </div>
    <div style="padding:24px;display:flex;flex-direction:column;gap:14px;max-width:560px;">
      ${[
        ['DATA WE COLLECT', 'Your trail name, email address, profile information you provide, and activity on the platform (nights walked, stamps, hosting activity). We also store messages you send to other users.'],
        ['HOW WE USE IT', 'To provide the WANDERKIND service, connect you with hosts and walkers, and maintain your tier standing. We do not sell your data to third parties.'],
        ['DATA STORAGE', 'Your data is stored securely via Supabase on EU-based servers. We apply industry-standard encryption in transit and at rest.'],
        ['YOUR RIGHTS', 'You may request a copy of your data, request deletion of your account, or correct any inaccurate information at any time by contacting hello@wanderkind.love.'],
        ['COOKIES', 'We use only essential session cookies required for authentication. No advertising or tracking cookies are used.'],
        ['CONTACT', 'For privacy-related requests: hello@wanderkind.love'],
      ].map(([title, body]) => `
        <div class="wk-card">
          <div class="h-label" style="margin-bottom:8px;">${title}</div>
          <p style="font-size:13px;color:var(--ink2);line-height:1.75;margin:0;">${body}</p>
        </div>`).join('')}
      <div style="padding:8px 0;text-align:center;">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--ink3);">LAST UPDATED ${new Date().getFullYear()}</div>
      </div>
    </div>`;
  el.querySelector('#back').addEventListener('click', () => history.back());
  return el;
}
