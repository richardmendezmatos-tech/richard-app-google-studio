import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import {
    sendWelcomeEmail2,
    sendWelcomeEmail3,
    sendWelcomeEmail4,
    sendReengagementEmail1,
    sendReengagementEmail2,
    sendReengagementEmail3,
    sendPostAppointmentEmail2,
    sendPostAppointmentEmail3,
} from '../services/emailService';

const db = admin.firestore();

/**
 * Scheduled function: Process email queue every hour
 */
export const processEmailQueue = onSchedule({
    schedule: 'every 1 hours',
    timeZone: 'America/Puerto_Rico',
    secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
    const now = admin.firestore.Timestamp.now();
    const nowDate = now.toDate();

    // Calculate time thresholds
    const oneDayAgo = new Date(nowDate.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(nowDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(nowDate.getTime() - 5 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(nowDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(nowDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyThreeDaysAgo = new Date(nowDate.getTime() - 33 * 24 * 60 * 60 * 1000);
    const thirtySevenDaysAgo = new Date(nowDate.getTime() - 37 * 24 * 60 * 60 * 1000);

    logger.info('Starting email queue processing', {
        timestamp: nowDate.toISOString(),
    });

    try {
        // Process all email types in parallel
        await Promise.all([
            processWelcomeEmail2(oneDayAgo),
            processWelcomeEmail3(threeDaysAgo),
            processWelcomeEmail4(fiveDaysAgo),
            processReengagementEmail1(thirtyDaysAgo),
            processReengagementEmail2(thirtyThreeDaysAgo),
            processReengagementEmail3(thirtySevenDaysAgo),
            processPostAppointmentEmail2(oneDayAgo),
            processPostAppointmentEmail3(sevenDaysAgo),
        ]);

        logger.info('✅ Email queue processed successfully');
    } catch (error: any) {
        logger.error('❌ Error processing email queue:', error);
        throw error;
    }
});

// ============================================
// WELCOME SERIES PROCESSORS
// ============================================

async function processWelcomeEmail2(oneDayAgo: Date) {
    const leadsSnapshot = await db.collection('leads')
        .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(oneDayAgo))
        .where('emailSequence.welcome1SentAt', '!=', null)
        .where('emailSequence.welcome2SentAt', '==', null)
        .where('responded', '==', false)
        .limit(50)
        .get();

    logger.info(`Processing Welcome Email 2 for ${leadsSnapshot.size} leads`);

    const promises = leadsSnapshot.docs.map(async (doc) => {
        const lead = doc.data();
        if (!lead.email) return;

        try {
            await sendWelcomeEmail2({
                nombre: lead.nombre,
                telefono: lead.telefono,
                email: lead.email,
                tipo_vehiculo: lead.tipo_vehiculo,
            });

            await doc.ref.update({
                'emailSequence.welcome2SentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.lastEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.emailsSent': admin.firestore.FieldValue.increment(1),
            });

            logger.info(`✅ Welcome email 2 sent to ${lead.email}`);
        } catch (error: any) {
            logger.error(`❌ Error sending welcome email 2 to ${lead.email}:`, error.message);
        }
    });

    await Promise.all(promises);
}

async function processWelcomeEmail3(threeDaysAgo: Date) {
    const leadsSnapshot = await db.collection('leads')
        .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(threeDaysAgo))
        .where('emailSequence.welcome2SentAt', '!=', null)
        .where('emailSequence.welcome3SentAt', '==', null)
        .where('responded', '==', false)
        .limit(50)
        .get();

    logger.info(`Processing Welcome Email 3 for ${leadsSnapshot.size} leads`);

    const promises = leadsSnapshot.docs.map(async (doc) => {
        const lead = doc.data();
        if (!lead.email) return;

        try {
            await sendWelcomeEmail3({
                nombre: lead.nombre,
                telefono: lead.telefono,
                email: lead.email,
                tipo_vehiculo: lead.tipo_vehiculo,
            });

            await doc.ref.update({
                'emailSequence.welcome3SentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.lastEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.emailsSent': admin.firestore.FieldValue.increment(1),
            });

            logger.info(`✅ Welcome email 3 sent to ${lead.email}`);
        } catch (error: any) {
            logger.error(`❌ Error sending welcome email 3 to ${lead.email}:`, error.message);
        }
    });

    await Promise.all(promises);
}

async function processWelcomeEmail4(fiveDaysAgo: Date) {
    const leadsSnapshot = await db.collection('leads')
        .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(fiveDaysAgo))
        .where('emailSequence.welcome3SentAt', '!=', null)
        .where('emailSequence.welcome4SentAt', '==', null)
        .where('responded', '==', false)
        .limit(50)
        .get();

    logger.info(`Processing Welcome Email 4 for ${leadsSnapshot.size} leads`);

    const promises = leadsSnapshot.docs.map(async (doc) => {
        const lead = doc.data();
        if (!lead.email) return;

        try {
            await sendWelcomeEmail4({
                nombre: lead.nombre,
                telefono: lead.telefono,
                email: lead.email,
                tipo_vehiculo: lead.tipo_vehiculo,
            });

            await doc.ref.update({
                'emailSequence.welcome4SentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.lastEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.emailsSent': admin.firestore.FieldValue.increment(1),
            });

            logger.info(`✅ Welcome email 4 sent to ${lead.email}`);
        } catch (error: any) {
            logger.error(`❌ Error sending welcome email 4 to ${lead.email}:`, error.message);
        }
    });

    await Promise.all(promises);
}

// ============================================
// RE-ENGAGEMENT SERIES PROCESSORS
// ============================================

async function processReengagementEmail1(thirtyDaysAgo: Date) {
    const leadsSnapshot = await db.collection('leads')
        .where('emailSequence.lastEmailSentAt', '<=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .where('emailSequence.reengagement1SentAt', '==', null)
        .where('responded', '==', false)
        .limit(50)
        .get();

    logger.info(`Processing Re-engagement Email 1 for ${leadsSnapshot.size} leads`);

    const promises = leadsSnapshot.docs.map(async (doc) => {
        const lead = doc.data();
        if (!lead.email) return;

        try {
            await sendReengagementEmail1({
                nombre: lead.nombre,
                telefono: lead.telefono,
                email: lead.email,
                tipo_vehiculo: lead.tipo_vehiculo,
            });

            await doc.ref.update({
                'emailSequence.reengagement1SentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.lastEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.emailsSent': admin.firestore.FieldValue.increment(1),
            });

            logger.info(`✅ Re-engagement email 1 sent to ${lead.email}`);
        } catch (error: any) {
            logger.error(`❌ Error sending re-engagement email 1 to ${lead.email}:`, error.message);
        }
    });

    await Promise.all(promises);
}

async function processReengagementEmail2(thirtyThreeDaysAgo: Date) {
    const leadsSnapshot = await db.collection('leads')
        .where('emailSequence.reengagement1SentAt', '<=', admin.firestore.Timestamp.fromDate(thirtyThreeDaysAgo))
        .where('emailSequence.reengagement2SentAt', '==', null)
        .where('responded', '==', false)
        .limit(50)
        .get();

    logger.info(`Processing Re-engagement Email 2 for ${leadsSnapshot.size} leads`);

    const promises = leadsSnapshot.docs.map(async (doc) => {
        const lead = doc.data();
        if (!lead.email) return;

        try {
            await sendReengagementEmail2({
                nombre: lead.nombre,
                telefono: lead.telefono,
                email: lead.email,
            });

            await doc.ref.update({
                'emailSequence.reengagement2SentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.lastEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.emailsSent': admin.firestore.FieldValue.increment(1),
            });

            logger.info(`✅ Re-engagement email 2 sent to ${lead.email}`);
        } catch (error: any) {
            logger.error(`❌ Error sending re-engagement email 2 to ${lead.email}:`, error.message);
        }
    });

    await Promise.all(promises);
}

async function processReengagementEmail3(thirtySevenDaysAgo: Date) {
    const leadsSnapshot = await db.collection('leads')
        .where('emailSequence.reengagement2SentAt', '<=', admin.firestore.Timestamp.fromDate(thirtySevenDaysAgo))
        .where('emailSequence.reengagement3SentAt', '==', null)
        .where('responded', '==', false)
        .limit(50)
        .get();

    logger.info(`Processing Re-engagement Email 3 for ${leadsSnapshot.size} leads`);

    const promises = leadsSnapshot.docs.map(async (doc) => {
        const lead = doc.data();
        if (!lead.email) return;

        try {
            await sendReengagementEmail3({
                nombre: lead.nombre,
                telefono: lead.telefono,
                email: lead.email,
            });

            await doc.ref.update({
                'emailSequence.reengagement3SentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.lastEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.emailsSent': admin.firestore.FieldValue.increment(1),
            });

            logger.info(`✅ Re-engagement email 3 sent to ${lead.email}`);
        } catch (error: any) {
            logger.error(`❌ Error sending re-engagement email 3 to ${lead.email}:`, error.message);
        }
    });

    await Promise.all(promises);
}

// ============================================
// POST-APPOINTMENT SERIES PROCESSORS
// ============================================

async function processPostAppointmentEmail2(oneDayAgo: Date) {
    const leadsSnapshot = await db.collection('leads')
        .where('emailSequence.postAppointment1SentAt', '<=', admin.firestore.Timestamp.fromDate(oneDayAgo))
        .where('emailSequence.postAppointment2SentAt', '==', null)
        .where('documentsSent', '==', false)
        .limit(50)
        .get();

    logger.info(`Processing Post-Appointment Email 2 for ${leadsSnapshot.size} leads`);

    const promises = leadsSnapshot.docs.map(async (doc) => {
        const lead = doc.data();
        if (!lead.email) return;

        try {
            await sendPostAppointmentEmail2({
                nombre: lead.nombre,
                telefono: lead.telefono,
                email: lead.email,
                vehiculo: lead.vehiculo || lead.tipo_vehiculo,
                doc1: lead.doc1,
                doc2: lead.doc2,
                doc3: lead.doc3,
            });

            await doc.ref.update({
                'emailSequence.postAppointment2SentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.lastEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.emailsSent': admin.firestore.FieldValue.increment(1),
            });

            logger.info(`✅ Post-appointment email 2 sent to ${lead.email}`);
        } catch (error: any) {
            logger.error(`❌ Error sending post-appointment email 2 to ${lead.email}:`, error.message);
        }
    });

    await Promise.all(promises);
}

async function processPostAppointmentEmail3(sevenDaysAgo: Date) {
    const leadsSnapshot = await db.collection('leads')
        .where('emailSequence.postAppointment1SentAt', '<=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .where('emailSequence.postAppointment3SentAt', '==', null)
        .where('dealClosed', '==', false)
        .limit(50)
        .get();

    logger.info(`Processing Post-Appointment Email 3 for ${leadsSnapshot.size} leads`);

    const promises = leadsSnapshot.docs.map(async (doc) => {
        const lead = doc.data();
        if (!lead.email) return;

        try {
            await sendPostAppointmentEmail3({
                nombre: lead.nombre,
                telefono: lead.telefono,
                email: lead.email,
                vehiculo: lead.vehiculo || lead.tipo_vehiculo,
            });

            await doc.ref.update({
                'emailSequence.postAppointment3SentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.lastEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
                'emailSequence.emailsSent': admin.firestore.FieldValue.increment(1),
            });

            logger.info(`✅ Post-appointment email 3 sent to ${lead.email}`);
        } catch (error: any) {
            logger.error(`❌ Error sending post-appointment email 3 to ${lead.email}:`, error.message);
        }
    });

    await Promise.all(promises);
}
