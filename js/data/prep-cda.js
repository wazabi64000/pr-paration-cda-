/** Guide de préparation — Entretien d'entrée CDA */

export const PREP_PROGRESS_GROUPS = {
  global: { id: 'global', label: 'Préparation globale', icon: '🎯' },
  technique: { id: 'technique', label: 'Préparation technique', icon: '💻' },
  entretien: { id: 'entretien', label: 'Préparation entretien', icon: '🎤' },
  outils: { id: 'outils', label: 'Préparation outils', icon: '🛠️' },
  soft: { id: 'soft', label: 'Préparation savoir-être', icon: '🤝' },
};

export const PREP_CATEGORIES = [
  { id: 'culture-info', num: 1, title: 'Culture informatique', icon: '🖥️', group: 'technique' },
  { id: 'web', num: 2, title: 'Web', icon: '🌐', group: 'technique' },
  { id: 'html-css', num: 3, title: 'HTML / CSS', icon: '🎨', group: 'technique' },
  { id: 'javascript', num: 4, title: 'JavaScript', icon: '⚡', group: 'technique' },
  { id: 'database', num: 5, title: 'Bases de données', icon: '🗄️', group: 'technique' },
  { id: 'git', num: 6, title: 'Git', icon: '📦', group: 'technique' },
  { id: 'api', num: 7, title: 'API', icon: '🔌', group: 'technique' },
  { id: 'outils', num: 8, title: 'Outils', icon: '🛠️', group: 'outils' },
  { id: 'logic', num: 9, title: 'Logique', icon: '🧠', group: 'technique' },
  { id: 'entretien', num: 10, title: 'Entretien', icon: '🎤', group: 'entretien' },
  { id: 'soft-skills', num: 11, title: 'Savoir-être', icon: '🤝', group: 'soft' },
];

function item(id, category, title, minutes = 10) {
  const cat = PREP_CATEGORIES.find(c => c.id === category);
  return { id, category, title, minutes, group: cat?.group || 'technique' };
}

export const PREP_ITEMS = [
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

  // 10 — Entretien
  item('ent-cv', 'entretien', 'Mon CV est à jour', 30),
  item('ent-parcours', 'entretien', 'Je connais mon parcours', 20),
  item('ent-projet', 'entretien', 'Je peux présenter mon projet préféré', 30),
  item('ent-pourquoi-dev', 'entretien', 'Je peux expliquer pourquoi je veux devenir développeur', 20),
  item('ent-motivation', 'entretien', 'Je peux expliquer ma motivation', 20),
  item('ent-entreprise', 'entretien', 'Je connais les activités de l\'entreprise', 30),
  item('ent-pitch', 'entretien', 'Je sais me présenter en moins de deux minutes', 30),
  item('ent-questions', 'entretien', 'J\'ai préparé des questions à poser', 15),

  // 11 — Savoir-être
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

export const PREP_FAQ = [
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
];

export function isItemDone(state, id) {
  return state.prepChecklist?.[id] === true;
}

export function getCategoryProgress(state, categoryId) {
  const items = PREP_ITEMS.filter(i => i.category === categoryId);
  const done = items.filter(i => isItemDone(state, i.id)).length;
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
}

export function getGroupProgress(state, groupId) {
  let items;
  if (groupId === 'global') {
    items = PREP_ITEMS;
  } else {
    items = PREP_ITEMS.filter(i => i.group === groupId);
  }
  const done = items.filter(i => isItemDone(state, i.id)).length;
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
}

export function getPrepStats(state) {
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

export function searchPrepItems(query) {
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
