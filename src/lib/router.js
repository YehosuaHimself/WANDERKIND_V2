/**
 * WANDERKIND — Hash router
 * Routes: #myway  #memories  #more  #messages  #me
 *         #auth/signin  #auth/signup  #auth/callback
 *         Plus sub-routes like #me/journey  #me/edit  #more/verification  etc.
 */

const routes = {};
let currentRoute = null;

export function defineRoute(path, loader) {
  routes[path] = loader;
}

export function navigate(path, opts = {}) {
  if (opts.replace) {
    location.replace('#' + path);
  } else {
    location.hash = '#' + path;
  }
}

export function currentPath() {
  return location.hash.replace(/^#\/?/, '') || 'myway';
}

async function render(path) {
  const page = document.getElementById('page');
  currentRoute = path;

  // Find longest matching route
  const route = Object.keys(routes)
    .filter(r => path === r || path.startsWith(r + '/'))
    .sort((a, b) => b.length - a.length)[0];

  if (!route) {
    page.innerHTML = `<div class="wk-empty"><p>Page not found</p></div>`;
    return;
  }

  page.innerHTML = `<div class="wk-spinner"></div>`;
  try {
    const mod = await routes[route]();
    if (currentRoute !== path) return; // navigated away during load
    page.innerHTML = '';
    const el = mod.default ? await mod.default(path) : document.createElement('div');
    if (el instanceof HTMLElement) page.appendChild(el);
    else page.innerHTML = el;
  } catch (err) {
    console.error('Route error:', err);
    page.innerHTML = `<div class="wk-empty"><p>Something went wrong</p></div>`;
  }
}

function syncTabBar(path) {
  const tab = path.split('/')[0];
  document.querySelectorAll('.tab-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

export function initRouter() {
  function onChange() {
    const path = currentPath();
    render(path);
    syncTabBar(path);
  }

  window.addEventListener('hashchange', onChange);

  // Tab bar clicks
  document.querySelectorAll('.tab-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.tab));
  });

  onChange(); // initial render
}
