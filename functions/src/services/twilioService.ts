
import twilio from 'twilio';
import * as logger from 'firebase-functions/logger';

const getTwilioClient = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    return (accountSid && authToken) ? twilio(accountSid, authToken) : null;
};

const getFromNumber = () => process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886'; // Default sandbox

/**
 * Sends a WhatsApp or SMS message via Twilio.
 * @param to The recipient's phone number
 * @param body The message text
 */
export const sendTwilioMessage = async (to: string, body: string) => {
    const client = getTwilioClient();

    if (!client) {
        logger.warn("Twilio credentials not found. Message suppressed.", { to, body });
        return;
    }

    const isWhatsApp = to.startsWith('whatsapp:');
    const fromStr = getFromNumber();
    const finalFrom = isWhatsApp && !fromStr.startsWith('whatsapp:') ? `whatsapp:${fromStr}` : fromStr;

    try {
        const message = await client.messages.create({
            body,
            from: finalFrom,
            to: to // Assume caller formats it correctly or passes an SMS number
        });
        logger.info(`Twilio message sent: ${message.sid}`);
        return message;
    } catch (error) {
        logger.error("Error sending Twilio message:", error);
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
