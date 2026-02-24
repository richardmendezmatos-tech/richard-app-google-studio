import * as logger from 'firebase-functions/logger';
import { LeadLifecycleManager } from '../application/use-cases/LeadLifecycleManager';
import { FirestoreCRMRepository } from '../infrastructure/crm/FirestoreCRMRepository';

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
    private static manager = new LeadLifecycleManager(new FirestoreCRMRepository());

    static async processTransition(leadId: string, newState: LeadState): Promise<string> {
        logger.info(`Processing transition for lead ${leadId} to ${newState.status}`);

        const result = await this.manager.processTransition({
            leadId,
            ...newState
        });

        return result.message;
    }
}
