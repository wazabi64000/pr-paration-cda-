export const LS_KEY = 'cda-prep-state';

const defaultState = {
  theme: 'light',
  prepChecklist: {},
  prepLastProgress: null,
  prepFilter: 'all',
  searchHistory: [],
};

let state = structuredClone(defaultState);
let saveTimeout = null;

export function getState() {
  return state;
}

export function getDefaultState() {
  return structuredClone(defaultState);
}

export function resetStateForTests() {
  state = structuredClone(defaultState);
  clearTimeout(saveTimeout);
  saveTimeout = null;
}

export function loadState() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...structuredClone(defaultState), ...parsed };
      if (!state.prepChecklist || typeof state.prepChecklist !== 'object') {
        state.prepChecklist = {};
      }
    }
    const legacy = localStorage.getItem('cda-roadmap-state');
    if (legacy && !saved) {
      try {
        const old = JSON.parse(legacy);
        if (old.checklists) {
          const prepChecklist = {};
          for (const [k, v] of Object.entries(old.checklists)) {
            if (k.startsWith('prep-') || k.startsWith('ent-') || k.startsWith('ci-') || k.startsWith('dock-')) {
              prepChecklist[k] = v === 'done' || v === true;
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

/** Écrit immédiatement dans localStorage (persiste après F5 et fermeture du navigateur). */
export function flushSave() {
  clearTimeout(saveTimeout);
  saveTimeout = null;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn('Failed to save state:', e);
    return false;
  }
}

export function saveState() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(flushSave, 100);
}

export function updateState(updates) {
  Object.assign(state, updates);
  flushSave();
}

export function exportState() {
  return JSON.stringify(state, null, 2);
}

export function importState(json) {
  try {
    const parsed = JSON.parse(json);
    state = { ...structuredClone(defaultState), ...parsed };
    flushSave();
    return true;
  } catch { return false; }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushSave);
  window.addEventListener('pagehide', flushSave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSave();
  });
}
