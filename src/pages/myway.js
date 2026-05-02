import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

export default async function render() {
  const el = document.createElement('div');

  // Tab state
  let activeTab = 'routes';

  function tabBar() {
    return `
      <div style="display:flex;gap:0;border-bottom:1px solid var(--border-lt);background:var(--bg);position:sticky;top:0;z-index:5;">
        ${['routes','map','groups'].map(t => {
          const labels = { routes:'ROUTES', map:'MAP', groups:'WANDERGROUPS' };
          const active = t === activeTab;
          return `
            <button data-myway-tab="${t}" style="
              flex:1;padding:14px 0;border:none;background:transparent;cursor:pointer;
              font-family:var(--font-mono);font-size:13px;font-weight:700;letter-spacing:2px;
              text-transform:uppercase;color:${active ? 'var(--amber)' : 'var(--ink3)'};
              border-bottom:${active ? '2px solid var(--amber)' : '2px solid transparent'};
              margin-bottom:-1px;transition:color 0.15s;
            ">${labels[t]}</button>`;
        }).join('')}
      </div>`;
  }

  function routesContent() {
    return `
      <div style="padding:var(--screen-px);">
        <div class="h-label">Your Routes</div>
        <div class="wk-empty" style="padding:var(--sp-3xl) 0;">
          <div class="icon">🗺️</div>
          <p>Routes you save or create will appear here.</p>
        </div>
      </div>`;
  }

  function mapContent() {
    return `
      <div style="padding:var(--screen-px);">
        <div class="h-label">Community Map</div>
        <div style="
          width:100%;height:300px;border-radius:var(--r-lg);
          background:var(--surface-alt);border:1px solid var(--border-lt);
          display:flex;align-items:center;justify-content:center;
          color:var(--ink3);font-size:var(--text-sm);flex-direction:column;gap:8px;
        ">
          <span style="font-size:32px;">🌍</span>
          <span>Map loading…</span>
        </div>
      </div>`;
  }

  function groupsContent() {
    return `
      <div style="padding:var(--screen-px);">
        <div class="h-label">Wandergroups</div>
        <div class="wk-empty" style="padding:var(--sp-3xl) 0;">
          <div class="icon">🧭</div>
          <p>Groups of wanderers on the same path.</p>
          <button class="wk-btn secondary" style="margin-top:var(--sp-md);width:auto;padding:10px 20px;">Find a group</button>
        </div>
      </div>`;
  }

  function contentFor(tab) {
    if (tab === 'routes')  return routesContent();
    if (tab === 'map')     return mapContent();
    if (tab === 'groups')  return groupsContent();
    return '';
  }

  function rebuild() {
    el.innerHTML = tabBar() + `<div id="myway-content">${contentFor(activeTab)}</div>`;
    el.querySelectorAll('[data-myway-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.mywayTab;
        rebuild();
      });
    });
  }

  rebuild();
  return el;
}
