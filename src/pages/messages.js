import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

export default async function render() {
  const el = document.createElement('div');
  let activeTab = '1on1';

  function tabBar() {
    return `
      <div style="display:flex;border-bottom:1px solid var(--border-lt);background:var(--bg);position:sticky;top:0;z-index:5;">
        ${[['1on1','1:1'],['groups','GROUPS']].map(([key,label]) => {
          const active = key === activeTab;
          return `<button data-msg-tab="${key}" style="
            flex:1;padding:14px 0;border:none;background:transparent;cursor:pointer;
            font-family:var(--font-mono);font-size:15px;font-weight:700;letter-spacing:2px;
            text-transform:uppercase;color:${active ? 'var(--amber)' : 'var(--ink3)'};
            border-bottom:${active ? '2px solid var(--amber)' : '2px solid transparent'};
            margin-bottom:-1px;transition:color 0.15s;">${label}</button>`;
        }).join('')}
      </div>`;
  }

  async function dmContent() {
    const user = getUser();
    if (!user) return `<div class="wk-empty"><p>Sign in to see your messages</p></div>`;

    const { data: convos } = await supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(trail_name, avatar_url)')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!convos || convos.length === 0) {
      return `
        <div class="wk-empty" style="padding:var(--sp-3xl) 0;">
          <div class="icon"><i class="ph ph-paper-plane-tilt" style="font-size:48px;color:var(--ink3);opacity:0.4;"></i></div>
          <p>No conversations yet.<br/>Send your first message to a wanderer.</p>
        </div>`;
    }

    // Deduplicate by conversation partner
    const seen = new Set();
    const unique = convos.filter(m => {
      const partnerId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      if (seen.has(partnerId)) return false;
      seen.add(partnerId); return true;
    });

    return `<div class="row-list">
      ${unique.map(m => {
        const partner = m.profiles;
        const name = partner?.trail_name || 'Wanderer';
        const avatar = partner?.avatar_url || '';
        return `
          <div class="row-item" data-conv="${m.sender_id === user.id ? m.recipient_id : m.sender_id}">
            <div style="width:44px;height:44px;border-radius:22px;background:var(--amber-bg);
              border:1px solid var(--border-lt);flex-shrink:0;overflow:hidden;display:flex;
              align-items:center;justify-content:center;color:var(--amber);font-size:18px;">
              ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="ph ph-user"></i>`}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:600;color:var(--ink);">${name}</div>
              <div style="font-size:var(--text-caption);color:var(--ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${m.content || ''}
              </div>
            </div>
            <div style="font-size:var(--text-caption);color:var(--ink3);font-family:var(--font-mono);flex-shrink:0;">
              ${new Date(m.created_at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}
            </div>
          </div>`;
      }).join('')}
    </div>`;
  }

  function groupsContent() {
    return `
      <div class="wk-empty" style="padding:var(--sp-3xl) 0;">
        <div class="icon"><i class="ph ph-users-three" style="font-size:48px;color:var(--ink3);opacity:0.4;"></i></div>
        <p>Group chats for wanderers on the same route.</p>
        <button class="wk-btn secondary" style="margin-top:var(--sp-md);width:auto;padding:10px 20px;"
          onclick="navigate('messages/group/create')">Create a group</button>
      </div>`;
  }

  async function rebuild() {
    const content = activeTab === '1on1' ? await dmContent() : groupsContent();
    el.innerHTML = tabBar() + `<div id="msg-content">${content}</div>`;

    // Tab switching
    el.querySelectorAll('[data-msg-tab]').forEach(btn => {
      btn.addEventListener('click', async () => {
        activeTab = btn.dataset.msgTab;
        await rebuild();
      });
    });

    // Row clicks
    el.querySelectorAll('[data-conv]').forEach(row => {
      row.addEventListener('click', () => navigate(`messages/${row.dataset.conv}`));
    });

    // FAB — only for 1:1
    if (activeTab === '1on1') {
      const fab = document.createElement('button');
      fab.innerHTML = `<i class="ph ph-pencil"></i>`;
      Object.assign(fab.style, {
        position:'fixed', bottom:`calc(var(--nav-h) + 16px)`, right:'16px',
        width:'52px', height:'52px', borderRadius:'26px',
        background:'var(--amber)', color:'var(--white)',
        border:'none', cursor:'pointer', fontSize:'22px',
        boxShadow:'0 4px 12px rgba(200,118,42,0.35)',
        display:'flex', alignItems:'center', justifyContent:'center', zIndex:'50',
      });
      fab.addEventListener('click', () => navigate('messages/new'));
      el.appendChild(fab);
    }
  }

  await rebuild();
  return el;
}
