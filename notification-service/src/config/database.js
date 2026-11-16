
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// Database connection
const dbPromise = open({
    filename: path.resolve(process.env.DB_PATH || "./notification.sqlite"),
    driver: sqlite3.Database
});

// Initialize database
async function initializeDatabase() {
    const db = await dbPromise;

    // Notifications table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
            channel TEXT NOT NULL DEFAULT 'EMAIL'
                CHECK (channel IN ('EMAIL', 'PUSH')),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            sent_at TEXT
        );
    `);

    // Reminders table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS reminders (
            id TEXT PRIMARY KEY,
            borrow_id TEXT NOT NULL UNIQUE,
            user_id TEXT NOT NULL,
            due_date TEXT NOT NULL,
            scheduled_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING', 'SENT', 'CANCELLED', 'FAILED')),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            sent_at TEXT
        );
    `);

    // Campaigns table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS campaigns (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            audience TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completed_at TEXT
        );
    `);

    // Processed Kafka events table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS processed_events (
            event_id TEXT PRIMARY KEY,
            event_type TEXT NOT NULL,
            processed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Indexes
    await db.exec(`
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id
        ON notifications(user_id);

        CREATE INDEX IF NOT EXISTS idx_notifications_status
        ON notifications(status);

        CREATE INDEX IF NOT EXISTS idx_reminders_scheduled
        ON reminders(status, scheduled_at);

        CREATE INDEX IF NOT EXISTS idx_campaigns_status
        ON campaigns(status);
    `);

    console.log("Notification database initialized successfully");
}

module.exports = {
    dbPromise,
    initializeDatabase
};
