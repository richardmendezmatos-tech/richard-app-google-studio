import { Lead, updateLead } from '@/features/leads/services/crmService';
import { whatsappService } from './whatsappService';
import { sendTransactionalEmail } from './emailService';
import { getAntigravityOutreachAction } from './antigravityOmnichannelService';
import nurtureRules from '@/features/leads/data/nurtureRules.json';

/**
 * Automation Service
 * Handles background nurturing sequences for leads.
 */
class AutomationService {
    private async dispatchOutreach(lead: Lead, message: string, subject?: string): Promise<{ success: boolean; channel: 'whatsapp' | 'email' }> {
        const antigravityAction = await getAntigravityOutreachAction(lead, {
            trigger: 'nurture',
            fallbackMessage: message,
            fallbackChannel: lead.phone ? 'whatsapp' : 'email'
        });

        const preferredChannel = antigravityAction?.channel || (lead.phone ? 'whatsapp' : 'email');
        const finalMessage = antigravityAction?.message || message;
        const finalSubject = antigravityAction?.subject || subject || 'Seguimiento Richard Automotive';

        if (preferredChannel === 'email' && lead.email) {
            const sent = await sendTransactionalEmail({
                to: lead.email,
                subject: finalSubject,
                html: `<p>${finalMessage}</p>`
            });

            if (sent) return { success: true, channel: 'email' };
        }

        if (lead.phone) {
            const sent = await whatsappService.sendMessage(lead.phone, finalMessage);
            return { success: sent, channel: 'whatsapp' };
        }

        if (lead.email) {
            const sent = await sendTransactionalEmail({
                to: lead.email,
                subject: finalSubject,
                html: `<p>${finalMessage}</p>`
            });
            return { success: sent, channel: 'email' };
        }

        return { success: false, channel: preferredChannel };
    }

    /**
     * Evaluates and triggers pending automation for a lead.
     * In a real production app, this would be triggered by a Cloud Function CRON job.
     */
    async processLeadNurturing(lead: Lead): Promise<void> {
        const now = Date.now();

        let createdAtTime: number;
        const rawCreatedAt = lead.createdAt as unknown;
        if (rawCreatedAt && typeof (rawCreatedAt as { toDate: () => { getTime: () => number } }).toDate === 'function') {
            createdAtTime = (rawCreatedAt as { toDate: () => { getTime: () => number } }).toDate().getTime();
        } else if (rawCreatedAt && typeof (rawCreatedAt as { seconds: number }).seconds === 'number') {
            createdAtTime = (rawCreatedAt as { seconds: number }).seconds * 1000;
        } else {
            createdAtTime = now;
        }

        const daysSinceCreation = Math.floor((now - createdAtTime) / (1000 * 60 * 60 * 24));

        for (const rule of nurtureRules) {
            if (daysSinceCreation >= rule.delayDays) {
                // Heuristic check: Ensure we don't send the same step twice
                const stepKey = `nurture_${rule.id}` as keyof Lead;
                if (!lead[stepKey]) {
                    console.log(`[Automation] Triggering ${rule.id} for ${lead.name}`);

                    const message = rule.template
                        .replace('{name}', lead.name || 'cliente')
                        .replace('{vehicle}', lead.vehicleOfInterest || 'tu próximo auto');

                    const subject = `Seguimiento ${rule.delayDays}d: ${lead.vehicleOfInterest || 'Tu próximo auto'}`;
                    const { success, channel } = await this.dispatchOutreach(lead, message, subject);

                    if (success) {
                        // Mark as sent in Firestore
                        await updateLead(lead.id || '', {
                            [stepKey]: true,
                            emailSent: channel === 'email' ? true : (lead.emailSent || false),
                            nudgeSent: channel === 'whatsapp' ? true : (lead.nudgeSent || false),
                            lastContacted: { seconds: Math.floor(now / 1000), nanoseconds: 0 }
                        } as Partial<Lead>);
                    }
                }
            }
        }
    }
}

export const automationService = new AutomationService();
