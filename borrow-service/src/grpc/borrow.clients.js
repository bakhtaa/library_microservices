
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Configuration commune des fichiers proto
const protoOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

// Load User proto
const userProtoPath = path.join(
    __dirname,
    "../../proto/user.proto"
);

const userDefinition = protoLoader.loadSync(
    userProtoPath,
    protoOptions
);

const userProto = grpc.loadPackageDefinition(
    userDefinition
).user;

// Load Book proto
const bookProtoPath = path.join(
    __dirname,
    "../../proto/book.proto"
);

const bookDefinition = protoLoader.loadSync(
    bookProtoPath,
    protoOptions
);

const bookProto = grpc.loadPackageDefinition(
    bookDefinition
).book;

// Service addresses
const USER_SERVICE_URL =
    process.env.USER_SERVICE_URL || "localhost:50051";

const BOOK_SERVICE_URL =
    process.env.BOOK_SERVICE_URL || "localhost:50052";

// Create clients
const userClient = new userProto.UserService(
    USER_SERVICE_URL,
    grpc.credentials.createInsecure()
);

const bookClient = new bookProto.BookService(
    BOOK_SERVICE_URL,
    grpc.credentials.createInsecure()
);

module.exports = {
    userClient,
    bookClient
};
