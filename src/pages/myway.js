import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

const CARD_COLORS = ['#4A5D3A','#2C3E50','#6B5A3E','#5B3A29','#3D5C5C','#4A3728','#2D4A3E','#5C4033'];

const REGIONS = ['All','Europe','Americas','Asia','Africa','Middle East','Oceania'];
const DIFFICULTIES = ['All','Easy','Moderate','Challenging','Expert'];

const REGION_MAP = {
  Spain:'Europe',France:'Europe',Italy:'Europe',Germany:'Europe',Portugal:'Europe',Switzerland:'Europe',Austria:'Europe',England:'Europe',Scotland:'Europe',Ireland:'Europe',Norway:'Europe',Sweden:'Europe',Netherlands:'Europe','Czech Republic':'Europe',Poland:'Europe',Greece:'Europe',
  'United States':'Americas',Peru:'Americas',Chile:'Americas',Guatemala:'Americas',Brazil:'Americas',
  Japan:'Asia',Nepal:'Asia',China:'Asia',India:'Asia',
  Turkey:'Middle East',Jordan:'Middle East',Palestine:'Middle East',Israel:'Middle East',
  Tanzania:'Africa',Namibia:'Africa',Morocco:'Africa',Ethiopia:'Africa',
  'New Zealand':'Oceania',Australia:'Oceania',
};

function getRegion(countries=[]) {
  for (const c of countries) if (REGION_MAP[c]) return REGION_MAP[c];
  return 'Other';
}

function getDiffColor(d) {
  return { easy:'#27864A', moderate:'#C8762A', challenging:'#C0392B', expert:'#8E44AD' }[d?.toLowerCase()] || '#9B8E7E';
}

export default async function render() {
  const el = document.createElement('div');
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.minHeight = '100%';

  let activeTab = 'routes';
  let routes = [];
  let routeSearch = '';
  let regionFilter = 'All';
  let diffFilter = 'All';
  let groupWalks = [];
  let myGroupWalks = [];
  let routesLoaded = false;

  async function loadRoutes() {
    if (routesLoaded) return;
    const { data } = await supabase.from('routes').select('*').order('walker_count', { ascending: false });
    routes = data || [];
    routesLoaded = true;
  }

  async function loadGroupWalks() {
    const user = getUser();
    const { data } = await supabase.from('group_walks').select('*, organizer:profiles(trail_name,avatar_url)').order('start_date', { ascending: true }).limit(20);
    groupWalks = data || [];
    if (user) {
      const { data: mine } = await supabase.from('group_walk_members').select('group_walk:group_walks(*)').eq('user_id', user.id);
      myGroupWalks = (mine || []).map(m => m.group_walk).filter(Boolean);
    }
  }

  function filteredRoutes() {
    let r = routes;
    if (routeSearch.trim()) {
      const q = routeSearch.trim().toLowerCase();
      r = r.filter(w => w.name?.toLowerCase().includes(q) || (w.countries||[]).some(c => c.toLowerCase().includes(q)) || w.country?.toLowerCase().includes(q));
    }
    if (regionFilter !== 'All') {
      r = r.filter(w => getRegion(w.countries || (w.country ? [w.country] : [])) === regionFilter);
    }
    if (diffFilter !== 'All') {
      r = r.filter(w => w.difficulty?.toLowerCase() === diffFilter.toLowerCase() || (w.difficulty === 'hard' && diffFilter === 'Challenging'));
    }
    return r;
  }

  function routeCard(route, i) {
    const bg = CARD_COLORS[i % CARD_COLORS.length];
    const dist = route.distance_km ? `${Number(route.distance_km).toLocaleString()}km` : '';
    const days = route.duration_days ? `${route.duration_days} days` : '';
    const walkers = route.walker_count ? `${route.walker_count} walkers` : '';
    return `
      <div class="route-card" data-id="${route.id}" style="
        border-radius:14px;height:110px;overflow:hidden;background:${bg};
        cursor:pointer;margin-bottom:10px;flex-shrink:0;transition:transform 0.1s;
      ">
        <div style="padding:16px 20px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;">
          <div style="font-size:20px;font-weight:800;color:#fff;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${route.name || 'Unnamed Way'}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:3px;">${(route.countries||[]).join(', ') || route.country || ''}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:6px;font-weight:600;">${[dist, days, walkers].filter(Boolean).join('  ·  ')}</div>
        </div>
      </div>`;
  }

  function routesTab() {
    const shown = filteredRoutes();
    const hasFilters = routeSearch || regionFilter !== 'All' || diffFilter !== 'All';
    return `
      <!-- Search -->
      <div style="padding:12px 16px 4px;">
        <div style="display:flex;align-items:center;gap:8px;background:var(--surface-alt);border-radius:10px;padding:8px 12px;border:1px solid var(--border-lt);">
          <i class="ph ph-magnifying-glass" style="font-size:16px;color:var(--ink3);flex-shrink:0;"></i>
          <input id="route-search" type="text" placeholder="Search routes, countries…" value="${routeSearch}" style="flex:1;border:none;background:transparent;font-size:14px;color:var(--ink);outline:none;" autocomplete="off" />
          ${routeSearch ? `<button id="clear-route-search" style="background:none;border:none;cursor:pointer;padding:0;"><i class="ph ph-x-circle" style="font-size:16px;color:var(--ink3);"></i></button>` : ''}
        </div>
      </div>

      <!-- Region filter -->
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;border-bottom:1px solid var(--border-lt);">
        <div style="display:flex;gap:6px;padding:8px 16px;width:max-content;">
          ${REGIONS.map(r => `
            <button class="region-chip" data-region="${r}" style="
              padding:6px 12px;border-radius:16px;border:1px solid;cursor:pointer;font-size:12px;font-weight:500;white-space:nowrap;transition:all 0.15s;
              ${r === regionFilter ? 'background:var(--amber-bg);border-color:var(--amber);color:var(--amber);font-weight:600;' : 'background:var(--bg);border-color:var(--border-lt);color:var(--ink3);'}
            ">${r}</button>`).join('')}
        </div>
      </div>

      <!-- Difficulty filter -->
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;border-bottom:1px solid var(--border-lt);">
        <div style="display:flex;gap:6px;padding:6px 16px;width:max-content;">
          ${DIFFICULTIES.map(d => `
            <button class="diff-chip" data-diff="${d}" style="
              padding:5px 12px;border-radius:14px;border:1px solid;cursor:pointer;font-size:12px;font-weight:500;white-space:nowrap;transition:all 0.15s;
              ${d === diffFilter ? 'background:var(--amber-bg);border-color:var(--amber);color:var(--amber);font-weight:600;' : 'background:var(--bg);border-color:var(--border-lt);color:var(--ink3);'}
            ">${d}</button>`).join('')}
        </div>
      </div>

      ${hasFilters ? `<div style="padding:4px 16px;"><button id="clear-filters" style="display:flex;align-items:center;gap:4px;background:none;border:none;cursor:pointer;color:var(--amber);font-size:11px;font-weight:600;padding:4px 0;"><i class="ph ph-x" style="font-size:14px;"></i> Clear filters</button></div>` : ''}

      <!-- Route list -->
      <div id="route-list" style="padding:6px 16px;">
        ${!routesLoaded ? '<div style="padding:40px;text-align:center;"><div class="wk-spinner"></div></div>' :
          shown.length === 0 ? `
            <div class="wk-empty" style="padding-top:60px;">
              <div class="icon"><i class="ph ph-trail-sign" style="font-size:48px;color:var(--ink3);opacity:0.35;"></i></div>
              <p>${hasFilters ? 'No matching routes. Try adjusting your filters.' : 'Walking routes will appear here as the community grows.'}</p>
              ${hasFilters ? `<button class="wk-btn secondary" style="width:auto;padding:10px 20px;margin-top:12px;" id="empty-clear-filters">Clear Filters</button>` : ''}
            </div>` :
          shown.map((r, i) => routeCard(r, i)).join('')}
      </div>`;
  }

  function groupsTab() {
    return `
      <div style="padding:16px;">
        <!-- Create group walk -->
        <button id="create-group-walk" style="
          width:100%;padding:14px;border-radius:12px;border:2px dashed var(--amber-line);
          background:var(--amber-bg);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
          font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--amber);letter-spacing:1px;
          margin-bottom:16px;
        ">
          <i class="ph ph-plus" style="font-size:18px;"></i> CREATE GROUP WALK
        </button>

        ${myGroupWalks.length > 0 ? `
        <div class="h-label">MY GROUPS</div>
        <div class="row-list" style="margin-bottom:16px;border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
          ${myGroupWalks.map(g => `
            <div class="row-item group-walk-row" data-id="${g.id}" style="border-radius:0;border-bottom:1px solid var(--border-lt);">
              <i class="ph ph-users-three" style="font-size:20px;color:var(--amber);width:24px;flex-shrink:0;"></i>
              <div style="flex:1;">
                <div style="font-size:14px;font-weight:600;color:var(--ink);">${g.name || 'Group Walk'}</div>
                <div style="font-size:11px;color:var(--ink3);margin-top:2px;">${g.start_date ? new Date(g.start_date).toLocaleDateString('en-GB', {day:'numeric',month:'short'}) : ''} · ${g.member_count || 0} members</div>
              </div>
              <i class="ph ph-caret-right" style="color:var(--ink3);font-size:14px;"></i>
            </div>`).join('')}
        </div>` : ''}

        <div class="h-label">DISCOVER</div>
        ${groupWalks.length === 0 ? `
          <div class="wk-empty" style="padding-top:40px;">
            <div class="icon"><i class="ph ph-compass" style="font-size:48px;color:var(--ink3);opacity:0.35;"></i></div>
            <p>Groups of wanderers on the same path.<br/>Create one to get started.</p>
          </div>` : `
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${groupWalks.map(g => `
              <div class="group-walk-row wk-card" data-id="${g.id}" style="cursor:pointer;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:44px;height:44px;border-radius:22px;background:var(--amber-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="ph ph-users-three" style="font-size:20px;color:var(--amber);"></i>
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:14px;font-weight:600;color:var(--ink);">${g.name || 'Group Walk'}</div>
                    <div style="font-size:11px;color:var(--ink3);margin-top:2px;">${g.organizer?.trail_name || 'Wanderkind'} · ${g.member_count || 0} members</div>
                  </div>
                  <i class="ph ph-caret-right" style="color:var(--ink3);font-size:14px;"></i>
                </div>
              </div>`).join('')}
          </div>`}
      </div>`;
  }

  function rebuild() {
    const isRoutes = activeTab === 'routes';
    el.innerHTML = `
      <!-- H-LABEL header -->
      <div style="padding:8px 20px 4px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:14px;height:1.5px;border-radius:1px;background:var(--amber);"></div>
          <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:3px;color:var(--amber);font-weight:600;">MY WAY</span>
        </div>
      </div>

      <!-- Large caps tab bar -->
      <div style="display:flex;gap:0;padding:0 20px;border-bottom:1px solid var(--border-lt);background:var(--bg);">
        ${[['routes','ROUTES'],['map','MAP'],['groups','WANDERGROUPS']].map(([key,label]) => {
          const active = key === activeTab;
          return `<button data-myway-tab="${key}" style="
            padding:12px 0;margin-right:20px;border:none;background:transparent;cursor:pointer;
            font-family:var(--font-mono);font-size:13px;font-weight:700;letter-spacing:2px;
            color:${active ? 'var(--amber)' : 'var(--ink3)'};
            border-bottom:${active ? '2px solid var(--amber)' : '2px solid transparent'};
            margin-bottom:-1px;transition:color 0.15s;">${label}</button>`;
        }).join('')}
      </div>

      <!-- Tab content -->
      <div id="myway-content" style="flex:1;overflow-y:auto;">
        ${activeTab === 'routes' ? routesTab() : activeTab === 'groups' ? groupsTab() : mapTab()}
      </div>
    `;

    bindTabEvents();
  }

  function mapTab() {
    return `
      <div style="padding:var(--screen-px);">
        <div class="h-label">COMMUNITY MAP</div>
        <div style="width:100%;height:300px;border-radius:var(--r-lg);background:var(--surface-alt);border:1px solid var(--border-lt);display:flex;align-items:center;justify-content:center;color:var(--ink3);font-size:var(--text-sm);flex-direction:column;gap:8px;">
          <i class="ph ph-globe" style="font-size:48px;color:var(--ink3);opacity:0.35;"></i>
          <span>Map coming soon</span>
        </div>
      </div>`;
  }

  function bindTabEvents() {
    el.querySelectorAll('[data-myway-tab]').forEach(btn => {
      btn.addEventListener('click', async () => {
        activeTab = btn.dataset.mywayTab;
        if (activeTab === 'routes' && !routesLoaded) {
          rebuild();
          await loadRoutes();
        } else if (activeTab === 'groups') {
          await loadGroupWalks();
        }
        rebuild();
      });
    });

    // Route search
    const searchInput = el.querySelector('#route-search');
    let timer;
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        routeSearch = e.target.value;
        clearTimeout(timer);
        timer = setTimeout(() => rebuild(), 200);
      });
    }

    el.querySelector('#clear-route-search')?.addEventListener('click', () => { routeSearch = ''; rebuild(); });
    el.querySelector('#clear-filters')?.addEventListener('click', () => { routeSearch = ''; regionFilter = 'All'; diffFilter = 'All'; rebuild(); });
    el.querySelector('#empty-clear-filters')?.addEventListener('click', () => { routeSearch = ''; regionFilter = 'All'; diffFilter = 'All'; rebuild(); });

    el.querySelectorAll('.region-chip').forEach(btn => {
      btn.addEventListener('click', () => { regionFilter = btn.dataset.region; rebuild(); });
    });
    el.querySelectorAll('.diff-chip').forEach(btn => {
      btn.addEventListener('click', () => { diffFilter = btn.dataset.diff; rebuild(); });
    });

    // Route card clicks
    el.querySelectorAll('.route-card').forEach(card => {
      card.addEventListener('click', () => navigate(`more/ways/${card.dataset.id}`));
      card.addEventListener('mouseenter', () => { card.style.transform = 'scale(1.02)'; });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // Group walk actions
    el.querySelector('#create-group-walk')?.addEventListener('click', () => navigate('more/group-walk/create'));
    el.querySelectorAll('.group-walk-row').forEach(row => {
      row.addEventListener('click', () => navigate(`more/group-walk/${row.dataset.id}`));
    });
  }

  // Load routes immediately and render
  await loadRoutes();
  rebuild();
  return el;
}
