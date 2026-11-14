
const { dbPromise } = require("../config/database");

// 1. Créer un emprunt
async function createBorrow(borrow) {
    const db = await dbPromise;

    const {
        id,
        user_id,
        book_id,
        status,
        borrowed_at,
        due_date,
        returned_at
    } = borrow;

    await db.run(
        `INSERT INTO borrows (
            id,
            user_id,
            book_id,
            status,
            borrowed_at,
            due_date,
            returned_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            user_id,
            book_id,
            status,
            borrowed_at,
            due_date,
            returned_at ?? null
        ]
    );

    return findById(id);
}

// 2. Trouver un emprunt par son identifiant
async function findById(id) {
    const db = await dbPromise;

    return db.get(
        "SELECT * FROM borrows WHERE id = ?",
        [id]
    );
}

// 3. Trouver un emprunt actif pour un utilisateur et un livre
async function findActiveBorrow(userId, bookId) {
    const db = await dbPromise;

    return db.get(
        `SELECT * FROM borrows
         WHERE user_id = ?
         AND book_id = ?
         AND status = 'ACTIVE'`,
        [userId, bookId]
    );
}

// 4. Récupérer tous les emprunts d'un utilisateur
async function findByUserId(userId) {
    const db = await dbPromise;

    return db.all(
        `SELECT * FROM borrows
         WHERE user_id = ?
         ORDER BY borrowed_at DESC`,
        [userId]
    );
}

async function markAsReturned(id, returnedAt) {
    const db = await dbPromise;

    const result = await db.run(
        `UPDATE borrows
         SET status = 'RETURNED',
             returned_at = ?
         WHERE id = ?
         AND status = 'ACTIVE'`,
        [returnedAt, id]
    );

    if (result.changes === 0) {
        return null;
    }

    return findById(id);
}

module.exports = {
    createBorrow,
    findById,
    findActiveBorrow,
    findByUserId,
    markAsReturned
};
