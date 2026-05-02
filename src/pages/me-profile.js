import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

const TIER_COLORS={wanderkind:'#9B8E7E',wunderkind:'#9B8E7E',wandersmann:'#C8762A',ehrenmann:'#C8762A',pilger:'#C8762A',apostel:'#D4A017',lehrer:'#D4A017',meister:'#B8860B',grossmeister:'#B8860B',legende:'#27864A',koenig:'#27864A'};

export default async function render(path) {
  const profileId = path.replace('me/profile/', '');
  const me = getUser();
  const el = document.createElement('div');
  el.style.cssText = 'min-height:100%;';

  const { data: p } = await supabase.from('profiles').select('*').eq('id', profileId).single();
  if (!p) {
    el.innerHTML = `
      <div class="wk-header">
        <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
        <h1>PROFILE</h1>
      </div>
      <div class="wk-empty"><p>This wanderer could not be found.</p></div>`;
    el.querySelector('#back').addEventListener('click', () => history.back());
    return el;
  }

  const {data:mData} = await supabase.from('moments')
    .select('id,photo_url,image_url').eq('author_id', profileId)
    .order('created_at',{ascending:false}).limit(9);
  const moments = (mData||[]).filter(m=>m.photo_url||m.image_url);
  const gallery = p.gallery_urls||p.gallery||[];

  const name   = p.trail_name||p.full_name||'Wanderer';
  const handle = '@'+(p.trail_name||'wanderkind').toLowerCase().replace(/\s+/g,'.');
  const tier   = p.tier||'wanderkind';
  const tc     = TIER_COLORS[tier]||'#9B8E7E';
  const wkId   = p.wanderkind_id||'WK-????';
  const isSelf = me?.id === profileId;

  function imgModal(url){
    const o=document.createElement('div');o.className='img-overlay';
    o.innerHTML=`<img src="${url}" />`;o.addEventListener('click',()=>o.remove());
    document.body.appendChild(o);
  }

  el.innerHTML = `
    <!-- Cover -->
    <div class="profile-cover" style="${p.cover_url?`background:url('${p.cover_url}') center/cover no-repeat;`:''}">
      ${!p.cover_url?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;"><i class="ph ph-mountains" style="font-size:48px;color:var(--ink3);opacity:0.2;"></i></div>`:''}
      <!-- transparent back button floating over cover -->
      <button id="back" style="position:absolute;top:14px;left:16px;width:36px;height:36px;border-radius:18px;background:rgba(250,246,239,0.85);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);font-size:20px;color:var(--ink);"><i class="ph ph-arrow-left"></i></button>
    </div>

    <div class="profile-body">
      <!-- Avatar row -->
      <div class="profile-avatar-row">
        <div class="avatar-stack">
          <div class="avatar xl${p.avatar_url?' ring':''}">
            ${p.avatar_url?`<img src="${p.avatar_url}" alt="${name}" />`:`<i class="ph ph-user"></i>`}
          </div>
          ${p.is_walking?`<div class="walk-badge">W</div>`:''}
        </div>
        ${!isSelf?`
        <div class="quick-actions">
          <button class="quick-btn" id="msg-btn"><i class="ph ph-chat-circle"></i> MESSAGE</button>
        </div>`:''}
      </div>

      <h2 class="profile-name">${name}</h2>
      <div class="profile-handle">${handle} · ${wkId}</div>
      ${!p.quiet_mode?`<div class="tier-badge" style="background:${tc}18;"><div class="tier-dot" style="background:${tc};"></div><span class="tier-label" style="color:${tc};">${tier.toUpperCase()}</span></div>`:''}
      ${p.bio?`<p class="profile-bio">${p.bio}</p>`:''}

      <!-- Stats -->
      ${p.show_stats!==false?`
      <div class="stats-row" style="pointer-events:none;">
        <div class="stat-item"><div class="stat-value">${p.night_count||0}</div><div class="stat-label">NIGHTS</div></div>
        <div class="stat-item"><div class="stat-value">${p.stamps_count||0}</div><div class="stat-label">STAMPS</div></div>
        <div class="stat-item"><div class="stat-value">${p.hosted_count||0}</div><div class="stat-label">HOSTED</div></div>
      </div>`:''}

      <!-- Gallery -->
      ${gallery.length?`
      <div style="margin-top:20px;">
        <div class="h-label" style="padding:0 0 4px;">GALLERY</div>
        <div class="gallery-scroll"><div class="gallery-inner">
          ${gallery.map(u=>`<div class="gallery-thumb" data-url="${u}"><img src="${u}" /></div>`).join('')}
        </div></div>
      </div>`:''}

      <!-- Moments grid -->
      ${moments.length?`
      <div style="margin-top:20px;">
        <div class="h-label" style="padding:0 0 4px;">MOMENTS</div>
        <div class="moments-grid">
          ${moments.map(m=>`<div class="grid-thumb" data-id="${m.id}"><img src="${m.photo_url||m.image_url}" /></div>`).join('')}
        </div>
      </div>`:''}

      <!-- Hosting card if applicable -->
      ${p.is_hosting||p.hosting_project_title?`
      <div class="wk-card" style="margin-top:20px;border-color:var(--amber-line);">
        <div class="h-label" style="margin-bottom:8px;">OFFERING HOSTING</div>
        ${p.hosting_project_title?`<div style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:4px;">${p.hosting_project_title}</div>`:''}
        ${p.hosting_project_description?`<div style="font-size:13px;color:var(--ink2);line-height:1.6;">${p.hosting_project_description.slice(0,120)}${p.hosting_project_description.length>120?'…':''}</div>`:''}
        ${!isSelf?`<button class="wk-btn secondary" style="margin-top:14px;" id="host-msg-btn"><i class="ph ph-door-open"></i> Request a Stay</button>`:''}
      </div>`:''}

      <div style="height:32px;"></div>
    </div>
  `;

  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#msg-btn')?.addEventListener('click', () => navigate(`messages/${profileId}`));
  el.querySelector('#host-msg-btn')?.addEventListener('click', () => navigate(`messages/${profileId}`));
  el.querySelectorAll('.gallery-thumb').forEach(t => t.addEventListener('click', () => imgModal(t.dataset.url)));
  el.querySelectorAll('.grid-thumb').forEach(t => t.addEventListener('click', () => navigate(`memories/${t.dataset.id}`)));

  return el;
}
