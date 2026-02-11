import sgMail from '@sendgrid/mail';
import { logger } from 'firebase-functions';
import nodemailer from 'nodemailer';

let sendGridInitialized = false;
let smtpTransport: nodemailer.Transporter | null = null;

const ensureSendGridConfigured = () => {
    if (sendGridInitialized) return;

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
        throw new Error('SendGrid not configured');
    }

    sgMail.setApiKey(apiKey);
    sendGridInitialized = true;
};

const ensureSmtpTransport = () => {
    if (smtpTransport) return smtpTransport;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error('SMTP not configured');
    }

    smtpTransport = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
    return smtpTransport;
};

const getSender = () => ({
    email: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER || 'richard@richardautomotive.com',
    name: process.env.SENDGRID_FROM_NAME || 'Richard Mendez - Richard Automotive',
});

const trySmtpFallback = async (to: string, subject: string, html: string, text?: string) => {
    const transport = ensureSmtpTransport();
    const from = getSender();

    const info = await transport.sendMail({
        from: `"${from.name}" <${from.email}>`,
        to,
        subject,
        text: text || html,
        html,
    });

    logger.info(`✅ SMTP fallback email sent to ${to}`, {
        messageId: info.messageId,
    });
    return info;
};

export interface SendEmailParams {
    to: string;
    templateId: string;
    dynamicData: Record<string, any>;
    trackingSettings?: {
        clickTracking?: boolean;
        openTracking?: boolean;
    };
}

/**
 * Send email using SendGrid dynamic template
 */
export const sendTemplateEmail = async (params: SendEmailParams) => {
    const { to, templateId, dynamicData, trackingSettings } = params;

    try {
        ensureSendGridConfigured();
    } catch (error) {
        logger.error('Cannot send email: SENDGRID_API_KEY not configured');
        throw error;
    }

    const from = getSender();
    const msg = {
        to,
        from,
        templateId,
        dynamicTemplateData: dynamicData,
        trackingSettings: {
            clickTracking: {
                enable: trackingSettings?.clickTracking ?? true,
            },
            openTracking: {
                enable: trackingSettings?.openTracking ?? true,
            },
        },
    };

    try {
        const [response] = await sgMail.send(msg);
        logger.info(`✅ Email sent to ${to} using template ${templateId}`, {
            statusCode: response.statusCode,
            messageId: response.headers['x-message-id'],
        });
        return response;
    } catch (error: any) {
        logger.error(`❌ Error sending email to ${to}:`, {
            error: error.response?.body || error.message,
            templateId,
        });
        const fallbackHtml = `
          <h2>Richard Automotive</h2>
          <p>Te compartimos la siguiente información:</p>
          <pre>${JSON.stringify(dynamicData, null, 2)}</pre>
        `;
        return trySmtpFallback(
            to,
            'Actualizacion de Richard Automotive',
            fallbackHtml,
            `Richard Automotive: ${JSON.stringify(dynamicData)}`
        );
    }
};

/**
 * Send plain text email (for testing or fallback)
 */
export const sendPlainEmail = async (
    to: string,
    subject: string,
    text: string,
    html?: string
) => {
    try {
        ensureSendGridConfigured();
    } catch (error) {
        logger.error('Cannot send email: SENDGRID_API_KEY not configured');
        throw error;
    }

    const from = getSender();
    const msg = {
        to,
        from,
        subject,
        text,
        html: html || text,
    };

    try {
        const [response] = await sgMail.send(msg);
        logger.info(`✅ Plain email sent to ${to}`, {
            subject,
            statusCode: response.statusCode,
        });
        return response;
    } catch (error: any) {
        logger.error(`❌ Error sending plain email to ${to}:`, error.response?.body || error);
        return trySmtpFallback(to, subject, html || text, text);
    }
};
