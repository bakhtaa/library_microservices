
const { initializeDatabase } = require("./src/config/database");

async function migrate() {
    try {
        await initializeDatabase();
        console.log("Waitlist migration completed successfully");
        process.exitCode = 0;
    } catch (error) {
        console.error("Waitlist migration failed:", error);
        process.exitCode = 1;
    }
}

migrate();