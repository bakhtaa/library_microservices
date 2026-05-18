const userClient = require("../grpc-clients/userClient");

module.exports = {
  Query: {
    users: () => {
      return new Promise((resolve, reject) => {
        userClient.GetUsers({}, (err, res) => {
          if (err) return reject(err);
          resolve(res.users);
        });
      });
    },

    user: (_, args) => {
      return new Promise((resolve, reject) => {
        userClient.GetUser({ id: args.id }, (err, res) => {
          if (err) return reject(err);
          resolve(res.user);
        });
      });
    },

    books: () => [],
    book: () => null,
    borrows: () => []
  },

  Mutation: {
    createUser: (_, args) => {
      return new Promise((resolve, reject) => {
        userClient.CreateUser(args, (err, res) => {
          if (err) return reject(err);
          resolve(res.user);
        });
      });
    }
  }
  
};