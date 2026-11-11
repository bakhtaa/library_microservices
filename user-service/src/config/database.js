//rôle : 	Initialise la connexion SQLite

const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const db = await open({
    filename: "./db.sqlite",
    driver: sqlite3.Database
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT
  )
`);

module.exports = db;