import { navigate } from '../lib/router.js';

const CATEGORIES = [
  {
    label: 'THE ESSENTIALS',
    accent: '#C8762A',
    items: [
      { name: 'Sleeping bag (3-season)', note: 'Down or synthetic — under 1kg' },
      { name: 'Lightweight tent / bivy', note: 'Or tarp + groundsheet' },
      { name: 'Trekking poles', note: 'Foldable, carbon or aluminium' },
      { name: 'Water filter / purifier', note: 'Sawyer Squeeze or similar' },
      { name: 'First aid kit', note: 'Blister care is non-negotiable' },
      { name: 'Map + compass', note: 'Battery-independent backup' },
    ]
  },
  {
    label: 'CLOTHING',
    accent: '#2D6A4F',
    items: [
      { name: 'Merino base layers ×2', note: 'Wool manages odour on long hauls' },
      { name: 'Waterproof shell jacket', note: 'Pack it even in summer' },
      { name: 'Insulating mid-layer', note: 'Down or fleece' },
      { name: 'Trail shoes / boots', note: 'Worn-in before you start' },
      { name: 'Hiking socks ×3 pairs', note: 'Darn Tough or Smartwool' },
      { name: 'Sun hat + warm hat', note: 'Both. Always.' },
    ]
  },
  {
    label: 'FOOD & WATER',
    accent: '#5A7A2B',
    items: [
      { name: 'Stove + fuel canister', note: 'Jetboil or MSR PocketRocket' },
      { name: 'Titanium pot / pan', note: '550ml cup works for most meals' },
      { name: 'Water bottles ×2 (1L each)', note: 'Soft flasks save space' },
      { name: 'High-calorie snacks', note: 'Nuts, jerky, chocolate' },
      { name: 'Electrolyte tabs', note: 'Critical in heat' },
    ]
  },
  {
    label: 'NAVIGATION & SAFETY',
    accent: '#8B1A2B',
    items: [
      { name: 'GPS watch or device', note: 'Garmin inReach for remote routes' },
      { name: 'Headtorch + spare batteries', note: 'Black Diamond Spot or Petzl' },
      { name: 'Emergency whistle', note: 'Lightweight, on your strap' },
      { name: 'Personal locator beacon', note: 'For solo alpine routes' },
      { name: 'Offline maps (app)', note: 'Maps.me or Gaia GPS downloaded' },
    ]
  },
  {
    label: 'WANDERKIND SPECIFIC',
    accent: '#C8762A',
    items: [
      { name: 'WANDERKIND pass (app)', note: 'Your ID with hosts' },
      { name: 'Emergency contacts set', note: 'In the app — takes 2 minutes' },
      { name: 'QR code downloaded', note: 'Offline verification with hosts' },
      { name: 'Route saved offline', note: 'Before leaving signal range' },
    ]
  }
];

export default async function render() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>PACKLIST & TIPS</h1>
    </div>
    <div style="padding:0 0 40px;">
      <div style="padding:16px 24px 4px;">
        <p style="font-size:14px;color:var(--ink2);line-height:1.7;">A curated list for long-distance walkers. Adapt to your route, climate, and experience.</p>
      </div>
      ${CATEGORIES.map(cat => `
        <div style="padding:16px 24px 0;">
          <div class="h-label" style="color:${cat.accent};margin-bottom:10px;">${cat.label}</div>
          <div class="row-list" style="border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
            ${cat.items.map(item => `
              <div style="display:flex;align-items:flex-start;gap:14px;padding:12px 16px;border-bottom:1px solid var(--border-lt);background:var(--surface);">
                <div style="width:8px;height:8px;border-radius:4px;background:${cat.accent};flex-shrink:0;margin-top:5px;"></div>
                <div>
                  <div style="font-size:14px;font-weight:600;color:var(--ink);">${item.name}</div>
                  <div style="font-size:12px;color:var(--ink3);margin-top:2px;">${item.note}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>`).join('')}
      <div style="padding:20px 24px 0;text-align:center;">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--ink3);">WANDERKIND · WALK LIGHT · TRUST WIDE</div>
      </div>
    </div>
  `;
  el.querySelector('#back').addEventListener('click', () => history.back());
  return el;
}
