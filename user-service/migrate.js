const { dbPromise } = require("./src/config/database");

async function migrate() {
    const db = await dbPromise;

    try {
        await db.run(`
            ALTER TABLE users
            ADD COLUMN account_status TEXT NOT NULL DEFAULT 'ACTIVE'
        `);

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error.message);
    } finally {
        await db.close();
    }
}

migrate();