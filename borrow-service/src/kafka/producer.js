const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "borrow-service",
    brokers: [
        process.env.KAFKA_BROKER || "localhost:9094"
    ]
});

const producer = kafka.producer();

async function connectProducer() {
    await producer.connect();
    console.log("BorrowService connected to Kafka");
}

async function publishEvent(topic, event) {
    try {
        await producer.send({
            topic,
            messages: [
                {
                    key: event.bookId,
                    value: JSON.stringify(event)
                }
            ]
        });

        console.log(`[Kafka] Event published to ${topic}:`, event);
    } catch (error) {
        console.error(`[Kafka] Failed to publish event to ${topic}:`, error);
        throw error;
    }
}

module.exports = {
    connectProducer,
    publishEvent
};
