import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { shouldEnforceWebhookSignatures, verifySendGridEventWebhook } from '../security/webhooks';

const db = admin.firestore();

interface SendGridEvent {
    email: string;
    event: 'processed' | 'delivered' | 'open' | 'click' | 'bounce' | 'dropped' | 'spamreport' | 'unsubscribe';
    timestamp: number;
    url?: string;
    reason?: string;
    sg_message_id?: string;
}

/**
 * Webhook endpoint for SendGrid email events
 */
export const sendgridWebhook = onRequest(async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // Optional (recommended) signed event webhook verification.
    // If SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY is set, we'll verify. You can enforce via WEBHOOK_SIGNATURE_ENFORCE=true.
    const hasPublicKey = !!String(process.env.SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY || '').trim();
    if (hasPublicKey) {
        const ok = verifySendGridEventWebhook(req);
        if (!ok) {
            logger.warn('Rejected SendGrid webhook: invalid signature');
            res.status(403).send('Forbidden');
            return;
        }
    } else if (shouldEnforceWebhookSignatures()) {
        logger.warn('Rejected SendGrid webhook: missing SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY');
        res.status(403).send('Forbidden');
        return;
    } else {
        logger.warn('SendGrid webhook signature not verified (missing public key).');
    }

    const events: SendGridEvent[] = req.body;

    if (!Array.isArray(events)) {
        logger.error('Invalid payload: expected array of events');
        res.status(400).send('Invalid payload');
        return;
    }

    logger.info(`Received ${events.length} SendGrid events`);

    try {
        const promises = events.map(async (event) => {
            const { email, event: eventType, timestamp, url, reason } = event;

            // Find lead by email
            const leadsSnapshot = await db.collection('leads')
                .where('email', '==', email)
                .limit(1)
                .get();

            if (leadsSnapshot.empty) {
                logger.warn(`Lead not found for email: ${email}`);
                return;
            }

            const leadDoc = leadsSnapshot.docs[0];
            const leadData = leadDoc.data();

            // Update lead based on event type
            switch (eventType) {
                case 'open':
                    await leadDoc.ref.update({
                        'emailSequence.emailsOpened': admin.firestore.FieldValue.increment(1),
                        'emailSequence.lastOpenedAt': admin.firestore.Timestamp.fromDate(new Date(timestamp * 1000)),
                    });
                    logger.info(`📧 Email opened by ${email}`);
                    break;

                case 'click':
                    await leadDoc.ref.update({
                        'emailSequence.emailsClicked': admin.firestore.FieldValue.increment(1),
                        'emailSequence.lastClickedAt': admin.firestore.Timestamp.fromDate(new Date(timestamp * 1000)),
                        'emailSequence.lastClickedUrl': url || '',
                    });
                    logger.info(`🖱️ Email link clicked by ${email}`, { url });

                    if (!leadData.responded) {
                        await leadDoc.ref.update({
                            responded: true,
                            respondedAt: admin.firestore.Timestamp.fromDate(new Date(timestamp * 1000)),
                            responseChannel: 'email_click',
                        });
                    }
                    break;

                case 'bounce':
                    await leadDoc.ref.update({
                        'emailSequence.bounced': true,
                        'emailSequence.bounceReason': reason || 'Unknown',
                        'emailSequence.bouncedAt': admin.firestore.Timestamp.fromDate(new Date(timestamp * 1000)),
                    });
                    logger.warn(`⚠️ Email bounced for ${email}`, { reason });
                    break;

                case 'spamreport':
                    await leadDoc.ref.update({
                        'emailSequence.markedAsSpam': true,
                        'emailSequence.spamReportedAt': admin.firestore.Timestamp.fromDate(new Date(timestamp * 1000)),
                        unsubscribed: true,
                    });
                    logger.error(`🚫 Email marked as spam by ${email}`);
                    break;

                case 'unsubscribe':
                    await leadDoc.ref.update({
                        unsubscribed: true,
                        unsubscribedAt: admin.firestore.Timestamp.fromDate(new Date(timestamp * 1000)),
                    });
                    logger.info(`🔕 User unsubscribed: ${email}`);
                    break;

                case 'delivered':
                    await leadDoc.ref.update({
                        'emailSequence.lastDeliveredAt': admin.firestore.Timestamp.fromDate(new Date(timestamp * 1000)),
                    });
                    logger.info(`✅ Email delivered to ${email}`);
                    break;

                default:
                    logger.info(`Received event type: ${eventType} for ${email}`);
            }
        });

        await Promise.all(promises);

        res.status(200).send('OK');
    } catch (error: any) {
        logger.error('Error processing SendGrid webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});
