
const { dbPromise } = require("./src/config/database");

async function migrate() {
    const db = await dbPromise;

    try {
        await db.exec("BEGIN TRANSACTION");

        // Récupérer les colonnes actuelles de la table
        const columns = await db.all("PRAGMA table_info(books)");

        const hasAvailable = columns.some(
            column => column.name === "available"
        );

        const hasStatus = columns.some(
            column => column.name === "status"
        );

        // Vérifier que la migration n'a pas déjà été exécutée
        if (hasStatus && !hasAvailable) {
            console.log("Migration already applied.");
            await db.exec("COMMIT");
            return;
        }

        if (!hasAvailable) {
            throw new Error("Column 'available' not found.");
        }

        // Créer une nouvelle table avec la bonne structure
        await db.exec(`
            CREATE TABLE books_new (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'AVAILABLE'
            )
        `);

        // Copier les données et convertir available en status
        await db.exec(`
            INSERT INTO books_new (id, title, author, status)
            SELECT
                id,
                title,
                author,
                CASE
                    WHEN available = 1 THEN 'AVAILABLE'
                    ELSE 'BORROWED'
                END
            FROM books
        `);

        // Supprimer l'ancienne table
        await db.exec("DROP TABLE books");

        // Renommer la nouvelle table
        await db.exec("ALTER TABLE books_new RENAME TO books");

        await db.exec("COMMIT");

        console.log("Migration completed successfully!");
    } catch (error) {
        await db.exec("ROLLBACK");
        console.error("Migration failed:", error);
        throw error;
    } finally {
        await db.close();
    }
}

migrate();
