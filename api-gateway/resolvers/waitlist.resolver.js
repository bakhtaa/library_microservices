
const waitlistClient = require("../grpc-clients/waitlistClient");

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

    Mutation: {

        // Join a book's waitlist
        joinWaitlist: async (_, args) => {

            const response = await grpcCall(
                waitlistClient.JoinWaitlist.bind(waitlistClient),
                {
                    user_id: args.userId,
                    book_id: args.bookId
                }
            );

            return {
                success: response.success,
                message: response.message,
                entry: response.entry
            };
        },

        // Leave a waitlist
        leaveWaitlist: async (_, args) => {

            const response = await grpcCall(
                waitlistClient.LeaveWaitlist.bind(waitlistClient),
                {
                    entry_id: args.entryId
                }
            );

            return {
                success: response.success,
                message: response.message,
                entry: response.entry
            };
        }
    },

    // Map Protobuf field names to GraphQL field names
    WaitlistEntry: {
        userId: entry => entry.user_id,
        bookId: entry => entry.book_id,
        createdAt: entry => entry.created_at,
        notifiedAt: entry => entry.notified_at,
        cancelledAt: entry => entry.cancelled_at
    }
};
