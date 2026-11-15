
const bookClient = require("../grpc-clients/bookClient");

// Convert a gRPC callback into a Promise
function grpcCall(method, request) {
    return new Promise((resolve, reject) => {
        method(request, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

module.exports = {

    // Queries: retrieve books

    Query: {

        books: async () => {
            const response = await grpcCall(
                bookClient.GetBooks.bind(bookClient),
                {}
            );

            return response.books;
        },

        book: async (_, args) => {
            const response = await grpcCall(
                bookClient.GetBook.bind(bookClient),
                {
                    id: args.id
                }
            );

            return response.book;
        }

    },

    // Mutations: modify books

    Mutation: {

        createBook: async (_, args) => {
            const response = await grpcCall(
                bookClient.CreateBook.bind(bookClient),
                {
                    title: args.title,
                    author: args.author
                }
            );

            return response.book;
        },

        updateBook: async (_, args) => {
            const response = await grpcCall(
                bookClient.UpdateBook.bind(bookClient),
                {
                    id: args.id,
                    title: args.title,
                    author: args.author
                }
            );

            return response.book;
        },

        deleteBook: async (_, args) => {
            const response = await grpcCall(
                bookClient.DeleteBook.bind(bookClient),
                {
                    id: args.id
                }
            );

            return response.success;
        }

    }
};
