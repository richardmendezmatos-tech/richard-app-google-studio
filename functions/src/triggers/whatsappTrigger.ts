import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { z } from 'genkit';
import { FirestoreLeadRepository } from '../infrastructure/persistence/firestore/FirestoreLeadRepository';
import { FirestoreInventoryRepository } from '../infrastructure/persistence/firestore/FirestoreInventoryRepository';
import { FirestoreChatRepository } from '../infrastructure/persistence/firestore/FirestoreChatRepository';
import { ProcessWhatsAppMessage } from '../application/use-cases';
import { GenkitAgentOrchestrator } from '../infrastructure/ai/GenkitAgentOrchestrator';
import { getRequestUrlForSignature, shouldEnforceWebhookSignatures } from '../security/webhooks';

// Infrastructure Instantiation
const leadRepository = new FirestoreLeadRepository();
const inventoryRepository = new FirestoreInventoryRepository();
const chatRepository = new FirestoreChatRepository();
const aiOrchestrator = new GenkitAgentOrchestrator();

// Use Case
const whatsAppProcessor = new ProcessWhatsAppMessage(chatRepository, leadRepository, aiOrchestrator, inventoryRepository);

export const incomingWhatsAppMessage = onRequest({
    secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"]
}, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const enforce = shouldEnforceWebhookSignatures();
        const twilioAuthToken = String(process.env.TWILIO_AUTH_TOKEN || '').trim();
        const signature = String(req.get('x-twilio-signature') || '').trim();

        if (twilioAuthToken && signature) {
            const twilio = (await import('twilio')).default;
            const url = getRequestUrlForSignature(req);
            const ok = twilio.validateRequest(twilioAuthToken, signature, url, req.body || {});
            if (!ok) {
                logger.warn('Rejected Twilio webhook: invalid signature', { url });
                res.status(403).send('Forbidden');
                return;
            }
        } else if (enforce) {
            res.status(403).send('Forbidden');
            return;
        }
    } catch (e) {
        logger.warn('Twilio webhook signature verification error', { error: String(e) });
        if (shouldEnforceWebhookSignatures()) {
            res.status(403).send('Forbidden');
            return;
        }
    }

    const WhatsAppPayloadSchema = z.object({
        Body: z.preprocess((val) => String(val || ""), z.string()),
        From: z.preprocess((val) => String(val || ""), z.string()),
        VehicleId: z.preprocess((val) => (val ? String(val) : undefined), z.string().optional()),
    });

    const validation = WhatsAppPayloadSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(400).send('Bad Request');
        return;
    }

    const { Body, From, VehicleId } = validation.data;

    try {
        const replyText = await whatsAppProcessor.execute({
            from: From,
            body: Body || "Hola",
            vehicleId: VehicleId
        });

        const { createTwiMLReply } = await import('../infrastructure/messaging/TwilioAdapter');
        const twiml = createTwiMLReply(replyText);

        res.set('Content-Type', 'text/xml');
        res.status(200).send(twiml);
    } catch (error) {
        logger.error("Error processing WhatsApp message", error);
        res.status(500).send('AI Error');
    }
});
