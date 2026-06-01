import { EmailRepository, EmailOptions } from '@/shared/api/repositories/IEmailRepository';
import { sendPlainEmail } from '@/shared/api/communications/SendGridAdapter';

export class SendGridEmailRepository implements EmailRepository {
  async send(options: EmailOptions): Promise<void> {
    // Map domain options to SendGrid service
    await sendPlainEmail(
      options.to,
      options.subject,
      options.text || options.html || '',
      options.html,
    );
  }
}
