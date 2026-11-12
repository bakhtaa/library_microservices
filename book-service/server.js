
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const bookHandler = require("./src/grpc/book.handler");
const { initializeDatabase } = require("./src/config/database");

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

// Enregistrer les méthodes du service
server.addService(
    bookProto.BookService.service,
    bookHandler
);

// Démarrer le serveur après l'initialisation de la DB
async function startServer() {
    try {
        await initializeDatabase();

        server.bindAsync(
            "0.0.0.0:50052",
            grpc.ServerCredentials.createInsecure(),
            (err, port) => {
                if (err) {
                    console.error("Server binding error:", err);
                    return;
                }

                console.log(`📚 Book Service running on port ${port}`);
            }
        );

    } catch (err) {
        console.error("Unable to start Book Service:", err);
        process.exit(1);
    }
}

startServer();
