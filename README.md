# ForexCI - Plateforme de Trading Forex

Plateforme de trading Forex moderne construite avec Next.js 14, TypeScript et Tailwind CSS.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18.17.0 ou plus récent
- npm ou yarn

### Installation

```bash
# Cloner le projet (si applicable)
git clone <votre-repo>
cd forexci

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.

## 📁 Structure du projet

```
forexci/
├── app/                    # App Router (Next.js 13+)
│   ├── globals.css        # Styles globaux avec Tailwind
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants réutilisables
│   └── Navbar.tsx         # Barre de navigation
├── public/               # Fichiers statiques
├── package.json          # Dépendances et scripts
├── tsconfig.json         # Configuration TypeScript
├── tailwind.config.js    # Configuration Tailwind CSS
├── postcss.config.js     # Configuration PostCSS
└── next.config.js        # Configuration Next.js
```

## 🛠️ Technologies utilisées

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **React 18** - Bibliothèque UI
- **ESLint** - Linter pour la qualité du code

## 📜 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run start` - Démarre le serveur de production
- `npm run lint` - Vérifie le code avec ESLint

## 🎨 Fonctionnalités

- ✅ Configuration Next.js 14 avec App Router
- ✅ TypeScript pour un développement type-safe
- ✅ Tailwind CSS pour un styling rapide
- ✅ Design responsive
- ✅ Navigation moderne
- ✅ Page d'accueil attrayante
- 🔄 Trading en temps réel (à implémenter)
- 🔄 Analyse technique (à implémenter)
- 🔄 Gestion de portefeuille (à implémenter)

## 🚧 Prochaines étapes

1. Intégrer une API de données Forex en temps réel
2. Ajouter des graphiques interactifs
3. Implémenter l'authentification utilisateur
4. Créer le système de trading
5. Ajouter des outils d'analyse technique

## 📄 Licence

Ce projet est sous licence MIT.
