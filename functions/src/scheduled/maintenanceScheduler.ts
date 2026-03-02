import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { CleanAuditLogs } from '../application/use-cases';
import { FirestoreLogRepository } from '../infrastructure/persistence/firestore/FirestoreLogRepository';

const logRepository = new FirestoreLogRepository();

export const cleanupOldLogs = onSchedule('every sunday 00:00', async () => {
    logger.info("Running Log Cleanup...");
    try {
        const useCase = new CleanAuditLogs(logRepository);
        const deletedCount = await useCase.execute(30);
        logger.info(`Log Cleanup complete. Deleted ${deletedCount} logs.`);
    } catch (error) {
        logger.error("Error in cleanupOldLogs", error);
    }
});

export const dailyMarketScraper = onSchedule({
    schedule: 'every day 02:00',
    timeZone: 'America/Puerto_Rico',
    timeoutSeconds: 300,
}, async () => {
    const { runMarketIntelScraper } = await import('../services/marketIntelService');
    await runMarketIntelScraper();
});
