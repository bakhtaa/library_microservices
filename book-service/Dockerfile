# Image Node.js 24 basée sur Debian Trixie
FROM node:24-trixie-slim

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances nécessaires
RUN npm ci --omit=dev

# Copier le code source
COPY . .

# Port gRPC de BookService
EXPOSE 50052

# Démarrer le microservice
CMD ["npm", "start"]