import { EmailRepository, EmailOptions } from '../../../domain/repositories';

/**
 * Use Case: Send Notification
 * Handles the business logic of when and how to notify users/leads.
 */
export class SendNotification {
    constructor(private emailRepository: EmailRepository) { }

    async execute(options: EmailOptions): Promise<void> {
        // Business Rules:
        // 1. Ensure 'from' is set to the default brand email if not provided
        const finalOptions = {
            ...options,
            from: options.from || 'contacto@richardmendezmatos.tech'
        };

        // 2. Potentially log notification in an Audit Log (Domain logic)
        console.log(`[NOTIF] Sending email to ${options.to}: ${options.subject}`);

        return this.emailRepository.send(finalOptions);
    }
}
