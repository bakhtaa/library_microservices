
const { Kafka } = require("kafkajs");

const { getUser } = require("../grpc/user.client");
const notificationService = require("../services/notification.service");

const kafka = new Kafka({
    clientId: "notification-service",
    brokers: [
        process.env.KAFKA_BROKER || "localhost:9094"
    ]
});

const consumer = kafka.consumer({
    groupId: "notification-service-group"
});

async function handleNotificationRequested(event) {
    // 1. Vérifier les données nécessaires
    const { userId, title, message } = event;

    if (!userId || !title || !message) {
        throw new Error("Invalid NOTIFICATION_REQUESTED event");
    }

    // 2. Récupérer l'utilisateur auprès de UserService
    const user = await getUser(userId);

    if (!user || !user.email) {
        throw new Error("User not found or email unavailable");
    }

    console.log("User retrieved from UserService:", user.email);

    // 3. Créer et envoyer la notification
    const result = await notificationService.sendNotification({
        userId: user.id,
        type: event.type,
        title,
        message,
        recipientEmail: user.email
    });

    // 4. Vérifier le résultat
    if (result.status !== "SENT") {
        throw new Error(result.message || "Notification sending failed");
    }

    console.log("Notification successfully processed:", result);
}

async function startConsumer() {
    try {
        await consumer.connect();

        console.log("NotificationService connected to Kafka");

        await consumer.subscribe({
            topics: ["notification-events"],
            fromBeginning: false
        });

        console.log("Subscribed to notification-events");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const rawMessage = message.value?.toString();

                if (!rawMessage?.trim()) {
                    console.warn("Received empty Kafka message");
                    return;
                }

                console.log("\n========== KAFKA EVENT ==========");
                console.log("Topic:", topic);
                console.log("Partition:", partition);
                console.log("Message:", rawMessage);
                console.log("=================================\n");

                try {
                    const event = JSON.parse(rawMessage);

                    if (event.type === "NOTIFICATION_REQUESTED") {
                        await handleNotificationRequested(event);
                    } else {
                        console.log("Unsupported event type:", event.type);
                    }

                } catch (error) {
                    console.error("Event processing failed:", error.message);
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
