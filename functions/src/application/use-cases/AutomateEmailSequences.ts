import { LeadRepository } from '../../domain/repositories/LeadRepository';
import { EmailRepository } from '../../domain/repositories/EmailRepository';

export class AutomateEmailSequences {
    constructor(
        private leadRepo: LeadRepository,
        private emailRepo: EmailRepository
    ) { }

    async execute(): Promise<void> {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        await Promise.all([
            this.processSequence('createdAt', oneDayAgo, '<=', 'welcome2'),
            this.processSequence('createdAt', threeDaysAgo, '<=', 'welcome3'),
            this.processSequence('createdAt', fiveDaysAgo, '<=', 'welcome4'),
            this.processSequence('emailSequence.lastEmailSentAt', thirtyDaysAgo, '<=', 'reengagement1'),
            this.processSequence('emailSequence.postAppointment1SentAt', oneDayAgo, '<=', 'postAppointment2'),
            this.processSequence('emailSequence.postAppointment1SentAt', sevenDaysAgo, '<=', 'postAppointment3'),
        ]);
    }

    private async processSequence(field: string, threshold: Date, op: '<=' | '==' | '!=' | '>=', type: string) {
        const leads = await this.leadRepo.getLeadsByEmailSequenceStatus(field, threshold, op, 50);

        for (const lead of leads) {
            if (lead.responded) continue;

            try {
                // orchestration logic here
                console.log(`Processing ${type} for lead ${lead.id}. Repository used: ${this.emailRepo}`);
            } catch (e) {
                console.error(`Error processing ${type} for ${lead.id}`, e);
            }
        }
    }
}
