
const { Kafka } = require("kafkajs");

const waitlistService = require("../service/waitlist.service");

const kafka = new Kafka({
    clientId: "waitlist-service",
    brokers: [
        process.env.KAFKA_BROKER || "localhost:9094"
    ]
});

const consumer = kafka.consumer({
    groupId: "waitlist-service-group"
});


async function startConsumer() {

    // 1. Connect to Kafka
    await consumer.connect();

    console.log("WaitlistService connected to Kafka");

    // 2. Subscribe to book-events
    await consumer.subscribe({
        topics: ["book-events"],
        fromBeginning: false
    });

    console.log("Subscribed to book-events");

await consumer.run({

    eachMessage: async ({ topic, partition, message }) => {

        // 1. Extract the message content
        const rawMessage = message.value?.toString();

        if (!rawMessage?.trim()) {
            console.warn("Received empty Kafka message");
            return;
        }

        // 2. Display received message
        console.log("\n========== KAFKA EVENT ==========");
        console.log("Topic:", topic);
        console.log("Partition:", partition);
        console.log("Message:", rawMessage);
        console.log("=================================\n");

        try {

            // 3. Convert JSON string into JavaScript object
            const event = JSON.parse(rawMessage);

            // 4. Check the event type
            if (event.type === "BOOK_AVAILABLE") {

                // 5. Trigger the business logic
                await waitlistService.processBookAvailable(event);

            } else {
                console.log("Unsupported event type:", event.type);
            }

        } catch (error) {
            console.error("Event processing failed:", error);
            throw error;
        }
    }
});

}


module.exports = {
    startConsumer,
    consumer
};