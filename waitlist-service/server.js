
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const waitlistHandler = require("./src/grpc/waitlist.handler");
const { initializeDatabase } = require("./src/config/database");

const {connectProducer}= require("./src/kafka/producer");

// 1. Load the proto file
const protoPath = path.join(__dirname, "proto/waitlist.proto");

const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

// 2. Load the waitlist package
const waitlistProto = grpc.loadPackageDefinition(packageDefinition).waitlist;

// 3. Create the gRPC server
const server = new grpc.Server();

// 4. Register the service and its handlers
server.addService(
    waitlistProto.WaitlistService.service,
    waitlistHandler
);

// 5. Start the server
async function main() {
    try {
        await initializeDatabase();
 // 2. Connect Kafka Producer
await connectProducer();

        server.bindAsync(
            "0.0.0.0:50054",
            grpc.ServerCredentials.createInsecure(),
            (error, port) => {
                if (error) {
                    console.error("Failed to start WaitlistService:", error);
                    return;
                }

                console.log(`WaitlistService running on port ${port}`);
            }
        );

    } catch (error) {
        console.error("WaitlistService startup error:", error);
        process.exit(1);
    }
}

main();
