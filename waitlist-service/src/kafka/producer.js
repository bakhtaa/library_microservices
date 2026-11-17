
const { Kafka } = require("kafkajs");
//créer une première instance du broker 
const kafka = new Kafka({
    clientId: "waitlist-service",
    brokers: [
        process.env.KAFKA_BROKER || "localhost:9094"
    ]
});
//créer un objet producer
const producer = kafka.producer();

// Establish connection with Kafka
//se lier à ce broker par une réference : savoir repérer son emplacement mémoire
async function connectProducer() {
    await producer.connect();

    console.log("WaitlistService Kafka producer connected");
}
//le producer publie notre evenement dans le broker
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
