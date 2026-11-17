
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "notification-service",
    brokers: [
        process.env.KAFKA_BROKER || "localhost:9094"
    ]
});

const consumer = kafka.consumer({
    groupId: "notification-service-group"
});

async function startConsumer() {
    try {
        await consumer.connect();

        console.log("NotificationService connected to Kafka");

        await consumer.subscribe({
            topics: [
                "borrow-events",
                "notification-events"
            ],
            fromBeginning: false
        });

        console.log("Subscribed to Kafka topics");

        await consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message
            }) => {
                // A message can have a null value.
                if (!message.value) {
                    console.warn("Received empty Kafka message");
                    return;
                }

                const rawMessage = message.value.toString();

                console.log("\n========== KAFKA EVENT ==========");
                console.log("Topic:", topic);
                console.log("Partition:", partition);
                console.log("Key:", message.key?.toString());
                console.log("Message:", rawMessage);
                console.log("=================================\n");

                try {
                    const event = JSON.parse(rawMessage);

                    console.log("Event received:", event);

                    // Event processing will be added here.

                } catch (error) {
                    console.error(
                        "Invalid JSON event:",
                        error.message
                    );
                }
            }
        });

    } catch (error) {
        console.error("Kafka consumer error:", error);
        throw error;
    }
}

module.exports = {
    startConsumer,
    consumer
};
