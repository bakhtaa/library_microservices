
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const borrowHandler = require("./src/grpc/borrow.handler");
const { initializeDatabase } = require("./src/config/database");

// Load Borrow proto
const borrowProtoPath = path.join(
    __dirname,
    "../user-service/proto/user.proto"
);

const borrowDefinition = protoLoader.loadSync(
    borrowProtoPath,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const borrowProto =
    grpc.loadPackageDefinition(borrowDefinition).borrow;

async function main() {

    // 1. Initialize database
    await initializeDatabase();

    // 2. Create gRPC server
    const server = new grpc.Server();

    // 3. Register handlers
    server.addService(
        borrowProto.BorrowService.service,
        borrowHandler
    );

    // 4. Start server
    server.bindAsync(
        "0.0.0.0:50053",
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {

            if (error) {
                console.error("Failed to start BorrowService:", error);
                return;
            }

            console.log(
                `BorrowService running on port ${port}`
            );
        }
    );
}

main().catch(error => {
    console.error("BorrowService startup error:", error);
    process.exit(1);
});
