
const borrowService = require("../service/borrow.service");

const borrowHandler = {

    // 1. Borrow a book
    BorrowBook: async (call, callback) => {
        try {
            const { user_id, book_id } = call.request;

            const result = await borrowService.borrowBook(
                user_id,
                book_id
            );

            callback(null, result);

        } catch (error) {
            console.error("BorrowBook handler error:", error);
            callback(error);
        }
    },

    // 2. Return a book
    ReturnBook: async (call, callback) => {
        try {
            const { borrow_id } = call.request;

            const result = await borrowService.returnBook(
                borrow_id
            );

            callback(null, result);

        } catch (error) {
            console.error("ReturnBook handler error:", error);
            callback(error);
        }
    },

    // 3. Get all borrows of a user
    GetUserBorrows: async (call, callback) => {
        try {
            const { user_id } = call.request;

            const borrows = await borrowService.getUserBorrows(
                user_id
            );

            callback(null, { borrows });

        } catch (error) {
            console.error("GetUserBorrows handler error:", error);
            callback(error);
        }
    }
};

module.exports = borrowHandler;
