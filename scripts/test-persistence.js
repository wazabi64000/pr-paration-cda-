#!/usr/bin/env node
/**
 * Test de persistance localStorage — simule F5 et nouvelle session navigateur.
 */
import { LS_KEY, resetStateForTests, loadState, updateState, getState, flushSave } from '../js/core/storage.js';
import { getPrepStats, isItemDone } from '../js/data/prep-cda.js';

const store = {};

globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log('  ✓', msg); }
  else { failed++; console.error('  ✗', msg); }
}

console.log('Test persistance localStorage\n');

// 1. État vide au départ
resetStateForTests();
localStorage.clear();
loadState();
assert(Object.keys(getState().prepChecklist).length === 0, 'État initial vide');

// 2. Cocher des items → sauvegarde immédiate
updateState({
  prepChecklist: { 'ci-os': true, 'web-http': true, 'dock-concept': true },
  prepLastProgress: '2026-06-28T12:00:00.000Z',
});
assert(localStorage.getItem(LS_KEY) !== null, 'Données écrites dans localStorage');
const raw = JSON.parse(localStorage.getItem(LS_KEY));
assert(raw.prepChecklist['ci-os'] === true, 'Item ci-os persisté');
assert(raw.prepLastProgress === '2026-06-28T12:00:00.000Z', 'Date de progression persistée');

// 3. Simuler fermeture navigateur (reset mémoire) + rechargement
resetStateForTests();
loadState();
assert(isItemDone(getState(), 'ci-os'), 'ci-os restauré après rechargement');
assert(isItemDone(getState(), 'web-http'), 'web-http restauré après rechargement');
assert(isItemDone(getState(), 'dock-concept'), 'dock-concept restauré après rechargement');
assert(!isItemDone(getState(), 'git-init'), 'git-init toujours non coché');

// 4. Progression recalculée correctement
const stats = getPrepStats(getState());
assert(stats.validatedCount === 3, `3 compétences validées (got ${stats.validatedCount})`);
assert(stats.globalPct > 0, 'Pourcentage global > 0');

// 5. Décocher un item
const checklist = { ...getState().prepChecklist, 'ci-os': false };
delete checklist['ci-os'];
updateState({ prepChecklist: checklist });
resetStateForTests();
loadState();
assert(!isItemDone(getState(), 'ci-os'), 'ci-os décoché persisté');

// 6. Thème persisté
updateState({ theme: 'dark' });
resetStateForTests();
loadState();
assert(getState().theme === 'dark', 'Thème dark persisté');

// 7. flushSave explicite
flushSave();
assert(localStorage.getItem(LS_KEY).includes('"theme":"dark"'), 'flushSave écrit bien le JSON');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
