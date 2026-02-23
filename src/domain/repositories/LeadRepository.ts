import { Lead } from '../entities';

export interface LeadRepository {
    getLeads(dealerId: string, limitCount: number): Promise<Lead[]>;
    getLeadById(id: string): Promise<Lead | null>;
    saveLead(lead: Partial<Lead>): Promise<string>;
    updateLead(id: string, data: Partial<Lead>): Promise<void>;
}
