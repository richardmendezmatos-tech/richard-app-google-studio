// HubSpot Integration Service (Native fetch implementation)
import { Lead } from '@/types/types';

const HUBSPOT_ACCESS_TOKEN = process.env.VITE_HUBSPOT_ACCESS_TOKEN || '';
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3';

/**
 * HubSpot Integration Service
 *
 * Synchronizes Richard Automotive leads with HubSpot CRM.
 * Implements Contact and Deal creation.
 */
class HubSpotService {
  private isConfigured(): boolean {
    return !!HUBSPOT_ACCESS_TOKEN && HUBSPOT_ACCESS_TOKEN !== '';
  }

  /**
   * Synchronizes a lead (Contact) to HubSpot.
   * Uses email as the primary identifier.
   */
  async syncLeadToHubSpot(lead: Lead): Promise<string | null> {
    if (!this.isConfigured()) {
      console.warn('[HubSpot] Access Token missing. Skipping sync.');
      return null;
    }

    if (!lead.email) {
      console.warn('[HubSpot] Lead has no email. Skipping sync.');
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const properties = {
        email: lead.email,
        firstname: lead.firstName || lead.name?.split(' ')[0] || '',
        lastname: lead.lastName || lead.name?.split(' ').slice(1).join(' ') || '',
        phone: lead.phone || '',
        vehicle_of_interest: lead.vehicleOfInterest || '',
        ai_intent_score: lead.aiScore?.toString() || '0',
        lifecycle_stage: lead.customerMemory?.l3_evolutivo?.lifecycleStage || 'discovery',
        lead_source: lead.source || 'direct',
      };

      // Search for existing contact first
      const searchResponse = await fetch(`${HUBSPOT_API_URL}/objects/contacts/search`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: lead.email,
                },
              ],
            },
          ],
        }),
      });

      if (!searchResponse.ok) {
        throw new Error(`[HubSpot] Search Error: ${searchResponse.statusText}`);
      }
      const searchData = await searchResponse.json();
      let contactId: string;

      if (searchData.total > 0) {
        contactId = searchData.results[0].id;
        // Update existing
        await fetch(`${HUBSPOT_API_URL}/objects/contacts/${contactId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({ properties }),
        });
        console.log(`[HubSpot] Updated contact: ${contactId}`);
      } else {
        // Create new
        const createResponse = await fetch(`${HUBSPOT_API_URL}/objects/contacts`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({ properties }),
        });
        if (!createResponse.ok) {
          throw new Error(`[HubSpot] Create Error: ${createResponse.statusText}`);
        }
        const createData = await createResponse.json();
        contactId = createData.id;
        console.log(`[HubSpot] Created contact: ${contactId}`);
      }

      // If high intent, create a deal (Independent timeout to ensure persistence)
      if (
        (lead.aiScore || 0) >= 80 ||
        lead.customerMemory?.l3_evolutivo?.lifecycleStage === 'decision'
      ) {
        await this.syncDealToHubSpot(lead, contactId);
      }

      return contactId;
    } catch (error) {
      console.error('[HubSpot] Sync Lead Error:', error);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Creates or updates a Deal in HubSpot associated with a contact.
   */
  private async syncDealToHubSpot(lead: Lead, contactId: string): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Independent 10s for Deal

    try {
      const dealProperties = {
        dealname: `OPP: ${lead.name || lead.email} - ${lead.vehicleOfInterest || 'Varios'}`,
        amount: '0', // Set to 0 initially, updated during negotiation
        dealstage: 'appointmentscheduled', // Default stage
        pipeline: 'default',
      };

      // In a real implementation, we would check if a deal already exists for this car + contact
      const createDealResponse = await fetch(`${HUBSPOT_API_URL}/objects/deals`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({ properties: dealProperties }),
      });

      if (!createDealResponse.ok) {
        throw new Error(`[HubSpot] Deal Create Error: ${createDealResponse.statusText}`);
      }
      const dealData = createDealResponse.ok ? await createDealResponse.json() : {};
      const dealId = dealData.id;

      // Associate Deal with Contact
      await fetch(
        `${HUBSPOT_API_URL}/objects/deals/${dealId}/associations/contacts/${contactId}/3`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({}),
        },
      );

      console.log(`[HubSpot] Created Deal ${dealId} and associated with Contact ${contactId}`);
    } catch (error) {
      console.error('[HubSpot] Sync Deal Error:', error);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const hubspotService = new HubSpotService();
