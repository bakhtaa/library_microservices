const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const packageDef = protoLoader.loadSync(
  path.join(__dirname, "../../book-service/book.proto"),
  {}
);

const grpcObject = grpc.loadPackageDefinition(packageDef);
const bookPackage = grpcObject.book;

const client = new bookPackage.BookService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

module.exports = client;