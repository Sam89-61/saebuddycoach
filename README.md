# 🧪 Guide de Test - BuddyCoach

Guide rapide pour installer et tester l'application BuddyCoach disponible en version WEB à utilisé avec la vue mobile avec des données de test.

## 📋 Prérequis

- Node.js (v16+)
- PostgreSQL (v15+) OU Docker
- Git

## 🚀 Installation Rapide

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd BuddyCoach
```

### 2. Configuration avec Docker (Recommandé)

```bash
# Démarrer les services (PostgreSQL + Adminer)
docker compose up -d

# Vérifier que les conteneurs fonctionnent
docker ps
```

### 3. Configuration Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
copy .env.example .env
```

**Éditer `backend/.env` avec ces valeurs de test :**
```env
DATABASE_URL=postgresql://appuser:apppassword@localhost:5432/appdb
PORT=5000
NODE_ENV=development
JWT_SECRET=test-secret-key-12345-change-in-production
API_KEY=test-api-key-12345
GROQ_API_KEY=votre-clé-groq-si-disponible
```

### 4. Configuration Frontend

```bash
cd ../front

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
copy .env.example .env
```

**Éditer `front/.env` avec :**
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

## 🗄️ Initialisation de la Base de Données

### Créer les tables et insérer les données de test

```bash
cd backend

# Initialiser le schéma de la base de données
node initDb.js

# Insérer les données de test complètes
node insertTest.js
```

✅ Vous verrez des messages confirmant l'insertion des utilisateurs, exercices, programmes, etc.

## ▶️ Lancement de l'Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Le backend démarre sur `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd front
npm run dev
```
Le frontend démarre sur `http://localhost:5173`

## 🧪 Données de Test Disponibles

### Utilisateur de Test
- **Email :** `johndoe@test.com`
- **Mot de passe :** `12345678`

### Endpoints API à tester

```bash
# Test de connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"johndoe@test.com\",\"password\":\"12345678\"}"

# Récupérer le profil (remplacer TOKEN par le token reçu)
curl http://localhost:5000/api/profil \
  -H "Authorization: Bearer TOKEN"
```

## 🔍 Vérifier la Base de Données

### Via Adminer (Interface Web)
1. Ouvrir `http://localhost:8080`
2. Se connecter avec :
   - **Système :** PostgreSQL
   - **Serveur :** postgres
   - **Utilisateur :** appuser
   - **Mot de passe :** apppassword
   - **Base :** appdb

### Via psql (ligne de commande)
```bash
docker exec -it app_db psql -U appuser -d appdb

# Voir les tables
\dt

# Voir les utilisateurs
SELECT email, nom, prenom FROM utilisateurs;

# Quitter
\q
```

## 🛠️ Commandes Utiles

### Réinitialiser la base de données
```bash
cd backend
node resetDb.js
node initDb.js
node insertTest.js
```

### Redémarrer les services Docker
```bash
docker compose down
docker compose up -d
```

### Voir les logs
```bash
# Logs du backend
docker logs app_backend -f

# Logs de la base de données
docker logs app_db -f
```


