const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const packageDef = protoLoader.loadSync(
path.join(__dirname, "../../user-service/proto/user.proto"),
{}
);

const grpcObject = grpc.loadPackageDefinition(packageDef);
const userPackage = grpcObject.user;

const client = new userPackage.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

module.exports = client;