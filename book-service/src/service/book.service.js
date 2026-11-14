
const bookRepository = require("../repository/book.repository");
const { randomUUID } = require("crypto");

// Récupérer un livre
async function getBook(id) {
    return bookRepository.findById(id);
}

// Récupérer tous les livres
async function getBooks() {
    return bookRepository.findAll();
}

// Créer un livre
async function createBook(data) {
    const book = {
        id: randomUUID(),
        title: data.title,
        author: data.author,
        status: "AVAILABLE"
    };

    await bookRepository.create(book);

    return book;
}

// Modifier un livre
async function updateBook(data) {
    return bookRepository.update(
        data.id,
        data.title,
        data.author
    );
}

// Supprimer un livre
async function deleteBook(id) {
    const changes = await bookRepository.deleteById(id);

    return changes > 0;
}

// Vérifier la disponibilité
async function checkAvailability(id) {
    return bookRepository.checkAvailability(id);
}

// Emprunter un livre
async function borrowBook(id) {
    return bookRepository.borrowBook(id);
}

// Retourner un livre
async function returnBook(id) {
    return bookRepository.returnBook(id);
}

module.exports = {
    getBook,
    getBooks,
    createBook,
    updateBook,
    deleteBook,
    checkAvailability,
    borrowBook,
    returnBook
};
