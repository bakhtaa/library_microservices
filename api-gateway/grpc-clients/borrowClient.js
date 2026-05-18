const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const packageDef = protoLoader.loadSync(
  path.join(__dirname, "../../borrow-service/borrow.proto"),
  {}
);

const grpcObject = grpc.loadPackageDefinition(packageDef);
const borrowPackage = grpcObject.borrow;

const client = new borrowPackage.BorrowService(
  "localhost:50053",
  grpc.credentials.createInsecure()
);

module.exports = client;