
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPromise = open({
    filename: path.join(__dirname, "../../waitlist.sqlite"),
    driver: sqlite3.Database
});

async function initializeDatabase() {
    const db = await dbPromise;

    await db.run(`
        CREATE TABLE IF NOT EXISTS waitlist (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            book_id TEXT NOT NULL,

            status TEXT NOT NULL DEFAULT 'WAITING'
                CHECK (status IN ('WAITING', 'NOTIFIED', 'CANCELLED')),

            created_at TEXT NOT NULL,
            notified_at TEXT,
            cancelled_at TEXT
        )
    `);

    await db.run(`
        CREATE INDEX IF NOT EXISTS idx_waitlist_book_status
        ON waitlist(book_id, status, created_at)
    `);

    await db.run(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_waiting_user_book
        ON waitlist(user_id, book_id)
        WHERE status = 'WAITING'
    `);

    console.log("Waitlist database initialized successfully");
}

module.exports = {
    dbPromise,
    initializeDatabase
};
