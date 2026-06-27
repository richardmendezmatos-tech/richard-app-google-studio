import { WhatsAppRepository } from '@/shared/api/repositories/IWhatsAppRepository';
import { generateObject } from 'ai';
import { z } from 'zod';
import { gemini15Flash } from '@/features/ai-hub/api/aiManager';
import { WHATSAPP_AGENT_SYSTEM_PROMPT, buildWhatsAppUserPrompt } from './WhatsAppAgent.prompt';
import { conversationMemory } from '@/shared/api/ai/conversationMemory';
import { houstonHandoffService } from '@/features/houston/api/HoustonHandoffService';

// SDK Removed due to Firebase Cloud Functions PEER conflicts
// Using pure HTTP fetch for Composio interactions
async function syncToHubspot(data: any): Promise<void> {
  try {
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (!apiKey) return;

    const headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey };

    await fetch('https://api.composio.dev/v1/actions/execute', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'HUBSPOT_CREATE_CONTACT',
        input: { properties: { phone: data.phone, firstname: data.name || 'WhatsApp Lead', lifecyclestage: 'lead' } },
      }),
    });

    await fetch('https://api.composio.dev/v1/actions/execute', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'HUBSPOT_CREATE_DEAL',
        input: {
          properties: {
            dealname: `WhatsApp Lead - ${data.suggestedVehicle || 'Auto'}`,
            dealstage: 'appointmentscheduled',
            pipeline: 'default',
            amount: data.budget ? String(data.budget) : '',
          },
        },
      }),
    });
  } catch (err: any) {
    console.error('[Composio:HubSpot] Error:', err.message || err);
  }
}

const WhatsAppResponseSchema = z.object({
  reply: z.string().describe('Tu mensaje para el cliente. Máximo 280 caracteres, tono boricua ejecutivo.'),
  intentLevel: z.enum(['low', 'medium', 'high', 'appointment_ready']),
  hasTradeIn: z.boolean().nullable().describe('null si no se mencionó trade-in'),
  budget: z.string().nullable().describe('Rango de presupuesto extraído, null si no se mencionó'),
  suggestedVehicle: z.string().nullable().describe('Vehículo del inventario que sugieres, null si no aplica'),
  needsHumanHandoff: z.boolean().describe('true si el cliente pide un humano o está frustrado'),
});

export type WhatsAppResponse = z.infer<typeof WhatsAppResponseSchema>;

export interface WhatsAppAgentInput {
  leadId: string;
  message: string;
  customerContext?: any;
  from: string;
}

export interface WhatsAppAgentOutput {
  reply: string;
  nextStage: string;
  needsHumanHandoff: boolean;
  hubspotData?: {
    hasTradeIn?: boolean | null;
    budget?: string | null;
    intentLevel?: string;
    suggestedVehicle?: string | null;
  };
}

export class WhatsAppAgent {
  constructor(private repo: WhatsAppRepository) {}

  async execute(input: WhatsAppAgentInput): Promise<WhatsAppAgentOutput> {
    const sequence = await this.repo.getSequence(input.leadId);

    // Load real conversation history from DB for better context
    const history = await conversationMemory.loadWhatsAppHistory(input.leadId);

    // Fetch inventory for prompt context
    let inventorySummary = 'No hay unidades registradas en este momento.';
    try {
      const { SupabaseInventoryRepository } = await import('@/entities/inventory/api/SupabaseInventoryRepository');
      const { createClient } = await import('@/shared/api/supabase/client');
      const inventoryRepo = new SupabaseInventoryRepository(createClient());
      const cars = await inventoryRepo.getInventory('richard-automotive', 12);
      if (cars?.length) {
        inventorySummary = cars
          .map((c) => `- ${c.year} ${c.make} ${c.model} | $${c.price} | ${c.mileage}mi`)
          .join('\n');
      }
    } catch (e) {
      console.error('[WhatsAppAgent] Inventory fetch error:', e);
    }

    const userPrompt = buildWhatsAppUserPrompt(
      history,
      input.customerContext,
      inventorySummary,
      input.message,
    );

    let parsed: WhatsAppResponse;
    try {
      const { object } = await generateObject({
        model: gemini15Flash,
        schema: WhatsAppResponseSchema,
        system: WHATSAPP_AGENT_SYSTEM_PROMPT,
        prompt: userPrompt,
      });
      parsed = object;
    } catch (err) {
      console.error('[WhatsAppAgent] generateObject failed:', err);
      parsed = {
        reply: 'Entendido. Un especialista de Richard Automotive te contactará en breve. 🚗',
        intentLevel: 'medium',
        hasTradeIn: null,
        budget: null,
        suggestedVehicle: null,
        needsHumanHandoff: false,
      };
    }

    // Persist this turn to conversation history
    conversationMemory.saveWhatsAppTurn(input.leadId, input.message, parsed.reply).catch(() => {});

    // Handle human handoff
    if (parsed.needsHumanHandoff) {
      houstonHandoffService
        .escalate({
          leadPhone: input.leadId,
          message: input.message,
          reason: 'Customer requested human agent via WhatsApp',
          channel: 'whatsapp',
        })
        .catch(() => {});
    }

    let nextStage = sequence?.currentStage || 'welcome';
    let justSuggestedAppointment = false;

    if (
      parsed.intentLevel === 'appointment_ready' &&
      nextStage !== 'appointment_suggested'
    ) {
      nextStage = 'appointment_suggested';
      justSuggestedAppointment = true;
    } else if (
      (input.message.toLowerCase().includes('cita') || input.message.toLowerCase().includes('ver')) &&
      nextStage !== 'appointment_suggested'
    ) {
      nextStage = 'appointment_suggested';
      justSuggestedAppointment = true;
    }

    if (justSuggestedAppointment) {
      syncToHubspot({ phone: input.from, ...parsed }).catch(() => {});
    }

    return {
      reply: parsed.reply,
      nextStage,
      needsHumanHandoff: parsed.needsHumanHandoff,
      hubspotData: {
        hasTradeIn: parsed.hasTradeIn,
        budget: parsed.budget,
        intentLevel: parsed.intentLevel,
        suggestedVehicle: parsed.suggestedVehicle,
      },
    };
  }
}
