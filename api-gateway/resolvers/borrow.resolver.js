
const borrowClient = require("../grpc-clients/borrowClient");

// Convert a gRPC callback into a Promise
function grpcCall(method, request) {
    return new Promise((resolve, reject) => {
        method(request, (err, response) => {
            if (err) {
                return reject(err);
            }

            resolve(response);
        });
    });
}

module.exports = {

    Query: {
        // Get all borrows belonging to a specific user
        userBorrows: async (_, args) => {

            const response = await grpcCall(
                borrowClient.GetUserBorrows.bind(borrowClient),
                {
                    user_id: args.userId
                }
            );

            return response.borrows;
        }
    },

    Mutation: {

        // Borrow a book
        borrowBook: async (_, args) => {

            const response = await grpcCall(
                borrowClient.BorrowBook.bind(borrowClient),
                {
                    user_id: args.userId,
                    book_id: args.bookId
                }
            );

            return {
                success: response.success,
                message: response.message,
                borrow: response.borrow
            };
        },

        // Return a borrowed book
        returnBook: async (_, args) => {

            const response = await grpcCall(
                borrowClient.ReturnBook.bind(borrowClient),
                {
                    borrow_id: args.borrowId
                }
            );

            return {
                success: response.success,
                message: response.message,
                borrow: response.borrow
            };
        }
    },

    // Map Protobuf field names to GraphQL field names
    Borrow: {
        userId: borrow => borrow.user_id,
        bookId: borrow => borrow.book_id,
        borrowedAt: borrow => borrow.borrowed_at,
        dueDate: borrow => borrow.due_date,
        returnedAt: borrow => borrow.returned_at
    }
};
