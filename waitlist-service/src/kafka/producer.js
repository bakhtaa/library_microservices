
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "waitlist-service",
    brokers: [
        process.env.KAFKA_BROKER || "localhost:9094"
    ]
});

const producer = kafka.producer();

// Establish connection with Kafka
async function connectProducer() {
    await producer.connect();

    console.log("WaitlistService Kafka producer connected");
}

// Publish an event to a Kafka topic
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

    console.log(
        `[Kafka] Event published to ${topic}:`,
        event
    );
}

module.exports = {
    connectProducer,
    publishEvent
};
