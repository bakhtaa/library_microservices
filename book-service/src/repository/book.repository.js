
const { dbPromise } = require("../config/database");

// Récupérer un livre par son ID
async function findById(id) {
    const db = await dbPromise;

    return db.get(
        "SELECT * FROM books WHERE id = ?",
        [id]
    );
}

// Récupérer tous les livres
async function findAll() {
    const db = await dbPromise;

    return db.all("SELECT * FROM books");
}

// Ajouter un livre
async function create(book) {
    const db = await dbPromise;

    const { id, title, author, status } = book;

    await db.run(
        `INSERT INTO books (id, title, author, status)
         VALUES (?, ?, ?, ?)`,
        [id, title, author, status]
    );

    return book;
}

// Modifier les informations d'un livre
async function update(id, title, author) {
    const db = await dbPromise;

    const result = await db.run(
        `UPDATE books
         SET title = ?, author = ?
         WHERE id = ?`,
        [title, author, id]
    );

    if (result.changes === 0) {
        return null;
    }

    return findById(id);
}

// Supprimer un livre
async function deleteById(id) {
    const db = await dbPromise;

    const result = await db.run(
        "DELETE FROM books WHERE id = ?",
        [id]
    );

    return result.changes;
}

// Vérifier la disponibilité d'un livre
async function checkAvailability(id) {
    const db = await dbPromise;

    const book = await db.get(
        "SELECT id, status FROM books WHERE id = ?",
        [id]
    );

    if (!book) {
        return {
            exists: false,
            available: false,
            status: ""
        };
    }

    return {
        exists: true,
        available: book.status === "AVAILABLE",
        status: book.status
    };
}

// Réserver un livre de manière atomique
async function borrowBook(id) {
    const db = await dbPromise;

    const result = await db.run(
        `UPDATE books
         SET status = 'BORROWED'
         WHERE id = ?
         AND status = 'AVAILABLE'`,
        [id]
    );

    // Une ligne modifiée signifie que la réservation a réussi
    if (result.changes === 1) {
        return {
            success: true,
            message: "Book borrowed successfully",
            book: await findById(id)
        };
    }

    // Aucune ligne modifiée : vérifier pourquoi
    const book = await findById(id);

    if (!book) {
        return {
            success: false,
            message: "Book not found",
            book: null
        };
    }

    if (book.status === "BORROWED") {
        return {
            success: false,
            message: "Book is already borrowed",
            book
        };
    }

    return {
        success: false,
        message: "Book is unavailable",
        book
    };
}

// Retourner un livre de manière atomique
async function returnBook(id) {
    const db = await dbPromise;

    const result = await db.run(
        `UPDATE books
         SET status = 'AVAILABLE'
         WHERE id = ?
         AND status = 'BORROWED'`,
        [id]
    );

    if (result.changes === 1) {
        return {
            success: true,
            message: "Book returned successfully",
            book: await findById(id)
        };
    }

    const book = await findById(id);

    if (!book) {
        return {
            success: false,
            message: "Book not found",
            book: null
        };
    }

    return {
        success: false,
        message: "Book is not currently borrowed",
        book
    };
}

module.exports = {
    findById,
    findAll,
    create,
    update,
    deleteById,
    checkAvailability,
    borrowBook,
    returnBook
};
