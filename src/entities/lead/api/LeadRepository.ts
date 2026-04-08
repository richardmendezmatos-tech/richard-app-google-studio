import { Lead } from '../model/types';

export interface LeadRepository {
  getLeads(dealerId: string, limitCount: number): Promise<Lead[]>;
  getLeadById(id: string, dealerId: string): Promise<Lead | null>;
  saveLead(lead: Partial<Lead>): Promise<string>;
  updateLead(id: string, data: Partial<Lead>): Promise<void>;
  getLeadVelocity(dealerId: string, hours: number): Promise<number>;
}
