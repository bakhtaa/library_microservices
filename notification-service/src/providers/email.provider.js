
async function sendEmail({ to, subject, message }) {
    try {
        // Simulation d'un envoi d'email
        console.log("================================");
        console.log("EMAIL SENT (SIMULATION)");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("Message:", message);
        console.log("================================");

        return {
            success: true,
            message: "Email sent successfully"
        };

    } catch (error) {
        console.error("Email sending failed:", error);

        return {
            success: false,
            message: error.message
        };
    }
}

module.exports = {
    sendEmail
};
