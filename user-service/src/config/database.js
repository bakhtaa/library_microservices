//rôle : 	Initialise la connexion SQLite
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const db = new sqlite3.Database("db.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT
  )
`);

module.exports = db;