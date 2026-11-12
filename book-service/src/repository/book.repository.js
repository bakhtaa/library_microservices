
const { dbPromise } = require("../config/database");

// Convertir la valeur SQLite (0 ou 1) en booléen JavaScript
function formatBook(book) {
    if (!book) return null;

    return {
        ...book,
        available: Boolean(book.available)
    };
}

// Récupérer un livre par son ID
async function findById(id) {
    const db = await dbPromise;

    const book = await db.get(
        "SELECT * FROM books WHERE id = ?",
        [id]
    );

    return formatBook(book);
}

// Récupérer tous les livres
async function findAll() {
    const db = await dbPromise;

    const books = await db.all(
        "SELECT * FROM books"
    );

    return books.map(formatBook);
}

// Ajouter un livre
async function create(book) {
    const db = await dbPromise;

    const { id, title, author, available } = book;

    await db.run(
        `INSERT INTO books (id, title, author, available)
         VALUES (?, ?, ?, ?)`,
        [id, title, author, available ? 1 : 0]
    );

    return book;
}

// Modifier un livre
async function update(id, title, author, available) {
    const db = await dbPromise;

    const result = await db.run(
        `UPDATE books
         SET title = ?, author = ?, available = ?
         WHERE id = ?`,
        [title, author, available ? 1 : 0, id]
    );

    if (result.changes === 0) {
        return null;
    }

    return findById(id);
}

// Supprimer un livre
async function deleteById(id) {
    const db = await dbPromise;

    const result = await db.run(
        "DELETE FROM books WHERE id = ?",
        [id]
    );

    return result.changes;
}

// Vérifier la disponibilité d'un livre
async function checkAvailability(id) {
    const db = await dbPromise;

    const book = await db.get(
        "SELECT available FROM books WHERE id = ?",
        [id]
    );

    return book ? Boolean(book.available) : false;
}

module.exports = {
    findById,
    findAll,
    create,
    update,
    deleteById,
    checkAvailability
};
