
# 1. Image Node.js 24 basée sur Debian Trixie
FROM node:24-trixie-slim

# 2. Répertoire de travail
WORKDIR /app

# 3. Copier les fichiers de dépendances
COPY package*.json ./

# 4. Installer les dépendances
RUN npm ci --omit=dev

# 5. Copier le code source
COPY . .

# 6. Port gRPC
EXPOSE 50051

# 7. Démarrer UserService
CMD ["npm", "start"]
