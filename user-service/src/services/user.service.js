//rôle: Contient la logique métier

const userRepository = require("../repositories/user.repository");
const { randomUUID } = require("crypto");

function getUser(id, callback) {
    userRepository.findById(id, callback);
}

function getUsers(callback) {
    userRepository.findAll(callback);
}

function createUser(data, callback) {
    const user = {
        id: randomUUID(),
        name: data.name,
        email: data.email
    };

    userRepository.create(user, (err) => {
        if (err) return callback(err);

        callback(null, user);
    });
}

function deleteUser(id, callback) {
    userRepository.deleteById(id, (err, changes) => {
        if (err) return callback(err);

        callback(null, changes > 0);
    });
}

module.exports = {
    getUser,
    getUsers,
    createUser,
    deleteUser
};