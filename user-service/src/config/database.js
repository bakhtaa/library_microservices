
// Rôle : Initialiser la connexion SQLite et créer la table users

const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPromise = open({
    filename: path.join(__dirname, "../../db.sqlite"),
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
