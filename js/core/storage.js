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

export function getState() {
  return state;
}

export function loadState() {
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

export function saveState() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, 200);
}

export function updateState(updates) {
  Object.assign(state, updates);
  saveState();
}

export function exportState() {
  return JSON.stringify(state, null, 2);
}

export function importState(json) {
  try {
    const parsed = JSON.parse(json);
    state = { ...structuredClone(defaultState), ...parsed };
    saveState();
    return true;
  } catch { return false; }
}
