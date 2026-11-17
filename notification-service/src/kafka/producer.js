
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "library-app",
    brokers: [
        process.env.KAFKA_BROKER || "localhost:9094"
    ]
});

const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();

    console.log("Kafka Producer connected");
};

const publishEvent = async (topic, data) => {
    await producer.send({
        topic,
        messages: [
            {
                value: JSON.stringify(data)
            }
        ]
    });
};

module.exports = {
    connectProducer,
    publishEvent
};
