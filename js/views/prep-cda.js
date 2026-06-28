import { getState, updateState } from '../core/storage.js';
import {
  PREP_CATEGORIES, PREP_ITEMS, PREP_FAQ, PREP_PROGRESS_GROUPS,
  getPrepStats, getCategoryProgress, isItemDone,
} from '../data/prep-cda.js';
import { escapeHtml } from '../utils/helpers.js';

export function renderPrepPage() {
  const state = getState();
  const stats = getPrepStats(state);
  const activeFilter = state.prepFilter || 'all';

  return `
    <article class="prep-page">
      <header class="prep-hero animate-fade-in">
        <span class="prep-badge">Feuille de route — Entretien d'admission</span>
        <h1>🎯 Préparer son entretien d'entrée en Concepteur Développeur d'Applications (CDA)</h1>
        <p class="prep-lead">Ce guide n'est pas une formation. C'est votre checklist de préparation : vérifiez que vous possédez les prérequis attendus avant votre entretien d'admission ou d'alternance.</p>
      </header>

      <section class="prep-dashboard" id="prep-dashboard">
        <h2>📊 Tableau de bord</h2>
        <div class="prep-stat-grid">
          <div class="prep-stat-card prep-stat-primary">
            <div class="prep-stat-value">${stats.globalPct}%</div>
            <div class="prep-stat-label">Préparation globale</div>
            <div class="progress-bar"><div class="progress-fill" style="width:${stats.globalPct}%"></div></div>
          </div>
          <div class="prep-stat-card">
            <div class="prep-stat-value">${stats.validatedCount}</div>
            <div class="prep-stat-label">Compétences validées</div>
          </div>
          <div class="prep-stat-card">
            <div class="prep-stat-value">${stats.prerequisitesCount}</div>
            <div class="prep-stat-label">Prérequis techniques maîtrisés</div>
          </div>
          <div class="prep-stat-card">
            <div class="prep-stat-value">${stats.lastDate}</div>
            <div class="prep-stat-label">Dernière progression</div>
          </div>
          <div class="prep-stat-card">
            <div class="prep-stat-value">${stats.remainingLabel}</div>
            <div class="prep-stat-label">Temps estimé restant</div>
          </div>
        </div>
        <p class="prep-hint">${stats.validatedCount} / ${stats.totalItems} éléments cochés — sauvegarde automatique</p>
      </section>

      <section class="prep-progress-section" id="prep-suivi">
        <h2>📈 Suivi de progression</h2>
        <div class="prep-progress-cards">
          ${Object.entries(PREP_PROGRESS_GROUPS).map(([key, g]) => {
            const p = stats.groups[key];
            return `
              <div class="prep-progress-card">
                <div class="prep-progress-header">
                  <span>${g.icon} ${g.label}</span>
                  <strong>${p.pct}%</strong>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${p.pct}%"></div></div>
                <span class="prep-progress-detail">${p.done} / ${p.total}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <section class="prep-filters">
        <div class="prep-filter-bar">
          <button type="button" class="prep-filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">Tout</button>
          <button type="button" class="prep-filter-btn ${activeFilter === 'todo' ? 'active' : ''}" data-filter="todo">À faire</button>
          <button type="button" class="prep-filter-btn ${activeFilter === 'done' ? 'active' : ''}" data-filter="done">Validés</button>
        </div>
      </section>

      <section class="prep-checklists" id="prep-checklists">
        <h2>✅ Checklist de préparation</h2>
        <p class="prep-hint">Cochez chaque élément au fur et à mesure de votre révision. Cliquez pour valider.</p>

        ${PREP_CATEGORIES.map(cat => {
          const prog = getCategoryProgress(state, cat.id);
          const items = PREP_ITEMS.filter(i => i.category === cat.id);
          return `
            <div class="prep-category" id="cat-${cat.id}" data-category="${cat.id}">
              <div class="prep-category-header">
                <div class="prep-category-title">
                  <span class="prep-cat-num">${cat.num}</span>
                  <span class="prep-cat-icon">${cat.icon}</span>
                  <h3>${cat.title}</h3>
                </div>
                <div class="prep-category-meta">
                  <span class="prep-cat-pct">${prog.pct}%</span>
                  <div class="progress-bar prep-cat-bar"><div class="progress-fill" style="width:${prog.pct}%"></div></div>
                  <span class="prep-cat-count">${prog.done}/${prog.total}</span>
                </div>
              </div>
              <ul class="prep-checklist">
                ${items.map(it => {
                  const done = isItemDone(state, it.id);
                  const hidden = shouldHideItem(done, activeFilter);
                  return `
                    <li class="prep-check-item ${done ? 'done' : ''} ${hidden ? 'filtered-out' : ''}"
                        data-item-id="${it.id}" data-done="${done}" role="button" tabindex="0">
                      <span class="prep-checkbox" aria-hidden="true">
                        <svg class="prep-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      <span class="prep-check-label">${escapeHtml(it.title)}</span>
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>
          `;
        }).join('')}
      </section>

      <section class="prep-faq" id="prep-faq">
        <h2>❓ Questions fréquentes à réviser</h2>
        <p class="prep-hint">Préparez vos réponses à voix haute. Aucune correction affichée — c'est à vous de réviser.</p>
        <div class="prep-faq-grid">
          ${PREP_FAQ.map((q, i) => `
            <div class="prep-faq-card">
              <span class="prep-faq-num">${i + 1}</span>
              <p>${escapeHtml(q)}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <footer class="prep-footer">
        <p>Vous êtes prêt quand la majorité des prérequis techniques et entretien sont cochés. Bon courage pour votre admission CDA.</p>
      </footer>
    </article>
  `;
}

function shouldHideItem(done, filter) {
  if (filter === 'todo') return done;
  if (filter === 'done') return !done;
  return false;
}

export function initPrepEvents() {
  document.querySelectorAll('.prep-check-item').forEach(row => {
    const toggle = () => toggleItem(row.dataset.itemId, row);
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  document.querySelectorAll('.prep-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      updateState({ prepFilter: btn.dataset.filter });
      refreshPrepView();
    });
  });
}

function toggleItem(id, row) {
  const state = getState();
  const checklist = { ...(state.prepChecklist || {}) };
  const nowDone = !checklist[id];
  checklist[id] = nowDone;
  updateState({
    prepChecklist: checklist,
    prepLastProgress: new Date().toISOString(),
  });

  row.classList.toggle('done', nowDone);
  row.dataset.done = nowDone;
  row.classList.add('prep-check-pop');
  setTimeout(() => row.classList.remove('prep-check-pop'), 400);

  const filter = state.prepFilter || 'all';
  row.classList.toggle('filtered-out', shouldHideItem(nowDone, filter));

  updateDashboardUI();
  updateCategoryProgress(row.closest('.prep-category'));
}

function updateCategoryProgress(categoryEl) {
  if (!categoryEl) return;
  const catId = categoryEl.dataset.category;
  const state = getState();
  const prog = getCategoryProgress(state, catId);
  categoryEl.querySelector('.prep-cat-pct').textContent = `${prog.pct}%`;
  categoryEl.querySelector('.prep-cat-count').textContent = `${prog.done}/${prog.total}`;
  categoryEl.querySelector('.prep-cat-bar .progress-fill').style.width = `${prog.pct}%`;
}

export function updateDashboardUI() {
  if (!document.querySelector('.prep-page')) return;
  const stats = getPrepStats(getState());

  document.querySelectorAll('.prep-stat-card .prep-stat-value').forEach((el, i) => {
    const values = [stats.globalPct + '%', stats.validatedCount, stats.prerequisitesCount, stats.lastDate, stats.remainingLabel];
    if (values[i] !== undefined) el.textContent = values[i];
  });

  document.querySelector('.prep-stat-primary .progress-fill')?.style && 
    (document.querySelector('.prep-stat-primary .progress-fill').style.width = `${stats.globalPct}%`);

  document.querySelectorAll('.prep-progress-card').forEach((card, i) => {
    const keys = ['global', 'technique', 'entretien', 'outils', 'soft'];
    const p = stats.groups[keys[i]];
    if (!p) return;
    card.querySelector('strong').textContent = `${p.pct}%`;
    card.querySelector('.progress-fill').style.width = `${p.pct}%`;
    card.querySelector('.prep-progress-detail').textContent = `${p.done} / ${p.total}`;
  });

  const bar = document.getElementById('global-progress-bar');
  const label = document.getElementById('global-progress-percent');
  if (bar) bar.style.width = `${stats.globalPct}%`;
  if (label) label.textContent = `${stats.globalPct}%`;
}

function refreshPrepView() {
  const main = document.getElementById('main-content');
  if (!main) return;
  main.innerHTML = renderPrepPage();
  initPrepEvents();
}

export { refreshPrepView, updateDashboardUI };
