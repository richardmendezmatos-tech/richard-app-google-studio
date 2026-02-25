import { Lead } from '../entities';

export interface LeadRepository {
    getById(id: string): Promise<Lead | null>;
    getHotLeads(limit: number): Promise<Lead[]>;
    getStaleLeads(days: number, limit: number): Promise<Lead[]>;
    getLeadsByVehicleId(vehicleId: string): Promise<Lead[]>;
    updateLead(id: string, data: Partial<Lead>): Promise<void>;
    create(data: Lead): Promise<string>;
    getLeadsByEmailSequenceStatus(
        field: string,
        value: any,
        operator: '<=' | '==' | '!=' | '>=',
        limit: number
    ): Promise<Lead[]>;
    getGarageByUserId(userId: string): Promise<any[]>;
}
