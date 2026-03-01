import * as functions from 'firebase-functions';
import { TwilioWhatsAppRepository } from '../infrastructure/messaging/TwilioWhatsAppRepository';
import { WhatsAppAgent } from '../application/use-cases/leads/WhatsAppAgent.usecase';

/**
 * Webhook: onWhatsAppMessage
 * Receives incoming messages from Twilio WhatsApp API.
 */
export const onWhatsAppMessage = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { From, Body } = req.body;

  if (!From || !Body) {
    res.status(400).send('Missing From or Body');
    return;
  }

  try {
    // 1. Resolve Lead ID from phone number (E.164)
    // For simplicity in this phase, we use the phone number as the Lead ID
    const leadId = From.replace('whatsapp:', '');

    // 2. Initialize Repositories & Agent
    const whatsappRepo = new TwilioWhatsAppRepository();
    const agent = new WhatsAppAgent(whatsappRepo);

    // 3. Execute Agent Logic
    const result = await agent.execute({
      leadId,
      message: Body,
    });

    // 4. Send Reply via Twilio
    await whatsappRepo.sendMessage(leadId, result.reply);

    res.status(200).send({
      status: 'success',
      nextStage: result.nextStage,
    });
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
});
