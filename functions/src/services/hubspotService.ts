import * as logger from 'firebase-functions/logger';
import { Lead } from '../domain/entities';

// We extract VITE_HUBSPOT_TOKEN if available, otherwise fallback to HUBSPOT_ACCESS_TOKEN
const HUBSPOT_ACCESS_TOKEN = process.env.VITE_HUBSPOT_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN || '';
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3';

export class HubSpotService {
  /**
   * Synchronizes a lead (Contact) and Deal to HubSpot.
   */
  async syncLeadToHubSpot(lead: Lead): Promise<string | null> {
    if (!HUBSPOT_ACCESS_TOKEN) {
      logger.warn('[HubSpotService] Access Token missing. Skipping sync.');
      return null;
    }

    try {
      let contactId: string | null = null;

      // 1. Search for existing contact by email or phone
      if (lead.email) {
          const searchResponse = await fetch(`${HUBSPOT_API_URL}/objects/contacts/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            },
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
    
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.total > 0) {
              contactId = searchData.results[0].id;
              logger.info(`[HubSpotService] Found existing contact by email: ${contactId}`);
            }
          }
      }

      // If not found by email, try by phone
      if (!contactId && lead.phone) {
        const searchResponsePhone = await fetch(`${HUBSPOT_API_URL}/objects/contacts/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              filterGroups: [
                {
                  filters: [
                    {
                      propertyName: 'phone',
                      operator: 'EQ',
                      value: lead.phone,
                    },
                  ],
                },
              ],
            }),
          });
          if (searchResponsePhone.ok) {
            const searchData = await searchResponsePhone.json();
            if (searchData.total > 0) {
              contactId = searchData.results[0].id;
              logger.info(`[HubSpotService] Found existing contact by phone: ${contactId}`);
            }
          }
      }

      // 2. Create or Update Contact
      const contactProperties: Record<string, string> = {
        firstname: lead.firstName || 'Usuario',
        lastname: lead.lastName || 'WhatsApp',
        phone: lead.phone || '',
        lead_source: 'WhatsApp_AI',
        lifecyclestage: 'lead'
      };

      if (lead.email) {
          contactProperties.email = lead.email;
      }
      if (lead.monthlyIncome) {
          contactProperties.monthly_income = String(lead.monthlyIncome);
      }
      if (lead.hasPronto) {
          contactProperties.has_downpayment = 'Yes';
      }
      if (lead.workStatus) {
          contactProperties.work_status = String(lead.workStatus);
      }
      if (lead.tradeIn) {
          contactProperties.trade_in_vehicle = String(lead.tradeIn);
      }

      if (contactId) {
        // Update
        const updateResponse = await fetch(`${HUBSPOT_API_URL}/objects/contacts/${contactId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ properties: contactProperties }),
        });

        if (!updateResponse.ok) {
           logger.error(`[HubSpotService] Update Error: ${updateResponse.statusText}`);
        } else {
           logger.info(`[HubSpotService] Updated contact: ${contactId}`);
        }
      } else {
        // Create
        const createResponse = await fetch(`${HUBSPOT_API_URL}/objects/contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ properties: contactProperties }),
        });

        if (!createResponse.ok) {
          throw new Error(`[HubSpotService] Create Error: ${createResponse.statusText} - ${await createResponse.text()}`);
        }

        const createData = await createResponse.json();
        contactId = createData.id;
        logger.info(`[HubSpotService] Created contact: ${contactId}`);
      }

      // 3. Create/Update Deal Context
      if (contactId) {
        await this.syncDealToHubSpot(lead, contactId);
      }

      return contactId;
    } catch (error) {
      logger.error('[HubSpotService] Sync Lead Error:', error);
      return null;
    }
  }

  private async syncDealToHubSpot(lead: Lead, contactId: string): Promise<void> {
    try {
      const dealName = `Lead: ${lead.firstName || 'WhatsApp'} ${lead.lastName || ''} - ${
        lead.vehicleOfInterest || 'Automóvil'
      }`;

      // En WhatsApp, el intent nos dice si es caliente
      const pipelineStage = lead.aiAnalysis?.intent === 'purchase_ready' || lead.aiAnalysis?.intent === 'financing'
        ? 'appointmentscheduled' // Or your specific stage ID
        : 'qualifying';   // Or 'appointmentscheduled', etc. depending on HubSpot setup 

      const dealProperties = {
        dealname: dealName,
        dealstage: pipelineStage, 
        pipeline: 'default', // standard HubSpot pipeline
        amount: '', // Could be filled if we know the vehicle price
      };

      const createDealResponse = await fetch(`${HUBSPOT_API_URL}/objects/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          properties: dealProperties,
        }),
      });

      if (!createDealResponse.ok) {
        throw new Error(`[HubSpotService] Deal Create Error: ${createDealResponse.statusText} - ${await createDealResponse.text()}`);
      }

      const dealData = await createDealResponse.json();
      const dealId = dealData.id;

      // Associate Deal with Contact
      await fetch(
        `${HUBSPOT_API_URL}/objects/deals/${dealId}/associations/contacts/${contactId}/3`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          },
        }
      );

      logger.info(`[HubSpotService] Created Deal ${dealId} and associated with Contact ${contactId}`);
    } catch (error) {
      logger.error('[HubSpotService] Sync Deal Error:', error);
    }
  }
}

export const hubspotService = new HubSpotService();
