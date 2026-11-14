
const grpc = require("@grpc/grpc-js");

const waitlistService = require("../service/waitlist.service");

const waitlistHandler = {

    JoinWaitlist: async (call, callback) => {
        try {
            const { user_id, book_id } = call.request;

            const result = await waitlistService.joinWaitlist(
                user_id,
                book_id
            );

            callback(null, {
                success: result.success,
                message: result.message,
                entry: result.entry || null
            });

        } catch (error) {
            console.error("JoinWaitlist handler error:", error);

            callback({
                code: grpc.status.INTERNAL,
                details: "Internal server error"
            });
        }
    },

    LeaveWaitlist: async (call, callback) => {
        try {
            const { entry_id } = call.request;

            const result = await waitlistService.leaveWaitlist(entry_id);

            callback(null, {
                success: result.success,
                message: result.message,
                entry: result.entry || null
            });

        } catch (error) {
            console.error("LeaveWaitlist handler error:", error);

            callback({
                code: grpc.status.INTERNAL,
                details: "Internal server error"
            });
        }
    }
};

module.exports = waitlistHandler;
