import { EmailRepository, EmailOptions } from '../../domain/repositories';
import { sendPlainEmail } from './SendGridAdapter';

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
