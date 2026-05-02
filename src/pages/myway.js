import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

const CARD_BG=['#4A5D3A','#2C3E50','#6B5A3E','#5B3A29','#3D5C5C','#4A3728','#2D4A3E','#5C4033'];
const REGIONS=['All','Europe','Americas','Asia','Africa','Middle East','Oceania'];
const DIFFS=['All','Easy','Moderate','Challenging','Expert'];
const RMAP={Spain:'Europe',France:'Europe',Italy:'Europe',Germany:'Europe',Portugal:'Europe',Switzerland:'Europe',Austria:'Europe',England:'Europe','United States':'Americas',Peru:'Americas',Chile:'Americas',Japan:'Asia',Nepal:'Asia',China:'Asia',Turkey:'Middle East',Jordan:'Middle East',Tanzania:'Africa',Morocco:'Africa','New Zealand':'Oceania',Australia:'Oceania'};
function region(countries=[]){for(const c of countries)if(RMAP[c])return RMAP[c];return'Other';}

export default async function render() {
  const el = document.createElement('div');
  el.style.cssText='display:flex;flex-direction:column;min-height:100%;';
  let tab='routes', routes=[], search='', reg='All', diff='All', groups=[], timer;

  async function loadRoutes(){
    const {data}=await supabase.from('routes').select('*').order('walker_count',{ascending:false});
    routes=data||[];
  }
  async function loadGroups(){
    const {data}=await supabase.from('group_walks').select('*,organizer:profiles(trail_name)').order('created_at',{ascending:false}).limit(20);
    groups=data||[];
  }

  function filtered(){
    let r=routes;
    if(search.trim()){const q=search.trim().toLowerCase();r=r.filter(w=>w.name?.toLowerCase().includes(q)||(w.countries||[]).some(c=>c.toLowerCase().includes(q))||w.country?.toLowerCase().includes(q));}
    if(reg!=='All')r=r.filter(w=>region(w.countries||(w.country?[w.country]:[]))===reg);
    if(diff!=='All')r=r.filter(w=>w.difficulty?.toLowerCase()===diff.toLowerCase()||(w.difficulty==='hard'&&diff==='Challenging'));
    return r;
  }

  function routeCard(r,i){
    const bg=CARD_BG[i%CARD_BG.length];
    const parts=[r.distance_km?`${Number(r.distance_km).toLocaleString()}km`:'',r.duration_days?`${r.duration_days} days`:''].filter(Boolean).join('  ·  ');
    return`<div class="route-card" data-id="${r.id}" style="background:${bg};">
      <div class="route-card-inner">
        <div class="route-card-name">${r.name||'Unnamed Way'}</div>
        <div class="route-card-country">${(r.countries||[]).join(', ')||r.country||''}</div>
        ${parts?`<div class="route-card-meta">${parts}</div>`:''}
      </div>
    </div>`;
  }

  function routesContent(){
    const f=filtered();
    const hasF=search||reg!=='All'||diff!=='All';
    return`
      <div class="search-wrap"><div class="search-bar">
        <i class="ph ph-magnifying-glass"></i>
        <input id="rsearch" type="text" placeholder="Search routes, countries…" value="${search}" autocomplete="off" />
        ${search?`<button class="clear-btn" id="rclear"><i class="ph ph-x-circle"></i></button>`:''}
      </div></div>
      <div class="chip-row">${REGIONS.map(r=>`<button class="chip${r===reg?' active':''}" data-reg="${r}">${r}</button>`).join('')}</div>
      <div class="chip-row" style="border-top:none;padding-top:4px;">${DIFFS.map(d=>`<button class="chip${d===diff?' active':''}" data-diff="${d}">${d}</button>`).join('')}</div>
      ${hasF?`<div style="padding:4px 16px;"><button id="rclear-all" style="display:flex;align-items:center;gap:4px;background:none;border:none;cursor:pointer;color:var(--amber);font-size:11px;font-weight:600;padding:4px 0;"><i class="ph ph-x" style="font-size:14px;"></i> Clear filters</button></div>`:''}
      <div style="padding:6px 16px 24px;">
        ${f.length?f.map((r,i)=>routeCard(r,i)).join(''):`<div class="wk-empty"><div class="icon"><i class="ph ph-trail-sign"></i></div><p>${hasF?'No matching routes. Try adjusting your filters.':'Walking routes will appear here as the community grows.'}</p>${hasF?`<button class="wk-btn secondary" style="width:auto;padding:10px 20px;" id="rclear-empty">Clear Filters</button>`:''}</div>`}
      </div>`;
  }

  function groupsContent(){
    return`<div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
      <button class="create-dashed" id="create-group"><i class="ph ph-plus" style="font-size:18px;"></i> CREATE GROUP WALK</button>
      ${groups.length?`
        <div class="h-label">DISCOVER</div>
        ${groups.map(g=>`
          <div class="group-card" data-gid="${g.id}">
            <div class="group-icon"><i class="ph ph-users-three"></i></div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:14px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${g.name||'Group Walk'}</div>
              <div style="font-size:11px;color:var(--ink3);margin-top:2px;">${g.organizer?.trail_name||'Wanderkind'} · ${g.member_count||0} members</div>
            </div>
            <i class="ph ph-caret-right" style="color:var(--ink3);font-size:16px;flex-shrink:0;"></i>
          </div>`).join('')}`:`
        <div class="wk-empty" style="padding-top:40px;">
          <div class="icon"><i class="ph ph-compass"></i></div>
          <p>Groups of wanderers on the same path.<br/>Create one to get started.</p>
        </div>`}
    </div>`;
  }

  function rebuild(){
    el.innerHTML=`
      <div class="page-header" style="padding-bottom:0;">
        <div class="page-label">MY WAY</div>
      </div>
      <div class="inner-tab-bar">
        <button class="inner-tab${tab==='routes'?' active':''}" data-wt="routes">ROUTES</button>
        <button class="inner-tab${tab==='map'?' active':''}" data-wt="map">MAP</button>
        <button class="inner-tab${tab==='groups'?' active':''}" data-wt="groups">WANDERGROUPS</button>
      </div>
      <div id="wt-content" style="flex:1;overflow-y:auto;">
        ${tab==='routes'?routesContent():tab==='groups'?groupsContent():`
          <div style="padding:var(--screen-px);">
            <div class="h-label">COMMUNITY MAP</div>
            <div style="width:100%;height:300px;border-radius:var(--r-lg);background:var(--surface-alt);border:1px solid var(--border-lt);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;">
              <i class="ph ph-globe" style="font-size:48px;color:var(--ink3);opacity:0.35;"></i>
              <span style="font-size:13px;color:var(--ink3);">Map coming soon</span>
            </div>
          </div>`}
      </div>
    `;

    el.querySelectorAll('[data-wt]').forEach(b=>b.addEventListener('click',async()=>{
      tab=b.dataset.wt;
      if(tab==='groups'&&!groups.length)await loadGroups();
      rebuild();
    }));

    // Route search / filters
    const si=el.querySelector('#rsearch');
    if(si)si.addEventListener('input',e=>{search=e.target.value;clearTimeout(timer);timer=setTimeout(()=>rebuild(),200);});
    el.querySelector('#rclear')?.addEventListener('click',()=>{search='';rebuild();});
    el.querySelector('#rclear-all')?.addEventListener('click',()=>{search='';reg='All';diff='All';rebuild();});
    el.querySelector('#rclear-empty')?.addEventListener('click',()=>{search='';reg='All';diff='All';rebuild();});
    el.querySelectorAll('[data-reg]').forEach(b=>b.addEventListener('click',()=>{reg=b.dataset.reg;rebuild();}));
    el.querySelectorAll('[data-diff]').forEach(b=>b.addEventListener('click',()=>{diff=b.dataset.diff;rebuild();}));

    // Route cards
    el.querySelectorAll('.route-card').forEach(c=>c.addEventListener('click',()=>navigate(`more/ways/${c.dataset.id}`)));

    // Group walk
    el.querySelector('#create-group')?.addEventListener('click',()=>navigate('more/group-walk/create'));
    el.querySelectorAll('.group-card').forEach(c=>c.addEventListener('click',()=>navigate(`more/group-walk/${c.dataset.gid}`)));
  }

  await loadRoutes();
  rebuild();
  return el;
}
