
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const protoOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

// UserService proto
const userProtoPath = path.join(__dirname, "../../proto/user.proto");
const userDefinition = protoLoader.loadSync(userProtoPath, protoOptions);
const userProto = grpc.loadPackageDefinition(userDefinition).user;

// BookService proto
const bookProtoPath = path.join(__dirname, "../../proto/book.proto");
const bookDefinition = protoLoader.loadSync(bookProtoPath, protoOptions);
const bookProto = grpc.loadPackageDefinition(bookDefinition).book;

// gRPC clients
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "localhost:50051";

const BOOK_SERVICE_URL =
  process.env.BOOK_SERVICE_URL || "localhost:50052";

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
