
const userResolvers = require("./user.resolver");
const bookResolvers = require("./book.resolver");
const borrowResolvers = require("./borrow.resolver");
const waitlistResolvers = require("./waitlist.resolver");

module.exports = {
    Query: {
        ...userResolvers.Query,
        ...bookResolvers.Query,
        ...borrowResolvers.Query,
        ...waitlistResolvers.Query
    },

    Mutation: {
        ...userResolvers.Mutation,
        ...bookResolvers.Mutation,
        ...borrowResolvers.Mutation,
        ...waitlistResolvers.Mutation
    },

    User: {
        ...userResolvers.User
    },

    Borrow: {
        ...borrowResolvers.Borrow
    },

    WaitlistEntry: {
        ...waitlistResolvers.WaitlistEntry
    }
};
