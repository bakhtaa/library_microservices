
// Rôle : Initialiser la connexion SQLite et créer la table users

const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// Chargement des variables d'environnement du UserService
require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});

// Répertoire racine du UserService
const serviceDirectory = path.resolve(__dirname, "../..");

// Chemin de la base de données
const databasePath = path.resolve(
    serviceDirectory,
    process.env.DB_PATH || "db.sqlite"
);

const dbPromise = open({
    filename: databasePath,
    driver: sqlite3.Database
});

async function initializeDatabase() {
    const db = await dbPromise;

    await db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            account_status TEXT NOT NULL DEFAULT 'ACTIVE'
        )
    `);

    console.log("Database initialized successfully");
}

module.exports = {
    dbPromise,
    initializeDatabase
};
