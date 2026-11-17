
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "book-service",
    brokers: [
        process.env.KAFKA_BROKER || "localhost:9094"
    ]
});

const producer = kafka.producer();

async function connectProducer() {
    await producer.connect();
    console.log("BookService Kafka producer connected");
}

async function publishEvent(topic, event) {
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
}

module.exports = {
    connectProducer,
    publishEvent
};
