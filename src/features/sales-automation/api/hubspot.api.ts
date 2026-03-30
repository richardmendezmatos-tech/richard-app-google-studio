import { Lead } from '@/entities/lead';

/**
 * Service to interact with HubSpot API.
 * In a production environment, these calls should ideally be made from a backend
 * to avoid exposing the HubSpot API key, or by calling a secure proxy endpoint.
 * For this integration, we support a mock mode when keys are missing.
 */
export class HubSpotService {
  private readonly apiKey = import.meta.env.VITE_HUBSPOT_TOKEN;
  private readonly baseUrl = 'https://api.hubapi.com/crm/v3/objects';

  async createContactAndDeal(lead: Lead): Promise<void> {
    if (!this.apiKey) {
      console.warn('⚠️ [HubSpotService] Missing VITE_HUBSPOT_TOKEN. Running in Mock Mode.');
      console.info(
        `[HubSpot Mock] Would create Contact/Deal for: ${lead.firstName} ${lead.lastName}`,
      );
      return;
    }

    try {
      // 1. Create Contact
      const contactId = await this.createContact(lead);
      if (contactId) {
        // 2. Create Deal and associate with Contact
        await this.createDeal(lead, contactId);
      }
    } catch (error) {
      console.error('[HubSpotService] Failed to sync lead:', error);
      // We don't throw here to avoid interrupting the main UI flow if CRM fails
    }
  }

  private async createContact(lead: Lead): Promise<string | null> {
    const payload = {
      properties: {
        firstname: lead.firstName,
        lastname: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        lifecyclestage: 'lead',
        lead_source: lead.source || 'Website',
      },
    };

    const response = await fetch(`${this.baseUrl}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errbody = await response.text();
      throw new Error(`HubSpot Contact Error: ${response.status} - ${errbody}`);
    }

    const data = await response.json();
    return data.id;
  }

  private async createDeal(lead: Lead, contactId: string): Promise<string | null> {
    const payload = {
      properties: {
        dealname: `Nuevo Lead: ${lead.firstName} ${lead.lastName}`,
        pipeline: 'default',
        dealstage: 'appointmentscheduled', // adjust based on actual pipeline
        amount: '0',
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }], // Contact to Deal
        },
      ],
    };

    const response = await fetch(`${this.baseUrl}/deals`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errbody = await response.text();
      throw new Error(`HubSpot Deal Error: ${response.status} - ${errbody}`);
    }

    const data = await response.json();
    return data.id;
  }
}

export const hubspotService = new HubSpotService();
