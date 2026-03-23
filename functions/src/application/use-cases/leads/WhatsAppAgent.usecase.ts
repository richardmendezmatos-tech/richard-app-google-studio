import { WhatsAppRepository } from '../../../domain/repositories';
import { ai } from '../../../services/aiManager';
import { WHATSAPP_AGENT_PROMPT } from './WhatsAppAgent.prompt';

import { Composio } from 'composio-core';

/**
 * Conexión a Rube MCP (Composio) para HubSpot
 * Dispara la creación del Lead y del Deal asociado en el CRM
 */
async function syncToHubspot(data: any): Promise<void> {
  console.log('[Composio:HubSpot] Sincronizando Deal/Lead:', JSON.stringify(data));
  
  try {
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (!apiKey) {
      console.warn('[Composio:HubSpot] Missing COMPOSIO_API_KEY. Skipping sync.');
      return;
    }

    const composio = new Composio({ apiKey });
    
    // Create/Update Contact
    const contactRes = await composio.executeAction('HUBSPOT_CREATE_CONTACT', {
      properties: {
        phone: data.phone,
        firstname: data.name || 'WhatsApp Lead',
        lifecyclestage: 'lead'
      }
    });

    console.log('[Composio:HubSpot] Contact created/updated:', contactRes);

    // Create Deal
    const dealRes = await composio.executeAction('HUBSPOT_CREATE_DEAL', {
      properties: {
        dealname: `WhatsApp Lead - ${data.suggestedVehicle || 'Auto'}`,
        dealstage: 'appointmentscheduled',
        pipeline: 'default',
        amount: data.budget ? String(data.budget) : ''
      }
    });

    console.log('[Composio:HubSpot] Deal created:', dealRes);
  } catch (err: any) {
    console.error('[Composio:HubSpot] Error syncing to CRM:', err.message || err);
  }
}

export interface WhatsAppAgentInput {
  leadId: string;
  message: string;
  customerContext?: any;
  from: string; // Added 'from' property
}

export interface WhatsAppAgentOutput {
  reply: string;
  nextStage: string;
  hubspotData?: {
    hasTradeIn?: boolean | null;
    budget?: number | string | null;
    intentLevel?: 'low' | 'medium' | 'high' | 'appointment_ready';
    suggestedVehicle?: string | null;
  };
}

export class WhatsAppAgent {
  constructor(private repo: WhatsAppRepository) {}

  async execute(input: WhatsAppAgentInput): Promise<WhatsAppAgentOutput> {
    const sequence = await this.repo.getSequence(input.leadId);
    const history = sequence?.history || [];

    // Simple prompt-based orchestration for now
    const prompt = WHATSAPP_AGENT_PROMPT.replace(
      '{{customerContext}}',
      JSON.stringify(input.customerContext || {}),
    )
      .replace('{{history}}', JSON.stringify(history))
      .replace('{{message}}', input.message);

    const { text } = await ai.generate(prompt);

    let parsedResponse;
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(cleanText);
    } catch (e) {
      console.warn("Error parsing agent JSON directly, using fallback");
      parsedResponse = {
        reply: text || 'Entendido. Un especialista de Richard Automotive te contactará en breve.',
        extractedData: { intentLevel: 'medium' }
      };
    }

    let nextStage: any = sequence?.currentStage || 'welcome';
    if (
      parsedResponse.extractedData?.intentLevel === 'appointment_ready' &&
      nextStage !== 'appointment_suggested'
    ) {
      nextStage = 'appointment_suggested';
      
      // ✅ [OMNICHANNEL SYNC] Trigger HubSpot Deal Creation via Composio / Rube MCP
      await syncToHubspot({
        phone: input.from,
        ...parsedResponse.extractedData
      });
    } else if (
      input.message.toLowerCase().includes('cita') ||
      input.message.toLowerCase().includes('ver')
    ) {
      nextStage = 'appointment_suggested';
    }

    // TODO: Phase 8 - If nextStage === 'appointment_suggested', enqueue Composio HubSpot task

    return {
      reply: parsedResponse.reply,
      nextStage,
      hubspotData: parsedResponse.extractedData
    };
  }
}
