import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

const CARD_COLORS = ['#4A5D3A','#2C3E50','#6B5A3E','#5B3A29','#3D5C5C','#4A3728','#2D4A3E','#5C4033'];

function formatTime(iso) {
  const d = new Date(iso), now = new Date();
  const diff = now - d, mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default async function render() {
  const el = document.createElement('div');
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.minHeight = '100%';

  let filter = 'recent';
  let moments = [];
  let storyGroups = [];
  let likedIds = new Set();
  let likeCounts = {};
  let userLat = null, userLng = null;

  const user = getUser();

  // Get user location
  if (navigator?.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      renderFeed();
    }, () => {});
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function formatDist(lat, lng) {
    if (lat == null || lng == null || userLat == null || userLng == null) return null;
    const km = haversineKm(userLat, userLng, lat, lng);
    if (km < 1) return `${Math.round(km*1000)}m away`;
    return `${Math.round(km)}km away`;
  }

  async function loadMoments() {
    const { data } = await supabase
      .from('moments')
      .select('*, author:profiles!moments_author_id_fkey(id,trail_name,avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50);
    moments = data || [];

    // Load likes
    if (moments.length > 0 && user) {
      const ids = moments.map(m => m.id);
      const { data: likeRows } = await supabase.from('moment_likes').select('moment_id,user_id').in('moment_id', ids);
      const counts = {}, mySet = new Set();
      for (const r of likeRows || []) {
        counts[r.moment_id] = (counts[r.moment_id] || 0) + 1;
        if (r.user_id === user?.id) mySet.add(r.moment_id);
      }
      likeCounts = counts;
      likedIds = mySet;
    }
  }

  async function loadStories() {
    const { data } = await supabase.from('stories').select('*, author:profiles(trail_name,avatar_url)').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false });
    const map = new Map();
    for (const s of data || []) {
      if (!map.has(s.author_id)) map.set(s.author_id, { authorId: s.author_id, authorName: s.author?.trail_name || 'Wanderkind', authorAvatar: s.author?.avatar_url || null, stories: [] });
      map.get(s.author_id).stories.push(s);
    }
    storyGroups = Array.from(map.values());
  }

  async function toggleLike(momentId) {
    if (!user) return;
    const isLiked = likedIds.has(momentId);
    if (isLiked) { likedIds.delete(momentId); likeCounts[momentId] = Math.max(0, (likeCounts[momentId]||0)-1); }
    else { likedIds.add(momentId); likeCounts[momentId] = (likeCounts[momentId]||0)+1; }
    renderFeed();
    if (isLiked) await supabase.from('moment_likes').delete().eq('moment_id', momentId).eq('user_id', user.id);
    else await supabase.from('moment_likes').insert({ moment_id: momentId, user_id: user.id });
  }

  function showImageModal(url) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, { position:'fixed', inset:'0', background:'rgba(0,0,0,0.92)', zIndex:'9999', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' });
    overlay.innerHTML = `<img src="${url}" style="max-width:100%;max-height:100%;object-fit:contain;" />`;
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }

  function storyBar() {
    if (storyGroups.length === 0 && true) {
      // Show at least the "Your story" ring
    }
    return `
      <div style="border-bottom:1px solid var(--border-lt);overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;">
        <div style="display:flex;gap:16px;padding:12px 16px;width:max-content;">
          <!-- Your story -->
          <button id="add-story-btn" style="display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;cursor:pointer;min-width:64px;">
            <div style="width:64px;height:64px;border-radius:32px;border:2px dashed var(--amber);display:flex;align-items:center;justify-content:center;background:var(--amber-bg);position:relative;">
              <i class="ph ph-plus" style="font-size:22px;color:var(--amber);"></i>
            </div>
            <span style="font-size:10px;font-family:var(--font-mono);letter-spacing:0.5px;color:var(--ink3);text-align:center;">Your story</span>
          </button>
          ${storyGroups.map(g => `
            <button class="story-ring" data-author="${g.authorId}" style="display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;cursor:pointer;min-width:64px;">
              <div style="width:64px;height:64px;border-radius:32px;border:2.5px solid var(--amber);overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--surface-alt);">
                ${g.authorAvatar ? `<img src="${g.authorAvatar}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="ph ph-user" style="font-size:22px;color:var(--ink3);"></i>`}
              </div>
              <span style="font-size:10px;font-family:var(--font-mono);letter-spacing:0.5px;color:var(--ink3);text-align:center;max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${g.authorName.split(' ')[0]}</span>
            </button>`).join('')}
        </div>
      </div>`;
  }

  function filterTabs() {
    return `
      <div style="display:flex;gap:8px;padding:10px 16px;border-bottom:1px solid var(--border-lt);">
        ${[['nearby','<i class="ph ph-map-pin"></i> Nearby'],['recent','<i class="ph ph-clock"></i> Recent']].map(([key,label]) => `
          <button data-filter="${key}" style="
            display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:20px;border:1px solid;cursor:pointer;font-size:13px;font-weight:500;transition:all 0.15s;
            ${filter === key ? 'background:var(--amber-bg);border-color:var(--amber);color:var(--amber);font-weight:600;' : 'background:var(--bg);border-color:rgba(200,118,42,0.12);color:var(--ink3);'}
          ">${label}</button>`).join('')}
      </div>`;
  }

  function sortedMoments() {
    if (filter === 'nearby' && userLat != null) {
      return [...moments].sort((a,b) => {
        const aHas = a.lat != null && a.lng != null, bHas = b.lat != null && b.lng != null;
        if (!aHas && !bHas) return new Date(b.created_at) - new Date(a.created_at);
        if (!aHas) return 1; if (!bHas) return -1;
        return haversineKm(userLat,userLng,a.lat,a.lng) - haversineKm(userLat,userLng,b.lat,b.lng);
      });
    }
    return [...moments].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }

  function momentCard(m, i) {
    const author = m.author;
    const dist = filter === 'nearby' ? formatDist(m.lat, m.lng) : null;
    const liked = likedIds.has(m.id);
    const likeCount = likeCounts[m.id] || 0;
    const photoUrl = m.photo_url || m.image_url || '';
    const authorId = m.author_id || m.author?.id;

    return `
      <div style="background:var(--bg);margin:6px 12px;border-radius:12px;border:1px solid var(--border-lt);overflow:hidden;">
        <!-- Author row -->
        <div class="moment-author" data-profile="${authorId}" style="display:flex;align-items:center;gap:10px;padding:14px 14px 10px;cursor:pointer;">
          <div style="width:32px;height:32px;border-radius:16px;background:var(--surface-alt);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--ink3);">
            ${author?.avatar_url ? `<img src="${author.avatar_url}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="ph ph-user" style="font-size:14px;"></i>`}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;color:var(--ink);">${author?.trail_name || 'Wanderkind'}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:1px;">
              <span style="font-size:11px;color:var(--ink3);">${formatTime(m.created_at)}</span>
              ${dist ? `<span style="width:3px;height:3px;border-radius:2px;background:var(--ink3);display:inline-block;"></span><span style="font-size:11px;color:var(--amber);font-weight:500;">${dist}</span>` : ''}
            </div>
          </div>
          ${user && authorId !== user.id ? `
            <button class="dm-author-btn" data-author-id="${authorId}" data-author-name="${author?.trail_name || ''}" style="width:36px;height:36px;border-radius:18px;background:var(--amber-bg);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="ph ph-chat-circle" style="font-size:18px;color:var(--amber);"></i>
            </button>` : ''}
        </div>
        ${photoUrl ? `<div class="moment-photo" data-url="${photoUrl}" style="cursor:pointer;"><img src="${photoUrl}" style="width:100%;height:240px;object-fit:cover;display:block;" /></div>` : ''}
        <div style="padding:10px 14px;font-size:13px;color:var(--ink);line-height:1.5;">${m.content || m.caption || ''}</div>
        ${m.location_name ? `<div style="display:flex;align-items:center;gap:4px;padding:0 14px 8px;"><i class="ph ph-map-pin" style="font-size:12px;color:var(--ink3);"></i><span style="font-size:11px;color:var(--ink3);">${m.location_name}</span></div>` : ''}
        <!-- Actions -->
        <div style="display:flex;align-items:center;gap:6px;padding:10px 14px;border-top:1px solid #F0E8D5;margin-top:4px;">
          <button class="like-btn" data-moment-id="${m.id}" style="background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;gap:4px;">
            <i class="ph ${liked ? 'ph-heart-fill' : 'ph-heart'}" style="font-size:20px;color:${liked ? '#E8404A' : 'var(--ink3)'};"></i>
          </button>
          ${likeCount > 0 ? `<span style="font-size:12px;font-weight:600;color:var(--ink2);">${likeCount}</span>` : ''}
          <button class="comment-btn" data-moment-id="${m.id}" style="background:none;border:none;cursor:pointer;padding:4px;margin-left:auto;">
            <i class="ph ph-chat-circle" style="font-size:18px;color:var(--ink3);"></i>
          </button>
        </div>
      </div>`;
  }

  function renderFeed() {
    const sorted = sortedMoments();
    const feedEl = el.querySelector('#moments-feed');
    if (!feedEl) return;

    feedEl.innerHTML = filterTabs() + (
      sorted.length === 0
        ? `<div class="wk-empty" style="padding-top:80px;">
            <div class="icon"><i class="ph ph-image" style="font-size:48px;color:var(--ink3);opacity:0.35;"></i></div>
            <p>Be the first to share from this stretch of the road.</p>
            <button class="wk-btn secondary" style="width:auto;padding:10px 20px;margin-top:12px;" id="empty-create-btn">Share a Moment</button>
          </div>`
        : sorted.map((m, i) => momentCard(m, i)).join('')
    );

    feedEl.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => { filter = btn.dataset.filter; renderFeed(); });
    });
    feedEl.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); toggleLike(btn.dataset.momentId); });
    });
    feedEl.querySelectorAll('.moment-photo').forEach(div => {
      div.addEventListener('click', () => showImageModal(div.dataset.url));
    });
    feedEl.querySelectorAll('.moment-author').forEach(div => {
      div.addEventListener('click', e => { if (!e.target.closest('.dm-author-btn')) navigate(`me/profile/${div.dataset.profile}`); });
    });
    feedEl.querySelectorAll('.dm-author-btn').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); navigate(`messages/new?userId=${btn.dataset.authorId}&name=${encodeURIComponent(btn.dataset.authorName)}`); });
    });
    feedEl.querySelectorAll('.comment-btn').forEach(btn => {
      btn.addEventListener('click', () => navigate(`memories/${btn.dataset.momentId}`));
    });
    const emptyCreate = feedEl.querySelector('#empty-create-btn');
    if (emptyCreate) emptyCreate.addEventListener('click', () => navigate('memories/create'));
  }

  // Build shell immediately
  el.innerHTML = `
    <!-- Header -->
    <div style="padding:8px 20px 16px;border-bottom:1px solid var(--border-lt);">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <div style="width:6px;height:6px;border-radius:3px;background:var(--amber);"></div>
        <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:3px;color:var(--amber);font-weight:600;">MEMORIES</span>
      </div>
      <h1 style="font-size:22px;font-weight:800;color:var(--ink);margin:0;">From the Road</h1>
    </div>

    <!-- Stories bar -->
    <div id="story-bar"></div>

    <!-- Feed -->
    <div id="moments-feed" style="flex:1;">
      <div style="padding:40px;text-align:center;"><div class="wk-spinner"></div></div>
    </div>

    <!-- FAB -->
    <button id="create-moment-btn" style="
      position:fixed;bottom:calc(var(--nav-h) + 16px);right:16px;
      width:52px;height:52px;border-radius:26px;
      background:var(--amber);color:white;border:none;cursor:pointer;
      font-size:24px;box-shadow:0 4px 12px rgba(200,118,42,0.35);
      display:flex;align-items:center;justify-content:center;z-index:50;
    "><i class="ph ph-plus"></i></button>
  `;

  el.querySelector('#create-moment-btn').addEventListener('click', () => navigate('memories/create'));
  el.querySelector('#add-story-btn')?.addEventListener('click', () => navigate('memories/create-story'));

  // Load data in parallel then render
  await Promise.all([loadMoments(), loadStories()]);

  // Render story bar
  el.querySelector('#story-bar').innerHTML = storyBar();
  el.querySelector('#add-story-btn')?.addEventListener('click', () => navigate('memories/create-story'));
  el.querySelectorAll('.story-ring').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = storyGroups.find(g => g.authorId === btn.dataset.author);
      if (group && group.stories[0]) showImageModal(group.stories[0].media_url || group.stories[0].photo_url || '');
    });
  });

  renderFeed();
  return el;
}
