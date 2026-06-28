import { afterNavigation, scrollToMainTop } from '../utils/helpers.js';
import { PREP_SECTIONS } from '../data/navigation.js';

const routes = new Map();
let onRouteChange = null;

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function setRouteChangeCallback(cb) {
  onRouteChange = cb;
}

export function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}

export function getRouteParams() {
  const hash = window.location.hash.slice(1) || '/';
  const [path, ...rest] = hash.split('/').filter(Boolean);
  return { path: path || 'prep', segments: rest, full: hash };
}

async function renderIntoMain(main, result) {
  const html = typeof result === 'string' ? result : result.html;
  const mount = typeof result === 'object' ? result.mount : null;

  main.innerHTML = html;
  main.classList.remove('page-transition-out');
  main.classList.add('page-transition-in');
  if (mount) mount();
  afterNavigation();
  setTimeout(() => main.classList.remove('page-transition-in'), 300);
}

async function handleRoute() {
  const params = getRouteParams();
  const { path, segments } = params;

  let handler = routes.get(path) || routes.get('prep');

  const main = document.getElementById('main-content');
  if (main) {
    try {
      main.classList.add('page-transition-out');
      const result = await handler(params);
      await renderIntoMain(main, result);

      // Scroll vers section si ancre dans hash
      const anchor = segments[0];
      if (anchor) {
        requestAnimationFrame(() => {
          document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    } catch (e) {
      console.error('Route error:', e);
      main.innerHTML = `<div class="empty-state"><p>Erreur : ${e.message}</p></div>`;
      afterNavigation();
    }
  }

  if (onRouteChange) onRouteChange(params);
  updateBreadcrumb(path, segments);
  updateActiveNav(path, segments);
}

function updateBreadcrumb(path, segments) {
  const bc = document.getElementById('breadcrumb');
  if (!bc) return;
  if (segments[0]) {
    const section = PREP_SECTIONS.find(s => s.id === segments[0]);
    bc.innerHTML = `<a href="#/prep">Préparation CDA</a> / <span aria-current="page">${section?.label || segments[0]}</span>`;
  } else {
    bc.innerHTML = `<span aria-current="page">Préparation entretien CDA</span>`;
  }
}

function updateActiveNav(path, segments) {
  const target = segments[0] ? `prep/${segments[0]}` : 'prep';
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
    const href = el.getAttribute('href')?.slice(2) || '';
    if (href === target || (href === 'prep' && !segments[0])) el.classList.add('active');
  });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);

  document.getElementById('nav-menu')?.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-item');
    if (!link) return;
    const target = link.getAttribute('href')?.slice(1) || '';
    const current = window.location.hash.slice(1) || '/prep';
    if (target === current) {
      e.preventDefault();
      scrollToMainTop();
      afterNavigation();
    }
  });

  if (!window.location.hash || window.location.hash === '#/home') {
    window.location.hash = '#/prep';
  } else {
    handleRoute();
  }
}
