import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';
export default async function render() {
  const user = getUser();
  const { data: profile } = await supabase.from('profiles').select('emergency_contacts').eq('id', user.id).single();
  const contacts = profile?.emergency_contacts || [];
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>EMERGENCY & CONTACTS</h1>
    </div>
    <div style="padding:var(--screen-px);display:flex;flex-direction:column;gap:var(--sp-md);">
      <div class="wk-card" style="border-color:var(--red-bg);background:rgba(176,58,58,0.03);">
        <div class="h-label" style="color:var(--red);">Emergency Number</div>
        <p style="font-size:var(--text-sm);color:var(--ink2);">EU emergency: <strong>112</strong> · US: <strong>911</strong> · UK: <strong>999</strong></p>
      </div>
      <div class="h-label">Your Emergency Contacts</div>
      ${contacts.length === 0 ? `<div class="wk-empty" style="padding:var(--sp-lg) 0;"><p>No emergency contacts added yet.</p></div>` :
        contacts.map((c, i) => `
          <div class="wk-card" style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-weight:600;">${c.name}</div>
              <div style="color:var(--ink3);font-size:var(--text-sm);">${c.phone}</div>
            </div>
            <a href="tel:${c.phone}" style="color:var(--amber);font-size:20px;"><i class="ph ph-phone"></i></a>
          </div>`).join('')}
      <button class="wk-btn secondary" id="add-btn"><i class="ph ph-plus"></i> Add Contact</button>
    </div>`;
  el.querySelector('#back').addEventListener('click', () => navigate('me'));
  return el;
}
