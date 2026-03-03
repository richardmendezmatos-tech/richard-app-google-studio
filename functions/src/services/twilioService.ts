import twilio from 'twilio';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

// Estos valores vendrán de las variables de entorno configuradas en Firebase Functions
// o de las Secrets de Google Cloud.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const twilioBackendService = {
  async sendSMS(to: string, body: string): Promise<boolean> {
    return sendTwilioMessage(to, body);
  },
};

export async function sendTwilioMessage(to: string, body: string): Promise<boolean> {
  if (!client || !fromPhone) {
    console.warn('Twilio credentials no configuradas o faltan en el entorno.', { to, body });
    return false;
  }

  try {
    const message = await client.messages.create({
      body,
      from: fromPhone,
      to,
    });

    console.log(`[Twilio] SMS enviado exitosamente al ${to}. SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('[Twilio] Error enviando SMS:', error);
    return false;
  }
}
