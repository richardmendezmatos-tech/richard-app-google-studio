import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/shared/api/supabase/client';
import { LeadRepository } from '../LeadRepository';
import { Lead } from '../../model/types';
import { LeadSchema } from '@/entities/lead/lib/leadSchema';

function validateLeadInput(data: Partial<Lead> & Record<string, any>): void {
  const payload = {
    firstName: data.first_name || data.firstName || '',
    lastName: data.last_name || data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
  };

  const result = LeadSchema.safeParse(payload);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    if (!payload.phone && !payload.email) {
      throw new Error(`Lead validation failed - missing both phone and email: ${issues}`);
    }
    console.warn(`[SupabaseLeadRepository] Lead validation warnings: ${issues}`);
  }
}

export class SupabaseLeadRepository implements LeadRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    if (client) {
      this.client = client;
    } else {
      this.client = createClient();
    }
  }

  async getLeads(dealerId: string, limitCount: number = 100): Promise<Lead[]> {
    const { data, error } = await this.client
      .from('leads')
      .select('id, first_name, last_name, email, phone, status, location, category, vehicle_id, vehicle_of_interest, behavioral_metrics, ai_analysis, ai_score, created_at, updated_at')
      .eq('location', dealerId)
      .limit(limitCount)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseLeadRepository] Error fetching leads:', error);
      return [];
    }

    return (data || []) as any[];
  }

  async getLeadById(id: string, dealerId: string): Promise<Lead | null> {
    const { data, error } = await this.client.from('leads').select('id, first_name, last_name, email, phone, status, location, category, vehicle_id, vehicle_of_interest, behavioral_metrics, ai_analysis, ai_score, ssn_encrypted, created_at, updated_at').eq('id', id).single();

    if (error) {
      console.error(`[SupabaseLeadRepository] Error fetching lead ${id}:`, error);
      return null;
    }

    return data as any;
  }

  async saveLead(lead: Partial<Lead> & Record<string, any>): Promise<string> {
    validateLeadInput(lead);
    const firstName = lead.first_name || lead.firstName || '';
    const lastName = lead.last_name || lead.lastName || '';
    const email = lead.email || '';
    const phone = lead.phone || '';
    const status = lead.status || 'new';
    const location = lead.location || lead.dealerId || 'richard-automotive';
    const category = lead.category || null;
    const ssn = lead.ssn || null;
    const ssn_encrypted = lead.ssn_encrypted || null;
    const vehicle_id = lead.vehicle_id || lead.vehicleId || lead.vehicleInfo?.id || null;
    const vehicle_of_interest =
      lead.vehicle_of_interest || lead.vehicleOfInterest || lead.vehicleInfo?.name || null;

    const baseKeys = [
      'id',
      'first_name',
      'firstName',
      'last_name',
      'lastName',
      'email',
      'phone',
      'status',
      'location',
      'dealerId',
      'category',
      'ssn',
      'ssn_encrypted',
      'vehicle_id',
      'vehicleId',
      'vehicle_of_interest',
      'vehicleOfInterest',
      'vehicleInfo',
      'behavioral_metrics',
      'behavioralMetrics',
      'customer_memory',
      'customerMemory',
      'ai_analysis',
      'aiAnalysis',
      'created_at',
      'createdAt',
    ];

    const extraData: Record<string, any> = {};
    for (const key of Object.keys(lead)) {
      if (!baseKeys.includes(key)) {
        extraData[key] = lead[key];
      }
    }

    const behavioral_metrics = {
      source: lead.type || 'web',
      notes: lead.notes || '',
      ...extraData,
      ...(lead.behavioral_metrics || lead.behavioralMetrics || {}),
    };

    const customer_memory = lead.customer_memory || lead.customerMemory || null;
    const ai_analysis = lead.ai_analysis || lead.aiAnalysis || null;

    const dbPayload: any = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      status,
      location,
      category,
      ssn,
      ssn_encrypted,
      vehicle_id,
      vehicle_of_interest,
      behavioral_metrics,
      customer_memory,
      ai_analysis,
      created_at: lead.created_at || lead.createdAt || new Date().toISOString(),
    };

    if (lead.id) {
      dbPayload.id = lead.id;
    }

    const { data, error } = await this.client
      .from('leads')
      .insert([dbPayload])
      .select('id')
      .single();

    if (error) {
      console.error('[SupabaseLeadRepository] Error saving lead:', error);
      throw error;
    }

    return data.id;
  }

  async updateLead(id: string, data: Partial<Lead> & Record<string, any>): Promise<void> {
    const dbUpdates: any = {};

    if ('firstName' in data || 'first_name' in data)
      dbUpdates.first_name = data.firstName || data.first_name;
    if ('lastName' in data || 'last_name' in data)
      dbUpdates.last_name = data.lastName || data.last_name;
    if ('email' in data) dbUpdates.email = data.email;
    if ('phone' in data) dbUpdates.phone = data.phone;
    if ('status' in data) dbUpdates.status = data.status;
    if ('category' in data) dbUpdates.category = data.category;
    if ('ssn' in data) dbUpdates.ssn = data.ssn;
    if ('ssn_encrypted' in data) dbUpdates.ssn_encrypted = data.ssn_encrypted;
    if ('vehicleId' in data || 'vehicle_id' in data)
      dbUpdates.vehicle_id = data.vehicleId || data.vehicle_id;
    if ('vehicleOfInterest' in data || 'vehicle_of_interest' in data)
      dbUpdates.vehicle_of_interest = data.vehicleOfInterest || data.vehicle_of_interest;
    if ('customerMemory' in data || 'customer_memory' in data)
      dbUpdates.customer_memory = data.customerMemory || data.customer_memory;
    if ('aiAnalysis' in data || 'ai_analysis' in data)
      dbUpdates.ai_analysis = data.aiAnalysis || data.ai_analysis;
    if ('behavioralMetrics' in data || 'behavioral_metrics' in data)
      dbUpdates.behavioral_metrics = data.behavioralMetrics || data.behavioral_metrics;

    if (Object.keys(dbUpdates).length === 0) return;

    const { error } = await this.client.from('leads').update(dbUpdates).eq('id', id);

    if (error) {
      console.error(`[SupabaseLeadRepository] Error updating lead ${id}:`, error);
      throw error;
    }
  }

  async getLeadVelocity(dealerId: string, hours: number): Promise<number> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const { count, error } = await this.client
      .from('leads')
      .select('id', { count: 'estimated', head: true })
      .eq('location', dealerId)
      .gte('created_at', since);

    if (error) {
      console.error('[SupabaseLeadRepository] Error fetching lead velocity:', error);
      return 0;
    }

    return count || 0;
  }

  async getAverageAIScore(dealerId: string): Promise<number> {
    // This requires a more complex query if the score is inside a JSONB field.
    // Assuming score is a top-level column for now, or just return mock.
    return 85;
  }
}
