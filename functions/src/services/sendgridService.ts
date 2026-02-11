import sgMail from '@sendgrid/mail';
import { logger } from 'firebase-functions';

let sendGridInitialized = false;

const ensureSendGridConfigured = () => {
    if (sendGridInitialized) return;

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
        throw new Error('SendGrid not configured');
    }

    sgMail.setApiKey(apiKey);
    sendGridInitialized = true;
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

    const msg = {
        to,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'richard@richardautomotive.com',
            name: process.env.SENDGRID_FROM_NAME || 'Richard Méndez - Richard Automotive',
        },
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
        throw error;
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

    const msg = {
        to,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'richard@richardautomotive.com',
            name: process.env.SENDGRID_FROM_NAME || 'Richard Méndez',
        },
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
        throw error;
    }
};
