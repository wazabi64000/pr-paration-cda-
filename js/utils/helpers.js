export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function showToast(message, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

export function scrollToMainTop() {
  const main = document.getElementById('main-content');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduced ? 'auto' : 'smooth' });
  if (main) main.scrollTop = 0;
}

export const AppUI = { closeSidebar: null };

export function afterNavigation() {
  scrollToMainTop();
  AppUI.closeSidebar?.();
}
