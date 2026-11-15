
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// 1. Charger le fichier borrow.proto
const protoPath = path.join(
    __dirname,
    "../../borrow-service/proto/borrow.proto"
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
const borrowPackage = grpcObject.borrow;

// 3. Récupérer l'adresse du BorrowService
const borrowServiceAddress =
    process.env.BORROW_SERVICE_URL || "localhost:50053";

// 4. Créer le client gRPC
const client = new borrowPackage.BorrowService(
    borrowServiceAddress,
    grpc.credentials.createInsecure()
);

module.exports = client;
