import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

export default async function render(path) {
  const partnerId = path.replace('messages/', '');
  const user = getUser();
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;flex-direction:column;height:100%;';

  const { data: partner } = await supabase
    .from('profiles').select('trail_name,avatar_url,is_walking').eq('id', partnerId).single();
  const name   = partner?.trail_name || 'Wanderer';
  const avatar = partner?.avatar_url || '';

  const { data: msgs } = await supabase
    .from('messages').select('*')
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`)
    .order('created_at', { ascending: true }).limit(100);

  function bubbleHTML(m) {
    const mine = m.sender_id === user.id;
    return `<div style="display:flex;justify-content:${mine?'flex-end':'flex-start'};margin-bottom:4px;">
      <div style="max-width:78%;padding:10px 14px;
        border-radius:${mine?'18px 18px 4px 18px':'18px 18px 18px 4px'};
        background:${mine?'var(--amber)':'var(--surface-alt)'};
        color:${mine?'#fff':'var(--ink)'};
        font-size:14px;line-height:1.55;
        box-shadow:0 1px 3px rgba(26,18,10,${mine?'0.15':'0.06'});">
        ${m.content}
        <div style="font-size:10px;opacity:0.55;margin-top:3px;text-align:right;">${fmt(m.created_at)}</div>
      </div>
    </div>`;
  }

  el.innerHTML = `
    <!-- Header -->
    <div class="wk-header" style="flex-shrink:0;gap:12px;">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <div class="avatar sm" style="flex-shrink:0;cursor:pointer;" id="partner-avatar">
        ${avatar?`<img src="${avatar}" alt="${name}" />`:`<i class="ph ph-user"></i>`}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-family:var(--font-mono);font-size:13px;font-weight:700;letter-spacing:1.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name.toUpperCase()}</div>
        ${partner?.is_walking?`<div style="font-size:11px;color:var(--amber);font-weight:600;">● Currently Wandering</div>`:`<div style="font-size:11px;color:var(--ink3);">Wanderkind</div>`}
      </div>
    </div>

    <!-- E2E note -->
    <div class="e2e-banner" style="font-size:11px;">
      <i class="ph ph-lock"></i> End-to-end encrypted
    </div>

    <!-- Thread -->
    <div id="msg-thread" style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;">
      ${!msgs||msgs.length===0
        ?`<div class="wk-empty"><div class="icon"><i class="ph ph-chat-circle-dots"></i></div><p>Say hello to ${name}.<br/>All messages are private.</p></div>`
        :msgs.map(m=>bubbleHTML(m)).join('')}
    </div>

    <!-- Composer -->
    <div style="flex-shrink:0;padding:10px 16px 10px;border-top:1px solid var(--border-lt);background:var(--bg);display:flex;gap:10px;align-items:flex-end;">
      <textarea id="msg-input" placeholder="Write a message…" rows="1"
        style="flex:1;border:1.5px solid var(--border);border-radius:20px;
        padding:10px 16px;font-size:15px;resize:none;
        font-family:var(--font-body);background:var(--surface);color:var(--ink);outline:none;
        max-height:120px;overflow-y:auto;transition:border-color 0.15s;"></textarea>
      <button id="send-btn" style="width:44px;height:44px;border-radius:22px;flex-shrink:0;
        background:var(--amber);border:none;cursor:pointer;color:#fff;
        font-size:20px;display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(200,118,42,0.35);transition:transform 0.1s,box-shadow 0.1s;">
        <i class="ph ph-paper-plane-tilt"></i>
      </button>
    </div>
  `;

  const thread = el.querySelector('#msg-thread');
  const input  = el.querySelector('#msg-input');
  const sendBtn= el.querySelector('#send-btn');

  // focus styles
  input.addEventListener('focus', () => { input.style.borderColor = 'var(--amber)'; });
  input.addEventListener('blur',  () => { input.style.borderColor = 'var(--border)'; });

  // scroll to bottom
  setTimeout(() => { thread.scrollTop = thread.scrollHeight; }, 60);

  // auto-resize
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  async function sendMessage() {
    const content = input.value.trim();
    if (!content) return;
    input.value = ''; input.style.height = 'auto';
    sendBtn.style.transform = 'scale(0.9)';
    setTimeout(() => { sendBtn.style.transform = ''; }, 150);

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id, recipient_id: partnerId, content,
    });
    if (!error) {
      const wrap = document.createElement('div');
      wrap.innerHTML = bubbleHTML({ sender_id: user.id, content, created_at: new Date().toISOString() });
      thread.appendChild(wrap.firstElementChild);
      thread.scrollTop = thread.scrollHeight;
    }
  }

  el.querySelector('#back').addEventListener('click', () => navigate('messages'));
  el.querySelector('#partner-avatar').addEventListener('click', () => navigate(`me/profile/${partnerId}`));
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

  return el;
}
