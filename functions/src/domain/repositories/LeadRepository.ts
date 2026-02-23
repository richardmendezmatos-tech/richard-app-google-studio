import { Lead } from '../entities';

export interface LeadRepository {
    getById(id: string): Promise<Lead | null>;
    getHotLeads(limit: number): Promise<Lead[]>;
    update(id: string, data: Partial<Lead>): Promise<void>;
}
