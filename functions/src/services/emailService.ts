import { sendTemplateEmail, sendPlainEmail } from './sendgridService';
import { logger } from 'firebase-functions';

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

/**
 * Legacy support for existing admin notifications
 */
export const sendNotificationEmail = async (payload: EmailPayload) => {
    return sendPlainEmail(payload.to, payload.subject, payload.html, payload.html);
};

export interface LeadEmailData {
    nombre: string;
    telefono: string;
    email?: string;
    tipo_vehiculo?: string;
    presupuesto?: string;
    vehiculo?: string;
    pago_mensual?: string;
    proximo_paso?: string;
    documento_adicional?: string;
    doc1?: string;
    doc2?: string;
    doc3?: string;
}

const sendTemplateOrFallback = async ({
    to,
    templateId,
    dynamicData,
    subject,
    html,
}: {
    to: string;
    templateId?: string;
    dynamicData: Record<string, unknown>;
    subject: string;
    html: string;
}) => {
    const resolvedTemplateId = String(templateId || '').trim();
    if (resolvedTemplateId) {
        return sendTemplateEmail({
            to,
            templateId: resolvedTemplateId,
            dynamicData,
        });
    }

    logger.warn('Template ID missing, sending fallback plain email', { to, subject });
    return sendPlainEmail(to, subject, html, html);
};

// ============================================
// WELCOME SERIES (4 emails)
// ============================================

/**
 * Welcome Email 1: Bienvenida + Confirmación (Inmediato)
 */
export const sendWelcomeEmail1 = async (lead: LeadEmailData) => {
    if (!lead.email) {
        logger.warn('No email provided for lead:', lead.nombre);
        return;
    }

    return sendTemplateOrFallback({
        to: lead.email,
        templateId: process.env.TEMPLATE_WELCOME_1,
        dynamicData: {
            nombre: lead.nombre,
            telefono: lead.telefono,
            tipo_vehiculo: lead.tipo_vehiculo || 'vehículo',
        },
        subject: `Bienvenido a Richard Automotive, ${lead.nombre}`,
        html: `Hola ${lead.nombre}, gracias por tu interés en ${lead.tipo_vehiculo || 'nuestro inventario'}. Te contactaremos pronto para ayudarte con el próximo paso.`,
    });
};

/**
 * Welcome Email 2: Presentación + Credenciales (Día 1)
 */
export const sendWelcomeEmail2 = async (lead: LeadEmailData) => {
    if (!lead.email) return;

    return sendTemplateOrFallback({
        to: lead.email,
        templateId: process.env.TEMPLATE_WELCOME_2,
        dynamicData: {
            nombre: lead.nombre,
            tipo_vehiculo: lead.tipo_vehiculo || 'vehículo',
        },
        subject: `Seguimiento de tu solicitud, ${lead.nombre}`,
        html: `Hola ${lead.nombre}, seguimos disponibles para ayudarte a conseguir tu ${lead.tipo_vehiculo || 'próximo vehículo'}.`,
    });
};

/**
 * Welcome Email 3: Caso de Éxito Similar (Día 3)
 */
export const sendWelcomeEmail3 = async (lead: LeadEmailData) => {
    if (!lead.email) return;

    return sendTemplateOrFallback({
        to: lead.email,
        templateId: process.env.TEMPLATE_WELCOME_3,
        dynamicData: {
            nombre: lead.nombre,
            tipo_vehiculo: lead.tipo_vehiculo || 'vehículo',
        },
        subject: `Opciones para tu ${lead.tipo_vehiculo || 'vehículo'}`,
        html: `Hola ${lead.nombre}, tenemos opciones que pueden ajustarse a lo que estás buscando.`,
    });
};

/**
 * Welcome Email 4: Recordatorio + Urgencia Suave (Día 5)
 */
export const sendWelcomeEmail4 = async (lead: LeadEmailData) => {
    if (!lead.email) return;

    return sendTemplateOrFallback({
        to: lead.email,
        templateId: process.env.TEMPLATE_WELCOME_4,
        dynamicData: {
            nombre: lead.nombre,
            tipo_vehiculo: lead.tipo_vehiculo || 'vehículo',
        },
        subject: `Último recordatorio sobre tu solicitud`,
        html: `Hola ${lead.nombre}, este es un recordatorio para continuar tu proceso con Richard Automotive.`,
    });
};

// ============================================
// RE-ENGAGEMENT SERIES (3 emails)
// ============================================

/**
 * Re-engagement Email 1: Check-In Amigable (30 días inactividad)
 */
export const sendReengagementEmail1 = async (lead: LeadEmailData) => {
    if (!lead.email) return;

    return sendTemplateOrFallback({
        to: lead.email,
        templateId: process.env.TEMPLATE_REENGAGEMENT_1,
        dynamicData: {
            nombre: lead.nombre,
            tipo_vehiculo: lead.tipo_vehiculo || 'vehículo',
        },
        subject: `Te ayudamos a retomar tu búsqueda`,
        html: `Hola ${lead.nombre}, si aún buscas ${lead.tipo_vehiculo || 'vehículo'}, podemos ayudarte a retomar el proceso.`,
    });
};

/**
 * Re-engagement Email 2: Incentivo Especial (Día 3 después)
 */
export const sendReengagementEmail2 = async (lead: LeadEmailData) => {
    if (!lead.email) return;

    return sendTemplateOrFallback({
        to: lead.email,
        templateId: process.env.TEMPLATE_REENGAGEMENT_2,
        dynamicData: {
            nombre: lead.nombre,
        },
        subject: `Seguimos disponibles para ayudarte`,
        html: `Hola ${lead.nombre}, aún estás a tiempo de continuar tu solicitud.`,
    });
};

/**
 * Re-engagement Email 3: Última Oportunidad (Día 7 después)
 */
export const sendReengagementEmail3 = async (lead: LeadEmailData) => {
    if (!lead.email) return;

    return sendTemplateOrFallback({
        to: lead.email,
        templateId: process.env.TEMPLATE_REENGAGEMENT_3,
        dynamicData: {
            nombre: lead.nombre,
        },
        subject: `Cierre de seguimiento`,
        html: `Hola ${lead.nombre}, este es nuestro último seguimiento. Si deseas continuar, estamos listos para ayudarte.`,
    });
};

// ============================================
// POST-APPOINTMENT SERIES (3 emails)
// ============================================

/**
 * Post-Appointment Email 1: Agradecimiento + Próximos Pasos (Inmediato)
 */
export const sendPostAppointmentEmail1 = async (lead: LeadEmailData) => {
    if (!lead.email) return;

    return sendTemplateOrFallback({
        to: lead.email,
        templateId: process.env.TEMPLATE_POST_APPOINTMENT_1,
        dynamicData: {
            nombre: lead.nombre,
            vehiculo: lead.vehiculo || lead.tipo_vehiculo || 'vehículo',
            presupuesto: lead.presupuesto || 'a definir',
            pago_mensual: lead.pago_mensual || 'a calcular',
            proximo_paso: lead.proximo_paso || 'enviar documentos',
            documento_adicional: lead.documento_adicional || '',
        },
        subject: `Gracias por tu cita, ${lead.nombre}`,
        html: `Hola ${lead.nombre}, gracias por tu cita. Tu próximo paso es: ${lead.proximo_paso || 'enviar documentos'}.`,
    });
};

/**
 * Post-Appointment Email 2: Recordatorio de Documentos (Día 1)
 */
export const sendPostAppointmentEmail2 = async (lead: LeadEmailData) => {
    if (!lead.email) return;

    return sendTemplateOrFallback({
        to: lead.email,
        templateId: process.env.TEMPLATE_POST_APPOINTMENT_2,
        dynamicData: {
            nombre: lead.nombre,
            vehiculo: lead.vehiculo || lead.tipo_vehiculo || 'vehículo',
            doc1: lead.doc1 || 'Licencia de conducir',
            doc2: lead.doc2 || 'Talonario reciente',
            doc3: lead.doc3 || 'Evidencia de dirección',
        },
        subject: `Recordatorio de documentos`,
        html: `Hola ${lead.nombre}, recuerda enviarnos: ${lead.doc1 || 'Licencia de conducir'}, ${lead.doc2 || 'Talonario reciente'} y ${lead.doc3 || 'Evidencia de dirección'}.`,
    });
};

/**
 * Post-Appointment Email 3: Follow-Up Si No Cierra (Día 7)
 */
export const sendPostAppointmentEmail3 = async (lead: LeadEmailData) => {
    if (!lead.email) return;

    return sendTemplateOrFallback({
        to: lead.email,
        templateId: process.env.TEMPLATE_POST_APPOINTMENT_3,
        dynamicData: {
            nombre: lead.nombre,
            vehiculo: lead.vehiculo || lead.tipo_vehiculo || 'vehículo',
        },
        subject: `Seguimiento final de tu proceso`,
        html: `Hola ${lead.nombre}, seguimos listos para ayudarte a cerrar tu proceso para ${lead.vehiculo || lead.tipo_vehiculo || 'tu vehículo'}.`,
    });
};
