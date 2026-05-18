const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { randomUUID } = require("crypto");
/*const {
connectProducer,
sendEvent
}=require("../kafka/producer"); */

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

const userProto = grpc.loadPackageDefinition(packageDef).user;


const db = new sqlite3.Database("db.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT
  )
`);


const userService = {
  GetUser: (call, callback) => {
    db.get(
      "SELECT * FROM users WHERE id = ?",
      [call.request.id],
      (err, row) => {
        callback(null, { user: row });
      }
    );
  },

  GetUsers: (_, callback) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
      callback(null, { users: rows });
    });
  },


  CreateUser: (call, callback) => {
    const id = randomUUID();
    const { name, email } = call.request;

    db.run(
      "INSERT INTO users (id, name, email) VALUES (?, ?, ?)",
      [id, name, email],

      async function () {

        /*await sendEvent(
          "USER_CREATED",
          { id, name, email }
        );*/

        callback(null, {
          user: { id, name, email }
        });

      }
    );
},

  DeleteUser: (call, callback) => {
    db.run(
      "DELETE FROM users WHERE id = ?",
      [call.request.id],
      function () {
        callback(null, { success: this.changes > 0 });
      }
    );
  }
};


const server = new grpc.Server();

server.addService(userProto.UserService.service, userService);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("👤 User Service running on port 50051");
    server.start();
  }
);