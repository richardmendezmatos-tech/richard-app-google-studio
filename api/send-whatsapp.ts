
import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';

// Initialize Twilio Client
// Note: Vercel injects environment variables at runtime.
// We use process.env directly here.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // CORS Handling
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, message, mediaUrl } = request.body;

        if (!to || !message) {
            return response.status(400).json({ error: 'Missing "to" or "message" fields' });
        }

        if (!accountSid || !authToken || !fromNumber) {
            throw new Error('Twilio credentials missing in server environment');
        }

        console.log(`Sending WhatsApp to ${to}`);

        const messageOptions: any = {
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${to}`,
            body: message,
        };

        if (mediaUrl) {
            messageOptions.mediaUrl = [mediaUrl];
        }

        const result = await client.messages.create(messageOptions);

        return response.status(200).json({
            success: true,
            sid: result.sid,
            status: result.status
        });

    } catch (error: any) {
        console.error('Twilio Error:', error);
        return response.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}
