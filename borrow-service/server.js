const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const initDB = require("./db");

const {
 connectProducer,
 sendEvent
}=require("../kafka/producer");

const borrowProtoPath = path.join(__dirname, "proto/borrow.proto");
const bookProtoPath = path.join(__dirname, "../book-service/proto/book.proto");

const borrowDef = protoLoader.loadSync(borrowProtoPath);
const bookDef = protoLoader.loadSync(bookProtoPath);

const borrowProto = grpc.loadPackageDefinition(borrowDef).borrow;
const bookProto = grpc.loadPackageDefinition(bookDef).book;


const bookClient = new bookProto.BookService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

async function main() {
  const db = await initDB();

  //await connectProducer();

  const server = new grpc.Server();

  server.addService(borrowProto.BorrowService.service, {
    
    
    BorrowBook: async (call, callback) => {
      const { userId, bookId } = call.request;

      
      bookClient.GetBook({ id: bookId }, async (err, response) => {
        if (err || !response?.book) {
          return callback(null, {
            success: false,
            message: "Book not found"
          });
        }

        const book = response.book;

       
        if (!book.available) {
          return callback(null, {
            success: false,
            message: "Book not available"
          });
        }

        
        const borrow = {
          id: uuidv4(),
          userId,
          bookId,
          status: "BORROWED"
        };

        await db.borrows.insert(borrow);

        
        /*await sendEvent(
   "BOOK_BORROWED",
   {
      userId,
      bookId
   }
);*/


        return callback(null, {
          success: true,
          message: "Book borrowed successfully",
          borrow
        });
      });
    },

    
    ReturnBook: async (call, callback) => {
      const { userId, bookId } = call.request;

      const borrow = await db.borrows.findOne({
        selector: { userId, bookId, status: "BORROWED" }
      }).exec();

      if (!borrow) {
        return callback(null, {
          success: false,
          message: "Borrow not found"
        });
      }

      await borrow.patch({ status: "RETURNED" });

      return callback(null, {
        success: true,
        message: "Book returned successfully"
      });
    },

    GetUserBorrows: async (call, callback) => {
      const { userId } = call.request;

      const borrows = await db.borrows.find({
        selector: { userId }
      }).exec();

      /*await sendEvent(
   "BOOK_RETURNED",
   {
      borrowId:id
   }
);*/

      callback(null, {
        borrows: borrows.map(b => b.toJSON())
      });
    }
  });

  server.bindAsync(
    "0.0.0.0:50053",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("Borrow Service running on 50053");
    }
  );
}

main();