/**
 * Desktop Landing Page
 * Shown when user visits wanderkind.love on a desktop browser.
 * This is the WANDERKIND organization landing page.
 */
export function renderDesktopLanding() {
  const app = document.getElementById('app');
  if (app) app.style.display = 'none';

  const qr = `https://chart.googleapis.com/chart?chs=160x160&cht=qr&chl=https%3A%2F%2Fwanderkind.love&chco=1C1C1C&chf=bg,s,FAFAF5`;

  const page = document.createElement('div');
  page.id = 'desktop-landing';
  page.style.cssText = `
    position:fixed;inset:0;
    background:#FAFAF5;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    overflow-y:auto;
    z-index:9999;
    color:#1C1C1C;
  `;

  page.innerHTML = `
    <style>
      #desktop-landing * { box-sizing:border-box; }
      #desktop-landing a { color:#C8762A; text-decoration:none; }
      @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
      .wk-fade { animation: fadeUp 0.7s ease both; }
      .wk-fade-2 { animation: fadeUp 0.7s ease 0.15s both; }
      .wk-fade-3 { animation: fadeUp 0.7s ease 0.3s both; }
    </style>

    <!-- NAV -->
    <nav style="position:fixed;top:0;left:0;right:0;padding:20px 48px;display:flex;align-items:center;justify-content:space-between;background:rgba(250,250,245,0.85);backdrop-filter:blur(12px);border-bottom:1px solid #E8E2D8;z-index:10;">
      <div style="font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:700;letter-spacing:3px;color:#C8762A;">WANDERKIND</div>
      <div style="display:flex;gap:32px;font-size:13px;color:#6B6B5A;font-weight:500;">
        <a href="#concept">The Idea</a>
        <a href="#way">The Way</a>
        <a href="#host">Wanderhost</a>
        <a href="#tiers">Tiers</a>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-family:'Courier New',Courier,monospace;color:#9B8E7E;letter-spacing:1px;">
        📱 MOBILE ONLY
      </div>
    </nav>

    <!-- HERO -->
    <section style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 48px 80px;text-align:center;">
      <div class="wk-fade" style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:4px;color:#C8762A;margin-bottom:24px;">WALK · TRUST · BELONG</div>
      <h1 class="wk-fade-2" style="font-size:clamp(48px,6vw,88px);font-weight:900;line-height:1.05;letter-spacing:-2px;margin:0 0 24px;max-width:800px;">
        The world needs<br/>
        <em style="font-style:italic;color:#C8762A;">wanderers.</em>
      </h1>
      <p class="wk-fade-3" style="font-size:18px;color:#6B6B5A;line-height:1.7;max-width:560px;margin:0 0 56px;">
        WANDERKIND is a pilgrimage community for those who walk the long roads of the world — connecting walkers with free lodging, people who care, and routes worth walking.
      </p>

      <!-- QR + CTA -->
      <div class="wk-fade-3" style="display:flex;align-items:center;gap:40px;flex-wrap:wrap;justify-content:center;">
        <div style="background:#fff;border-radius:20px;padding:20px;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid #E8E2D8;">
          <img src="${qr}" alt="QR Code" style="width:160px;height:160px;display:block;" />
          <div style="font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:2px;color:#9B8E7E;text-align:center;margin-top:10px;">SCAN TO INSTALL</div>
        </div>
        <div style="text-align:left;max-width:220px;">
          <div style="font-size:15px;font-weight:700;color:#1C1C1C;margin-bottom:8px;">Available on mobile</div>
          <p style="font-size:13px;color:#6B6B5A;line-height:1.6;margin:0 0 16px;">Scan the QR code with your phone to open WANDERKIND and install it as an app.</p>
          <div style="font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:1px;color:#9B8E7E;">wanderkind.love</div>
        </div>
      </div>
    </section>

    <!-- CONCEPT -->
    <section id="concept" style="padding:80px 48px;max-width:1100px;margin:0 auto;">
      <div style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:3px;color:#C8762A;margin-bottom:16px;">THE IDEA</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;">
        <div>
          <h2 style="font-size:40px;font-weight:900;line-height:1.15;letter-spacing:-1px;margin:0 0 20px;">Hospitality is older than money.</h2>
          <p style="font-size:15px;color:#6B6B5A;line-height:1.8;margin:0;">For thousands of years, pilgrims walked across continents and were received by strangers — fed, sheltered, blessed. WANDERKIND revives this ancient covenant of the road.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:20px;">
          ${conceptCard('Walk', 'You commit to the path. Long routes, real effort, real transformation.')}
          ${conceptCard('Trust', 'Strangers open their doors. You walk in as a guest and leave as a friend.')}
          ${conceptCard('Belong', 'A global community of those who have chosen the harder, richer way.')}
        </div>
      </div>
    </section>

    <!-- THE WAY -->
    <section id="way" style="background:#2C2C2C;padding:80px 48px;color:#F5F0E8;">
      <div style="max-width:1100px;margin:0 auto;">
        <div style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:3px;color:#C8762A;margin-bottom:16px;">THE WAY</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
          <div>
            <h2 style="font-size:40px;font-weight:900;line-height:1.15;letter-spacing:-1px;margin:0 0 20px;color:#F5F0E8;">51 routes.<br/>Endless roads.</h2>
            <p style="font-size:15px;color:#9B9B8A;line-height:1.8;margin:0 0 24px;">From the Camino Francés to the Annapurna Circuit, from the Königsweg to Te Araroa — every great walking route, community-enriched and host-mapped.</p>
            <div style="display:flex;gap:32px;">
              ${statPill('51', 'Routes')}
              ${statPill('4', 'Continents')}
              ${statPill('∞', 'Steps')}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${routePill('The King\'s Way (Königsweg)', '4,200 km · Expert')}
            ${routePill('Camino Francés', '790 km · Moderate')}
            ${routePill('Via Francigena', '1,900 km · Challenging')}
            ${routePill('Annapurna Circuit', '230 km · Challenging')}
            <div style="font-size:12px;color:#6B6B5A;font-family:'Courier New',Courier,monospace;letter-spacing:1px;padding-left:4px;">+ 47 MORE ROUTES</div>
          </div>
        </div>
      </div>
    </section>

    <!-- WANDERHOST -->
    <section id="host" style="padding:80px 48px;max-width:1100px;margin:0 auto;">
      <div style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:3px;color:#C8762A;margin-bottom:16px;">WANDERHOST</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;">
        <div>
          <h2 style="font-size:40px;font-weight:900;line-height:1.15;letter-spacing:-1px;margin:0 0 20px;">Open your door.</h2>
          <p style="font-size:15px;color:#6B6B5A;line-height:1.8;margin:0 0 24px;">Wanderhosts offer free lodging to verified pilgrims. No money changes hands. Only trust, a shared meal, and the road ahead.</p>
          <p style="font-size:15px;color:#6B6B5A;line-height:1.8;margin:0;">Hosts control who they receive — by tier, verification level, route, and dates. You set the terms. The community honors them.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${hostFeature('🛏', 'Free lodging', 'No fees, no booking platforms. Pure hospitality.')}
          ${hostFeature('✓', 'Verified walkers', 'Every walker earns their tier through nights walked, not money paid.')}
          ${hostFeature('★', 'Gästebuch', 'Every guest leaves a handwritten entry in your digital guest book.')}
          ${hostFeature('⚙', 'Your rules', 'Set max guests, minimum tier, advance notice, and instant booking.')}
        </div>
      </div>
    </section>

    <!-- TIERS -->
    <section id="tiers" style="background:#F0EBE0;padding:80px 48px;">
      <div style="max-width:1100px;margin:0 auto;">
        <div style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:3px;color:#C8762A;margin-bottom:16px;">THE WANDERKIND WAY</div>
        <h2 style="font-size:40px;font-weight:900;line-height:1.15;letter-spacing:-1px;margin:0 0 40px;">Earned, not bought.</h2>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
          ${tierCard('WANDERKIND', '#9B8E7E', '0 nights', 'Every journey begins here. The road is open.')}
          ${tierCard('WANDERSMANN', '#C8762A', '30 nights', 'You have walked. The road knows your step.')}
          ${tierCard('APOSTEL', '#D4A017', '100 nights', 'You carry the way with you wherever you go.')}
          ${tierCard('LEGENDE', '#27864A', '365 nights', 'A year of nights. You are the road.')}
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer style="background:#1C1C1C;color:#6B6B5A;padding:48px;text-align:center;">
      <div style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:3px;color:#C8762A;margin-bottom:12px;">WANDERKIND</div>
      <p style="font-size:13px;line-height:1.6;margin:0 0 8px;">Walk. Trust. Belong.</p>
      <p style="font-size:11px;color:#4B4B3A;">
        Created by <strong style="color:#9B8E7E;">YEHOSHUA HIMSELF</strong> ·
        Available at <a href="https://wanderkind.love" style="color:#C8762A;">wanderkind.love</a> · Mobile only
      </p>
    </footer>
  `;

  document.body.appendChild(page);

  // Smooth scroll for nav links
  page.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = page.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function conceptCard(title, desc) {
  return `<div style="background:#fff;border-radius:16px;padding:20px 24px;border:1px solid #E8E2D8;">
    <div style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:2px;color:#C8762A;margin-bottom:6px;">${title.toUpperCase()}</div>
    <p style="margin:0;font-size:14px;color:#6B6B5A;line-height:1.6;">${desc}</p>
  </div>`;
}

function statPill(val, label) {
  return `<div style="text-align:center;">
    <div style="font-size:28px;font-weight:900;color:#C8762A;font-family:'Courier New',Courier,monospace;">${val}</div>
    <div style="font-size:11px;letter-spacing:2px;color:#6B6B5A;font-family:'Courier New',Courier,monospace;">${label.toUpperCase()}</div>
  </div>`;
}

function routePill(name, meta) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;background:#3C3C2C;border-radius:10px;padding:12px 16px;">
    <span style="font-size:14px;font-weight:600;color:#F5F0E8;">${name}</span>
    <span style="font-size:11px;color:#9B9B8A;font-family:'Courier New',Courier,monospace;">${meta}</span>
  </div>`;
}

function hostFeature(icon, title, desc) {
  return `<div style="display:flex;gap:16px;align-items:flex-start;background:#fff;border-radius:14px;padding:16px 20px;border:1px solid #E8E2D8;">
    <div style="width:36px;height:36px;background:#F5F0E8;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${icon}</div>
    <div>
      <div style="font-weight:700;font-size:14px;color:#1C1C1C;margin-bottom:3px;">${title}</div>
      <div style="font-size:13px;color:#6B6B5A;">${desc}</div>
    </div>
  </div>`;
}

function tierCard(name, color, nights, desc) {
  return `<div style="background:#fff;border-radius:16px;padding:24px;border-top:4px solid ${color};border:1px solid #E8E2D8;border-top:4px solid ${color};">
    <div style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;letter-spacing:2px;color:${color};margin-bottom:8px;">${name}</div>
    <div style="font-size:20px;font-weight:900;color:#1C1C1C;margin-bottom:4px;">${nights}</div>
    <p style="margin:0;font-size:13px;color:#6B6B5A;line-height:1.5;">${desc}</p>
  </div>`;
}
