
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const bookHandler = require("./src/grpc/book.handler");
const { initializeDatabase } = require("./src/config/database");
const { startConsumer } = require("./src/kafka/consumer");
const { connectProducer } = require("./src/kafka/producer");
// Charger le fichier proto
const packageDef = protoLoader.loadSync(
    path.join(__dirname, "proto/book.proto"),
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const bookProto = grpc.loadPackageDefinition(packageDef).book;

// Créer le serveur gRPC
const server = new grpc.Server();
  server.addService(
    bookProto.BookService.service,
    bookHandler
);
// Démarrer les services
async function startServer() {
    try {
        // 1. Initialiser la base de données
        await initializeDatabase();
        // 2. Connecter le producteur Kafka
        await connectProducer();
        // 2. Connecter le consumer Kafka
        await startConsumer();

     
        // 3. Démarrer le serveur gRPC
        server.bindAsync(
            "0.0.0.0:50052",
            grpc.ServerCredentials.createInsecure(),
            (err, port) => {
                if (err) {
                    console.error("Server binding error:", err);
                    return;
                }

                console.log(`Book Service running on port ${port}`);
            }
        );

    } catch (err) {
        console.error("Unable to start Book Service:", err);
        process.exit(1);
    }
}

startServer();
