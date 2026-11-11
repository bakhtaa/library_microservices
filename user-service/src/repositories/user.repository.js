
// Rôle : exécuter les requêtes SQL liées aux utilisateurs

const dbPromise = require("../config/database");

async function findById(id) {
    const db = await dbPromise;

    return db.get(
        "SELECT * FROM users WHERE id = ?",
        [id]
    );
}

async function findAll() {
    const db = await dbPromise;

    return db.all("SELECT * FROM users");
}

async function create(user) {
    const db = await dbPromise;
    const { id, name, email } = user;

    return db.run(
        "INSERT INTO users (id, name, email) VALUES (?, ?, ?)",
        [id, name, email]
    );
}

async function deleteById(id) {
    const db = await dbPromise;

    const result = await db.run(
        "DELETE FROM users WHERE id = ?",
        [id]
    );

    return result.changes;
}

module.exports = {
    findById,
    findAll,
    create,
    deleteById
};
