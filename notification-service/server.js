
require("dotenv").config();

const express = require("express");

const { initializeDatabase } = require("./src/config/database");
const notificationService = require("./src/services/notification.service");

const app = express();

const PORT = process.env.PORT || 50055;

// Middleware to parse JSON requests
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        service: "NotificationService",
        status: "UP"
    });
});

// Send notification
app.post("/notifications", async (req, res) => {
    try {
        const {
            userId,
            type,
            title,
            message,
            recipientEmail
        } = req.body;

        // Validate required fields
        if (!userId || !type || !title || !message || !recipientEmail) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        const result = await notificationService.sendNotification({
            userId,
            type,
            title,
            message,
            recipientEmail
        });

        const statusCode = result.status === "SENT" ? 200 : 500;

        return res.status(statusCode).json(result);

    } catch (error) {
        console.error("Error sending notification:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Get notification by ID
app.get("/notifications/:id", async (req, res) => {
    try {
        const notification = await notificationService.getNotification(
            req.params.id
        );

        if (!notification) {
            return res.status(404).json({
                error: "Notification not found"
            });
        }

        return res.status(200).json(notification);

    } catch (error) {
        console.error("Error retrieving notification:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

async function start() {
    try {
        // Initialize database before accepting requests
        await initializeDatabase();

        // Start HTTP server
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`NotificationService running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start NotificationService:", error);
        process.exit(1);
    }
}

start();
