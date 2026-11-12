
// Rôle : Contient la logique métier

const userRepository = require("../repositories/user.repository");
const { randomUUID } = require("crypto");

async function getUser(id) {
    return userRepository.findById(id);
}

async function getUsers() {
    return userRepository.findAll();
}

async function createUser(data) {
    const user = {
        id: randomUUID(),
        name: data.name,
        email: data.email
    };

    await userRepository.create(user);

    return user;
}

async function deleteUser(id) {
    const changes = await userRepository.deleteById(id);

    return changes > 0;
}

module.exports = {
    getUser,
    getUsers,
    createUser,
    deleteUser
};
