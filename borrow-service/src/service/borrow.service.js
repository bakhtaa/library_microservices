
const { userClient, bookClient } = require("../grpc/borrow.clients");

const borrowRepository = require("../repository/borrow.repository");

// Convert UserService.GetUser callback into a Promise
const grpc = require("@grpc/grpc-js");

function getUser(userId) {
    return new Promise((resolve, reject) => {

        console.log("User ID sent to UserService:", userId);

        userClient.GetUser({ id: userId }, (error, response) => {

            if (error) {
                console.error("GetUser error:", error);
                console.log("gRPC error code:", error.code);

                if (error.code === grpc.status.NOT_FOUND) {
                    return resolve(null);
                }

                return reject(error);
            }

            console.log("Complete GetUser response:", response);
            console.log("User returned:", response.user);

            resolve(response.user);
        });
    });
}

// Convert BookService.BorrowBook callback into a Promise
function reserveBook(bookId) {
    return new Promise((resolve, reject) => {

        bookClient.BorrowBook({ id: bookId }, (error, response) => {

            if (error) {
                return reject(error);
            }

            resolve(response);
        });
    });
}

// Convert BookService.ReturnBook callback into a Promise
function releaseBook(bookId) {
    return new Promise((resolve, reject) => {

        bookClient.ReturnBook({ id: bookId }, (error, response) => {

            if (error) {
                return reject(error);
            }

            resolve(response);
        });
    });
}

const { randomUUID } = require("crypto");


async function borrowBook(userId, bookId) {
    let bookReserved = false;

    try {
        // 1. Verify that the user exists
        const user = await getUser(userId);

        if (!user) {
            return {
                success: false,
                message: "User not found"
            };
        }

        // 2. Verify that the user is ACTIVE
        if (user.account_status !== "ACTIVE") {
            return {
                success: false,
                message: "User account is not active"
            };
        }

        // 3. Reserve the book
        const reservation = await reserveBook(bookId);

        if (!reservation.success) {
            return {
                success: false,
                message: reservation.message
            };
        }

        bookReserved = true;

        // 4. Prepare the borrow record
        const borrowedAt = new Date();
        const dueDate = new Date(borrowedAt);
        dueDate.setDate(dueDate.getDate() + 14);

        const borrow = {
            id: randomUUID(),
            user_id: userId,
            book_id: bookId,
            status: "ACTIVE",
            borrowed_at: borrowedAt.toISOString(),
            due_date: dueDate.toISOString(),
            returned_at: null
        };

        // 5. Save the borrow in our database
        const createdBorrow =
            await borrowRepository.createBorrow(borrow);

        return {
            success: true,
            message: "Book borrowed successfully",
            borrow: createdBorrow
        };

    } catch (error) {
        console.error("Borrow operation failed:", error);

        // 6. Compensate if the book was already reserved
        if (bookReserved) {
            try {
                const compensation = await releaseBook(bookId);

                if (!compensation.success) {
                    console.error(
                        "Compensation failed:",
                        compensation.message
                    );
                }
            } catch (compensationError) {
                console.error(
                    "Compensation error:",
                    compensationError
                );
            }
        }

        return {
            success: false,
            message: "Unable to complete the borrow operation"
        };
    }
}

async function returnBook(borrowId) {
    try {
        // 1. Find the borrow record
        const borrow = await borrowRepository.findById(borrowId);

        if (!borrow) {
            return {
                success: false,
                message: "Borrow record not found"
            };
        }

        // 2. Check whether the borrow is still ACTIVE
        if (borrow.status !== "ACTIVE") {
            return {
                success: false,
                message: "This borrow has already been returned"
            };
        }

        // 3. Release the book through BookService
        const release = await releaseBook(borrow.book_id);

        if (!release.success) {
            return {
                success: false,
                message: release.message
            };
        }

        // 4. Update the borrow record
        const returnedAt = new Date().toISOString();

        const updatedBorrow =
            await borrowRepository.markAsReturned(
                borrowId,
                returnedAt
            );

        if (!updatedBorrow) {
            return {
                success: false,
                message: "Unable to update the borrow record"
            };
        }

        // 5. Return the result
        return {
            success: true,
            message: "Book returned successfully",
            borrow: updatedBorrow
        };

    } catch (error) {
        console.error("Return operation failed:", error);

        return {
            success: false,
            message: "Unable to complete the return operation"
        };
    }
}
async function getUserBorrows(userId) {
    return borrowRepository.findByUserId(userId);
}
module.exports = {
    borrowBook,
    returnBook,
    getUserBorrows
};

