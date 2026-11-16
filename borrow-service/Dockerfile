
FROM node:24-trixie-slim

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Copier le code source
COPY . .

# Port gRPC
EXPOSE 50053

# Démarrer BorrowService
CMD ["npm", "start"]
