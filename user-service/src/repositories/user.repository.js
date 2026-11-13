
// Rôle : exécuter les requêtes SQL liées aux utilisateurs

const { dbPromise } = require("../config/database");

async function findById(id) {
    const db = await dbPromise;

    return db.get(
        "SELECT * FROM users WHERE id = ?",
        [id]
    );
}

async function findAll(status) {
    const db = await dbPromise;

    let users;

    if (!status || status === "ACCOUNT_STATUS_UNSPECIFIED") {
        users = await db.all("SELECT * FROM users");
    } else {
        users = await db.all(
            "SELECT * FROM users WHERE account_status = ?",
            [status]
        );
    }

    console.log("USERS FROM DATABASE:", users);

    return users;
}

async function create(user) {
    const db = await dbPromise;
    const { id, name, email, account_status } = user;

    return db.run(
        `INSERT INTO users (id, name, email, account_status)
         VALUES (?, ?, ?, ?)`,
        [id, name, email, account_status]
    );
}

async function deleteById(id) {
    const db = await dbPromise;

    const result = await db.run(
        " UPDATE users SET account_status = 'INACTIVE' WHERE id = ?;" ,
        [id]
    );

    return result.changes;
}

module.exports = {
    findById,
    findAll,
    create,
    deleteById
};
