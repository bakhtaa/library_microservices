
// Rôle : Démarrer et configurer le serveur gRPC

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const userHandler = require("./src/grpc/user.handler");

// Chargement du contrat Protobuf
const packageDef = protoLoader.loadSync(
    path.join(__dirname, "proto/user.proto"),
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

// Chargement du package User
const userProto = grpc.loadPackageDefinition(packageDef).user;

// Création du serveur gRPC
const server = new grpc.Server();

// Association du contrat Protobuf avec son Handler
server.addService(
    userProto.UserService.service,
    userHandler
);

// Démarrage du serveur
server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error("Erreur lors du démarrage :", error);
            return;
        }

        console.log(`👤 User Service running on port ${port}`);
    }
);
