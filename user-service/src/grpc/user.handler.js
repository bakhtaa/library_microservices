
// Rôle : Gérer les requêtes et réponses gRPC

const userService = require("../services/user.service");
const grpc = require("@grpc/grpc-js");

const userHandler = {

   

GetUser: async (call, sendResponse) => {
    try {
        const user = await userService.getUser(call.request.id);

        if (!user) {
            return sendResponse({
                code: grpc.status.NOT_FOUND,
                details: "User not found"
            });
        }

        sendResponse(null, { user });

    } catch (error) {
        sendResponse({
            code: grpc.status.INTERNAL,
            details: error.message
        });
    }
},
    GetUsers: async (call, sendResponse) => {
    try {
        const users = await userService.getUsers(call.request);

        console.log("USERS FROM HANDLER:", users);

        sendResponse(null, { users });

    } catch (error) {
        sendResponse({
            code: 13,
            message: error.message
        });
    }
},

    CreateUser: async (call, sendResponse) => {
        try {
            const user = await userService.createUser(call.request);
            sendResponse(null, { user });

        } catch (error) {
            sendResponse({
                code: 13,
                message: error.message
            });
        }
    },

    DeleteUser: async (call, sendResponse) => {
        try {
            const success = await userService.deleteUser(call.request.id);
            sendResponse(null, { success });

        } catch (error) {
            sendResponse({
                code: 13,
                message: error.message
            });
        }
    }
};

module.exports = userHandler;
