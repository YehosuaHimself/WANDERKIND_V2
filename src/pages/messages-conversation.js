import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

export default async function render(path) {
  const partnerId = path.replace('messages/', '');
  const user = getUser();
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;flex-direction:column;height:100vh;';

  // Load partner profile
  const { data: partner } = await supabase
    .from('profiles').select('trail_name,avatar_url').eq('id', partnerId).single();
  const name = partner?.trail_name || 'Wanderer';
  const avatar = partner?.avatar_url || '';

  // Load messages
  const { data: msgs } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`)
    .order('created_at', { ascending: true })
    .limit(50);

  el.innerHTML = `
    <div class="wk-header" style="flex-shrink:0;">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <div style="width:32px;height:32px;border-radius:16px;overflow:hidden;background:var(--amber-bg);
        display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;"/>` : `<i class="ph ph-user" style="color:var(--amber);font-size:16px;"></i>`}
      </div>
      <h1 style="font-size:var(--text-sm);">${name.toUpperCase()}</h1>
    </div>

    <div id="msg-thread" style="flex:1;overflow-y:auto;padding:var(--sp-md) var(--screen-px);
      display:flex;flex-direction:column;gap:var(--sp-sm);">
      ${!msgs || msgs.length === 0 ? `
        <div class="wk-empty"><p>Start the conversation.</p></div>` :
        msgs.map(m => {
          const mine = m.sender_id === user.id;
          return `<div style="display:flex;justify-content:${mine?'flex-end':'flex-start'};">
            <div style="max-width:75%;padding:10px 14px;border-radius:${mine?'16px 16px 4px 16px':'16px 16px 16px 4px'};
              background:${mine?'var(--amber)':'var(--surface-alt)'};
              color:${mine?'var(--white)':'var(--ink)'};
              font-size:var(--text-sm);line-height:1.5;">${m.content}</div>
          </div>`;
        }).join('')}
    </div>

    <div style="flex-shrink:0;padding:var(--sp-sm) var(--screen-px);
      border-top:1px solid var(--border-lt);background:var(--bg);
      display:flex;gap:var(--sp-sm);align-items:flex-end;">
      <textarea id="msg-input" placeholder="Write a message…" rows="1"
        style="flex:1;border:1px solid var(--border);border-radius:var(--r-lg);
        padding:10px var(--sp-md);font-size:var(--text-sm);resize:none;
        font-family:var(--font-body);background:var(--surface);color:var(--ink);outline:none;
        max-height:120px;overflow-y:auto;"></textarea>
      <button id="send-btn" style="width:40px;height:40px;border-radius:20px;
        background:var(--amber);border:none;cursor:pointer;color:var(--white);
        font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="ph ph-paper-plane-tilt"></i>
      </button>
    </div>`;

  el.querySelector('#back').addEventListener('click', () => navigate('messages'));

  // Auto-scroll to bottom
  const thread = el.querySelector('#msg-thread');
  setTimeout(() => { thread.scrollTop = thread.scrollHeight; }, 50);

  // Auto-resize textarea
  const input = el.querySelector('#msg-input');
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Send
  async function sendMessage() {
    const content = input.value.trim();
    if (!content) return;
    input.value = ''; input.style.height = 'auto';

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id, recipient_id: partnerId, content,
    });
    if (!error) {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;justify-content:flex-end;';
      div.innerHTML = `<div style="max-width:75%;padding:10px 14px;border-radius:16px 16px 4px 16px;
        background:var(--amber);color:var(--white);font-size:var(--text-sm);line-height:1.5;">${content}</div>`;
      thread.appendChild(div);
      thread.scrollTop = thread.scrollHeight;
    }
  }

  el.querySelector('#send-btn').addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

  return el;
}
