
const { randomUUID } = require("crypto");
const grpc = require("@grpc/grpc-js");

const { userClient, bookClient } =
    require("../grpc/waitlist.clients");

const waitlistRepository =
    require("../repository/waitlist.repository");

// Convert UserService.GetUser callback into a Promise
function getUser(userId) {
    return new Promise((resolve, reject) => {
        userClient.GetUser({ id: userId }, (error, response) => {
            if (error) {
                if (error.code === grpc.status.NOT_FOUND) {
                    return resolve(null);
                }

                return reject(error);
            }

            resolve(response.user);
        });
    });
}

// Convert BookService.GetBook callback into a Promise
function getBook(bookId) {
    return new Promise((resolve, reject) => {
        bookClient.GetBook({ id: bookId }, (error, response) => {
            if (error) {
                if (error.code === grpc.status.NOT_FOUND) {
                    return resolve(null);
                }

                return reject(error);
            }

            resolve(response.book);
        });
    });
}

// Join a book's waiting list
async function joinWaitlist(userId, bookId) {

    // 1. Verify that the user exists
    const user = await getUser(userId);

    if (!user) {
        return {
            success: false,
            message: "User not found"
        };
    }

    // 2. Verify that the user account is active
    if (user.account_status !== "ACTIVE") {
        return {
            success: false,
            message: "User account is not active"
        };
    }

    // 3. Verify that the book exists
    const book = await getBook(bookId);

    if (!book) {
        return {
            success: false,
            message: "Book not found"
        };
    }

    // 4. Verify that the book is borrowed
    if (book.status !== "BORROWED") {
        return {
            success: false,
            message: "Book is not currently borrowed"
        };
    }

    // 5. Check whether the user is already waiting
    const existingEntry =
        await waitlistRepository.findWaitingEntry(userId, bookId);

    if (existingEntry) {
        return {
            success: false,
            message: "User is already waiting for this book"
        };
    }

    // 6. Create the waitlist entry
    const entry = {
        id: randomUUID(),
        user_id: userId,
        book_id: bookId,
        status: "WAITING",
        created_at: new Date().toISOString()
    };

    const createdEntry =
        await waitlistRepository.createEntry(entry);

    return {
        success: true,
        message: "Successfully joined the waiting list",
        entry: createdEntry
    };
}

// Leave a waiting list
async function leaveWaitlist(entryId) {

    // 1. Find the entry
    const entry = await waitlistRepository.findById(entryId);

    if (!entry) {
        return {
            success: false,
            message: "Waitlist entry not found"
        };
    }

    // 2. Check whether it is still waiting
    if (entry.status !== "WAITING") {
        return {
            success: false,
            message: "This entry is no longer waiting"
        };
    }

    // 3. Cancel the entry
    const cancelledEntry =
        await waitlistRepository.cancelEntry(
            entryId,
            new Date().toISOString()
        );

    if (!cancelledEntry) {
        return {
            success: false,
            message: "Unable to cancel waitlist entry"
        };
    }

    return {
        success: true,
        message: "Successfully left the waiting list",
        entry: cancelledEntry
    };
}

module.exports = {
    joinWaitlist,
    leaveWaitlist
};
