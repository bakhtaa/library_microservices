
// Rôle : Gérer les requêtes et réponses gRPC

const userService = require("../services/user.service");

const userHandler = {

    GetUser: async (call, sendResponse) => {
        try {
            const user = await userService.getUser(call.request.id);
            sendResponse(null, { user: user || null });

        } catch (error) {
            sendResponse({
                code: 13,
                message: error.message
            });
        }
    },

    GetUsers: async (call, sendResponse) => {
        try {
            const users = await userService.getUsers();
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
