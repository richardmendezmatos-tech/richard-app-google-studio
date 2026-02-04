import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { sendWelcomeEmail1 } from '../services/emailService';

/**
 * Trigger: Send welcome email immediately when a new lead is created
 */
export const onLeadCreated = onDocumentCreated({
    document: 'leads/{leadId}',
    secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const lead = snapshot.data();
    const leadId = event.params.leadId;

    logger.info(`New lead created: ${leadId}`, {
        nombre: lead.nombre,
        hasEmail: !!lead.email,
    });

    // Only send if email is provided
    if (!lead.email) {
        logger.info('Lead created without email, skipping welcome email', {
            leadId,
            nombre: lead.nombre,
        });
        return;
    }

    try {
        // Send welcome email 1
        await sendWelcomeEmail1({
            nombre: lead.nombre,
            telefono: lead.telefono,
            email: lead.email,
            tipo_vehiculo: lead.tipo_vehiculo,
        });

        // Update lead with email sent timestamp
        await snapshot.ref.update({
            'emailSequence.welcome1SentAt': admin.firestore.FieldValue.serverTimestamp(),
            'emailSequence.lastEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
            'emailSequence.emailsSent': admin.firestore.FieldValue.increment(1),
        });

        logger.info(`✅ Welcome email 1 sent to ${lead.email}`, { leadId });
    } catch (error: any) {
        logger.error('❌ Error sending welcome email:', {
            leadId,
            email: lead.email,
            error: error.message,
        });

        // Log error in Firestore for debugging
        await snapshot.ref.update({
            'emailSequence.lastError': {
                message: error.message,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                emailType: 'welcome1',
            },
        });
    }
});

/**
 * Trigger: Send post-appointment email when appointment is marked as completed
 */
export const onAppointmentCompleted = onDocumentUpdated({
    document: 'leads/{leadId}',
    secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const leadId = event.params.leadId;

    if (!before || !after) return;

    // Check if appointment was just completed (assumed field appointmentCompleted)
    const wasCompleted = !before.appointmentCompleted && after.appointmentCompleted;

    if (!wasCompleted) {
        return;
    }

    if (!after.email) {
        logger.info('Appointment completed but no email, skipping post-appointment email', {
            leadId,
        });
        return;
    }

    try {
        const { sendPostAppointmentEmail1 } = await import('../services/emailService');

        await sendPostAppointmentEmail1({
            nombre: after.nombre,
            telefono: after.telefono,
            email: after.email,
            vehiculo: after.vehiculo || after.tipo_vehiculo,
            presupuesto: after.presupuesto,
            pago_mensual: after.pago_mensual,
            proximo_paso: after.proximo_paso,
            documento_adicional: after.documento_adicional,
        });

        // Update lead with email sent timestamp
        await event.data?.after.ref.update({
            'emailSequence.postAppointment1SentAt': admin.firestore.FieldValue.serverTimestamp(),
            'emailSequence.lastEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
            'emailSequence.emailsSent': admin.firestore.FieldValue.increment(1),
        });

        logger.info(`✅ Post-appointment email 1 sent to ${after.email}`, { leadId });
    } catch (error: any) {
        logger.error('❌ Error sending post-appointment email:', {
            leadId,
            error: error.message,
        });
    }
});
