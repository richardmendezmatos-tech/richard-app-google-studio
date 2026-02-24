import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { AutomateEmailSequences } from '../application/use-cases/AutomateEmailSequences';
import { FirestoreLeadRepository } from '../infrastructure/repositories/FirestoreLeadRepository';
import { SendGridEmailRepository } from '../infrastructure/repositories/SendGridEmailRepository';

const leadRepository = new FirestoreLeadRepository();
const emailRepository = new SendGridEmailRepository();

/**
 * Scheduled function: Process email automation every hour (Clean Architecture Nivel 12)
 */
export const processEmailQueue = onSchedule({
    schedule: 'every 1 hours',
    timeZone: 'America/Puerto_Rico',
    secrets: ["SENDGRID_API_KEY"],
}, async () => {
    logger.info('Starting Agnostic Email Automation Queue');

    try {
        const useCase = new AutomateEmailSequences(leadRepository, emailRepository);
        await useCase.execute();
        logger.info('✅ Email automation executed successfully via Use Case');
    } catch (error: any) {
        logger.error('❌ Error in Email Automation Scheduler:', error);
    }
});
