import { listLeads, ListLeadsVariables, getLead, createLead, updateLeadStatus, CreateLeadVariables } from '@dataconnect/generated';
import { LeadRepository } from '../LeadRepository';
import { Lead } from '../../model/types';
import { v4 as uuidv4 } from 'uuid'; // Fallback if necessary

export class DataConnectLeadRepository implements LeadRepository {
  async getLeads(dealerId: string, limit: number): Promise<Lead[]> {
    try {
      const vars: ListLeadsVariables = {
        dealerId,
        limit,
        offset: 0,
      };
      const response = await listLeads(vars);
      return response.data.leads.map(this.mapSqlToDomain);
    } catch (error) {
      console.error('[DataConnectLeadRepository] Error fetching leads:', error);
      return [];
    }
  }

  async getLeadById(id: string, dealerId: string): Promise<Lead | null> {
    try {
      const response = await getLead({ id });
      const lead = response.data.lead;
      if (!lead || lead.dealerId !== dealerId) return null;
      return this.mapSqlToDomain(lead);
    } catch (error) {
      console.error('[DataConnectLeadRepository] Error fetching lead:', error);
      return null;
    }
  }

  async saveLead(lead: Partial<Lead>): Promise<string> {
    try {
      const vars: CreateLeadVariables = {
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        phone: lead.phone || '',
        email: lead.email || '',
        vehicleOfInterest: lead.vehicleOfInterest,
        vehicleId: lead.vehicleId,
        type: lead.type,
        behavioralData: lead.behavioralFingerprint ? JSON.stringify(lead.behavioralFingerprint) : undefined,
        aiAnalysis: lead.aiAnalysis ? JSON.stringify(lead.aiAnalysis) : undefined,
        marketingData: lead.marketingData ? JSON.stringify(lead.marketingData) : undefined,
        closureProbability: lead.closureProbability || 0,
        totalVisits: lead.behavioralMetrics?.inventoryViews || 1,
      };
      
      const res = await createLead(vars);
      return res.data.lead_insert.id;
    } catch (error) {
      console.error('[DataConnectLeadRepository] Error saving lead:', error);
      throw error;
    }
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    try {
      // In the current schema we just have UpdateLeadStatus in mutations.gql
      // If we need to update other fields, we should expand the mutation.
      // For now, if status is provided, we update it.
      if (data.status) {
        await updateLeadStatus({ id, status: data.status });
      } else {
        console.warn(`[DataConnectLeadRepository] UpdateLead for ${id} called but no status provided. Generic updates not fully mapped in schema yet.`);
      }
    } catch (error) {
      console.error('[DataConnectLeadRepository] Error updating lead:', error);
      throw error;
    }
  }

  async getLeadVelocity(dealerId: string, hours: number): Promise<number> {
    // For SQL, calculate the number of leads in the last X hours divided by X
    // Returning 0 until custom GraphQL aggregation or client-side calculation is applied.
    try {
       const leads = await this.getLeads(dealerId, 100);
       const now = Date.now();
       const msInHours = hours * 60 * 60 * 1000;
       
       let count = 0;
       for (const lead of leads) {
          const pastTime = lead.timestamp?.toMillis ? lead.timestamp.toMillis() : (lead.timestamp?.seconds ? lead.timestamp.seconds * 1000 : 0);
          if (now - pastTime <= msInHours) {
            count++;
          }
       }
       return parseFloat((count / hours).toFixed(2)) || 0;
    } catch (e) {
      return 0;
    }
  }

  async getAverageAIScore(dealerId: string): Promise<number> {
    try {
       const leads = await this.getLeads(dealerId, 50);
       if (leads.length === 0) return 0;
       const totalScore = leads.reduce((sum, current) => sum + (current.aiScore || 0), 0);
       return parseFloat((totalScore / leads.length).toFixed(2));
    } catch (e) {
      return 0;
    }
  }

  private mapSqlToDomain(sqlLead: any): Lead {
    let behavioralFingerprint;
    try { 
      behavioralFingerprint = sqlLead.behavioralData ? JSON.parse(sqlLead.behavioralData) : undefined; 
    } catch (e) {
      console.debug('Failed to parse behavioralData', e);
    }

    let aiAnalysis;
    try { 
      aiAnalysis = sqlLead.aiAnalysis ? JSON.parse(sqlLead.aiAnalysis) : undefined; 
    } catch (e) {
      console.debug('Failed to parse aiAnalysis', e);
    }

    let marketingData;
    try { 
      marketingData = sqlLead.marketingData ? JSON.parse(sqlLead.marketingData) : undefined; 
    } catch (e) {
      console.debug('Failed to parse marketingData', e);
    }

    return {
      id: sqlLead.id,
      firstName: sqlLead.firstName,
      lastName: sqlLead.lastName,
      phone: sqlLead.phone,
      email: sqlLead.email,
      type: sqlLead.type || 'general',
      status: sqlLead.status || 'new',
      category: sqlLead.category,
      vehicleOfInterest: sqlLead.vehicleOfInterest,
      vehicleId: sqlLead.vehicleId,
      timestamp: sqlLead.timestamp ? { toMillis: () => new Date(sqlLead.timestamp).getTime() } as any : undefined,
      behavioralFingerprint,
      aiAnalysis,
      marketingData,
      closureProbability: sqlLead.closureProbability,
      aiScore: aiAnalysis?.score,
      responded: sqlLead.responded,
      documentsSent: sqlLead.documentsSent,
      dealClosed: sqlLead.dealClosed,
      appointmentCompleted: sqlLead.appointmentCompleted,
      chatInteractions: sqlLead.chatInteractions,
      hasPronto: sqlLead.hasPronto,
      displayName: `${sqlLead.firstName} ${sqlLead.lastName}`.trim(),
    } as Lead;
  }
}
