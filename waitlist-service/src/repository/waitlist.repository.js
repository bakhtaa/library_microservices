
const { dbPromise } = require("../config/database");

// Create a new waitlist entry
async function createEntry(entry) {
    const db = await dbPromise;

    const {
        id,
        user_id,
        book_id,
        status,
        created_at
    } = entry;

    await db.run(
        `INSERT INTO waitlist (
            id,
            user_id,
            book_id,
            status,
            created_at
        ) VALUES (?, ?, ?, ?, ?)`,
        [id, user_id, book_id, status, created_at]
    );

    return findById(id);
}

// Find an entry by its ID
async function findById(id) {
    const db = await dbPromise;

    return db.get(
        `SELECT *
         FROM waitlist
         WHERE id = ?`,
        [id]
    );
}

// Retrieve all users waiting for a specific book
async function findWaitingByBook(bookId) {
    const db = await dbPromise;

    return db.all(
        `SELECT *
         FROM waitlist
         WHERE book_id = ?
         AND status = 'WAITING'
         ORDER BY created_at ASC`,
        [bookId]
    );
}

// Retrieve all waitlist entries belonging to a user
async function findByUser(userId) {
    const db = await dbPromise;

    return db.all(
        `SELECT *
         FROM waitlist
         WHERE user_id = ?
         AND status != 'CANCELLED'
         ORDER BY created_at DESC`,
        [userId]
    );
}

// Cancel a waitlist entry
async function cancelEntry(id, cancelledAt) {
    const db = await dbPromise;

    const result = await db.run(
        `UPDATE waitlist
         SET status = 'CANCELLED',
             cancelled_at = ?
         WHERE id = ?
         AND status = 'WAITING'`,
        [cancelledAt, id]
    );

    if (result.changes === 0) {
        return null;
    }

    return findById(id);
}

// Mark an entry as notified
async function markAsNotified(id, notifiedAt) {
    const db = await dbPromise;

    const result = await db.run(
        `UPDATE waitlist
         SET status = 'NOTIFIED',
             notified_at = ?
         WHERE id = ?
         AND status = 'WAITING'`,
        [notifiedAt, id]
    );

    if (result.changes === 0) {
        return null;
    }

    return findById(id);
}

module.exports = {
    createEntry,
    findById,
    findWaitingByBook,
    findByUser,
    cancelEntry,
    markAsNotified
};
