import { LeadStatus } from '../types';

export interface LeadTransition {
    leadId: string;
    fromStatus: string;
    toStatus: LeadStatus;
    timestamp: Date;
    score?: number;
    metadata?: Record<string, any>;
}

export interface CRMRepository {
    recordTransition(transition: LeadTransition): Promise<void>;
    syncSalesData(leadId: string, saleData: any): Promise<void>;
}
