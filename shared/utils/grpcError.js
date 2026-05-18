const grpc = require('@grpc/grpc-js');

function notFound(callback, msg) {
  callback({ code: grpc.status.NOT_FOUND, message: msg });
}

function invalid(callback, msg) {
  callback({ code: grpc.status.INVALID_ARGUMENT, message: msg });
}

function internal(callback, msg) {
  callback({ code: grpc.status.INTERNAL, message: msg });
}

module.exports = { notFound, invalid, internal };