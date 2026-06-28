# 🎯 Préparation entretien CDA
https://wazabi64000.github.io/pr-paration-cda-/
Guide de préparation à l'**entretien d'entrée en formation Concepteur Développeur d'Applications (CDA)** ou en alternance.

Ce n'est **pas une formation**, **pas un cours**, **pas un quiz**. C'est une **feuille de route** pour vérifier que vous possédez les prérequis attendus avant votre entretien.

## 🚀 Utilisation

**Double-cliquez sur `index.html`** ou ouvrez-le dans votre navigateur.

Aucun serveur requis. Pas de `npm install`.

## ✨ Contenu

- **Tableau de bord** — progression, compétences validées, prérequis, temps restant
- **Checklist** — prérequis en 19 catégories (culture info, web, HTML/CSS, JS, BDD, Git, API, outils, logique, Docker, CI/CD, déploiement, sécurité, tests unitaires, Playwright, infrastructure, architecture multicouche, entretien, savoir-être)
- **Questions fréquentes** — questions à préparer (sans réponses affichées)
- **Suivi visuel** — progression globale, technique, entretien, outils, savoir-être
- **Recherche** — filtrer la checklist par mot-clé
- **Dark mode** — thème clair/sombre
- **Sauvegarde automatique** — progression conservée dans le navigateur

## 📁 Structure

```
├── index.html          ← Ouvrir ce fichier
├── js/main.js          ← Bundle JavaScript
├── js/data/prep-cda.js ← Données checklist
├── js/views/prep-cda.js← Interface
└── css/                ← Styles
```

Après modification des sources :

```bash
node build-main.js
```

## 💾 Données sauvegardées

Tout est mémorisé dans le navigateur (LocalStorage) :
- Cases cochées de la checklist
- Date de dernière progression
- Filtre actif
- Thème clair/sombre
