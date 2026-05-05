import { supabase } from '@/shared/api/supabase/supabaseClient';
import { Lead } from '@/shared/types/types';
import { hubspotService } from '@/shared/api/hubspot/HubSpotClient';
import { extractMarketingData } from './marketingCaptureService';
import { dispatchLeadToWebhook } from '@/shared/api/communications/webhookService';
import { sendWhatsAppRetargeting } from '@/shared/api/communications/whatsappService';

export type { Lead };

const LEADS_TABLE = 'leads';

/**
 * Adds a new lead to Supabase
 */
export const addLead = async (lead: Omit<Lead, 'id' | 'status' | 'createdAt'>): Promise<string> => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const marketingData = extractMarketingData();

    const { data, error } = await supabase.from(LEADS_TABLE).insert({
      first_name: lead.firstName || '',
      last_name: lead.lastName || '',
      phone: lead.phone || '',
      email: lead.email || '',
      vehicle_id: lead.vehicleId,
      marketing_data: marketingData,
      status: 'new',
      created_at: new Date().toISOString(),
    }).select('id').single();

    if (error) throw error;
    console.log('Lead added successfully to Supabase');

    const newLead = { ...lead, marketingData, id: data.id, status: 'new' } as Lead;

    // HubSpot Sync
    hubspotService
      .syncLeadToHubSpot(newLead)
      .catch((e) => console.error('HubSpot async sync failed', e));

    // Automation / Meta CAPI Webhook Sync
    dispatchLeadToWebhook(newLead).catch((e) => console.error('Webhook async sync failed', e));

    // WhatsApp Retargeting (Sentinel Funnel Optimization)
    sendWhatsAppRetargeting(newLead).catch((e) => console.error('WhatsApp dispatch failed', e));

    return data.id;
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
};

/**
 * Updates any field of a lead
 */
export const updateLead = async (leadId: string, updates: Partial<Lead>) => {
  try {
    if (!supabase) return;
    
    // Map CamelCase to SnakeCase for DB
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.aiScore) dbUpdates.ai_analysis = { score: updates.aiScore };
    if (updates.customerMemory) dbUpdates.customer_memory = updates.customerMemory;

    const { error } = await supabase.from(LEADS_TABLE).update(dbUpdates).eq('id', leadId);
    if (error) throw error;

    // HubSpot Sync
    if (updates.email || updates.aiScore || updates.customerMemory || updates.status) {
      hubspotService.syncLeadToHubSpot({ id: leadId, ...updates } as Lead).catch(console.error);
    }
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
};

/**
 * Updates the status of a lead (e.g. dragging card in Kanban)
 */
export const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
  await updateLead(leadId, { status: newStatus });
};

/**
 * CMS - Continuum Memory System refactored for Supabase
 */
export const updateLeadL1Memory = async (leadId: string, l1Data: any) => {
  if (!supabase) return;
  const { data: lead } = await supabase.from(LEADS_TABLE).select('customer_memory').eq('id', leadId).single();
  const currentMemory = lead?.customer_memory || {};

  await supabase.from(LEADS_TABLE).update({
    customer_memory: {
      ...currentMemory,
      l1_reactive: { ...(currentMemory.l1_reactive || {}), ...l1Data, activeContext: true }
    }
  }).eq('id', leadId);
};

export const subscribeToLeads = (callback: (leads: Lead[]) => void) => {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('leads-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: LEADS_TABLE }, async () => {
      const { data } = await supabase.from(LEADS_TABLE).select('*').order('created_at', { ascending: false }).limit(50);
      if (data) {
        callback(data.map(d => ({
          id: d.id,
          firstName: d.first_name,
          lastName: d.last_name,
          email: d.email,
          phone: d.phone,
          status: d.status,
          createdAt: d.created_at,
          customerMemory: d.customer_memory
        } as any)));
      }
    })
    .subscribe();

  // Initial fetch
  supabase.from(LEADS_TABLE).select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => {
    if (data) {
      callback(data.map(d => ({
        id: d.id,
        firstName: d.first_name,
        lastName: d.last_name,
        email: d.email,
        phone: d.phone,
        status: d.status,
        createdAt: d.created_at,
        customerMemory: d.customer_memory
      } as any)));
    }
  });

  return () => {
    supabase.removeChannel(channel);
  };
};

export const getSecureLeadData = async (leadId: string) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from(LEADS_TABLE).select('ssn').eq('id', leadId).single();
  if (error) throw error;
  return data;
};

