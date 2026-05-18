const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId:"library-consumer",
    brokers:["localhost:9092"]
});

const consumer = kafka.consumer({

    groupId:"library-group"

});

const startConsumer=async()=>{

    await consumer.connect();

    await consumer.subscribe({
        topic:"BOOK_BORROWED"
    });

    await consumer.subscribe({
        topic:"BOOK_RETURNED"
    });

    await consumer.subscribe({
        topic:"USER_CREATED"
    });

    await consumer.run({

        eachMessage:async({topic,message})=>{

            console.log(
                `Topic:${topic}`
            );

            console.log(
                JSON.parse(
                    message.value.toString()
                )
            );

        }

    });

};

startConsumer();