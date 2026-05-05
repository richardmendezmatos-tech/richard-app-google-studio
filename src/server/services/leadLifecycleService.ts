import { LeadLifecycleManager } from '../application/use-cases';
import { SupabaseCRMRepository } from '../infrastructure/crm/SupabaseCRMRepository';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiating' | 'sold' | 'lost';

export interface LeadState {
    status: LeadStatus;
    score?: number;
    assignedAgent?: string;
    lossReason?: string;
    saleId?: string;
    amount?: number;
    source?: string;
    timestamp?: Date;
}

/**
 * LeadLifecycleService: Unificación de lógica de estados.
 * Bridge to Clean Architecture Use Case.
 */
export class LeadLifecycleService {
    private static manager = new LeadLifecycleManager(new SupabaseCRMRepository() as any);

    static async processTransition(leadId: string, newState: LeadState): Promise<string> {
        console.log(`Processing transition for lead ${leadId} to ${newState.status}`);

        const result = await this.manager.processTransition({
            leadId,
            ...newState
        } as any);

        if (result.isFailure()) {
            throw result.error;
        }

        return result.value.message;
    }
}

