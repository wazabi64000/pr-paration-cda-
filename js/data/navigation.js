import { PREP_CATEGORIES } from './prep-cda.js';

export const NAV_ITEMS = [
  { id: 'prep', icon: '🎯', label: 'Préparation entretien CDA' },
];

export const PREP_SECTIONS = [
  { id: 'prep-dashboard', icon: '📊', label: 'Tableau de bord' },
  { id: 'prep-suivi', icon: '📈', label: 'Suivi' },
  { id: 'prep-checklists', icon: '✅', label: 'Checklist' },
  ...PREP_CATEGORIES.map(c => ({ id: `cat-${c.id}`, icon: c.icon, label: `${c.num}. ${c.title}` })),
  { id: 'prep-faq', icon: '❓', label: 'Questions à réviser' },
];
