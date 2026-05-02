import { supabase } from '../lib/supabase.js';
import { getUser, signOut } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

const TIER_COLORS={wanderkind:'#9B8E7E',wunderkind:'#9B8E7E',wandersmann:'#C8762A',ehrenmann:'#C8762A',pilger:'#C8762A',apostel:'#D4A017',lehrer:'#D4A017',meister:'#B8860B',grossmeister:'#B8860B',legende:'#27864A',koenig:'#27864A'};

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');

  const {data:p} = user ? await supabase.from('profiles').select('*').eq('id',user.id).single() : {data:null};
  const {data:mData} = user ? await supabase.from('moments').select('id,photo_url,image_url').eq('author_id',user.id).order('created_at',{ascending:false}).limit(9) : {data:null};

  const name    = p?.trail_name||p?.full_name||user?.user_metadata?.trail_name||'Wanderer';
  const avatar  = p?.avatar_url||'';
  const cover   = p?.cover_url||'';
  const bio     = p?.bio||'';
  const tier    = p?.tier||'wanderkind';
  const tc      = TIER_COLORS[tier]||'#9B8E7E';
  const wkId    = p?.wanderkind_id||'WK-0000';
  const handle  = '@'+(p?.trail_name||'wanderkind').toLowerCase().replace(/\s+/g,'.');
  const gallery = p?.gallery_urls||p?.gallery||[];
  const moments = (mData||[]).filter(m=>m.photo_url||m.image_url);
  const hasOffer= !!(p?.is_hosting||p?.hosting_project_title);
  const quiet   = p?.quiet_mode||false;

  let activeTab='profile', showStats=p?.show_stats!==false, isWalking=p?.is_walking||false;

  const completeness = [avatar,bio,hasOffer].filter(Boolean).length;
  const compPct = Math.round((completeness/3)*100);

  function imgModal(url){
    const o=document.createElement('div');o.className='img-overlay';
    o.innerHTML=`<img src="${url}" />`;o.addEventListener('click',()=>o.remove());
    document.body.appendChild(o);
  }

  function render() {
    el.innerHTML=`
      <!-- Cover -->
      <div class="profile-cover" id="cover-area" style="${cover?`background:url('${cover}') center/cover no-repeat;`:''}">
        ${!cover?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;color:var(--ink3);"><i class="ph ph-image" style="font-size:32px;"></i><span style="font-size:10px;font-family:var(--font-mono);letter-spacing:1.5px;">ADD COVER</span></div>`:''}
        <button class="cover-cam-btn" id="cover-cam"><i class="ph ph-camera"></i></button>
      </div>

      <div class="profile-body">
        <!-- Avatar row -->
        <div class="profile-avatar-row">
          <div class="avatar-stack">
            <div class="avatar xl${avatar?' ring':''}" id="avatar-wrap" style="border:3px solid var(--bg);cursor:pointer;">
              ${avatar?`<img src="${avatar}" alt="${name}" />`:`<i class="ph ph-user"></i>`}
            </div>
            ${isWalking?`<div class="walk-badge">W</div>`:''}
            <button class="avatar-cam-btn" id="avatar-cam"><i class="ph ph-camera"></i></button>
          </div>
          <div class="quick-actions">
            <button class="quick-btn" id="share-btn"><i class="ph ph-share-network"></i> SHARE</button>
            <button class="quick-btn" id="edit-btn"><i class="ph ph-pencil-simple"></i> EDIT</button>
          </div>
        </div>

        <!-- Name + handle + tier -->
        <h2 class="profile-name">${name}</h2>
        <div class="profile-handle">${handle} · ${wkId}</div>
        ${!quiet?`<div class="tier-badge" style="background:${tc}18;"><div class="tier-dot" style="background:${tc};"></div><span class="tier-label" style="color:${tc};">${tier.toUpperCase()}</span></div>`:''}
        ${bio?`<p class="profile-bio">${bio}</p>`:''}

        <!-- Walking toggle -->
        <div class="walk-toggle-row">
          <div class="walk-toggle-label">
            <i class="ph ph-person-simple-walk" style="font-size:18px;color:${isWalking?'var(--amber)':'var(--ink3)'};"></i>
            <span style="color:${isWalking?'var(--amber)':'var(--ink3)'};">${isWalking?'Currently Wandering':'Resting'}</span>
          </div>
          <label class="wk-toggle">
            <input type="checkbox" id="walk-chk" ${isWalking?'checked':''} ${isWalking?'disabled':''} />
            <div class="wk-toggle-track"></div>
            <div class="wk-toggle-thumb"></div>
          </label>
        </div>

        <!-- Completeness banner -->
        ${compPct<100?`<div class="completeness-banner" id="comp-banner">
          <i class="ph ph-star"></i>
          <div class="completeness-text">
            <div class="completeness-title">COMPLETE YOUR PROFILE</div>
            <div class="completeness-sub">${compPct}% done — add ${!avatar?'a photo':!bio?'a bio':'your offering'} to attract more connections</div>
          </div>
          <i class="ph ph-caret-right" style="font-size:16px;color:var(--amber);flex-shrink:0;"></i>
        </div>`:''}

        <!-- Stats -->
        <div class="stats-row">
          ${showStats?`
          <div class="stat-item"><div class="stat-value">${p?.night_count||0}</div><div class="stat-label">NIGHTS</div></div>
          <div class="stat-item"><div class="stat-value">${p?.stamps_count||0}</div><div class="stat-label">STAMPS</div></div>
          <div class="stat-item"><div class="stat-value">${p?.hosted_count||0}</div><div class="stat-label">HOSTED</div></div>
          `:`<div style="padding:4px 0;font-size:13px;color:var(--ink3);flex:1;text-align:center;">Stats hidden</div>`}
          <button class="stats-eye-btn" id="stats-eye"><i class="ph ${showStats?'ph-eye-slash':'ph-eye'}" style="font-size:18px;color:var(--ink3);"></i></button>
        </div>

        <!-- PROFILE / CREDENTIALS tabs -->
        <div class="inner-tab-bar" style="margin:0 calc(-1 * var(--screen-px));padding:0 var(--screen-px);">
          <button class="inner-tab${activeTab==='profile'?' active':''}" data-mtab="profile">PROFILE</button>
          <button class="inner-tab${activeTab==='credentials'?' active':''}" data-mtab="credentials">CREDENTIALS</button>
        </div>

        <div id="me-tab-body">
          ${activeTab==='profile' ? profileTab() : credsTab()}
        </div>
      </div>

      <input type="file" id="av-input" accept="image/*" capture="user" style="display:none;" />
      <input type="file" id="cv-input" accept="image/*" style="display:none;" />
    `;
    bind();
  }

  function profileTab() {
    return`
      <!-- QR inline -->
      <div class="qr-inline-row">
        <div class="qr-inline-info">
          <i class="ph ph-qr-code"></i>
          <div><div class="qr-title">MY QR CODE</div><div class="qr-id">${wkId}</div></div>
        </div>
        <button class="qr-show-btn" id="qr-btn"><i class="ph ph-arrows-out"></i> SHOW</button>
      </div>

      ${gallery.length?`
      <div style="margin-top:14px;"><div class="h-label">GALLERY</div>
        <div class="gallery-scroll"><div class="gallery-inner">
          ${gallery.map(u=>`<div class="gallery-thumb" data-url="${u}"><img src="${u}" /></div>`).join('')}
        </div></div>
      </div>`:''}

      ${moments.length?`
      <div style="margin-top:14px;"><div class="h-label">MOMENTS</div>
        <div class="moments-grid">
          ${moments.map(m=>`<div class="grid-thumb" data-id="${m.id}"><img src="${m.photo_url||m.image_url}" /></div>`).join('')}
        </div>
      </div>`:''}

      <div class="row-list" style="margin-top:14px;border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
        ${[
          {icon:'ph-path',       label:'MY JOURNEY',   route:'me/journey'},
          {icon:'ph-images',     label:'GALLERY',       route:'me/gallery'},
          {icon:'ph-seal',       label:'STAMPS',        route:'me/stamps-overview'},
          {icon:'ph-book-open',  label:'GÄSTEBUCH',     route:'me/gaestebuch'},
          {icon:'ph-house',      label:'MY HOSTING',    route:'me/hosting/dashboard'},
          {icon:'ph-shield-check',label:'VERIFICATION', route:'me/verification'},
          {icon:'ph-sign-out',   label:'SIGN OUT',      route:'__signout__'},
        ].map(item=>`
          <div class="row-item" data-route="${item.route}" style="border-radius:0;">
            <i class="ph ${item.icon}" style="font-size:20px;color:var(--amber);width:24px;flex-shrink:0;"></i>
            <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;letter-spacing:1.5px;color:var(--ink);">${item.label}</span>
            <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
          </div>`).join('')}
      </div>`;
  }

  function credsTab() {
    return`
      <div class="wk-card" style="margin-top:14px;">
        <div class="h-label">WANDERKIND PASS</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
          <div>
            <div style="font-size:17px;font-weight:700;color:var(--ink);">${name}</div>
            <div style="font-size:12px;color:var(--ink3);margin-top:2px;font-family:var(--font-mono);">${wkId}</div>
          </div>
          <div class="tier-badge" style="background:${tc}18;">
            <div class="tier-dot" style="background:${tc};"></div>
            <span class="tier-label" style="color:${tc};">${tier.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div class="row-list" style="margin-top:12px;border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
        ${[
          {icon:'ph-ticket',     label:'WANDERKIND PASS',    route:'more/passes'},
          {icon:'ph-seal',       label:'STAMPS & VISAS',     route:'more/stamps'},
          {icon:'ph-footsteps',  label:'WANDERKIND JOURNEY', route:'more/journey'},
          {icon:'ph-shield-check',label:'VERIFICATION',      route:'me/verification'},
        ].map(item=>`
          <div class="row-item" data-route="${item.route}" style="border-radius:0;">
            <i class="ph ${item.icon}" style="font-size:20px;color:var(--amber);width:24px;flex-shrink:0;"></i>
            <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;letter-spacing:1.5px;color:var(--ink);">${item.label}</span>
            <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
          </div>`).join('')}
      </div>`;
  }

  function bind() {
    // Tabs
    el.querySelectorAll('[data-mtab]').forEach(b=>b.addEventListener('click',()=>{activeTab=b.dataset.mtab;render();}));

    // Walking toggle
    el.querySelector('#walk-chk')?.addEventListener('change',async e=>{
      if(isWalking)return;
      isWalking=e.target.checked;
      if(user)await supabase.from('profiles').update({is_walking:isWalking}).eq('id',user.id);
      render();
    });

    // Stats toggle
    el.querySelector('#stats-eye')?.addEventListener('click',async()=>{
      showStats=!showStats;
      if(user)await supabase.from('profiles').update({show_stats:showStats}).eq('id',user.id);
      render();
    });

    // Action buttons
    el.querySelector('#edit-btn')?.addEventListener('click',()=>navigate('me/edit'));
    el.querySelector('#share-btn')?.addEventListener('click',()=>navigate('more/share-profile'));
    el.querySelector('#comp-banner')?.addEventListener('click',()=>navigate('more/wanderhost'));

    // QR modal
    el.querySelector('#qr-btn')?.addEventListener('click',()=>{
      const o=document.createElement('div');
      o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;';
      o.innerHTML=`<div style="background:var(--bg);border-radius:24px;padding:32px;display:flex;flex-direction:column;align-items:center;gap:16px;width:85%;max-width:300px;">
        <div class="page-label">MY QR CODE</div>
        <div style="width:180px;height:180px;background:var(--surface-alt);border-radius:12px;display:flex;align-items:center;justify-content:center;"><i class="ph ph-qr-code" style="font-size:110px;color:var(--ink2);"></i></div>
        <div style="font-family:var(--font-mono);font-size:15px;font-weight:700;color:var(--ink);">${wkId}</div>
        <div style="font-size:13px;color:var(--ink2);">${name}</div>
        <button class="wk-btn primary" style="width:auto;padding:10px 20px;" id="qr-share">Share Profile</button>
      </div>
      <button style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);font-size:14px;padding:12px;">Close</button>`;
      o.querySelector('#qr-share').addEventListener('click',()=>navigate('me/qr-code'));
      o.addEventListener('click',e=>{if(e.target===o||e.target.tagName==='BUTTON')o.remove();});
      document.body.appendChild(o);
    });

    // Gallery
    el.querySelectorAll('.gallery-thumb').forEach(t=>t.addEventListener('click',()=>imgModal(t.dataset.url)));
    el.querySelectorAll('.grid-thumb').forEach(t=>t.addEventListener('click',()=>navigate(`memories/${t.dataset.id}`)));

    // Cover / avatar upload
    el.querySelector('#cover-area')?.addEventListener('click',()=>el.querySelector('#cv-input').click());
    el.querySelector('#cover-cam')?.addEventListener('click',e=>{e.stopPropagation();el.querySelector('#cv-input').click();});
    el.querySelector('#avatar-wrap')?.addEventListener('click',()=>el.querySelector('#av-input').click());
    el.querySelector('#avatar-cam')?.addEventListener('click',e=>{e.stopPropagation();el.querySelector('#av-input').click();});

    el.querySelector('#av-input')?.addEventListener('change',async e=>{
      const f=e.target.files[0];if(!f||!user)return;
      const {uploadAvatar}=await import('../lib/supabase.js');
      const url=await uploadAvatar(user.id,f,`avatar_${Date.now()}.jpg`);
      await supabase.from('profiles').upsert({id:user.id,avatar_url:url});
      toastSuccess('Photo saved');navigate('me',{replace:true});
    });
    el.querySelector('#cv-input')?.addEventListener('change',async e=>{
      const f=e.target.files[0];if(!f||!user)return;
      const {uploadAvatar}=await import('../lib/supabase.js');
      const url=await uploadAvatar(user.id,f,`cover_${Date.now()}.jpg`);
      await supabase.from('profiles').upsert({id:user.id,cover_url:url});
      toastSuccess('Cover saved');navigate('me',{replace:true});
    });

    // Row nav
    el.querySelectorAll('.row-item[data-route]').forEach(r=>r.addEventListener('click',async()=>{
      const route=r.dataset.route;
      if(route==='__signout__'){await signOut();navigate('auth/signin',{replace:true});}
      else navigate(route);
    }));
  }

  render();
  return el;
}
