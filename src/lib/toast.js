const container = () => document.getElementById('toast-container');

export function toast(msg, type = 'default', duration = 2800) {
  const el = document.createElement('div');
  el.className = `toast${type !== 'default' ? ' ' + type : ''}`;
  el.textContent = msg;
  container().appendChild(el);
  setTimeout(() => el.remove(), duration + 300);
}

export const toastSuccess = (msg) => toast(msg, 'success');
export const toastError   = (msg) => toast(msg, 'error');
