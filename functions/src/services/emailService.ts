
import * as nodemailer from 'nodemailer';
import { logger } from 'firebase-functions';

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export const sendNotificationEmail = async (payload: EmailPayload) => {
    // 1. Check if SMTP config is present
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn("⚠️ SMTP credentials missing. Email logging only:", payload);
        return;
    }

    // 2. Create Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        // 3. Send Email
        const info = await transporter.sendMail({
            from: `"Richard Automotive AI" <${process.env.SMTP_USER}>`,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
        });

        logger.info(`✅ Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error("❌ Error sending email:", error);
        throw error;
    }
};
