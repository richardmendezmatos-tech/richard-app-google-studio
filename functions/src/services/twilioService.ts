
import twilio from 'twilio';
import * as logger from 'firebase-functions/logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER; // Format: whatsapp:+14155238886

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

/**
 * Sends a WhatsApp message to a specific number.
 * @param to The recipient's phone number (e.g., 'whatsapp:+17875550123')
 * @param body The message text
 */
export const sendWhatsAppMessage = async (to: string, body: string) => {
    if (!client) {
        logger.warn("Twilio credentials not found. Message suppressed.", { to, body });
        return;
    }

    try {
        const message = await client.messages.create({
            body,
            from: fromNumber || 'whatsapp:+14155238886', // Default sandbox
            to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
        });
        logger.info(`WhatsApp sent: ${message.sid}`);
        return message;
    } catch (error) {
        logger.error("Error sending WhatsApp:", error);
        throw error;
    }
};

/**
 * Generates a TwiML response for a webhook reply.
 * @param message The message to reply with
 */
export const createTwiMLReply = (message: string): string => {
    const response = new twilio.twiml.MessagingResponse();
    response.message(message);
    return response.toString();
};
