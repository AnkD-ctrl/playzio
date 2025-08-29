# 📅 Playzio BARA

**Playzio BARA** est une application web moderne avec un design sombre et des gradients beige-violet, conçue pour organiser des parties de **Tennis**, **Padel** et **Soirées** entre amis.

## ✨ Fonctionnalités

- 🔐 **Connexion sécurisée** avec hash SHA256 des mots de passe
- 🎾 **Gestion des activités** : Tennis, Padel, Soirées
- 📅 **Calendrier interactif** pour visualiser les créneaux
- 👥 **Participation universelle** : Tous les utilisateurs peuvent rejoindre n'importe quelle disponibilité
- 🛡️ **Permissions admin** : Les admins peuvent supprimer toutes les disponibilités
- 📱 **Interface responsive** avec thème sombre et gradients beige-violet
- 🎯 **Filtrage par activité** et par date

## 🚀 Installation Locale

### Installation complète
```bash
git clone https://github.com/VOTRE-USERNAME/playzio-bara.git
cd playzio-bara
npm run install:all
```

### Développement
```bash
# Démarrer frontend et backend simultanément
npm run dev

# Ou séparément :
npm run dev:frontend  # Frontend sur http://localhost:5173
npm run dev:backend   # Backend sur http://localhost:3001
```

## 🌐 Déploiement en Ligne

### Frontend (Vercel)
1. Connectez le repository GitHub à Vercel
2. Vercel détectera automatiquement le frontend React
3. L'application sera disponible sur `https://votre-app.vercel.app`

### Backend (Railway)
1. Allez sur [Railway.app](https://railway.app)
2. Connectez votre compte GitHub
3. Créez un nouveau projet depuis le repository
4. Railway déploiera automatiquement le backend
5. L'API sera disponible sur `https://votre-backend.railway.app`

## 🎨 Design

Playzio utilise un design moderne avec :
- **Thème sombre** avec fond gris profond (#2c2c2c)
- **Gradients beige-violet** (#d4af8c → #8a2be2)
- **Icônes cohérentes** : Cercle (Tennis), Carré arrondi (Padel), Triangle (Soirées)
- **Interface intuitive** avec cartes sombres
- **Footer flottant** pour la sélection d'activités

## 🔧 Technologies

- **Frontend** : React + Vite
- **Backend** : Node.js + Express
- **Base de données** : JSON (fichier local)
- **Sécurité** : Hash SHA256 pour les mots de passe
- **Déploiement** : Vercel (Frontend) + Railway (Backend)

## 👥 Comptes de Test

- **Admin** : `U` / `U` (peut supprimer toutes les disponibilités)
- **Utilisateur** : `TEST` / `test` (peut participer aux disponibilités)

## 📝 Licence

MIT License
