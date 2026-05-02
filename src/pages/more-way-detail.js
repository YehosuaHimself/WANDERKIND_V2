import { supabase } from '../lib/supabase.js';
import { navigate } from '../lib/router.js';

const CARD_COLORS = ['#4A5D3A','#2C3E50','#6B5A3E','#5B3A29','#3D5C5C','#4A3728','#2D4A3E','#5C4033'];

function getDiffColor(d) {
  return { easy:'#27864A', moderate:'#C8762A', challenging:'#C0392B', expert:'#8E44AD' }[d?.toLowerCase()] || '#9B8E7E';
}
function getDiffLabel(d) {
  return { easy:'Easy walking — suitable for beginners', moderate:'Moderate challenge — some fitness required', challenging:'Challenging terrain — experienced walkers', expert:'Expert — multi-week expedition, high endurance' }[d?.toLowerCase()] || d;
}

export default async function render() {
  const el = document.createElement('div');

  // Extract route ID from hash
  const hash = location.hash.replace('#', '');
  const parts = hash.split('/');
  const routeId = parts[parts.indexOf('ways') + 1];

  el.innerHTML = `<div style="padding:40px;text-align:center;"><div class="wk-spinner"></div></div>`;

  let route = null;

  if (routeId) {
    const { data } = await supabase.from('routes').select('*').eq('id', routeId).single();
    route = data;
  }

  if (!route) {
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-lt);">
        <button onclick="history.back()" style="background:none;border:none;cursor:pointer;padding:4px;"><i class="ph ph-caret-left" style="font-size:24px;color:var(--ink);"></i></button>
        <span style="font-size:16px;font-weight:700;color:var(--ink);">Route not found</span>
      </div>
      <div class="wk-empty" style="padding-top:80px;"><p>This route couldn't be loaded.</p></div>`;
    return el;
  }

  const bgColor = CARD_COLORS[Math.abs(routeId.charCodeAt(0) + routeId.charCodeAt(1)) % CARD_COLORS.length];
  const dist = route.distance_km ? `${Number(route.distance_km).toLocaleString()} km` : '';
  const days = route.duration_days ? `${route.duration_days} days` : '';
  const walkers = route.walker_count ? `${route.walker_count} walkers` : '';
  const diffColor = getDiffColor(route.difficulty);
  const diffLabel = getDiffLabel(route.difficulty);

  el.innerHTML = `
    <!-- Back header -->
    <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-lt);">
      <button id="back-btn" style="background:none;border:none;cursor:pointer;padding:4px;flex-shrink:0;"><i class="ph ph-caret-left" style="font-size:24px;color:var(--ink);"></i></button>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:6px;height:6px;border-radius:3px;background:var(--amber);"></div>
        <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:3px;color:var(--amber);font-weight:600;">THE WAYS</span>
      </div>
    </div>

    <!-- Hero card -->
    <div style="margin:16px;border-radius:16px;height:140px;background:${bgColor};overflow:hidden;position:relative;">
      <div style="padding:20px 24px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-end;">
        <h1 style="font-size:26px;font-weight:800;color:#fff;margin:0;line-height:1.2;">${route.name}</h1>
        <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">${(route.countries||[]).join(', ') || route.country || ''}</div>
      </div>
    </div>

    <!-- Stats row -->
    <div style="display:flex;gap:0;margin:0 16px;border:1px solid var(--border-lt);border-radius:12px;overflow:hidden;">
      ${[['ph-path', dist || '—', 'Distance'],['ph-clock', days || '—', 'Duration'],['ph-users', walkers || '—', 'Walkers']].map(([icon,val,label]) => `
        <div style="flex:1;text-align:center;padding:12px 4px;border-right:1px solid var(--border-lt);">
          <i class="${icon}" style="font-size:18px;color:var(--amber);"></i>
          <div style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--ink);margin-top:4px;">${val}</div>
          <div style="font-size:10px;letter-spacing:1.5px;font-family:var(--font-mono);color:var(--ink3);font-weight:600;">${label.toUpperCase()}</div>
        </div>`).join('')}
    </div>

    <!-- Difficulty -->
    ${route.difficulty ? `
    <div style="margin:12px 16px 0;padding:12px 16px;border-radius:12px;background:${diffColor}12;border:1px solid ${diffColor}30;display:flex;align-items:center;gap:10px;">
      <i class="ph ph-activity" style="font-size:20px;color:${diffColor};flex-shrink:0;"></i>
      <div>
        <div style="font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:1.5px;color:${diffColor};">${route.difficulty.toUpperCase()}</div>
        <div style="font-size:12px;color:var(--ink2);margin-top:2px;">${diffLabel}</div>
      </div>
    </div>` : ''}

    <!-- Description -->
    ${route.description ? `
    <div style="margin:16px;padding:16px;border-radius:12px;border:1px solid var(--border-lt);background:var(--surface-alt);">
      <div class="h-label" style="margin-bottom:8px;">ABOUT THIS WAY</div>
      <p style="font-size:13px;color:var(--ink2);line-height:1.6;margin:0;">${route.description}</p>
    </div>` : ''}

    <!-- Start a group walk CTA -->
    <div style="margin:0 16px 24px;">
      <button id="start-group-btn" style="
        width:100%;padding:14px;border-radius:12px;
        background:var(--amber);border:none;cursor:pointer;
        font-family:var(--font-mono);font-size:13px;font-weight:700;color:#fff;letter-spacing:1px;
        display:flex;align-items:center;justify-content:center;gap:10px;
      ">
        <i class="ph ph-users-three" style="font-size:18px;"></i> START A GROUP WALK
      </button>
    </div>
  `;

  el.querySelector('#back-btn')?.addEventListener('click', () => history.back());
  el.querySelector('#start-group-btn')?.addEventListener('click', () => navigate('more/group-walk/create'));

  return el;
}
