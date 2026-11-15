
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// 1. Charger le fichier waitlist.proto
const protoPath = path.join(
    __dirname,
    "../../waitlist-service/proto/waitlist.proto"
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
const waitlistPackage = grpcObject.waitlist;

// 3. Récupérer l'adresse du WaitlistService
const waitlistServiceAddress =
    process.env.WAITLIST_SERVICE_URL || "localhost:50054";

// 4. Créer le client gRPC
const client = new waitlistPackage.WaitlistService(
    waitlistServiceAddress,
    grpc.credentials.createInsecure()
);

module.exports = client;
