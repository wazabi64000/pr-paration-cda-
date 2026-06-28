import { loadState, getState, updateState } from './core/storage.js';
import { initRouter, registerRoute, setRouteChangeCallback } from './core/router.js';
import { NAV_ITEMS, PREP_SECTIONS } from './data/navigation.js';
import { initSearchUI } from './utils/search.js';
import { AppUI } from './utils/helpers.js';
import { getPrepStats } from './data/prep-cda.js';
import { renderPrepPage, initPrepEvents, updateDashboardUI } from './views/prep-cda.js';

function initApp() {
  loadState();
  initTheme();
  buildNavigation();
  registerRoutes();
  initSearchUI();
  initSidebar();
  initRouter();
  setRouteChangeCallback(updateGlobalProgress);
}

function initTheme() {
  const state = getState();
  const theme = state.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    updateState({ theme: next });
  });
}

function buildNavigation() {
  const nav = document.getElementById('nav-menu');
  if (!nav) return;

  nav.innerHTML = `
    ${NAV_ITEMS.map(item => `
      <a href="#/${item.id}" class="nav-item">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `).join('')}
    <div class="nav-section-label">Sections</div>
    ${PREP_SECTIONS.map(s => `
      <a href="#/prep/${s.id}" class="nav-item nav-sub">
        <span class="nav-icon">${s.icon}</span>
        <span>${s.label}</span>
      </a>
    `).join('')}
  `;
}

function registerRoutes() {
  registerRoute('prep', () => ({ html: renderPrepPage(), mount: () => initPrepEvents() }));
  registerRoute('home', () => ({ html: renderPrepPage(), mount: () => initPrepEvents() }));
}

function updateGlobalProgress() {
  const stats = getPrepStats(getState());
  const bar = document.getElementById('global-progress-bar');
  const label = document.getElementById('global-progress-percent');
  if (bar) bar.style.width = `${stats.globalPct}%`;
  if (label) label.textContent = `${stats.globalPct}%`;
  updateDashboardUI();
}

function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggle = document.getElementById('sidebar-toggle');
  const close = document.getElementById('sidebar-close');

  function openSidebar() {
    sidebar?.classList.add('open');
    if (overlay) overlay.hidden = false;
    toggle?.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    sidebar?.classList.remove('open');
    if (overlay) overlay.hidden = true;
    toggle?.setAttribute('aria-expanded', 'false');
  }

  toggle?.addEventListener('click', openSidebar);
  close?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);
  AppUI.closeSidebar = closeSidebar;

  document.getElementById('nav-menu')?.addEventListener('click', (e) => {
    if (e.target.closest('.nav-item')) closeSidebar();
  });
}

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

document.addEventListener('DOMContentLoaded', initApp);
