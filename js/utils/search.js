import { searchPrepItems, PREP_ITEMS } from '../data/prep-cda.js';
import { escapeHtml } from './helpers.js';

export function initSearchUI() {
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
