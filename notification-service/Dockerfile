
FROM node:24-trixie-slim

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances nécessaires en production
RUN npm ci --omit=dev

# Copier le code source
COPY . .

# Préparer le dossier de stockage SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production

EXPOSE 50055

CMD ["npm", "start"]
