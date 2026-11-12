
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// Initialisation de la connexion SQLite
const dbPromise = open({
    filename: path.join(__dirname, "../../db.sqlite"),
    driver: sqlite3.Database
});

// Création de la table books
async function initializeDatabase() {
    const db = await dbPromise;

    await db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            available INTEGER NOT NULL DEFAULT 1
        )
    `);

    console.log("Book database initialized successfully");
}

module.exports = {
    dbPromise,
    initializeDatabase
};
