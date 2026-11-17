
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, "../../proto/user.proto"),
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const userClient = new userProto.UserService(
    process.env.USER_SERVICE_URL || "localhost:50051",
    grpc.credentials.createInsecure()
);

function getUser(userId) {
    return new Promise((resolve, reject) => {
        userClient.GetUser(
            { id: userId },
            (error, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(response.user);
            }
        );
    });
}

module.exports = {
    getUser
};
