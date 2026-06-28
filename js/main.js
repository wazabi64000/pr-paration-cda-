/* Préparation entretien CDA — bundle file:// compatible */
(function () {
'use strict';


/* --- js/core/storage.js --- */
const LS_KEY = 'cda-prep-state';

const defaultState = {
  theme: 'light',
  prepChecklist: {},
  prepLastProgress: null,
  prepFilter: 'all',
  searchHistory: [],
};

let state = structuredClone(defaultState);
let saveTimeout = null;

function getState() {
  return state;
}

function loadState() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...structuredClone(defaultState), ...parsed };
    }
    // Migration depuis l'ancien format
    const legacy = localStorage.getItem('cda-roadmap-state');
    if (legacy && !saved) {
      try {
        const old = JSON.parse(legacy);
        if (old.checklists) {
          const prepChecklist = {};
          for (const [k, v] of Object.entries(old.checklists)) {
            if (k.startsWith('prep-') || k.startsWith('ent-') || k.startsWith('ci-')) {
              prepChecklist[k] = v === 'done';
            }
          }
          if (Object.keys(prepChecklist).length) state.prepChecklist = prepChecklist;
        }
        if (old.theme) state.theme = old.theme;
      } catch { /* ignore */ }
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
  return state;
}

function saveState() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, 200);
}

function updateState(updates) {
  Object.assign(state, updates);
  saveState();
}

function exportState() {
  return JSON.stringify(state, null, 2);
}

function importState(json) {
  try {
    const parsed = JSON.parse(json);
    state = { ...structuredClone(defaultState), ...parsed };
    saveState();
    return true;
  } catch { return false; }
}


/* --- js/utils/helpers.js --- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

function scrollToMainTop() {
  const main = document.getElementById('main-content');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduced ? 'auto' : 'smooth' });
  if (main) main.scrollTop = 0;
}

const AppUI = { closeSidebar: null };

function afterNavigation() {
  scrollToMainTop();
  AppUI.closeSidebar?.();
}


/* --- js/data/prep-cda.js --- */
/** Guide de préparation — Entretien d'entrée CDA */

const PREP_PROGRESS_GROUPS = {
  global: { id: 'global', label: 'Préparation globale', icon: '🎯' },
  technique: { id: 'technique', label: 'Préparation technique', icon: '💻' },
  entretien: { id: 'entretien', label: 'Préparation entretien', icon: '🎤' },
  outils: { id: 'outils', label: 'Préparation outils', icon: '🛠️' },
  soft: { id: 'soft', label: 'Préparation savoir-être', icon: '🤝' },
};

const PREP_CATEGORIES = [
  { id: 'culture-info', num: 1, title: 'Culture informatique', icon: '🖥️', group: 'technique' },
  { id: 'web', num: 2, title: 'Web', icon: '🌐', group: 'technique' },
  { id: 'html-css', num: 3, title: 'HTML / CSS', icon: '🎨', group: 'technique' },
  { id: 'javascript', num: 4, title: 'JavaScript', icon: '⚡', group: 'technique' },
  { id: 'database', num: 5, title: 'Bases de données', icon: '🗄️', group: 'technique' },
  { id: 'git', num: 6, title: 'Git', icon: '📦', group: 'technique' },
  { id: 'api', num: 7, title: 'API', icon: '🔌', group: 'technique' },
  { id: 'outils', num: 8, title: 'Outils', icon: '🛠️', group: 'outils' },
  { id: 'logic', num: 9, title: 'Logique', icon: '🧠', group: 'technique' },
  { id: 'docker', num: 10, title: 'Docker', icon: '🐳', group: 'technique' },
  { id: 'cicd', num: 11, title: 'CI / CD', icon: '🔄', group: 'technique' },
  { id: 'deploy', num: 12, title: 'Déploiement', icon: '🚀', group: 'technique' },
  { id: 'security', num: 13, title: 'Sécurité', icon: '🔒', group: 'technique' },
  { id: 'unit-tests', num: 14, title: 'Tests unitaires', icon: '🧪', group: 'technique' },
  { id: 'playwright', num: 15, title: 'Tests Playwright', icon: '🎭', group: 'technique' },
  { id: 'infra', num: 16, title: 'Infrastructure', icon: '🏗️', group: 'technique' },
  { id: 'architecture', num: 17, title: 'Architecture multicouche', icon: '📐', group: 'technique' },
  { id: 'entretien', num: 18, title: 'Entretien', icon: '🎤', group: 'entretien' },
  { id: 'soft-skills', num: 19, title: 'Savoir-être', icon: '🤝', group: 'soft' },
];

function item(id, category, title, minutes = 10) {
  const cat = PREP_CATEGORIES.find(c => c.id === category);
  return { id, category, title, minutes, group: cat?.group || 'technique' };
}

const PREP_ITEMS = [
  // 1 — Culture informatique
  item('ci-os', 'culture-info', 'Je sais ce qu\'est un système d\'exploitation'),
  item('ci-windows', 'culture-info', 'Je connais Windows'),
  item('ci-linux', 'culture-info', 'Je connais Linux'),
  item('ci-terminal', 'culture-info', 'Je sais utiliser un terminal', 15),
  item('ci-files', 'culture-info', 'Je connais les fichiers et dossiers'),
  item('ci-extensions', 'culture-info', 'Je comprends les extensions de fichiers'),
  item('ci-env', 'culture-info', 'Je connais les variables d\'environnement', 15),
  item('ci-install', 'culture-info', 'Je sais installer un logiciel'),
  item('ci-ram', 'culture-info', 'Je comprends la différence entre RAM et stockage'),
  item('ci-cpu', 'culture-info', 'Je sais ce qu\'est un processeur'),
  item('ci-browser', 'culture-info', 'Je comprends le fonctionnement d\'un navigateur'),
  item('ci-internet', 'culture-info', 'Je connais les bases d\'Internet'),

  // 2 — Web
  item('web-fe-be', 'web', 'Je connais la différence entre Frontend et Backend'),
  item('web-site', 'web', 'Je sais ce qu\'est un site web'),
  item('web-app', 'web', 'Je sais ce qu\'est une application web'),
  item('web-http', 'web', 'Je connais HTTP'),
  item('web-https', 'web', 'Je connais HTTPS'),
  item('web-url', 'web', 'Je sais ce qu\'est une URL'),
  item('web-domain', 'web', 'Je comprends un nom de domaine'),
  item('web-hosting', 'web', 'Je sais ce qu\'est un hébergement'),
  item('web-request', 'web', 'Je comprends le fonctionnement d\'une requête HTTP', 15),
  item('web-methods', 'web', 'Je connais les méthodes GET POST PUT DELETE', 15),
  item('web-json', 'web', 'Je sais ce qu\'est JSON'),

  // 3 — HTML / CSS
  item('hc-html', 'html-css', 'Je connais HTML'),
  item('hc-css', 'html-css', 'Je connais CSS'),
  item('hc-page', 'html-css', 'Je sais créer une page simple', 20),
  item('hc-tags', 'html-css', 'Je comprends les balises principales'),
  item('hc-flex', 'html-css', 'Je connais Flexbox', 15),
  item('hc-grid', 'html-css', 'Je connais Grid', 15),
  item('hc-responsive', 'html-css', 'Je comprends le Responsive Design', 15),

  // 4 — JavaScript
  item('js-vars', 'javascript', 'Variables'),
  item('js-cond', 'javascript', 'Conditions'),
  item('js-loops', 'javascript', 'Boucles'),
  item('js-func', 'javascript', 'Fonctions'),
  item('js-arrays', 'javascript', 'Tableaux'),
  item('js-objects', 'javascript', 'Objets'),
  item('js-dom', 'javascript', 'DOM', 15),
  item('js-events', 'javascript', 'Events'),
  item('js-fetch', 'javascript', 'Fetch', 15),
  item('js-async', 'javascript', 'Async/Await', 20),
  item('js-modules', 'javascript', 'Modules', 15),

  // 5 — Bases de données
  item('db-concept', 'database', 'Je sais ce qu\'est une base de données'),
  item('db-sql', 'database', 'Je connais SQL'),
  item('db-select', 'database', 'SELECT', 10),
  item('db-insert', 'database', 'INSERT'),
  item('db-update', 'database', 'UPDATE'),
  item('db-delete', 'database', 'DELETE'),
  item('db-pk', 'database', 'PRIMARY KEY'),
  item('db-fk', 'database', 'FOREIGN KEY', 15),
  item('db-join', 'database', 'JOIN', 15),

  // 6 — Git
  item('git-install', 'git', 'Installer Git'),
  item('git-init', 'git', 'git init'),
  item('git-clone', 'git', 'git clone'),
  item('git-add', 'git', 'git add'),
  item('git-commit', 'git', 'git commit'),
  item('git-push', 'git', 'git push'),
  item('git-pull', 'git', 'git pull'),
  item('git-branch', 'git', 'Branch', 15),
  item('git-merge', 'git', 'Merge', 15),
  item('git-github', 'git', 'GitHub'),

  // 7 — API
  item('api-rest', 'api', 'Je comprends REST', 15),
  item('api-read', 'api', 'Je sais lire une API', 15),
  item('api-codes', 'api', 'Je connais les codes HTTP', 15),
  item('api-cors', 'api', 'Je comprends CORS', 15),
  item('api-postman', 'api', 'Je sais utiliser Postman ou Bruno', 15),

  // 8 — Outils
  item('tool-vscode', 'outils', 'VS Code'),
  item('tool-cursor', 'outils', 'Cursor'),
  item('tool-github', 'outils', 'GitHub'),
  item('tool-terminal', 'outils', 'Terminal'),
  item('tool-node', 'outils', 'Node.js'),
  item('tool-npm', 'outils', 'npm'),
  item('tool-pnpm', 'outils', 'pnpm'),
  item('tool-mysql', 'outils', 'MySQL'),

  // 9 — Logique
  item('log-analyze', 'logic', 'Je sais analyser un problème', 15),
  item('log-split', 'logic', 'Je sais découper un problème', 15),
  item('log-read', 'logic', 'Je sais lire du code', 15),
  item('log-debug', 'logic', 'Je sais rechercher une erreur', 15),
  item('log-docs', 'logic', 'Je sais utiliser la documentation'),

  // 10 — Docker
  item('dock-concept', 'docker', 'Je sais ce qu\'est Docker'),
  item('dock-container', 'docker', 'Je comprends conteneur vs machine virtuelle', 15),
  item('dock-image', 'docker', 'Je connais le concept d\'image Docker'),
  item('dock-dockerfile', 'docker', 'Je connais un Dockerfile', 15),
  item('dock-build', 'docker', 'docker build'),
  item('dock-run', 'docker', 'docker run'),
  item('dock-compose', 'docker', 'docker compose', 15),
  item('dock-volumes', 'docker', 'Je comprends les volumes Docker', 15),
  item('dock-ports', 'docker', 'Je comprends l\'exposition de ports', 10),

  // 11 — CI / CD
  item('cicd-concept', 'cicd', 'Je sais ce qu\'est CI/CD'),
  item('cicd-ci', 'cicd', 'Je comprends l\'intégration continue (CI)', 15),
  item('cicd-cd', 'cicd', 'Je comprends le déploiement continu (CD)', 15),
  item('cicd-actions', 'cicd', 'Je connais GitHub Actions (ou GitLab CI / Jenkins)', 15),
  item('cicd-pipeline', 'cicd', 'Je comprends un pipeline build → test → deploy', 15),
  item('cicd-env', 'cicd', 'Je comprends les environnements dev / staging / prod', 15),
  item('cicd-trigger', 'cicd', 'Je comprends le déclenchement automatique (push, PR)', 10),

  // 12 — Déploiement
  item('dep-concept', 'deploy', 'Je sais ce qu\'est un déploiement'),
  item('dep-prod', 'deploy', 'Je comprends un environnement de production', 15),
  item('dep-cloud', 'deploy', 'Je connais l\'hébergement cloud (VPS, PaaS, SaaS)', 15),
  item('dep-ssl', 'deploy', 'Je comprends domaine et certificat SSL / HTTPS', 10),
  item('dep-done', 'deploy', 'J\'ai déjà déployé un projet (Vercel, Railway, Render…)', 30),
  item('dep-env', 'deploy', 'Je comprends les variables d\'environnement en production', 15),
  item('dep-build', 'deploy', 'Je comprends build vs runtime en production', 15),

  // 13 — Sécurité
  item('sec-basics', 'security', 'Je connais les bases de la sécurité web', 15),
  item('sec-https', 'security', 'Je comprends HTTPS et le chiffrement'),
  item('sec-xss', 'security', 'Je connais XSS et CSRF (notions)', 15),
  item('sec-hash', 'security', 'Je comprends le hachage de mots de passe (bcrypt, argon2)', 15),
  item('sec-jwt', 'security', 'Je comprends JWT et l\'authentification', 15),
  item('sec-owasp', 'security', 'Je connais OWASP Top 10 (notions)', 15),
  item('sec-secrets', 'security', 'Je sais ne jamais commiter de secrets (.env, clés API)'),

  // 14 — Tests unitaires
  item('tu-concept', 'unit-tests', 'Je sais ce qu\'est un test unitaire'),
  item('tu-framework', 'unit-tests', 'Je connais Jest, Vitest ou PHPUnit (notions)', 15),
  item('tu-aaa', 'unit-tests', 'Je comprends Arrange — Act — Assert', 10),
  item('tu-mock', 'unit-tests', 'Je connais mock et stub (notions)', 15),
  item('tu-coverage', 'unit-tests', 'Je comprends la couverture de code (notions)', 10),
  item('tu-written', 'unit-tests', 'J\'ai écrit au moins un test unitaire', 20),
  item('tu-isolation', 'unit-tests', 'Je comprends l\'isolation des tests unitaires', 10),

  // 15 — Tests Playwright
  item('pw-concept', 'playwright', 'Je sais ce qu\'est un test E2E (bout en bout)'),
  item('pw-playwright', 'playwright', 'Je connais Playwright (ou Cypress / Selenium)', 15),
  item('pw-vs-unit', 'playwright', 'Je distingue test unitaire, intégration et E2E', 15),
  item('pw-scenario', 'playwright', 'Je comprends un scénario utilisateur automatisé', 15),
  item('pw-selectors', 'playwright', 'Je connais les sélecteurs et interactions (click, fill)', 15),
  item('pw-pom', 'playwright', 'Je connais le Page Object Model (notions)', 15),
  item('pw-ci', 'playwright', 'Je comprends l\'exécution des tests E2E en CI', 15),

  // 16 — Infrastructure
  item('infra-concept', 'infra', 'Je sais ce qu\'est une infrastructure informatique'),
  item('infra-server', 'infra', 'Je comprends serveur, client et réseau', 10),
  item('infra-lb', 'infra', 'Je connais le load balancer (notions)', 15),
  item('infra-cdn', 'infra', 'Je connais le CDN (notions)', 10),
  item('infra-cloud', 'infra', 'Je connais le cloud (AWS, Azure, GCP — notions)', 15),
  item('infra-monitor', 'infra', 'Je comprends monitoring et logs (notions)', 15),
  item('infra-dns', 'infra', 'Je comprends DNS et résolution de noms', 10),

  // 17 — Architecture multicouche
  item('arch-layers', 'architecture', 'Je connais l\'architecture multicouche (n-tiers)'),
  item('arch-pmd', 'architecture', 'Je comprends Présentation / Métier / Données', 15),
  item('arch-diagram', 'architecture', 'Je sais dessiner un diagramme d\'architecture', 20),
  item('arch-mvc', 'architecture', 'Je comprends MVC ou MVVM (notions)', 15),
  item('arch-flux', 'architecture', 'Je peux expliquer le flux Frontend → API → BDD', 15),
  item('arch-soc', 'architecture', 'Je connais la séparation des responsabilités (SoC)', 10),
  item('arch-seq', 'architecture', 'Je connais diagramme de composants / séquence (notions)', 15),
  item('arch-draw', 'architecture', 'J\'ai réalisé un diagramme multicouche de mon projet', 25),

  // 18 — Entretien
  item('ent-cv', 'entretien', 'Mon CV est à jour', 30),
  item('ent-parcours', 'entretien', 'Je connais mon parcours', 20),
  item('ent-projet', 'entretien', 'Je peux présenter mon projet préféré', 30),
  item('ent-pourquoi-dev', 'entretien', 'Je peux expliquer pourquoi je veux devenir développeur', 20),
  item('ent-motivation', 'entretien', 'Je peux expliquer ma motivation', 20),
  item('ent-entreprise', 'entretien', 'Je connais les activités de l\'entreprise', 30),
  item('ent-pitch', 'entretien', 'Je sais me présenter en moins de deux minutes', 30),
  item('ent-questions', 'entretien', 'J\'ai préparé des questions à poser', 15),

  // 19 — Savoir-être
  item('soft-ponct', 'soft-skills', 'Ponctualité'),
  item('soft-curio', 'soft-skills', 'Curiosité'),
  item('soft-motiv', 'soft-skills', 'Motivation'),
  item('soft-comm', 'soft-skills', 'Communication'),
  item('soft-team', 'soft-skills', 'Esprit d\'équipe'),
  item('soft-org', 'soft-skills', 'Organisation'),
  item('soft-auto', 'soft-skills', 'Autonomie'),
  item('soft-respect', 'soft-skills', 'Respect'),
  item('soft-learn', 'soft-skills', 'Capacité d\'apprentissage'),
  item('soft-persist', 'soft-skills', 'Persévérance'),
];

const PREP_FAQ = [
  'Qu\'est-ce qu\'une API ?',
  'Qu\'est-ce que HTTP ?',
  'Quelle différence entre HTTP et HTTPS ?',
  'Qu\'est-ce qu\'une base de données ?',
  'Quelle différence entre Frontend et Backend ?',
  'Qu\'est-ce que Git ?',
  'À quoi sert JavaScript ?',
  'Qu\'est-ce que JSON ?',
  'Qu\'est-ce que SQL ?',
  'Qu\'est-ce que Node.js ?',
  'Pourquoi souhaitez-vous intégrer une formation CDA ?',
  'Pourquoi souhaitez-vous devenir développeur ?',
  'Quel est votre projet personnel préféré ?',
  'Comment gérez-vous une difficulté technique ?',
  'Comment apprenez-vous une nouvelle technologie ?',
  'Qu\'est-ce que Docker ?',
  'Qu\'est-ce que CI/CD ?',
  'Comment déployez-vous une application web ?',
  'Qu\'est-ce qu\'un test unitaire ?',
  'Quelle différence entre test unitaire et test E2E ?',
  'Qu\'est-ce que Playwright ?',
  'Quelles bonnes pratiques de sécurité connaissez-vous ?',
  'Qu\'est-ce qu\'une architecture multicouche ?',
  'Pouvez-vous expliquer le flux de votre application (Frontend → API → BDD) ?',
  'Qu\'est-ce qu\'un pipeline CI/CD ?',
  'Comment gérez-vous les secrets en production ?',
];

function isItemDone(state, id) {
  return state.prepChecklist?.[id] === true;
}

function getCategoryProgress(state, categoryId) {
  const items = PREP_ITEMS.filter(i => i.category === categoryId);
  const done = items.filter(i => isItemDone(state, i.id)).length;
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
}

function getGroupProgress(state, groupId) {
  let items;
  if (groupId === 'global') {
    items = PREP_ITEMS;
  } else {
    items = PREP_ITEMS.filter(i => i.group === groupId);
  }
  const done = items.filter(i => isItemDone(state, i.id)).length;
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
}

function getPrepStats(state) {
  const global = getGroupProgress(state, 'global');
  const technique = getGroupProgress(state, 'technique');
  const entretien = getGroupProgress(state, 'entretien');
  const outils = getGroupProgress(state, 'outils');
  const soft = getGroupProgress(state, 'soft');

  const remainingMinutes = PREP_ITEMS
    .filter(i => !isItemDone(state, i.id))
    .reduce((sum, i) => sum + i.minutes, 0);

  const lastDate = state.prepLastProgress
    ? new Date(state.prepLastProgress).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return {
    globalPct: global.pct,
    validatedCount: global.done,
    prerequisitesCount: technique.done,
    totalItems: global.total,
    lastDate,
    remainingMinutes,
    remainingLabel: formatMinutes(remainingMinutes),
    groups: { global, technique, entretien, outils, soft },
  };
}

function formatMinutes(m) {
  if (m === 0) return '0 min';
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}h ${min > 0 ? min + 'min' : ''}`.trim();
  return `${min} min`;
}

function searchPrepItems(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results = [];
  for (const item of PREP_ITEMS) {
    if (item.title.toLowerCase().includes(q)) {
      const cat = PREP_CATEGORIES.find(c => c.id === item.category);
      results.push({ type: 'item', id: item.id, label: item.title, category: cat?.title });
    }
  }
  for (const faq of PREP_FAQ) {
    if (faq.toLowerCase().includes(q)) {
      results.push({ type: 'faq', label: faq });
    }
  }
  for (const cat of PREP_CATEGORIES) {
    if (cat.title.toLowerCase().includes(q)) {
      results.push({ type: 'category', id: cat.id, label: cat.title });
    }
  }
  return results.slice(0, 12);
}


/* --- js/data/navigation.js --- */

const NAV_ITEMS = [
  { id: 'prep', icon: '🎯', label: 'Préparation entretien CDA' },
];

const PREP_SECTIONS = [
  { id: 'prep-dashboard', icon: '📊', label: 'Tableau de bord' },
  { id: 'prep-suivi', icon: '📈', label: 'Suivi' },
  { id: 'prep-checklists', icon: '✅', label: 'Checklist' },
  ...PREP_CATEGORIES.map(c => ({ id: `cat-${c.id}`, icon: c.icon, label: `${c.num}. ${c.title}` })),
  { id: 'prep-faq', icon: '❓', label: 'Questions à réviser' },
];


/* --- js/utils/search.js --- */


function initSearchUI() {
  const input = document.getElementById('global-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  let debounce = null;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = input.value.trim();
      if (!q) {
        results.hidden = true;
        return;
      }
      const hits = searchPrepItems(q);
      if (!hits.length) {
        results.innerHTML = '<div class="search-empty">Aucun résultat</div>';
      } else {
        results.innerHTML = hits.map(h => {
          let href = '#/prep/prep-faq';
          if (h.type === 'category') href = `#/prep/cat-${h.id}`;
          else if (h.type === 'item') {
            const item = PREP_ITEMS.find(i => i.id === h.id);
            href = `#/prep/cat-${item?.category || 'culture-info'}`;
          }
          return `<a href="${href}" class="search-result-item">${escapeHtml(h.label)}${h.category ? `<small>${escapeHtml(h.category)}</small>` : ''}</a>`;
        }).join('');
      }
      results.hidden = false;
    }, 150);
  });

  input.addEventListener('blur', () => setTimeout(() => { results.hidden = true; }, 200));
  input.addEventListener('focus', () => { if (input.value.trim()) results.hidden = false; });
}


/* --- js/views/prep-cda.js --- */



function renderPrepPage() {
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

function initPrepEvents() {
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

function updateDashboardUI() {
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



/* --- js/core/router.js --- */


const routes = new Map();
let onRouteChange = null;

function registerRoute(path, handler) {
  routes.set(path, handler);
}

function setRouteChangeCallback(cb) {
  onRouteChange = cb;
}

function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}

function getRouteParams() {
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

function initRouter() {
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


/* --- js/app.js --- */







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


})();
