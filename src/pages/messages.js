import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

function fmt(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso), m = Math.floor(diff/60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h/24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
}

export default async function render() {
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;flex-direction:column;height:100%;';
  const user = getUser();
  let tab = '1on1', threads = [], searchQ = '', searchRes = [], timer;

  async function fetchThreads() {
    if (!user) return;
    const { data } = await supabase.from('threads').select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order('last_message_at', { ascending:false });
    if (data && data.length) {
      threads = data.map(t => ({
        id: t.id, otherId: t.user_a===user.id ? t.user_b : t.user_a,
        name: t.other_trail_name||'Wanderkind', avatar: t.other_avatar_url||null,
        last: t.last_message||'', at: t.last_message_at, unread: t.unread_count||0,
      }));
      return;
    }
    // fallback: dedupe raw messages
    const { data: msgs } = await supabase.from('messages')
      .select('*, profiles!messages_sender_id_fkey(trail_name,avatar_url)')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at',{ascending:false}).limit(50);
    const seen = new Map();
    for (const m of msgs||[]) {
      const pid = m.sender_id===user.id ? m.recipient_id : m.sender_id;
      if (!seen.has(pid)) seen.set(pid,{id:`m_${pid}`,otherId:pid,name:m.profiles?.trail_name||'Wanderer',avatar:m.profiles?.avatar_url||null,last:m.content||'',at:m.created_at,unread:0});
    }
    threads = Array.from(seen.values());
  }

  async function doSearch(q) {
    if (!q.trim()) { searchRes = []; return; }
    const { data } = await supabase.from('profiles').select('id,trail_name,avatar_url,bio')
      .ilike('trail_name',`%${q.trim().replace(/^@/,'')}%`).neq('id',user?.id||'').limit(10);
    searchRes = data||[];
  }

  function avatarHTML(url, size='md', name='') {
    return `<div class="avatar ${size}">${url?`<img src="${url}" alt="${name}" />`:`<i class="ph ph-user"></i>`}</div>`;
  }

  function threadHTML(t) {
    return `<div class="thread-row" data-id="${t.otherId}">
      ${avatarHTML(t.avatar,'md',t.name)}
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;">
          <span class="thread-name">${t.name}</span>
          <span class="thread-time">${fmt(t.at)}</span>
        </div>
        <div class="thread-preview">${t.last}</div>
      </div>
      ${t.unread?`<div class="unread-badge">${t.unread}</div>`:''}
    </div>`;
  }

  function searchRowHTML(p) {
    return `<div class="thread-row search-row" data-uid="${p.id}" data-name="${encodeURIComponent(p.trail_name)}">
      ${avatarHTML(p.avatar_url,'md',p.trail_name)}
      <div style="flex:1;min-width:0;">
        <div class="thread-name">${p.trail_name}</div>
        <div class="thread-preview">${p.bio?p.bio.slice(0,55):'Wanderkind'}</div>
      </div>
      <div style="width:32px;height:32px;border-radius:16px;background:var(--amber-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="ph ph-chat-circle" style="font-size:14px;color:var(--amber);"></i>
      </div>
    </div>`;
  }

  function rebuild() {
    const isSearch = tab==='1on1' && searchQ.trim().length>0;
    const showSearch = isSearch && searchRes.length>0;

    el.innerHTML = `
      <div class="page-header" style="padding-bottom:0;">
        <div class="page-label">MESSAGES</div>
      </div>

      <div class="inner-tab-bar">
        <button class="inner-tab${tab==='1on1'?' active':''}" data-tab="1on1">1:1</button>
        <button class="inner-tab${tab==='groups'?' active':''}" data-tab="groups">GROUPS</button>
      </div>

      <div class="e2e-banner">
        <i class="ph ph-lock"></i>
        End-to-end encrypted
        <i class="ph ph-shield-check"></i>
      </div>

      ${tab==='1on1'?`
      <div class="search-wrap">
        <div class="search-bar">
          <i class="ph ph-magnifying-glass"></i>
          <input id="msg-search" type="text" placeholder="Search by name or @handle…" value="${searchQ}" autocomplete="off" autocapitalize="off" />
          ${searchQ?`<button class="clear-btn" id="clear-search"><i class="ph ph-x-circle"></i></button>`:''}
        </div>
      </div>`:''}

      <div id="msg-content" style="flex:1;overflow-y:auto;">
        ${tab==='groups' ? `
          <div class="wk-empty">
            <div class="icon"><i class="ph ph-users-three"></i></div>
            <p>Group conversations with fellow Wanderkinder coming soon.</p>
          </div>` :
        isSearch ? (searchRes.length ? searchRes.map(searchRowHTML).join('') :
          `<div class="wk-empty"><p>No wanderkinder found.<br/>Try a different name or @handle.</p></div>`) :
        threads.length ? threads.map(threadHTML).join('') : `
          <div class="wk-empty">
            <div class="icon"><i class="ph ph-paper-plane-tilt"></i></div>
            <p>No messages yet.<br/>Connect with hosts and Wanderkinder along your Way.</p>
            <button class="wk-btn secondary" style="width:auto;padding:10px 20px;margin-top:var(--sp-sm);" id="find-btn">Find a Wanderkind</button>
          </div>`}
      </div>

      ${tab==='1on1'?`<button class="fab" id="msg-fab"><i class="ph ph-pencil-simple"></i></button>`:''}
    `;

    el.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab=b.dataset.tab; searchQ=''; searchRes=[]; rebuild(); }));
    el.querySelector('#msg-fab')?.addEventListener('click', () => navigate('messages/new'));
    el.querySelector('#find-btn')?.addEventListener('click', () => el.querySelector('#msg-search')?.focus());
    el.querySelector('#clear-search')?.addEventListener('click', () => { searchQ=''; searchRes=[]; rebuild(); });

    const si = el.querySelector('#msg-search');
    if (si) si.addEventListener('input', e => {
      searchQ = e.target.value;
      clearTimeout(timer);
      timer = setTimeout(async () => { await doSearch(searchQ); updateContent(); }, 280);
    });

    el.querySelectorAll('.thread-row[data-id]').forEach(r => r.addEventListener('click', () => navigate(`messages/${r.dataset.id}`)));
    el.querySelectorAll('.search-row[data-uid]').forEach(r => r.addEventListener('click', () => navigate(`messages/new?userId=${r.dataset.uid}&name=${r.dataset.name}`)));
  }

  function updateContent() {
    const c = el.querySelector('#msg-content');
    if (!c) return;
    const isSearch = searchQ.trim().length>0;
    c.innerHTML = isSearch ? (searchRes.length ? searchRes.map(searchRowHTML).join('') :
      `<div class="wk-empty"><p>No wanderkinder found.</p></div>`) :
      threads.length ? threads.map(threadHTML).join('') :
      `<div class="wk-empty"><div class="icon"><i class="ph ph-paper-plane-tilt"></i></div><p>No messages yet.</p></div>`;
    el.querySelectorAll('.thread-row[data-id]').forEach(r => r.addEventListener('click', () => navigate(`messages/${r.dataset.id}`)));
    el.querySelectorAll('.search-row[data-uid]').forEach(r => r.addEventListener('click', () => navigate(`messages/new?userId=${r.dataset.uid}&name=${r.dataset.name}`)));
  }

  await fetchThreads();
  rebuild();
  return el;
}
