import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

export default async function render(path) {
  // Handle ?userId=xxx&name=xxx pre-fill from DM buttons
  const params = new URLSearchParams(location.hash.includes('?') ? location.hash.split('?')[1] : '');
  const preUserId = params.get('userId');
  const preName   = decodeURIComponent(params.get('name') || '');

  if (preUserId) {
    navigate(`messages/${preUserId}`, { replace: true });
    return document.createElement('div');
  }

  const user = getUser();
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;flex-direction:column;height:100%;';
  let searchQ = '', results = [], timer;

  async function doSearch(q) {
    if (!q.trim()) { results = []; return; }
    const { data } = await supabase.from('profiles').select('id,trail_name,avatar_url,bio,tier')
      .ilike('trail_name', `%${q.trim().replace(/^@/, '')}%`)
      .neq('id', user?.id || '').limit(15);
    results = data || [];
  }

  function rebuild() {
    const hasQ = searchQ.trim().length > 0;
    el.innerHTML = `
      <div class="wk-header" style="flex-shrink:0;">
        <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
        <h1>NEW MESSAGE</h1>
      </div>

      <div class="search-wrap" style="flex-shrink:0;">
        <div class="search-bar">
          <i class="ph ph-magnifying-glass"></i>
          <input id="new-search" type="text" placeholder="Search by name or @handle…"
            value="${searchQ}" autocomplete="off" autocapitalize="off" autofocus />
          ${searchQ ? `<button class="clear-btn" id="clear"><i class="ph ph-x-circle"></i></button>` : ''}
        </div>
      </div>

      <div style="flex:1;overflow-y:auto;">
        ${!hasQ ? `
          <div class="wk-empty" style="padding-top:60px;">
            <div class="icon"><i class="ph ph-user-plus"></i></div>
            <p>Search for a wanderer to start a conversation.</p>
          </div>` :
        results.length === 0 ? `
          <div class="wk-empty" style="padding-top:60px;">
            <div class="icon"><i class="ph ph-magnifying-glass"></i></div>
            <p>No wanderers found for "${searchQ}"</p>
          </div>` :
        results.map(p => `
          <div class="thread-row" data-uid="${p.id}">
            <div class="avatar md">
              ${p.avatar_url ? `<img src="${p.avatar_url}" alt="${p.trail_name}" />` : `<i class="ph ph-user"></i>`}
            </div>
            <div style="flex:1;min-width:0;">
              <div class="thread-name">${p.trail_name}</div>
              <div class="thread-preview">${p.bio ? p.bio.slice(0, 60) : 'Wanderkind'}</div>
            </div>
            <div style="width:34px;height:34px;border-radius:17px;background:var(--amber-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="ph ph-paper-plane-tilt" style="font-size:14px;color:var(--amber);"></i>
            </div>
          </div>`).join('')}
      </div>
    `;

    el.querySelector('#back').addEventListener('click', () => navigate('messages'));
    el.querySelector('#clear')?.addEventListener('click', () => { searchQ = ''; rebuild(); });

    const input = el.querySelector('#new-search');
    input.addEventListener('input', e => {
      searchQ = e.target.value;
      clearTimeout(timer);
      timer = setTimeout(async () => { await doSearch(searchQ); rebuild(); }, 250);
    });
    // keep focus after rebuild
    setTimeout(() => input?.focus(), 10);

    el.querySelectorAll('[data-uid]').forEach(row =>
      row.addEventListener('click', () => navigate(`messages/${row.dataset.uid}`))
    );
  }

  rebuild();
  return el;
}
