import { supabase } from '../lib/supabase.js';
import { getUser } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { toastSuccess, toastError } from '../lib/toast.js';

export default async function render() {
  const user = getUser();
  const el = document.createElement('div');
  let activeSignal = false;
  let signalId = null;

  el.innerHTML = `
    <div class="wk-header">
      <button class="back-btn" id="back"><i class="ph ph-arrow-left"></i></button>
      <h1>HITCHHIKE</h1>
    </div>
    <div style="padding:var(--screen-px);display:flex;flex-direction:column;gap:var(--sp-lg);">
      <div class="wk-card" style="border-color:var(--tramp-bg);">
        <div class="h-label">Signal Active</div>
        <p style="font-size:var(--text-sm);color:var(--ink2);line-height:1.7;">
          Activate your signal so passing drivers know you need a ride.
          Your location is shared only while the signal is active.
        </p>
      </div>

      <div style="text-align:center;">
        <button id="signal-btn" style="
          width:140px;height:140px;border-radius:70px;
          background:var(--tramp-bg);border:3px solid var(--tramp);
          cursor:pointer;display:inline-flex;flex-direction:column;
          align-items:center;justify-content:center;gap:8px;
          transition:background 0.2s,transform 0.1s;color:var(--tramp);
          font-family:var(--font-mono);font-size:12px;font-weight:700;letter-spacing:2px;">
          <i class="ph ph-thumbs-up" style="font-size:40px;"></i>
          <span>ACTIVATE</span>
        </button>
      </div>

      <div id="signal-status" style="display:none;" class="wk-card">
        <div class="h-label" style="color:var(--tramp);">Signal Live</div>
        <p style="font-size:var(--text-sm);color:var(--ink2);">
          You are visible to nearby drivers. Stay safe and visible.
        </p>
      </div>

      <div class="wk-card">
        <div class="h-label">Ride Log</div>
        <div id="ride-log">
          <div class="wk-empty" style="padding:var(--sp-md) 0;">
            <p>Your rides will appear here.</p>
          </div>
        </div>
      </div>
    </div>`;

  const btn = el.querySelector('#signal-btn');
  const status = el.querySelector('#signal-status');

  async function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation not available'));
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        reject,
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }

  btn.addEventListener('click', async () => {
    if (!activeSignal) {
      btn.textContent = '…';
      btn.disabled = true;
      try {
        const { lat, lng } = await getPosition();
        const id = `ride_${Date.now()}`;
        await supabase.from('rides').insert({
          id, user_id: user.id, start_lat: lat, start_lng: lng, driver_note: '',
        });
        signalId = id;
        activeSignal = true;
        btn.innerHTML = `<i class="ph ph-stop-circle" style="font-size:40px;"></i><span>STOP</span>`;
        btn.style.background = 'var(--tramp)';
        btn.style.color = 'var(--white)';
        btn.style.borderColor = 'var(--tramp)';
        btn.disabled = false;
        status.style.display = 'block';
        toastSuccess('Signal activated — be visible!');
      } catch (err) {
        btn.innerHTML = `<i class="ph ph-thumbs-up" style="font-size:40px;"></i><span>ACTIVATE</span>`;
        btn.disabled = false;
        toastError('Could not get your location — enable GPS and try again');
      }
    } else {
      // Stop signal
      if (signalId) {
        await supabase.from('rides').update({ ended_at: new Date().toISOString() }).eq('id', signalId);
      }
      activeSignal = false; signalId = null;
      btn.innerHTML = `<i class="ph ph-thumbs-up" style="font-size:40px;"></i><span>ACTIVATE</span>`;
      btn.style.background = 'var(--tramp-bg)';
      btn.style.color = 'var(--tramp)';
      btn.style.borderColor = 'var(--tramp)';
      status.style.display = 'none';
      toastSuccess('Signal stopped');
    }
  });

  el.querySelector('#back').addEventListener('click', () => navigate('more'));
  return el;
}
