const { createRxDatabase } = require('rxdb');
const { getRxStorageMemory } = require('rxdb/plugins/storage-memory');



const borrowSchema = {
  title: "borrow schema",
  version: 0,
  primaryKey: "id",
  type: "object",
  additionalProperties: false,

  properties: {
    id: {
      type: "string",
      maxLength: 36
    },

    userId: {
      type: "string"
    },

    bookId: {
      type: "string"
    },

    status: {
      type: "string",
      enum: ["BORROWED","RETURNED"]
    }
  },

  required:[
    "id",
    "userId",
    "bookId",
    "status"
  ]
};

async function initDB() {
  const db = await createRxDatabase({
    name: "borrowdb",
    storage: getRxStorageMemory()
  });

  await db.addCollections({
    borrows: { schema: borrowSchema }
  });

  return db;
}

module.exports = initDB;