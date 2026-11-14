
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Load User proto
const userProtoPath = path.join(
    __dirname,
    "../../../user-service/proto/user.proto"
);

const userDefinition = protoLoader.loadSync(userProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const userProto = grpc.loadPackageDefinition(userDefinition).user;

// Load Book proto
const bookProtoPath = path.join(
    __dirname,
    "../../../book-service/proto/book.proto"
);

const bookDefinition = protoLoader.loadSync(bookProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const bookProto = grpc.loadPackageDefinition(bookDefinition).book;

// Create clients
const userClient = new userProto.UserService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

const bookClient = new bookProto.BookService(
    "localhost:50052",
    grpc.credentials.createInsecure()
);

module.exports = {
    userClient,
    bookClient
};
