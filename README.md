# TeamManager - Application de Gestion d'Équipe

Application web complète développée avec Nuxt 3 pour centraliser la gestion des fichiers Excel utilisés par votre équipe.

## 🚀 Fonctionnalités

### ✅ Phase 1 - Implémentée
- **Authentification complète** : Inscription, connexion, gestion des sessions
- **Module de calcul des temps de travail** : 
  - Saisie des pointages quotidiens
  - Calcul automatique du temps de travail
  - Gestion des régimes 4 ou 5 jours/semaine
  - Paramétrage personnalisé par employé
  - Historique et analyse des données

### 🔄 Phase 2 - À venir
- Module Planning Téléphonique
- Module Gestion des Vacances

### 🔄 Phase 3 - À venir  
- Module Vérification des Congés
- Panel Administrateur complet

### 🔄 Phase 4 - À venir
- Import/Export Excel
- Optimisations et déploiement

## 🛠 Stack Technique

- **Framework** : Nuxt 3 avec TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : PostgreSQL (Neon)
- **ORM** : Prisma
- **Authentification** : JWT + bcryptjs
- **État global** : Pinia
- **Icons** : Phosphor Icons
- **Dates** : date-fns

## 📋 Prérequis

- Node.js 18+
- pnpm
- Base de données PostgreSQL (Neon recommandé)

## ⚙️ Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd workscapsule
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configuration de la base de données**
   - Créer une base de données PostgreSQL sur [Neon](https://neon.tech)
   - Copier la chaîne de connexion

4. **Configuration des variables d'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs
DATABASE_URL="postgresql://username:password@ep-xxx-pooler.region.neon.tech/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-128-chars-long"
```

5. **Initialiser la base de données**
```bash
# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev --name init

# (Optionnel) Peupler avec des données de test
npx prisma db seed
```

6. **Lancer le serveur de développement**
```bash
pnpm dev
```

L'application sera disponible sur `http://localhost:3000`

## 📁 Structure du Projet

```
/
├── pages/                 # Pages Nuxt (routing automatique)
│   ├── index.vue         # Page d'accueil
│   ├── login.vue         # Connexion
│   ├── register.vue      # Inscription
│   └── timetracking.vue  # Module temps de travail
├── components/           # Composants Vue réutilisables
├── layouts/             # Layouts Nuxt
│   └── default.vue      # Layout principal avec navigation
├── server/api/          # API routes Nuxt
│   ├── auth/           # Authentification
│   └── timetracking/   # Gestion des temps
├── stores/             # Stores Pinia
│   └── auth.ts         # Store d'authentification
├── utils/              # Utilitaires
│   ├── auth.ts         # Fonctions auth (JWT, hash)
│   ├── prisma.ts       # Client Prisma
│   └── timeCalculations.ts # Calculs de temps
├── types/              # Définitions TypeScript
├── middleware/         # Middleware Nuxt
│   ├── auth.ts         # Protection des routes
│   └── admin.ts        # Protection admin
├── prisma/             # Configuration Prisma
│   └── schema.prisma   # Schéma de base de données
└── plugins/            # Plugins Nuxt
```

## 🗃 Base de Données

### Modèles principaux

- **User** : Utilisateurs avec paramètres de travail
- **TimeEntry** : Entrées de pointage quotidien  
- **ScheduleEntry** : Planning téléphonique
- **LeaveRequest** : Demandes de congés
- **HolidayCalendar** : Jours fériés

### Commandes Prisma utiles

```bash
# Voir la base de données
npx prisma studio

# Réinitialiser la base
npx prisma migrate reset

# Générer le client après modification du schéma
npx prisma generate
```

## 👤 Utilisation

### Première utilisation

1. Accéder à `/register` pour créer un compte
2. Configurer vos paramètres de travail :
   - Régime 4 ou 5 jours
   - Heures par jour
   - Date d'embauche
3. Commencer à saisir vos pointages dans `/timetracking`

### Module Temps de Travail

- **Saisie rapide** : Date, heures d'arrivée/départ, pauses
- **Calcul automatique** : Temps de travail calculé en temps réel
- **Résumé mensuel** : Total, heures sup, heures manquantes
- **Historique** : Visualisation et modification des entrées passées

## 🔐 Sécurité

- Mots de passe hashés avec bcryptjs
- Authentification JWT avec expiration
- Protection des routes sensibles
- Validation des données côté serveur
- Isolation des données par utilisateur

## 🚀 Déploiement

### Recommandations

- **Frontend** : Vercel ou Netlify
- **Base de données** : Neon (PostgreSQL serverless)
- **Variables d'environnement** : Configurer sur la plateforme de déploiement

### Variables de production

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-secret-key-very-long
NODE_ENV=production
```

## 🔄 Développement futur

### Phase 2 - Planning & Vacances
- Interface calendrier pour le planning téléphonique
- Visualisation des congés de l'équipe
- Gestion des conflits de planning

### Phase 3 - Administration
- Panel admin pour gérer les utilisateurs
- Configuration des règles de calcul
- Validation des demandes de congés

### Phase 4 - Migration Excel
- Import des fichiers Excel existants
- Export des données vers Excel
- Scripts de migration automatisés

## 🐛 Troubleshooting

### Erreurs courantes

**Erreur de connexion à la base** :
- Vérifier la variable `DATABASE_URL`
- S'assurer que la base Neon est accessible

**Erreur JWT** :
- Vérifier la variable `JWT_SECRET`
- Réinitialiser le token en se reconnectant

**Erreur Prisma** :
- Régénérer le client : `npx prisma generate`
- Vérifier les migrations : `npx prisma migrate status`

## 📝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.