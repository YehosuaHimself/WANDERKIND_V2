import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

const CARD_BG=['#4A5D3A','#2C3E50','#6B5A3E','#5B3A29','#3D5C5C','#4A3728','#2D4A3E','#5C4033'];
function fmt(iso){const d=new Date(iso),m=Math.floor((Date.now()-d)/60000);return m<60?`${m}m`:m<1440?`${Math.floor(m/60)}h`:`${Math.floor(m/1440)}d`;}
function hav(la1,lo1,la2,lo2){const R=6371,dL=(la2-la1)*Math.PI/180,dl=(lo2-lo1)*Math.PI/180;const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dl/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}

export default async function render() {
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;flex-direction:column;min-height:100%;';
  const user = getUser();
  let filter='recent', moments=[], stories=[], liked=new Set(), counts={}, uLat=null, uLng=null;

  navigator?.geolocation?.getCurrentPosition(p=>{ uLat=p.coords.latitude; uLng=p.coords.longitude; renderFeed(); },()=>{});

  function dist(la,lo) {
    if(la==null||lo==null||uLat==null) return null;
    const k=hav(uLat,uLng,la,lo);
    return k<1?`${Math.round(k*1000)}m away`:`${Math.round(k)}km away`;
  }

  async function load() {
    const [{data:m},{data:s}] = await Promise.all([
      supabase.from('moments').select('*,author:profiles!moments_author_id_fkey(id,trail_name,avatar_url)').order('created_at',{ascending:false}).limit(50),
      supabase.from('stories').select('*,author:profiles(trail_name,avatar_url)').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}),
    ]);
    moments = m||[];
    // Group stories
    const map=new Map();
    for(const s2 of s||[]){if(!map.has(s2.author_id))map.set(s2.author_id,{id:s2.author_id,name:s2.author?.trail_name||'Wanderkind',av:s2.author?.avatar_url||null,items:[]});map.get(s2.author_id).items.push(s2);}
    stories=Array.from(map.values());
    // Likes
    if(moments.length&&user){
      const {data:lr}=await supabase.from('moment_likes').select('moment_id,user_id').in('moment_id',moments.map(x=>x.id));
      for(const r of lr||[]){counts[r.moment_id]=(counts[r.moment_id]||0)+1;if(r.user_id===user?.id)liked.add(r.moment_id);}
    }
  }

  async function toggleLike(id){
    if(!user)return;
    const was=liked.has(id);
    if(was){liked.delete(id);counts[id]=Math.max(0,(counts[id]||0)-1);}
    else{liked.add(id);counts[id]=(counts[id]||0)+1;}
    renderFeed();
    if(was)await supabase.from('moment_likes').delete().eq('moment_id',id).eq('user_id',user.id);
    else await supabase.from('moment_likes').insert({moment_id:id,user_id:user.id});
  }

  function imgModal(url){
    const o=document.createElement('div');
    o.className='img-overlay';
    o.innerHTML=`<img src="${url}" />`;
    o.addEventListener('click',()=>o.remove());
    document.body.appendChild(o);
  }

  function sorted(){
    if(filter==='nearby'&&uLat!=null)return[...moments].sort((a,b)=>{
      const ah=a.lat!=null,bh=b.lat!=null;
      if(!ah&&!bh)return new Date(b.created_at)-new Date(a.created_at);
      if(!ah)return 1;if(!bh)return-1;
      return hav(uLat,uLng,a.lat,a.lng)-hav(uLat,uLng,b.lat,b.lng);
    });
    return[...moments].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  }

  function storyBarHTML(){
    return`<div class="story-bar-scroll"><div class="story-bar-inner">
      <button class="story-ring-btn" id="add-story">
        <div class="story-avatar add"><i class="ph ph-plus" style="font-size:22px;color:var(--amber);"></i></div>
        <span class="story-label">Your story</span>
      </button>
      ${stories.map(g=>`
        <button class="story-ring-btn story-view" data-gid="${g.id}">
          <div class="story-avatar unseen">${g.av?`<img src="${g.av}" style="width:100%;height:100%;object-fit:cover;" />`:`<i class="ph ph-user" style="font-size:22px;color:var(--ink3);"></i>`}</div>
          <span class="story-label">${g.name.split(' ')[0]}</span>
        </button>`).join('')}
    </div></div>`;
  }

  function momentHTML(m,i){
    const lk=liked.has(m.id), ct=counts[m.id]||0;
    const d=filter==='nearby'?dist(m.lat,m.lng):null;
    const photo=m.photo_url||m.image_url;
    return`<div class="moment-card">
      <div class="moment-author-row" data-pid="${m.author_id}">
        <div class="avatar sm">${m.author?.avatar_url?`<img src="${m.author.avatar_url}" />`:`<i class="ph ph-user"></i>`}</div>
        <div style="flex:1;min-width:0;">
          <div class="moment-author-name">${m.author?.trail_name||'Wanderkind'}</div>
          <div class="moment-author-meta">
            <span class="moment-time">${fmt(m.created_at)}</span>
            ${d?`<span class="moment-meta-dot"></span><span class="moment-dist">${d}</span>`:''}
          </div>
        </div>
        ${user&&m.author_id!==user.id?`<button class="dm-btn" data-aid="${m.author_id}" data-aname="${m.author?.trail_name||''}"><i class="ph ph-chat-circle"></i></button>`:''}
      </div>
      ${photo?`<img class="moment-photo" src="${photo}" data-url="${photo}" />`:''}
      ${m.content||m.caption?`<div class="moment-caption">${m.content||m.caption}</div>`:''}
      ${m.location_name?`<div class="moment-location"><i class="ph ph-map-pin"></i>${m.location_name}</div>`:''}
      <div class="moment-actions">
        <button class="action-btn like-btn${lk?' liked':''}" data-mid="${m.id}">
          <i class="ph ${lk?'ph-heart-fill':'ph-heart'}"></i>
          ${ct>0?`<span>${ct}</span>`:''}
        </button>
        <button class="action-btn sm comment-btn" data-mid="${m.id}" style="margin-left:auto;">
          <i class="ph ph-chat-circle"></i>
        </button>
      </div>
    </div>`;
  }

  function renderFeed(){
    const feed=el.querySelector('#feed');
    if(!feed)return;
    const ms=sorted();
    feed.innerHTML=`
      <div class="filter-bar">
        <button class="chip${filter==='nearby'?' active':''}" data-f="nearby"><i class="ph ph-map-pin"></i> Nearby</button>
        <button class="chip${filter==='recent'?' active':''}" data-f="recent"><i class="ph ph-clock"></i> Recent</button>
      </div>
      ${ms.length?ms.map((m,i)=>momentHTML(m,i)).join(''):`
        <div class="wk-empty">
          <div class="icon"><i class="ph ph-image"></i></div>
          <p>Be the first to share from this stretch of the road.</p>
          <button class="wk-btn secondary" style="width:auto;padding:10px 20px;" id="empty-create">Share a Moment</button>
        </div>`}`;
    feed.querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.f;renderFeed();}));
    feed.querySelectorAll('.like-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();toggleLike(b.dataset.mid);}));
    feed.querySelectorAll('.moment-photo').forEach(img=>img.addEventListener('click',()=>imgModal(img.dataset.url)));
    feed.querySelectorAll('.moment-author-row').forEach(r=>r.addEventListener('click',e=>{if(!e.target.closest('.dm-btn'))navigate(`me/profile/${r.dataset.pid}`);}));
    feed.querySelectorAll('.dm-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();navigate(`messages/new?userId=${b.dataset.aid}&name=${encodeURIComponent(b.dataset.aname)}`)}));
    feed.querySelectorAll('.comment-btn').forEach(b=>b.addEventListener('click',()=>navigate(`memories/${b.dataset.mid}`)));
    feed.querySelector('#empty-create')?.addEventListener('click',()=>navigate('memories/create'));
  }

  el.innerHTML=`
    <div class="page-header">
      <div class="page-label dot">MEMORIES</div>
      <div class="page-title">From the Road</div>
    </div>
    <div id="story-bar"></div>
    <div id="feed" style="flex:1;"><div style="padding:40px;text-align:center;"><div class="wk-spinner"></div></div></div>
    <button class="fab" id="create-btn"><i class="ph ph-plus"></i></button>
  `;

  el.querySelector('#create-btn').addEventListener('click',()=>navigate('memories/create'));

  await load();
  el.querySelector('#story-bar').innerHTML=storyBarHTML();
  el.querySelector('#add-story')?.addEventListener('click',()=>navigate('memories/create-story'));
  el.querySelectorAll('.story-view').forEach(b=>{
    b.addEventListener('click',()=>{
      const g=stories.find(s=>s.id===b.dataset.gid);
      if(g?.items[0]){imgModal(g.items[0].media_url||g.items[0].photo_url||'');}
    });
  });
  renderFeed();
  return el;
}
