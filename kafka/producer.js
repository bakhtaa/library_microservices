const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId:"library-app",
    brokers:["localhost:9092"]
});

const producer = kafka.producer();

const connectProducer = async()=>{

    await producer.connect();

    console.log("Kafka Producer connected");

};

const sendEvent = async(topic,data)=>{

    await producer.send({

        topic,

        messages:[
            {
                value:JSON.stringify(data)
            }
        ]

    });

};

module.exports={
    connectProducer,
    sendEvent
};