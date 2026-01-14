# Utilise l'image officielle Node.js
FROM node:20-alpine

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste des fichiers de l'application
COPY . .

# Expose le port utilisé par l'application
EXPOSE 5000

# Commande par défaut pour démarrer le serveur
CMD ["npm", "run", "dev"]
