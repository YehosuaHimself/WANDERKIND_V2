import { supabase } from '../lib/supabase.js';
import { getUser, signOut } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

const TIER_COLORS = {
  wanderkind:'#9B8E7E', wunderkind:'#9B8E7E',
  wandersmann:'#C8762A', ehrenmann:'#C8762A', pilger:'#C8762A',
  apostel:'#D4A017', lehrer:'#D4A017',
  meister:'#B8860B', grossmeister:'#B8860B',
  legende:'#27864A', koenig:'#27864A',
};

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  el.style.paddingBottom = '24px';

  let activeTab = 'profile'; // 'profile' | 'credentials'
  let moments = [];
  let showStats = true;
  let isWalking = false;

  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null };

  const name        = profile?.trail_name || profile?.full_name || user?.user_metadata?.trail_name || 'Wanderer';
  const avatar      = profile?.avatar_url || '';
  const cover       = profile?.cover_url  || '';
  const bio         = profile?.bio        || '';
  const nightCount  = profile?.night_count || 0;
  const stampsCount = profile?.stamps_count || 0;
  const hostedCount = profile?.hosted_count || 0;
  const tier        = profile?.tier || 'wanderkind';
  const tierColor   = TIER_COLORS[tier] || '#9B8E7E';
  const wkId        = profile?.wanderkind_id || 'WK-0000';
  const handle      = '@' + (profile?.trail_name || 'wanderkind').toLowerCase().replace(/\s+/g, '.');
  const galleryPhotos = profile?.gallery_urls || profile?.gallery || [];
  const hasOffering = !!(profile?.is_hosting || profile?.hosting_project_title);
  const isQuietMode = profile?.quiet_mode || false;
  showStats = profile?.show_stats !== false;
  isWalking = profile?.is_walking || false;

  // Load recent moments
  if (user) {
    const { data: mData } = await supabase
      .from('moments')
      .select('id,photo_url,image_url,created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(9);
    moments = mData || [];
  }

  function render() {
    const isProfile = activeTab === 'profile';

    // Profile completeness banner
    const completenessItems = [avatar, bio, hasOffering].filter(Boolean).length;
    const completeness = Math.round((completenessItems / 3) * 100);
    const showBanner = completeness < 100 && isProfile;

    el.innerHTML = `
      <!-- Cover -->
      <div style="position:relative;height:180px;background:${cover ? `url('${cover}') center/cover no-repeat` : 'var(--surface-alt)'};cursor:pointer;" id="cover-area">
        ${!cover ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--ink3);flex-direction:column;gap:4px;"><i class="ph ph-image" style="font-size:32px;"></i><span style="font-size:10px;font-family:var(--font-mono);letter-spacing:1px;">ADD COVER</span></div>` : ''}
        <div id="cover-camera" style="position:absolute;bottom:10px;right:10px;width:30px;height:30px;border-radius:15px;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;">
          <i class="ph ph-camera" style="font-size:14px;color:#fff;"></i>
        </div>
      </div>

      <!-- Avatar + quick actions -->
      <div style="padding:0 var(--screen-px);margin-top:-36px;position:relative;">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:var(--sp-md);">
          <!-- Avatar -->
          <div style="position:relative;">
            <div id="avatar-wrap" style="width:72px;height:72px;border-radius:36px;border:3px solid var(--bg);background:var(--surface-alt);overflow:hidden;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--amber);font-size:28px;">
              ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="ph ph-user"></i>`}
            </div>
            ${isWalking ? `<div style="position:absolute;bottom:2px;right:2px;width:18px;height:18px;border-radius:9px;background:var(--amber);border:2px solid var(--bg);display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;font-weight:800;color:#fff;">W</span></div>` : ''}
            <div id="avatar-camera" style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);width:24px;height:24px;border-radius:12px;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;cursor:pointer;">
              <i class="ph ph-camera" style="font-size:12px;color:#fff;"></i>
            </div>
          </div>

          <!-- Quick action buttons -->
          <div style="display:flex;gap:8px;align-items:center;padding-bottom:4px;">
            <button id="share-btn" style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:20px;border:1px solid var(--border-lt);background:var(--bg);cursor:pointer;font-size:12px;font-family:var(--font-mono);font-weight:600;color:var(--ink3);letter-spacing:0.5px;">
              <i class="ph ph-share-network" style="font-size:14px;"></i> SHARE
            </button>
            <button id="edit-profile-btn" style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:20px;border:1px solid var(--border-lt);background:var(--bg);cursor:pointer;font-size:12px;font-family:var(--font-mono);font-weight:600;color:var(--ink3);letter-spacing:0.5px;">
              <i class="ph ph-pencil-simple" style="font-size:14px;"></i> EDIT
            </button>
          </div>
        </div>

        <!-- Name + handle + tier -->
        <h2 style="font-family:var(--font-mono);font-size:20px;font-weight:700;color:var(--ink);margin:0;">${name}</h2>
        <div style="font-size:12px;color:var(--ink3);margin-top:3px;font-family:var(--font-mono);">${handle} · ${wkId}</div>

        ${!isQuietMode ? `
        <div style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:4px 10px;border-radius:12px;background:${tierColor}18;">
          <div style="width:7px;height:7px;border-radius:4px;background:${tierColor};"></div>
          <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:2px;color:${tierColor};">${tier.toUpperCase()}</span>
        </div>` : ''}

        ${bio ? `<p style="margin-top:10px;color:var(--ink2);font-size:13px;line-height:1.5;">${bio}</p>` : ''}

        <!-- Walking toggle -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding:10px 14px;border-radius:12px;background:var(--surface-alt);border:1px solid var(--border-lt);">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="ph ph-person-simple-walk" style="font-size:18px;color:${isWalking ? 'var(--amber)' : 'var(--ink3)'};"></i>
            <span style="font-size:13px;font-weight:600;color:${isWalking ? 'var(--amber)' : 'var(--ink3)'};">${isWalking ? 'Currently Wandering' : 'Resting'}</span>
          </div>
          <label style="position:relative;width:42px;height:24px;cursor:pointer;">
            <input type="checkbox" id="walking-toggle" ${isWalking ? 'checked' : ''} style="opacity:0;width:0;height:0;position:absolute;" ${isWalking ? 'disabled' : ''} />
            <div style="position:absolute;inset:0;border-radius:12px;background:${isWalking ? 'var(--amber)' : 'var(--border)'};transition:background 0.2s;">
              <div style="position:absolute;width:18px;height:18px;border-radius:9px;background:#fff;top:3px;transition:left 0.2s;left:${isWalking ? '21px' : '3px'};box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
            </div>
          </label>
        </div>

        <!-- Profile completeness banner -->
        ${showBanner ? `
        <div id="completeness-banner" style="display:flex;align-items:center;gap:12px;margin-top:12px;padding:12px 14px;border-radius:12px;background:var(--amber-bg);border:1px solid var(--amber-line);cursor:pointer;">
          <i class="ph ph-star" style="font-size:20px;color:var(--amber);flex-shrink:0;"></i>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:700;font-family:var(--font-mono);color:var(--amber);letter-spacing:1px;">COMPLETE YOUR PROFILE</div>
            <div style="font-size:11px;color:var(--ink2);margin-top:2px;">${completeness}% done — add ${!avatar ? 'a photo' : !bio ? 'a bio' : 'your offering'} to attract more connections</div>
          </div>
          <i class="ph ph-caret-right" style="font-size:16px;color:var(--amber);flex-shrink:0;"></i>
        </div>` : ''}

        <!-- Stats row -->
        <div style="display:flex;align-items:center;margin-top:12px;">
          <div style="display:flex;gap:var(--sp-lg);flex:1;padding:var(--sp-md) 0;border-top:1px solid var(--border-lt);border-bottom:1px solid var(--border-lt);">
            ${showStats ? `
            <div style="text-align:center;">
              <div style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--ink);">${nightCount}</div>
              <div style="font-size:8px;letter-spacing:1.5px;font-family:var(--font-mono);color:var(--ink3);font-weight:600;">NIGHTS</div>
            </div>
            <div style="text-align:center;">
              <div style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--ink);">${stampsCount}</div>
              <div style="font-size:8px;letter-spacing:1.5px;font-family:var(--font-mono);color:var(--ink3);font-weight:600;">STAMPS</div>
            </div>
            <div style="text-align:center;">
              <div style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--ink);">${hostedCount}</div>
              <div style="font-size:8px;letter-spacing:1.5px;font-family:var(--font-mono);color:var(--ink3);font-weight:600;">HOSTED</div>
            </div>` : `<div style="font-size:12px;color:var(--ink3);">Stats hidden</div>`}
          </div>
          <button id="toggle-stats" style="padding:0 4px 0 12px;background:none;border:none;cursor:pointer;" title="${showStats ? 'Hide stats' : 'Show stats'}">
            <i class="ph ${showStats ? 'ph-eye-slash' : 'ph-eye'}" style="font-size:18px;color:var(--ink3);"></i>
          </button>
        </div>

        <!-- PROFILE / CREDENTIALS tab toggle -->
        <div style="display:flex;gap:0;margin-top:var(--sp-md);border-bottom:1px solid var(--border-lt);">
          ${[['profile','PROFILE'],['credentials','CREDENTIALS']].map(([key,label]) => {
            const active = key === activeTab;
            return `<button data-me-tab="${key}" style="
              padding:12px 0;margin-right:20px;border:none;background:transparent;cursor:pointer;
              font-family:var(--font-mono);font-size:13px;font-weight:700;letter-spacing:2px;
              color:${active ? 'var(--amber)' : 'var(--ink3)'};
              border-bottom:${active ? '2px solid var(--amber)' : '2px solid transparent'};
              margin-bottom:-1px;">${label}</button>`;
          }).join('')}
        </div>

        <!-- Tab content -->
        <div id="me-tab-content">
          ${isProfile ? profileTabContent() : credentialsTabContent()}
        </div>
      </div>

      <!-- Hidden file inputs -->
      <input type="file" id="avatar-input" accept="image/*" capture="user" style="display:none;" />
      <input type="file" id="cover-input"  accept="image/*" style="display:none;" />
    `;

    bindEvents();
  }

  function profileTabContent() {
    const photoGrid = moments.filter(m => m.photo_url || m.image_url);
    return `
      <!-- QR code inline -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--sp-md);padding:14px;border-radius:12px;border:1px solid var(--border-lt);background:var(--surface-alt);">
        <div style="display:flex;align-items:center;gap:10px;">
          <i class="ph ph-qr-code" style="font-size:28px;color:var(--amber);"></i>
          <div>
            <div style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--ink);letter-spacing:1px;">MY QR CODE</div>
            <div style="font-size:11px;color:var(--ink3);margin-top:2px;">${wkId}</div>
          </div>
        </div>
        <button id="qr-fullscreen" style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:20px;border:1px solid var(--amber-line);background:var(--amber-bg);cursor:pointer;font-size:11px;font-family:var(--font-mono);font-weight:600;color:var(--amber);">
          <i class="ph ph-arrows-out" style="font-size:14px;"></i> SHOW
        </button>
      </div>

      <!-- Gallery horizontal scroll -->
      ${galleryPhotos.length > 0 ? `
      <div style="margin-top:var(--sp-md);">
        <div class="h-label">GALLERY</div>
        <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin:0 calc(-1 * var(--screen-px));">
          <div style="display:flex;gap:8px;padding:8px var(--screen-px);width:max-content;">
            ${galleryPhotos.map(url => `
              <div style="width:100px;height:100px;border-radius:10px;overflow:hidden;flex-shrink:0;cursor:pointer;" class="gallery-thumb" data-url="${url}">
                <img src="${url}" style="width:100%;height:100%;object-fit:cover;" />
              </div>`).join('')}
          </div>
        </div>
      </div>` : ''}

      <!-- Photo grid -->
      ${photoGrid.length > 0 ? `
      <div style="margin-top:var(--sp-md);">
        <div class="h-label">MOMENTS</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px;margin:0 calc(-1 * var(--screen-px));margin-top:8px;">
          ${photoGrid.map(m => `
            <div class="moment-grid-thumb" data-id="${m.id}" style="aspect-ratio:1;overflow:hidden;cursor:pointer;">
              <img src="${m.photo_url || m.image_url}" style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>`).join('')}
        </div>
      </div>` : ''}

      <!-- Menu list -->
      <div class="row-list" style="margin-top:var(--sp-md);border:1px solid var(--border-lt);border-radius:var(--r-lg);overflow:hidden;">
        ${[
          { icon:'ph-path',         label:'MY JOURNEY',    route:'me/journey'              },
          { icon:'ph-images',        label:'GALLERY',       route:'me/gallery'              },
          { icon:'ph-seal',          label:'STAMPS',        route:'me/stamps-overview'      },
          { icon:'ph-book-open',     label:'GÄSTEBUCH',     route:'me/gaestebuch'           },
          { icon:'ph-house',         label:'MY HOSTING',    route:'me/hosting/dashboard'    },
          { icon:'ph-shield-check',  label:'VERIFICATION',  route:'me/verification'         },
          { icon:'ph-sign-out',      label:'SIGN OUT',      route:'__signout__'             },
        ].map(item => `
          <div class="row-item" data-route="${item.route}" style="border-radius:0;border-bottom:1px solid var(--border-lt);">
            <i class="${item.icon}" style="font-size:20px;color:var(--amber);width:24px;flex-shrink:0;"></i>
            <span style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:600;letter-spacing:1.5px;color:var(--ink);">${item.label}</span>
            <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
          </div>`).join('')}
      </div>
    `;
  }

  function credentialsTabContent() {
    return `
      <div style="margin-top:var(--sp-md);">
        <div class="wk-card" style="display:flex;flex-direction:column;gap:var(--sp-sm);">
          <div class="h-label">WANDERKIND PASS</div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-family:var(--font-mono);font-size:16px;font-weight:700;color:var(--ink);">${name}</div>
              <div style="font-size:12px;color:var(--ink3);margin-top:2px;">${wkId}</div>
            </div>
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:12px;background:${tierColor}18;">
              <div style="width:7px;height:7px;border-radius:4px;background:${tierColor};"></div>
              <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:2px;color:${tierColor};">${tier.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;margin-top:var(--sp-md);">
          ${[
            { icon:'ph-ticket',       label:'WANDERKIND PASS',       route:'more/passes'         },
            { icon:'ph-seal',         label:'STAMPS & VISAS',        route:'more/stamps'         },
            { icon:'ph-footsteps',    label:'WANDERKIND JOURNEY',    route:'more/journey'        },
            { icon:'ph-shield-check', label:'VERIFICATION',          route:'me/verification'     },
          ].map(item => `
            <div class="row-item" data-route="${item.route}" style="border-radius:var(--r-md);border:1px solid var(--border-lt);">
              <i class="${item.icon}" style="font-size:20px;color:var(--amber);width:24px;flex-shrink:0;"></i>
              <span style="font-family:var(--font-mono);font-size:var(--text-sm);font-weight:600;letter-spacing:1.5px;color:var(--ink);">${item.label}</span>
              <i class="ph ph-caret-right" style="margin-left:auto;color:var(--ink3);font-size:14px;"></i>
            </div>`).join('')}
        </div>
      </div>
    `;
  }

  function showQrModal() {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, { position:'fixed', inset:'0', background:'rgba(0,0,0,0.85)', zIndex:'9999', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px' });
    overlay.innerHTML = `
      <div style="background:var(--bg);border-radius:24px;padding:32px;display:flex;flex-direction:column;align-items:center;gap:16px;max-width:300px;width:90%;">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:3px;color:var(--amber);">MY QR CODE</div>
        <div style="width:200px;height:200px;background:var(--surface-alt);border-radius:12px;display:flex;align-items:center;justify-content:center;">
          <i class="ph ph-qr-code" style="font-size:120px;color:var(--ink2);"></i>
        </div>
        <div style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--ink);">${wkId}</div>
        <div style="font-size:12px;color:var(--ink3);text-align:center;">${name}</div>
        <button id="qr-share-btn" style="display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:20px;background:var(--amber);border:none;cursor:pointer;color:#fff;font-family:var(--font-mono);font-size:12px;font-weight:700;letter-spacing:1px;">
          <i class="ph ph-share-network"></i> SHARE PROFILE
        </button>
      </div>
      <button style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.6);font-size:14px;padding:12px;">Close</button>
    `;
    overlay.querySelector('#qr-share-btn').addEventListener('click', () => navigate('me/qr-code'));
    overlay.addEventListener('click', e => { if (e.target === overlay || e.target.tagName === 'BUTTON') overlay.remove(); });
    document.body.appendChild(overlay);
  }

  function bindEvents() {
    // Tab switch
    el.querySelectorAll('[data-me-tab]').forEach(btn => {
      btn.addEventListener('click', () => { activeTab = btn.dataset.meTab; render(); });
    });

    // Walking toggle
    const walkingToggle = el.querySelector('#walking-toggle');
    if (walkingToggle) {
      walkingToggle.addEventListener('change', async e => {
        if (isWalking) return; // can't turn off
        isWalking = e.target.checked;
        if (user) {
          await supabase.from('profiles').update({ is_walking: isWalking }).eq('id', user.id);
        }
        render();
      });
    }

    // Stats toggle
    el.querySelector('#toggle-stats')?.addEventListener('click', async () => {
      showStats = !showStats;
      if (user) await supabase.from('profiles').update({ show_stats: showStats }).eq('id', user.id);
      render();
    });

    // Edit, share
    el.querySelector('#edit-profile-btn')?.addEventListener('click', () => navigate('me/edit'));
    el.querySelector('#share-btn')?.addEventListener('click', () => navigate('more/share-profile'));

    // QR
    el.querySelector('#qr-fullscreen')?.addEventListener('click', showQrModal);

    // Cover tap
    el.querySelector('#cover-area')?.addEventListener('click', () => el.querySelector('#cover-input').click());
    el.querySelector('#cover-camera')?.addEventListener('click', e => { e.stopPropagation(); el.querySelector('#cover-input').click(); });

    // Avatar tap
    el.querySelector('#avatar-wrap')?.addEventListener('click', () => el.querySelector('#avatar-input').click());
    el.querySelector('#avatar-camera')?.addEventListener('click', e => { e.stopPropagation(); el.querySelector('#avatar-input').click(); });

    // Avatar upload
    el.querySelector('#avatar-input')?.addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file || !user) return;
      const { uploadAvatar } = await import('../lib/supabase.js');
      const url = await uploadAvatar(user.id, file, `avatar_${Date.now()}.jpg`);
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: url });
      toastSuccess('Photo saved');
      navigate('me', { replace: true });
    });

    // Cover upload
    el.querySelector('#cover-input')?.addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file || !user) return;
      const { uploadAvatar } = await import('../lib/supabase.js');
      const url = await uploadAvatar(user.id, file, `cover_${Date.now()}.jpg`);
      await supabase.from('profiles').upsert({ id: user.id, cover_url: url });
      toastSuccess('Cover saved');
      navigate('me', { replace: true });
    });

    // Profile completeness banner
    el.querySelector('#completeness-banner')?.addEventListener('click', () => navigate('more/wanderhost'));

    // Gallery thumbs
    el.querySelectorAll('.gallery-thumb').forEach(div => {
      div.addEventListener('click', () => {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, { position:'fixed', inset:'0', background:'rgba(0,0,0,0.92)', zIndex:'9999', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' });
        overlay.innerHTML = `<img src="${div.dataset.url}" style="max-width:100%;max-height:100%;object-fit:contain;" />`;
        overlay.addEventListener('click', () => overlay.remove());
        document.body.appendChild(overlay);
      });
    });

    // Moments grid taps
    el.querySelectorAll('.moment-grid-thumb').forEach(div => {
      div.addEventListener('click', () => navigate(`memories/${div.dataset.id}`));
    });

    // Row navigation
    el.querySelectorAll('.row-item[data-route]').forEach(row => {
      row.addEventListener('click', async () => {
        const route = row.dataset.route;
        if (route === '__signout__') {
          await signOut();
          navigate('auth/signin', { replace: true });
        } else {
          navigate(route);
        }
      });
    });
  }

  render();
  return el;
}
