# Backend - BuddyCoach

Ce service backend, construit avec Node.js et Express.js, constitue l'API de l'application BuddyCoach. Il gère toute la logique métier, les interactions avec la base de données PostgreSQL et l'authentification des utilisateurs.

## Fonctionnalités Principales

L'API est organisée en plusieurs routes, chacune correspondant à un ensemble de fonctionnalités :

- **Authentification (`/api/auth`)**: Inscription et connexion des utilisateurs avec gestion par jetons JWT.
- **Profil Utilisateur (`/api/profil`)**: Gestion complète des profils utilisateurs, incluant les informations de santé.
- **Alimentation (`/api/alimentation`)**: Suivi de l'alimentation, gestion des repas et des régimes.
- **Exercices (`/api/exos`)**: Base de données d'exercices physiques.
- **Équipements (`/api/equipement`)**: Gestion des équipements sportifs disponibles.
- **Sessions Sportives (`/api/sessionSport`)**: Création et suivi des séances de sport.
- **Programmes (`/api/programme`)**: Génération et gestion des programmes sportifs et alimentaires.
- **Objectifs (`/api/objectif`)**: Suivi des objectifs personnels des utilisateurs.
- **Records (`/api/record`)**: Enregistrement des performances et records personnels.
- **Classement (`/api/classement`)**: Gestion des classements et des ligues entre utilisateurs.
- **Événements (`/api/evenement`)**: Participation à des événements et défis communautaires.
- **Mascotte (`/api/mascotte`)**: Interaction avec la mascotte de l'application.

## Démarrage Rapide

Ce projet est conçu pour être lancé avec Docker.

### Prérequis

- [Docker](https://www.docker.com/get-started) et [Docker Compose](https://docs.docker.com/compose/install/) installés sur votre machine.

### Lancement

1.  **Placement du fichier `.env`**: Assurez-vous qu'un fichier `.env` est présent à la racine du dossier `backend` et qu'il contient les variables d'environnement nécessaires (notamment pour la connexion à la base de données si non gérée par Docker). Pour la configuration par défaut de `compose.yml`, aucune variable supplémentaire n'est requise.

2.  **Lancer les services**: Depuis la racine du projet (le dossier `SAE_S5`), exécutez la commande suivante :

    ```bash
    docker-compose up --build
    ```

Cette commande va construire l'image du backend, démarrer les conteneurs du backend et de la base de données PostgreSQL, et installer les dépendances `npm`.

Le serveur de développement (`nodemon`) sera lancé, et l'API sera accessible à l'adresse [http://localhost:5000](http://localhost:5000).
