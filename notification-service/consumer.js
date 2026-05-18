const { Kafka } = require("kafkajs");

const kafka = new Kafka({

    clientId:"notification-service",
    brokers:["localhost:9092"]

});

const consumer=kafka.consumer({

    groupId:"notifications"

});

async function run(){

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

    console.log(
        "Notification Service running..."
    );

    await consumer.run({

        eachMessage:async({

            topic,
            message

        })=>{

            const data=JSON.parse(
                message.value.toString()
            );

            console.log(
                "Notification:"
            );

            console.log(
                topic,
                data
            );

        }

    });

}

run();