import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso), now = new Date(), diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default async function render() {
  const el = document.createElement('div');
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.height = '100%';

  let activeTab = '1on1';
  let threads = [];
  let searchQuery = '';
  let searchResults = [];
  let isSearching = false;
  let searchTimer = null;

  const user = getUser();

  async function fetchThreads() {
    if (!user) return;
    const { data } = await supabase
      .from('threads')
      .select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    threads = (data || []).map(t => ({
      id: t.id,
      otherId: t.user_a === user.id ? t.user_b : t.user_a,
      name: t.other_trail_name || 'Wanderkind',
      avatar: t.other_avatar_url || null,
      lastMessage: t.last_message || '',
      lastAt: t.last_message_at,
      unread: t.unread_count || 0,
    }));

    // If no threads table data, fall back to deduplicated messages
    if (threads.length === 0) {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*, profiles!messages_sender_id_fkey(trail_name,avatar_url)')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      const seen = new Map();
      for (const m of msgs || []) {
        const partnerId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        if (!seen.has(partnerId)) {
          seen.set(partnerId, {
            id: `msg_${partnerId}`,
            otherId: partnerId,
            name: m.profiles?.trail_name || 'Wanderer',
            avatar: m.profiles?.avatar_url || null,
            lastMessage: m.content || '',
            lastAt: m.created_at,
            unread: 0,
          });
        }
      }
      threads = Array.from(seen.values());
    }
  }

  async function searchProfiles(q) {
    if (!q.trim()) { searchResults = []; return; }
    const clean = q.trim().replace(/^@/, '');
    const { data } = await supabase
      .from('profiles')
      .select('id,trail_name,avatar_url,bio')
      .ilike('trail_name', `%${clean}%`)
      .neq('id', user?.id || '')
      .limit(10);
    searchResults = data || [];
  }

  function threadRow(t) {
    return `
      <div class="msg-thread" data-thread-id="${t.id}" data-other-id="${t.otherId}" style="
        display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;
        border-bottom:1px solid var(--border-lt);transition:background 0.12s;
      ">
        <div style="width:44px;height:44px;border-radius:22px;background:var(--surface-alt);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--ink3);font-size:18px;">
          ${t.avatar ? `<img src="${t.avatar}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="ph ph-user"></i>`}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span style="font-size:14px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;">${t.name}</span>
            <span style="font-size:11px;color:var(--ink3);flex-shrink:0;">${formatTime(t.lastAt)}</span>
          </div>
          <div style="font-size:12px;color:var(--ink3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.lastMessage}</div>
        </div>
        ${t.unread > 0 ? `<div style="min-width:20px;height:20px;border-radius:10px;background:var(--amber);display:flex;align-items:center;justify-content:center;padding:0 6px;flex-shrink:0;"><span style="font-size:10px;font-weight:700;color:#fff;">${t.unread}</span></div>` : ''}
      </div>`;
  }

  function searchResultRow(p) {
    return `
      <div class="search-result" data-user-id="${p.id}" data-name="${encodeURIComponent(p.trail_name)}" style="
        display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;
        border-bottom:1px solid var(--border-lt);transition:background 0.12s;
      ">
        <div style="width:44px;height:44px;border-radius:22px;background:var(--surface-alt);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--ink3);font-size:18px;">
          ${p.avatar_url ? `<img src="${p.avatar_url}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="ph ph-user"></i>`}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:600;color:var(--ink);">${p.trail_name}</div>
          <div style="font-size:12px;color:var(--ink3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.bio ? p.bio.slice(0,60) : 'Wanderkind'}</div>
        </div>
        <div style="width:32px;height:32px;border-radius:16px;background:var(--amber-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="ph ph-chat-circle" style="font-size:14px;color:var(--amber);"></i>
        </div>
      </div>`;
  }

  async function rebuild() {
    const showSearch = activeTab === '1on1';
    const showSearchResults = showSearch && isSearching && searchQuery.trim().length > 0;

    let mainContent = '';

    if (activeTab === 'groups') {
      mainContent = `
        <div class="wk-empty" style="padding-top:80px;">
          <div class="icon"><i class="ph ph-users-three" style="font-size:48px;color:var(--ink3);opacity:0.35;"></i></div>
          <p>Group conversations with fellow Wanderkinder coming soon.</p>
        </div>`;
    } else if (showSearchResults) {
      if (searchResults.length === 0) {
        mainContent = `<div class="wk-empty" style="padding-top:60px;"><p>No wanderkinder found.<br/>Try a different name or @handle.</p></div>`;
      } else {
        mainContent = searchResults.map(searchResultRow).join('');
      }
    } else {
      if (threads.length === 0) {
        mainContent = `
          <div class="wk-empty" style="padding-top:80px;">
            <div class="icon"><i class="ph ph-paper-plane-tilt" style="font-size:48px;color:var(--ink3);opacity:0.35;"></i></div>
            <p>No messages yet.<br/>Connect with hosts and Wanderkinder along your Way.</p>
            <button class="wk-btn secondary" style="width:auto;padding:10px 20px;margin-top:12px;" id="find-wk-btn">Find a Wanderkind</button>
          </div>`;
      } else {
        mainContent = threads.map(threadRow).join('');
      }
    }

    el.innerHTML = `
      <!-- Header -->
      <div style="padding:8px 20px 4px;background:var(--bg);">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:14px;height:1.5px;border-radius:1px;background:var(--amber);"></div>
          <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:3px;color:var(--amber);font-weight:600;">MESSAGES</span>
        </div>
      </div>

      <!-- Tab bar -->
      <div style="display:flex;border-bottom:1px solid var(--border-lt);background:var(--bg);padding:0 20px;">
        ${[['1on1','1:1'],['groups','GROUPS']].map(([key,label]) => {
          const active = key === activeTab;
          return `<button data-msg-tab="${key}" style="
            padding:12px 4px;margin-right:20px;border:none;background:transparent;cursor:pointer;
            font-family:var(--font-mono);font-size:15px;font-weight:700;letter-spacing:2px;
            color:${active ? 'var(--amber)' : 'var(--ink3)'};
            border-bottom:${active ? '2px solid var(--amber)' : '2px solid transparent'};
            margin-bottom:-1px;transition:color 0.15s;">${label}</button>`;
        }).join('')}
      </div>

      <!-- E2E banner -->
      <div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:7px;background:rgba(39,134,74,0.06);border-bottom:1px solid rgba(39,134,74,0.1);">
        <i class="ph ph-lock" style="font-size:13px;color:#27864A;"></i>
        <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:1.5px;font-weight:600;color:#27864A;text-transform:uppercase;">End-to-end encrypted</span>
        <i class="ph ph-shield-check" style="font-size:13px;color:#27864A;"></i>
      </div>

      <!-- Search bar (1:1 only) -->
      ${showSearch ? `
      <div style="padding:10px 20px;border-bottom:1px solid var(--border-lt);">
        <div style="display:flex;align-items:center;gap:8px;background:var(--surface-alt);border-radius:10px;padding:8px 12px;">
          <i class="ph ph-magnifying-glass" style="font-size:16px;color:var(--ink3);flex-shrink:0;"></i>
          <input id="msg-search" type="text" placeholder="Search wanderkinder by name or @handle…" value="${searchQuery}" style="
            flex:1;border:none;background:transparent;font-size:14px;color:var(--ink);outline:none;
          " autocomplete="off" autocapitalize="off" />
          ${searchQuery ? `<button id="clear-search" style="background:none;border:none;cursor:pointer;padding:0;"><i class="ph ph-x-circle" style="font-size:16px;color:var(--ink3);"></i></button>` : ''}
        </div>
      </div>` : ''}

      <!-- Content -->
      <div id="msg-content" style="flex:1;overflow-y:auto;">${mainContent}</div>

      <!-- FAB (1:1 only) -->
      ${activeTab === '1on1' ? `<button id="msg-fab" style="
        position:fixed;bottom:calc(var(--nav-h) + 16px);right:16px;
        width:56px;height:56px;border-radius:28px;background:var(--amber);
        color:#fff;border:none;cursor:pointer;font-size:24px;
        box-shadow:0 4px 12px rgba(200,118,42,0.35);
        display:flex;align-items:center;justify-content:center;z-index:50;
      "><i class="ph ph-pencil-simple"></i></button>` : ''}
    `;

    // Bind tab switches
    el.querySelectorAll('[data-msg-tab]').forEach(btn => {
      btn.addEventListener('click', async () => {
        activeTab = btn.dataset.msgTab;
        searchQuery = '';
        isSearching = false;
        searchResults = [];
        await rebuild();
      });
    });

    // Search
    const searchInput = el.querySelector('#msg-search');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        searchQuery = e.target.value;
        isSearching = true;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(async () => {
          await searchProfiles(searchQuery);
          // Update just the content div
          const contentEl = el.querySelector('#msg-content');
          if (!contentEl) return;
          if (!searchQuery.trim()) {
            contentEl.innerHTML = threads.length === 0
              ? `<div class="wk-empty" style="padding-top:80px;"><div class="icon"><i class="ph ph-paper-plane-tilt" style="font-size:48px;color:var(--ink3);opacity:0.35;"></i></div><p>No messages yet.</p></div>`
              : threads.map(threadRow).join('');
            bindContent();
          } else {
            contentEl.innerHTML = searchResults.length === 0
              ? `<div class="wk-empty" style="padding-top:60px;"><p>No wanderkinder found.</p></div>`
              : searchResults.map(searchResultRow).join('');
            bindContent();
          }
        }, 300);
      });
      searchInput.addEventListener('focus', () => { isSearching = true; });
    }

    el.querySelector('#clear-search')?.addEventListener('click', async () => {
      searchQuery = '';
      isSearching = false;
      searchResults = [];
      await rebuild();
    });

    el.querySelector('#msg-fab')?.addEventListener('click', () => navigate('messages/new'));
    el.querySelector('#find-wk-btn')?.addEventListener('click', () => {
      const input = el.querySelector('#msg-search');
      if (input) input.focus();
    });

    bindContent();
  }

  function bindContent() {
    el.querySelectorAll('.msg-thread').forEach(row => {
      row.addEventListener('click', () => navigate(`messages/${row.dataset.otherId}`));
      row.addEventListener('mouseenter', () => { row.style.background = 'var(--surface-alt)'; });
      row.addEventListener('mouseleave', () => { row.style.background = ''; });
    });
    el.querySelectorAll('.search-result').forEach(row => {
      row.addEventListener('click', () => navigate(`messages/new?userId=${row.dataset.userId}&name=${row.dataset.name}`));
      row.addEventListener('mouseenter', () => { row.style.background = 'var(--surface-alt)'; });
      row.addEventListener('mouseleave', () => { row.style.background = ''; });
    });
  }

  await fetchThreads();
  await rebuild();
  return el;
}
