import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');

  const { data: profile } = await supabase.from('profiles')
    .select('emergency_number,emergency_contacts').eq('id', user.id).single();
  const contacts = profile?.emergency_contacts || [];
  const emergencyNum = profile?.emergency_number || '';

  function contactsHTML() {
    if (!contacts.length) return `
      <div style="padding:20px;text-align:center;border:1.5px dashed var(--border-dark);border-radius:var(--r-lg);background:var(--surface-alt);">
        <div style="font-size:13px;color:var(--ink3);">No emergency contacts added yet.</div>
      </div>`;
    return contacts.map((c,i) => `
      <div class="wk-card" style="display:flex;align-items:center;gap:14px;">
        <div style="width:40px;height:40px;border-radius:20px;background:var(--amber-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="ph ph-user" style="font-size:20px;color:var(--amber);"></i>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:700;color:var(--ink);">${c.name||'Contact '+(i+1)}</div>
          <div style="font-size:12px;color:var(--ink3);margin-top:2px;">${c.phone||''}</div>
          ${c.relation?`<div style="font-size:11px;color:var(--amber);font-family:var(--font-mono);letter-spacing:1px;margin-top:2px;">${c.relation.toUpperCase()}</div>`:''}
        </div>
        ${c.phone?`<a href="tel:${c.phone}" style="width:36px;height:36px;border-radius:18px;background:var(--green-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;text-decoration:none;">
          <i class="ph ph-phone" style="font-size:18px;color:var(--green);"></i>
        </a>`:''}
      </div>`).join('');
  }

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>EMERGENCY</h1>
    </div>
    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:16px;">

      <!-- SOS Banner -->
      <div style="background:var(--red);border-radius:var(--r-lg);padding:18px 20px;display:flex;align-items:center;gap:14px;cursor:pointer;" id="sos-banner">
        <i class="ph ph-first-aid-kit" style="font-size:32px;color:#fff;flex-shrink:0;"></i>
        <div>
          <div style="font-family:var(--font-mono);font-size:13px;font-weight:800;color:#fff;letter-spacing:2px;">INTERNATIONAL SOS</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:2px;">Dial 112 (Europe) · 911 (USA) · 999 (UK)</div>
        </div>
      </div>

      <!-- Personal emergency number -->
      <div class="wk-card" style="border-color:var(--red-bg);">
        <div class="h-label" style="color:var(--red);margin-bottom:10px;">YOUR EMERGENCY NUMBER</div>
        <div style="display:flex;gap:10px;align-items:center;">
          <input class="wk-input" id="em-num" type="tel" placeholder="+49 123 456 789" value="${emergencyNum}" style="flex:1;" />
          ${emergencyNum?`<a href="tel:${emergencyNum}" style="width:44px;height:44px;border-radius:22px;background:var(--green);display:flex;align-items:center;justify-content:center;flex-shrink:0;text-decoration:none;">
            <i class="ph ph-phone" style="font-size:20px;color:#fff;"></i>
          </a>`:''}
        </div>
        <button class="wk-btn secondary" style="margin-top:12px;" id="save-num">SAVE NUMBER</button>
      </div>

      <!-- Emergency contacts -->
      <div>
        <div class="h-label" style="margin-bottom:10px;">EMERGENCY CONTACTS</div>
        <div id="contacts-list" style="display:flex;flex-direction:column;gap:10px;">
          ${contactsHTML()}
        </div>
        <button class="wk-btn ghost" style="margin-top:12px;" id="edit-contacts">
          <i class="ph ph-pencil"></i> MANAGE CONTACTS
        </button>
      </div>

      <!-- Tips -->
      <div class="wk-card" style="border-color:var(--border-lt);">
        <div class="h-label" style="margin-bottom:10px;">ON THE ROAD</div>
        ${[
          ['ph-map-pin', 'Always share your planned route with a contact before entering remote areas.'],
          ['ph-device-mobile-camera', 'Download offline maps before you lose signal.'],
          ['ph-drop', 'Dehydration and hypothermia are the most common walker emergencies.'],
          ['ph-qr-code', 'Your WANDERKIND QR code contains your emergency contacts for first responders.'],
        ].map(([icon,text])=>`
          <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
            <i class="ph ${icon}" style="font-size:18px;color:var(--amber);flex-shrink:0;margin-top:1px;"></i>
            <p style="font-size:13px;color:var(--ink2);line-height:1.6;margin:0;">${text}</p>
          </div>`).join('')}
      </div>
    </div>
  `;

  el.querySelector('#back').addEventListener('click', () => history.back());
  el.querySelector('#save-num').addEventListener('click', async () => {
    const num = el.querySelector('#em-num').value.trim();
    const { error } = await supabase.from('profiles').update({ emergency_number: num }).eq('id', user.id);
    if (error) toastError('Could not save'); else toastSuccess('Emergency number saved');
  });
  el.querySelector('#edit-contacts').addEventListener('click', () => navigate('me/emergency-contacts'));

  return el;
}
