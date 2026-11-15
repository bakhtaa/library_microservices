
const userClient = require("../grpc-clients/userClient");

// Helper: convert a gRPC callback into a Promise
function grpcCall(method, request) {
    return new Promise((resolve, reject) => {
        method(request, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

module.exports = {

    Query: {

        // Get all users (with pagination and optional status filter)
        users: async (_, args) => {
            const response = await grpcCall(
                userClient.GetUsers.bind(userClient),
                {
                    page_size: args.pageSize || 0,
                    page_token: args.pageToken || "",
                    status: args.status || ""
                }
            );

            return {
                users: response.users,
                nextPageToken: response.next_page_token
            };
        },

        // Get one user by ID
        user: async (_, args) => {
            const response = await grpcCall(
                userClient.GetUser.bind(userClient),
                { id: args.id }
            );

            return response.user;
        }
    },

    Mutation: {

        // Create a user
        createUser: async (_, args) => {
            const response = await grpcCall(
                userClient.CreateUser.bind(userClient),
                {
                    name: args.name,
                    email: args.email
                }
            );

            return response.user;
        },

        // Update an existing user
        updateUser: async (_, args) => {
            const response = await grpcCall(
                userClient.UpdateUser.bind(userClient),
                {
                    id: args.id,
                    name: args.name,
                    email: args.email
                }
            );

            return response.user;
        },

        // Delete a user
        deleteUser: async (_, args) => {
            const response = await grpcCall(
                userClient.DeleteUser.bind(userClient),
                { id: args.id }
            );

            return response.success;
        }
    }
};
