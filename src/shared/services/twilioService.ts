import twilio from 'twilio';

export const twilioBackendService = {
  async sendSMS(to: string, body: string): Promise<boolean> {
    return sendTwilioMessage(to, body);
  },
};

export async function sendTwilioMessage(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid?.startsWith('AC') || !authToken || !fromPhone) {
    console.warn('Twilio credentials no configuradas o faltan en el entorno.', { to, body });
    return false;
  }

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({ body, from: fromPhone, to });
    console.log(`[Twilio] SMS enviado al ${to}. SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('[Twilio] Error enviando SMS:', error);
    return false;
  }
}
