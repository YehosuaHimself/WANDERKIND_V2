const routes = {};
let currentRoute = null;

export function defineRoute(path, loader) {
  routes[path] = loader;
}

export function navigate(path, opts = {}) {
  if (opts.replace) location.replace('#' + path);
  else location.hash = '#' + path;
}

export function currentPath() {
  return location.hash.replace(/^#\/?/, '') || 'myway';
}

async function render(path) {
  const page = document.getElementById('page');
  currentRoute = path;

  // Exact match first, then prefix match (longest prefix wins)
  let route = routes[path];
  if (!route) {
    const prefixMatches = Object.keys(routes)
      .filter(r => r.endsWith('/') && path.startsWith(r))
      .sort((a, b) => b.length - a.length);
    if (prefixMatches.length) route = routes[prefixMatches[0]];
  }
  // Fallback: longest non-trailing-slash prefix
  if (!route) {
    const partialMatches = Object.keys(routes)
      .filter(r => !r.endsWith('/') && path.startsWith(r + '/'))
      .sort((a, b) => b.length - a.length);
    if (partialMatches.length) route = routes[partialMatches[0]];
  }

  if (!route) {
    page.innerHTML = `<div class="wk-header"><h1>NOT FOUND</h1></div><div class="wk-empty"><p>Page not found.</p></div>`;
    return;
  }

  page.innerHTML = `<div class="wk-spinner"></div>`;
  try {
    const mod = await route();
    if (currentRoute !== path) return;
    page.innerHTML = '';
    const result = mod.default ? await mod.default(path) : null;
    if (result instanceof HTMLElement) page.appendChild(result);
    else if (typeof result === 'string') page.innerHTML = result;
  } catch (err) {
    console.error('Route error [' + path + ']:', err);
    page.innerHTML = `<div class="wk-header"><h1>ERROR</h1></div><div class="wk-empty"><p>Something went wrong loading this page.</p></div>`;
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
  document.querySelectorAll('.tab-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.tab));
  });
  onChange();
}
