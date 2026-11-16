
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// 1. Charger le fichier book.proto
const protoPath = path.join(
    __dirname,
    "../proto/book.proto"
);

const packageDef = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

// 2. Charger le package gRPC
const grpcObject = grpc.loadPackageDefinition(packageDef);
const bookPackage = grpcObject.book;

// 3. Récupérer l'adresse du BookService
const bookServiceAddress =
    process.env.BOOK_SERVICE_URL || "localhost:50052";

// 4. Créer le client gRPC
const client = new bookPackage.BookService(
    bookServiceAddress,
    grpc.credentials.createInsecure()
);

module.exports = client;
