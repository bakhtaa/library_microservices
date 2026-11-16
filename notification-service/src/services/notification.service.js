
const { randomUUID } = require("crypto");

const notificationRepository = require("../repository/notification.repository");
const emailProvider = require("../providers/email.provider");

async function sendNotification({
    userId,
    type,
    title,
    message,
    recipientEmail
}) {
    // 1. Construire la notification
    const notification = {
        id: randomUUID(),
        userId,
        type,
        title,
        message,
        channel: "EMAIL"
    };

    // 2. Enregistrer la notification avec le statut PENDING
    await notificationRepository.create(notification);

    try {
        // 3. Demander au provider d'envoyer l'email
        const result = await emailProvider.sendEmail({
            to: recipientEmail,
            subject: title,
            message
        });

        // 4. Mettre à jour le statut selon le résultat
        if (result.success) {
            await notificationRepository.updateStatus(
                notification.id,
                "SENT"
            );
        } else {
            await notificationRepository.updateStatus(
                notification.id,
                "FAILED"
            );
        }

        // 5. Retourner le résultat
        return {
            notificationId: notification.id,
            status: result.success ? "SENT" : "FAILED",
            message: result.message
        };

    } catch (error) {
        // En cas d'erreur technique
        await notificationRepository.updateStatus(
            notification.id,
            "FAILED"
        );

        console.error("Notification processing failed:", error);

        return {
            notificationId: notification.id,
            status: "FAILED",
            message: error.message
        };
    }
}

async function getNotification(id) {
    return notificationRepository.findById(id);
}

module.exports = {
    sendNotification,
    getNotification
};
