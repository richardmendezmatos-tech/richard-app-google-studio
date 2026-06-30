import { supabase } from '@/shared/api/supabase/supabase';
import { Lead } from '@/shared/types/types';
import { hubspotService } from '@/shared/api/hubspot/HubSpotClient';
import { extractMarketingData } from './marketingCaptureService';
import { dispatchLeadToWebhook } from '@/shared/api/communications/webhookService';
import { sendWhatsAppRetargeting } from '@/shared/api/communications/whatsappService';
import { leadIntelligenceService } from './leadIntelligenceService';
import { sendTransactionalEmail } from '@/shared/api/communications/emailService';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- valida con el Zod LeadSchema del dominio; deuda conocida, reubicar a entities/lead o features/leads
import { LeadSchema } from '@/entities/lead/lib/leadSchema';

export type { Lead };

const LEADS_TABLE = 'leads';

function validateLeadInput(data: Record<string, any>): void {
  const payload = {
    firstName: data.firstName || data.name?.split(' ')[0] || '',
    lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || '',
    email: data.email || '',
    phone: data.phone || '',
  };
  const result = LeadSchema.safeParse(payload);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    if (!payload.phone && !payload.email) {
      throw new Error(`Lead validation failed - missing both phone and email: ${issues}`);
    }
    console.warn(`[CRM] Lead validation warnings: ${issues}`);
  }
}

/**
 * Adds a new lead to Supabase
 */
export const addLead = async (lead: Omit<Lead, 'id' | 'status' | 'createdAt'>): Promise<string> => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');

    validateLeadInput(lead as any);

    // Support both { firstName, lastName } and { name } call patterns
    let firstName = (lead as any).firstName || '';
    let lastName = (lead as any).lastName || '';
    if (!firstName && (lead as any).name) {
      const parts = ((lead as any).name as string).trim().split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    // Determine category from notes or explicit field
    const notes = (lead as any).notes || '';
    let category = (lead as any).category || 'WARM';

    // Ford-First: Auto-escalar leads con interés en Ford a HIGH-YIELD
    const vehicleOfInterest = (lead as any).vehicleOfInterest || (lead as any).vehicle_of_interest || '';
    if (vehicleOfInterest.toLowerCase().includes('ford') || notes.toLowerCase().includes('ford')) {
      category = 'HIGH-YIELD';
    }

    const { data, error } = await supabase
      .from(LEADS_TABLE)
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone: lead.phone || '',
        email: lead.email || '',
        vehicle_id: (lead as any).vehicleId || null,
        vehicle_of_interest:
          (lead as any).vehicleOfInterest || (lead as any).vehicle_of_interest || null,
        category,
        status: 'new',
        behavioral_metrics: { source: (lead as any).type || 'web', notes },
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    console.log('[CRM] ✅ Lead guardado en Supabase:', data.id);

    const newLead = { ...lead, id: data.id, status: 'new' } as Lead;

    // HubSpot Sync
    hubspotService
      .syncLeadToHubSpot(newLead)
      .catch((e) => console.error('HubSpot async sync failed', e));

    // Automation / Meta CAPI Webhook Sync
    dispatchLeadToWebhook(newLead).catch((e) => console.error('Webhook async sync failed', e));

    // WhatsApp Retargeting (Sentinel Funnel Optimization)
    sendWhatsAppRetargeting(newLead).catch((e) => console.error('WhatsApp dispatch failed', e));

    // Sentinel Lead Intelligence Enrichment (Asynchronous)
    leadIntelligenceService
      .enrichLead(
        data.id,
        (lead as any).vehicleOfInterest || (lead as any).vehicle_of_interest,
        notes,
      )
      .catch((e: any) => console.error('[CRM] Intelligence Enrichment failed', e));

    // Real-time Email Notification to Richard
    const richardEmail =
      process.env.VITE_RICHARD_NOTIFICATION_EMAIL || 'richardmendezmatos@gmail.com';
    sendTransactionalEmail({
      to: richardEmail,
      subject: `🚨 ¡NUEVO LEAD ENTRANDO! - ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0b1116; color: #fff; padding: 30px; border-radius: 16px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
          <h2 style="color: #00aed9; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 15px; letter-spacing: 0.05em;">
            🚨 Richard Automotive Command Center
          </h2>
          <p style="font-size: 16px; font-weight: bold; margin-bottom: 25px; color: #cbd5e1; text-align: center;">
            Un nuevo cliente potencial acaba de registrarse en la plataforma.
          </p>
          
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <p style="margin: 8px 0; font-size: 14px; color: #fff;"><strong style="color: #00aed9; font-weight: 900;">Nombre:</strong> ${firstName} ${lastName}</p>
            <p style="margin: 8px 0; font-size: 14px; color: #fff;"><strong style="color: #00aed9; font-weight: 900;">Teléfono:</strong> <a href="tel:${lead.phone}" style="color: #38bdf8; text-decoration: none;">${lead.phone}</a></p>
            <p style="margin: 8px 0; font-size: 14px; color: #fff;"><strong style="color: #00aed9; font-weight: 900;">Correo:</strong> <a href="mailto:${lead.email}" style="color: #38bdf8; text-decoration: none;">${lead.email}</a></p>
            <p style="margin: 8px 0; font-size: 14px; color: #fff;"><strong style="color: #00aed9; font-weight: 900;">Unidad de Interés:</strong> ${(lead as any).vehicleOfInterest || (lead as any).vehicle_of_interest || 'Ninguna seleccionada'}</p>
            <p style="margin: 8px 0; font-size: 14px; color: #fff;"><strong style="color: #00aed9; font-weight: 900;">Categoría:</strong> ${category || 'WARM'}</p>
          </div>
          
          ${
            notes
              ? `
          <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); padding: 15px; border-radius: 12px; margin-bottom: 25px;">
            <p style="margin: 0; font-size: 13px; color: #f59e0b; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Notas / Contexto:</p>
            <p style="margin: 0; font-size: 13px; color: #f59e0b; font-style: italic; line-height: 1.5;">${notes}</p>
          </div>
          `
              : ''
          }
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://richard-automotive-command-center.vercel.app/admin" style="background-color: #00aed9; color: #000; padding: 15px 35px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; box-shadow: 0 4px 15px rgba(0, 174, 217, 0.3);">
              Ir a la Bóveda del Command Center
            </a>
          </div>
          
          <p style="font-size: 10px; color: #475569; text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
            Enviado de forma segura por el Núcleo de Inteligencia Artificial Sentinel de Richard Automotive.
          </p>
        </div>
      `,
    }).catch((e) => console.error('[CRM] Failed to send email alert to Richard:', e));

    return data.id;
  } catch (error) {
    console.error('[CRM] ❌ Error adding lead:', error);
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
  const { data: lead } = await supabase
    .from(LEADS_TABLE)
    .select('customer_memory')
    .eq('id', leadId)
    .single();
  const currentMemory = lead?.customer_memory || {};

  await supabase
    .from(LEADS_TABLE)
    .update({
      customer_memory: {
        ...currentMemory,
        l1_reactive: { ...(currentMemory.l1_reactive || {}), ...l1Data, activeContext: true },
      },
    })
    .eq('id', leadId);
};

export const subscribeToLeads = (callback: (leads: Lead[]) => void) => {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('leads-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: LEADS_TABLE }, async () => {
      const { data } = await supabase
        .from(LEADS_TABLE)
        .select('id, first_name, last_name, email, phone, status, created_at, customer_memory, ai_analysis')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) {
        callback(
          data.map(
            (d) =>
              ({
                id: d.id,
                firstName: d.first_name,
                lastName: d.last_name,
                email: d.email,
                phone: d.phone,
                status: d.status,
                createdAt: d.created_at,
                customerMemory: d.customer_memory,
                aiAnalysis: d.ai_analysis,
              }) as any,
          ),
        );
      }
    })
    .subscribe();

  // Initial fetch
  supabase
    .from(LEADS_TABLE)
    .select('id, first_name, last_name, email, phone, status, created_at, customer_memory, ai_analysis')
    .order('created_at', { ascending: false })
    .limit(50)
    .then(({ data }) => {
      if (data) {
        callback(
          data.map(
            (d) =>
              ({
                id: d.id,
                firstName: d.first_name,
                lastName: d.last_name,
                email: d.email,
                phone: d.phone,
                status: d.status,
                createdAt: d.created_at,
                customerMemory: d.customer_memory,
                aiAnalysis: d.ai_analysis,
              }) as any,
          ),
        );
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
