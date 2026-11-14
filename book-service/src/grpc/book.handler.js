
const bookService = require("../service/book.service");
const grpc = require("@grpc/grpc-js");

const bookHandler = {

    GetBook: async (call, callback) => {
        try {
            const book = await bookService.getBook(call.request.id);

            if (!book) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    details: "Book not found"
                });
            }

            callback(null, { book });

        } catch (err) {
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            });
        }
    },

    GetBooks: async (_, callback) => {
        try {
            const books = await bookService.getBooks();

            callback(null, { books });

        } catch (err) {
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            });
        }
    },

    CreateBook: async (call, callback) => {
        try {
            const book = await bookService.createBook(call.request);

            callback(null, { book });

        } catch (err) {
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            });
        }
    },

    UpdateBook: async (call, callback) => {
        try {
            const book = await bookService.updateBook(call.request);

            if (!book) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    details: "Book not found"
                });
            }

            callback(null, { book });

        } catch (err) {
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            });
        }
    },

    DeleteBook: async (call, callback) => {
        try {
            const success = await bookService.deleteBook(call.request.id);

            callback(null, { success });

        } catch (err) {
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            });
        }
    },

   CheckAvailability: async (call, callback) => {
    try {
        const result = await bookService.checkAvailability(
            call.request.id
        );

        callback(null, {
            exists: result.exists,
            available: result.available,
            status: result.status
        });

    } catch (err) {
        callback({
            code: grpc.status.INTERNAL,
            details: err.message
        });
    }
},
BorrowBook: async (call, callback) => {
    try {
        const result = await bookService.borrowBook(
            call.request.id
        );

        callback(null, {
            success: result.success,
            message: result.message,
            book: result.book
        });

    } catch (err) {
        callback({
            code: grpc.status.INTERNAL,
            details: err.message
        });
    }
},
ReturnBook: async (call, callback) => {
    try {
        const result = await bookService.returnBook(
            call.request.id
        );

        callback(null, {
            success: result.success,
            message: result.message,
            book: result.book
        });

    } catch (err) {
        callback({
            code: grpc.status.INTERNAL,
            details: err.message
        });
    }
}
};

module.exports = bookHandler;
