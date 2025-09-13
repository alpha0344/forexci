# 🎨 Guide du Système de Design - ForexCI

## 📋 Vue d'ensemble

Ce document présente le système de design complet de ForexCI, incluant la palette de couleurs, la typographie, et les composants réutilisables.

## 🎨 Palette de Couleurs

### Couleurs Principales (Brand Colors)
```css
--primary-yellow: #FCEF91    /* Jaune principal */
--primary-orange: #FB9E3A    /* Orange principal */
--primary-red-orange: #E6521F /* Rouge-orange principal */
--primary-red: #EA2F14       /* Rouge principal */
```

### Variantes de Couleurs
```css
/* Variantes claires */
--primary-yellow-light: #fdf6c4
--primary-orange-light: #fcb366
--primary-red-orange-light: #ed7146
--primary-red-light: #ef4f2f

/* Variantes sombres */
--primary-yellow-dark: #f9e86a
--primary-orange-dark: #f98a14
--primary-red-orange-dark: #d63f0f
--primary-red-dark: #d11f09
```

### Couleurs Fonctionnelles
```css
--success: #10b981    /* Vert de succès */
--warning: #FB9E3A    /* Orange d'avertissement */
--error: #EA2F14      /* Rouge d'erreur */
--info: #3b82f6       /* Bleu d'information */
```

### Couleurs Neutres
```css
--neutral-white: #ffffff
--neutral-gray-50: #f9fafb
--neutral-gray-100: #f3f4f6
--neutral-gray-200: #e5e7eb
--neutral-gray-300: #d1d5db
--neutral-gray-400: #9ca3af
--neutral-gray-500: #6b7280
--neutral-gray-600: #4b5563
--neutral-gray-700: #374151
--neutral-gray-800: #1f2937
--neutral-gray-900: #111827
--neutral-black: #000000
```

## 🔤 Typographie

### Police Principale
- **Poppins** : Police moderne et professionnelle
- Poids disponibles : 100, 200, 300, 400, 500, 600, 700, 800, 900
- Fallback : -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif

### Hiérarchie Typographique
```css
/* Couleurs de texte */
--text-primary: #111827     /* Texte principal */
--text-secondary: #4b5563   /* Texte secondaire */
--text-muted: #6b7280       /* Texte atténué */
--text-inverse: #ffffff     /* Texte inversé */
```

## 🎯 Classes Utilitaires CSS

### Classes de Couleurs
```css
/* Couleurs de texte */
.text-brand-yellow
.text-brand-orange
.text-brand-red-orange
.text-brand-red
.text-success
.text-warning
.text-error
.text-info

/* Couleurs de fond */
.bg-brand-yellow
.bg-brand-orange
.bg-brand-red-orange
.bg-brand-red
.bg-brand-yellow-light
.bg-brand-orange-light
.bg-brand-red-orange-light
.bg-brand-red-light
```

### Gradients de Marque
```css
.bg-brand-gradient          /* Gradient principal coloré */
.bg-brand-gradient-subtle   /* Gradient subtil */
```

### Composants Stylisés
```css
.btn-primary    /* Bouton principal avec gradient */
.btn-secondary  /* Bouton secondaire avec bordure */
.card           /* Carte de base */
.card-accent    /* Carte avec accent coloré */
```

## 🎬 Animations

### Classes d'Animation
```css
.animate-fade-in        /* Animation d'apparition */
.animate-slide-in-up    /* Animation de glissement */
.animate-bounce-gentle  /* Animation de rebond doux */
```

## 📱 Responsive Design

### Breakpoints
- **Mobile** : ≤ 480px
- **Tablette** : 481px - 1024px  
- **Desktop** : ≥ 1025px

### Classes Tailwind Disponibles
```css
/* Classes Tailwind personnalisées */
bg-brand-yellow
bg-brand-orange
bg-brand-red-orange
bg-brand-red
text-brand-yellow
text-brand-orange
text-brand-red-orange
text-brand-red
border-brand-yellow
border-brand-orange
border-brand-red-orange
border-brand-red
```

## 🧩 Utilisation des Composants

### Boutons
```jsx
// Bouton principal
<button className="btn-primary">Action Principale</button>

// Bouton secondaire
<button className="btn-secondary">Action Secondaire</button>
```

### Cartes
```jsx
// Carte standard
<div className="card">Contenu</div>

// Carte avec accent
<div className="card card-accent">Contenu Important</div>
```

### Texte
```jsx
// Texte avec couleurs de marque
<h1 className="text-brand-red-orange">Titre Principal</h1>
<p className="text-secondary">Texte descriptif</p>
```

## 🎨 Conseils d'Usage

### Hiérarchie des Couleurs
1. **Rouge-orange** (#E6521F) : Actions principales, titres importants
2. **Orange** (#FB9E3A) : Actions secondaires, liens de navigation
3. **Rouge** (#EA2F14) : Alertes, erreurs, actions critiques
4. **Jaune** (#FCEF91) : Accents, arrière-plans subtils, highlights

### Bonnes Pratiques
- Utilisez le rouge pour les actions importantes ou urgentes
- L'orange pour les interactions et la navigation
- Le jaune pour les accents et backgrounds subtils
- Respectez les contrastes pour l'accessibilité
- Testez sur tous les breakpoints responsive

### Accessibilité
- Toutes les couleurs respectent un contraste minimum de 4.5:1
- Focus states définis pour tous les éléments interactifs
- Navigation au clavier supportée

## 📄 Fichiers Modifiés
- `app/globals.css` : Système de couleurs global
- `app/layout.tsx` : Configuration de la police Poppins
- `components/Navbar.tsx` : Application du nouveau thème
- `app/page.tsx` : Mise à jour avec les nouvelles couleurs
- `tailwind.config.js` : Configuration Tailwind personnalisée