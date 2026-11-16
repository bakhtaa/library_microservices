
const { dbPromise } = require("../config/database");

async function create(notification) {
    const db = await dbPromise;

    await db.run(
        `INSERT INTO notifications (
            id,
            user_id,
            type,
            title,
            message,
            status,
            channel
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            notification.id,
            notification.userId,
            notification.type,
            notification.title,
            notification.message,
            "PENDING",
            notification.channel || "EMAIL"
        ]
    );
}

async function updateStatus(id, status) {
    const db = await dbPromise;

    await db.run(
        `UPDATE notifications
         SET status = ?,
             sent_at = CASE
                 WHEN ? = 'SENT' THEN CURRENT_TIMESTAMP
                 ELSE sent_at
             END
         WHERE id = ?`,
        [status, status, id]
    );
}

async function findById(id) {
    const db = await dbPromise;

    return db.get(
        "SELECT * FROM notifications WHERE id = ?",
        [id]
    );
}

module.exports = {
    create,
    updateStatus,
    findById
};
