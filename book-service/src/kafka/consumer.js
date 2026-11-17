
const { Kafka } = require("kafkajs");
const bookService = require("../service/book.service");
const { publishEvent } = require("./producer");

const kafka = new Kafka({
    clientId: "book-service",
    brokers: [
        process.env.KAFKA_BROKER || "localhost:9094"
    ]
});

const consumer = kafka.consumer({
    groupId: "book-service-group"
});

async function startConsumer() {
    await consumer.connect();

    console.log("BookService connected to Kafka");

    await consumer.subscribe({
        topic: "borrow-events",
        fromBeginning: true
    });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const event = JSON.parse(
                    message.value.toString()
                );

                console.log(
                    `[Kafka] Event received from ${topic}:`,
                    event
                );

                if (event.type === "BORROW_RETURNED") {
                    const result = await bookService.returnBook(
                        event.bookId
                    );

                    if (!result.success) {
                        console.error(
                            "Unable to make book available:",
                            result.message
                        );
                        return;
                    }

                    console.log(
                        "Book is now available:",
                        result.book
                    );

                    // Publier un événement pour WaitlistService
                    const bookAvailableEvent = {
                        eventId: require("crypto").randomUUID(),
                        type: "BOOK_AVAILABLE",
                        bookId: result.book.id,
                        title: result.book.title,
                        author: result.book.author,
                        availableAt: new Date().toISOString()
                    };

                    await publishEvent(
                        "book-events",
                        bookAvailableEvent
                    );
                }

            } catch (error) {
                console.error(
                    "Error processing borrow event:",
                    error
                );
                throw error;
            }
        }
    });
}

module.exports = {
    startConsumer
};
