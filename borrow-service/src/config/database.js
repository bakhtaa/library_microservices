
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPromise = open({
    filename: path.join(__dirname, "../../borrow.sqlite"),
    driver: sqlite3.Database
});

async function initializeDatabase() {
    const db = await dbPromise;

    await db.run(`
        CREATE TABLE IF NOT EXISTS borrows (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            book_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE'
                CHECK (status IN ('ACTIVE', 'RETURNED')),
            borrowed_at TEXT NOT NULL,
            due_date TEXT NOT NULL,
            returned_at TEXT
        )
    `);

    await db.run(`
        CREATE INDEX IF NOT EXISTS idx_borrows_user_id
        ON borrows(user_id)
    `);

    await db.run(`
        CREATE UNIQUE INDEX IF NOT EXISTS
        idx_unique_active_borrow
        ON borrows(user_id, book_id)
        WHERE status = 'ACTIVE'
    `);

    console.log("Borrow database initialized successfully");
}

module.exports = {
    dbPromise,
    initializeDatabase
};
