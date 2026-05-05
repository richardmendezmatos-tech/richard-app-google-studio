import { EmailRepository, EmailOptions } from '../../domain/repositories/EmailRepository';
import { sendPlainEmail } from '../../services/sendgridService';

export class SendGridEmailRepository implements EmailRepository {
    async send(options: EmailOptions): Promise<void> {
        // Map domain options to SendGrid service
        await sendPlainEmail(
            options.to,
            options.subject,
            options.text || options.html || '',
            options.html
        );
    }
}
