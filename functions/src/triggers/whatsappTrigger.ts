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
        MessageSid: z.preprocess((val) => String(val || ""), z.string().optional()),
        VehicleId: z.preprocess((val) => (val ? String(val) : undefined), z.string().optional()),
    });

    const validation = WhatsAppPayloadSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(400).send('Bad Request');
        return;
    }

    const { Body, From, VehicleId, MessageSid } = validation.data;

    // 1. Idempotency Check
    if (MessageSid) {
        const { getFirestore } = await import('firebase-admin/firestore');
        const idempotencyRef = getFirestore().collection('webhook_idempotency').doc(MessageSid);
        const doc = await idempotencyRef.get();
        if (doc.exists) {
            logger.info(`Idempotency hit: Message ${MessageSid} already processed.`);
            res.set('Content-Type', 'text/xml');
            res.status(200).send('<Response></Response>');
            return;
        }
        await idempotencyRef.set({ processedAt: new Date(), from: From });
    }

    // 2. Exponential Backoff Retry Loop
    const executeWithRetry = async (retries = 2) => {
        let lastError: any;
        for (let i = 0; i <= retries; i++) {
            try {
                return await whatsAppProcessor.execute({
                    from: From,
                    body: Body || "Hola",
                    vehicleId: VehicleId
                });
            } catch (err) {
                lastError = err;
                if (i === retries) throw err;
                logger.warn(`AI Processor failed, retrying (${i + 1}/${retries})...`, err);
                await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, i)));
            }
        }
        throw lastError;
    };

    try {
        const replyText = await executeWithRetry() as string;

        const { createTwiMLReply } = await import('../infrastructure/messaging/TwilioAdapter');
        const twiml = createTwiMLReply(replyText);

        res.set('Content-Type', 'text/xml');
        res.status(200).send(twiml);
    } catch (error) {
        logger.error("Error processing WhatsApp message", error);
        res.status(500).send('AI Error');
    }
});
