import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { SendLeadEmailSequence } from '../application/use-cases';
import { Lead } from '../domain/entities';
import { FirestoreLeadRepository } from '../infrastructure/persistence/firestore/FirestoreLeadRepository';
import { SendGridEmailRepository } from '../infrastructure/messaging/SendGridEmailRepository';

// In Triggers, we can instantiate local repositories if not sharing a global state
const leadRepository = new FirestoreLeadRepository();
const emailRepository = new SendGridEmailRepository();

/**
 * Trigger: Send welcome email immediately when a new lead is created
 */
/**
 * Trigger: Send welcome email immediately when a new lead is created
 */
export const onLeadCreated = onDocumentCreated({
    document: 'leads/{leadId}',
    secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    try {
        const lead = { id: event.params.leadId, ...snapshot.data() } as Lead;
        const useCase = new SendLeadEmailSequence(leadRepository, emailRepository);
        await useCase.sendWelcome(lead);
        logger.info(`✅ Welcome email sequence initiated for ${event.params.leadId}`);
    } catch (error: any) {
        logger.error('❌ Error in onLeadCreated trigger:', error);
    }
});

/**
 * Trigger: Send post-appointment email when appointment is marked as completed
 */
/**
 * Trigger: Send post-appointment email when appointment is marked as completed
 */
export const onAppointmentCompleted = onDocumentUpdated({
    document: 'leads/{leadId}',
    secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    // Check if appointment was just completed
    const wasCompleted = !before.appointmentCompleted && after.appointmentCompleted;

    if (wasCompleted) {
        try {
            const lead = { id: event.params.leadId, ...after } as Lead;
            const useCase = new SendLeadEmailSequence(leadRepository, emailRepository);
            await useCase.sendAppointmentFollowUp(lead);
            logger.info(`✅ Appointment follow-up sequence initiated for ${event.params.leadId}`);
        } catch (error: any) {
            logger.error('❌ Error in onAppointmentCompleted trigger:', error);
        }
    }
});
