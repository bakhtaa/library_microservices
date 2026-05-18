const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { randomUUID } = require("crypto");

// --------------------
// LOAD PROTO
// --------------------
const packageDef = protoLoader.loadSync(
  path.join(__dirname, "proto/book.proto"),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const bookProto = grpc.loadPackageDefinition(packageDef).book;

// --------------------
// DB SQLITE
// --------------------
const db = new sqlite3.Database("db.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT,
    author TEXT,
    available INTEGER
  )
`);

// --------------------
// SERVICE LOGIC
// --------------------
const bookService = {
  GetBook: (call, callback) => {
    db.get(
      "SELECT * FROM books WHERE id = ?",
      [call.request.id],
      (err, row) => {
        callback(null, { book: row });
      }
    );
  },

  GetBooks: (_, callback) => {
    db.all("SELECT * FROM books", [], (err, rows) => {
      callback(null, { books: rows });
    });
  },

  CreateBook: (call, callback) => {
    const id = randomUUID();
    const { title, author } = call.request;

    db.run(
      "INSERT INTO books (id, title, author, available) VALUES (?, ?, ?, ?)",
      [id, title, author, 1],
      function () {
        callback(null, {
          book: { id, title, author, available: true }
        });
      }
    );
  },

  UpdateBook: (call, callback) => {
    const { id, title, author, available } = call.request;

    db.run(
      "UPDATE books SET title=?, author=?, available=? WHERE id=?",
      [title, author, available ? 1 : 0, id],
      function () {
        callback(null, {
          book: { id, title, author, available }
        });
      }
    );
  },

  DeleteBook: (call, callback) => {
    db.run(
      "DELETE FROM books WHERE id = ?",
      [call.request.id],
      function () {
        callback(null, { success: this.changes > 0 });
      }
    );
  },

  CheckAvailability: (call, callback) => {
    db.get(
      "SELECT available FROM books WHERE id = ?",
      [call.request.id],
      (err, row) => {
        callback(null, {
          available: row ? !!row.available : false
        });
      }
    );
  }
};

// --------------------
// START SERVER
// --------------------
const server = new grpc.Server();

server.addService(bookProto.BookService.service, bookService);

server.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("📚 Book Service running on port 50052");
    server.start();
  }
);