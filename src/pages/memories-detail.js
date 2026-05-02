import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

function formatTime(iso) {
  const d = new Date(iso), now = new Date(), diff = now - d, mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default async function render(path) {
  const momentId = path.replace('memories/', '');
  const el = document.createElement('div');
  const user = getUser();

  el.innerHTML = `<div style="padding:40px;text-align:center;"><div class="wk-spinner"></div></div>`;

  const [{ data: m }, { data: commentRows }, { data: likeRows }] = await Promise.all([
    supabase.from('moments').select('*, author:profiles!moments_author_id_fkey(id,trail_name,avatar_url)').eq('id', momentId).single(),
    supabase.from('comments').select('*, author:profiles(id,trail_name,avatar_url)').eq('moment_id', momentId).order('created_at', { ascending: true }),
    supabase.from('moment_likes').select('user_id').eq('moment_id', momentId),
  ]);

  if (!m) {
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-lt);">
        <button id="back" style="background:none;border:none;cursor:pointer;padding:4px;"><i class="ph ph-caret-left" style="font-size:24px;color:var(--ink);"></i></button>
        <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:3px;color:var(--amber);">MEMORY</span>
      </div>
      <div class="wk-empty"><p>Memory not found.</p></div>`;
    el.querySelector('#back').addEventListener('click', () => navigate('memories'));
    return el;
  }

  let comments = commentRows || [];
  let likeCount = likeRows?.length || 0;
  let liked = !!(likeRows || []).find(r => r.user_id === user?.id);

  const name   = m.author?.trail_name || 'Wanderkind';
  const avatar = m.author?.avatar_url  || '';
  const photoUrl = m.photo_url || m.image_url || '';

  function rebuildComments() {
    const section = el.querySelector('#comments-section');
    if (!section) return;
    section.innerHTML = comments.length === 0
      ? `<div style="padding:20px;text-align:center;color:var(--ink3);font-size:13px;">No comments yet. Be the first!</div>`
      : comments.map(c => `
          <div style="display:flex;gap:10px;padding:12px 20px;border-bottom:1px solid var(--border-lt);">
            <div style="width:30px;height:30px;border-radius:15px;background:var(--surface-alt);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
              ${c.author?.avatar_url ? `<img src="${c.author.avatar_url}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="ph ph-user" style="font-size:14px;color:var(--ink3);"></i>`}
            </div>
            <div style="flex:1;">
              <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:3px;">
                <span style="font-size:13px;font-weight:600;color:var(--ink);">${c.author?.trail_name || 'Wanderkind'}</span>
                <span style="font-size:11px;color:var(--ink3);">${formatTime(c.created_at)}</span>
              </div>
              <p style="font-size:13px;color:var(--ink2);margin:0;line-height:1.5;">${c.content}</p>
            </div>
          </div>`).join('');
  }

  function rebuildLikeBtn() {
    const btn = el.querySelector('#like-btn');
    if (!btn) return;
    btn.innerHTML = `<i class="ph ${liked ? 'ph-heart-fill' : 'ph-heart'}" style="font-size:22px;color:${liked ? '#E8404A' : 'var(--ink3)'};"></i> ${likeCount > 0 ? likeCount : ''}`;
  }

  el.innerHTML = `
    <!-- Back header -->
    <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-lt);position:sticky;top:0;background:var(--bg);z-index:10;">
      <button id="back" style="background:none;border:none;cursor:pointer;padding:4px;flex-shrink:0;"><i class="ph ph-caret-left" style="font-size:24px;color:var(--ink);"></i></button>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:6px;height:6px;border-radius:3px;background:var(--amber);"></div>
        <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:3px;color:var(--amber);font-weight:600;">MEMORY</span>
      </div>
    </div>

    <!-- Author row -->
    <div id="author-row" style="display:flex;align-items:center;gap:10px;padding:14px 20px;cursor:pointer;">
      <div style="width:36px;height:36px;border-radius:18px;background:var(--surface-alt);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="ph ph-user" style="font-size:16px;color:var(--ink3);"></i>`}
      </div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;color:var(--ink);">${name}</div>
        <div style="font-size:11px;color:var(--ink3);">${formatTime(m.created_at)}</div>
      </div>
    </div>

    <!-- Photo -->
    ${photoUrl ? `<img src="${photoUrl}" style="width:100%;max-height:400px;object-fit:cover;display:block;" />` : ''}

    <!-- Actions bar -->
    <div style="display:flex;align-items:center;gap:6px;padding:12px 20px;border-bottom:1px solid var(--border-lt);">
      <button id="like-btn" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-size:15px;font-weight:600;color:var(--ink3);padding:4px;">
        <i class="ph ${liked ? 'ph-heart-fill' : 'ph-heart'}" style="font-size:22px;color:${liked ? '#E8404A' : 'var(--ink3)'};"></i> ${likeCount > 0 ? likeCount : ''}
      </button>
    </div>

    <!-- Caption -->
    ${m.content || m.caption ? `<div style="padding:12px 20px;font-size:14px;color:var(--ink);line-height:1.6;border-bottom:1px solid var(--border-lt);">${m.content || m.caption}</div>` : ''}

    <!-- Location -->
    ${m.location_name ? `<div style="display:flex;align-items:center;gap:6px;padding:8px 20px;border-bottom:1px solid var(--border-lt);"><i class="ph ph-map-pin" style="font-size:14px;color:var(--ink3);"></i><span style="font-size:12px;color:var(--ink3);">${m.location_name}</span></div>` : ''}

    <!-- Comments label -->
    <div style="padding:12px 20px 0;"><div class="h-label">COMMENTS</div></div>

    <!-- Comments list -->
    <div id="comments-section"></div>

    <!-- Comment input -->
    ${user ? `
    <div style="padding:12px 20px;border-top:1px solid var(--border-lt);display:flex;gap:10px;align-items:flex-end;background:var(--bg);position:sticky;bottom:var(--nav-h);">
      <textarea id="comment-input" placeholder="Add a comment…" style="
        flex:1;border:1px solid var(--border-lt);border-radius:10px;padding:10px 12px;
        font-size:13px;color:var(--ink);background:var(--surface-alt);resize:none;
        outline:none;font-family:inherit;line-height:1.4;min-height:38px;max-height:100px;
      " rows="1"></textarea>
      <button id="send-comment" style="
        width:38px;height:38px;border-radius:19px;background:var(--amber);border:none;
        cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;
      "><i class="ph ph-paper-plane-tilt" style="font-size:16px;color:#fff;"></i></button>
    </div>` : `<div style="padding:16px 20px;text-align:center;color:var(--ink3);font-size:12px;">Sign in to comment</div>`}
  `;

  rebuildComments();

  el.querySelector('#back')?.addEventListener('click', () => navigate('memories'));
  el.querySelector('#author-row')?.addEventListener('click', () => navigate(`me/profile/${m.author_id}`));

  // Like
  el.querySelector('#like-btn')?.addEventListener('click', async () => {
    if (!user) { navigate('auth/signin'); return; }
    liked = !liked;
    likeCount = Math.max(0, likeCount + (liked ? 1 : -1));
    rebuildLikeBtn();
    if (liked) await supabase.from('moment_likes').insert({ moment_id: momentId, user_id: user.id });
    else await supabase.from('moment_likes').delete().eq('moment_id', momentId).eq('user_id', user.id);
  });

  // Comment input auto-resize
  const textarea = el.querySelector('#comment-input');
  textarea?.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(100, textarea.scrollHeight) + 'px';
  });

  // Send comment
  el.querySelector('#send-comment')?.addEventListener('click', async () => {
    const text = textarea?.value.trim();
    if (!text || !user) return;
    textarea.value = '';
    textarea.style.height = 'auto';
    const { data: newComment, error } = await supabase.from('comments').insert({
      moment_id: momentId,
      user_id: user.id,
      content: text,
    }).select('*, author:profiles(id,trail_name,avatar_url)').single();
    if (!error && newComment) {
      comments = [...comments, newComment];
      rebuildComments();
    } else if (error) {
      toastError('Could not post comment');
    }
  });

  return el;
}
