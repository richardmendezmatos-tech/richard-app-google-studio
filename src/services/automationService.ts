import { Lead, updateLead } from '@/features/leads/services/crmService';
import { whatsappService } from './whatsappService';
import nurtureRules from '@/features/leads/data/nurtureRules.json';

/**
 * Automation Service
 * Handles background nurturing sequences for leads.
 */
class AutomationService {
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

                    const success = await whatsappService.sendMessage(lead.phone || '', message);

                    if (success) {
                        // Mark as sent in Firestore
                        await updateLead(lead.id || '', {
                            [stepKey]: true,
                            lastContacted: { seconds: Math.floor(now / 1000), nanoseconds: 0 }
                        } as Partial<Lead>);
                    }
                }
            }
        }
    }
}

export const automationService = new AutomationService();
