
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// 1. Load UserService proto
const protoPath = path.join(
    __dirname,
    "../../user-service/proto/user.proto"
);

const packageDef = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

// 2. Load gRPC package
const grpcObject = grpc.loadPackageDefinition(packageDef);
const userPackage = grpcObject.user;

// 3. Configure UserService address
const userServiceAddress =
    process.env.USER_SERVICE_URL || "localhost:50051";

// 4. Create gRPC client
const client = new userPackage.UserService(
    userServiceAddress,
    grpc.credentials.createInsecure()
);

module.exports = client;
