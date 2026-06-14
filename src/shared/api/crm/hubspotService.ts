import { Lead } from '@/entities/lead/model/LeadEntity';
import fs from 'node:fs';
import path from 'node:path';

// We extract VITE_HUBSPOT_TOKEN if available, otherwise fallback to HUBSPOT_ACCESS_TOKEN
const HUBSPOT_ACCESS_TOKEN =
  process.env.VITE_HUBSPOT_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN || '';
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3';

export class HubSpotService {
  /**
   * Synchronizes a lead (Contact) and Deal to HubSpot.
   */
  async syncLeadToHubSpot(lead: Lead): Promise<string | null> {
    if (!HUBSPOT_ACCESS_TOKEN) {
      console.warn('[HubSpotService] Access Token missing. Skipping sync.');
      this.writeWorkspaceCheckpoint(lead, 'pending', 'Missing HubSpot Access Token');
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
            console.log(`[HubSpotService] Found existing contact by email: ${contactId}`);
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
            console.log(`[HubSpotService] Found existing contact by phone: ${contactId}`);
          }
        }
      }

      // 2. Create or Update Contact
      const contactProperties: Record<string, string> = {
        firstname: lead.firstName || 'Usuario',
        lastname: lead.lastName || 'WhatsApp',
        phone: lead.phone || '',
        lead_source: 'WhatsApp_AI',
        lifecyclestage: 'lead',
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
          console.error(`[HubSpotService] Update Error: ${updateResponse.statusText}`);
        } else {
          console.log(`[HubSpotService] Updated contact: ${contactId}`);
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
          throw new Error(
            `[HubSpotService] Create Error: ${createResponse.statusText} - ${await createResponse.text()}`,
          );
        }

        const createData = await createResponse.json();
        contactId = createData.id;
        console.log(`[HubSpotService] Created contact: ${contactId}`);
      }

      // 3. Create/Update Deal Context
      if (contactId) {
        await this.syncDealToHubSpot(lead, contactId);
      }

      this.writeWorkspaceCheckpoint(lead, 'synced');
      return contactId;
    } catch (error: any) {
      console.error('[HubSpotService] Sync Lead Error:', error);
      this.writeWorkspaceCheckpoint(lead, 'pending', error?.message || String(error));
      return null;
    }
  }

  private async syncDealToHubSpot(lead: Lead, contactId: string): Promise<void> {
    try {
      const dealName = `Lead: ${lead.firstName || 'WhatsApp'} ${lead.lastName || ''} - ${
        lead.vehicleOfInterest || 'Automóvil'
      }`;

      // En WhatsApp, el intent nos dice si es caliente
      const pipelineStage =
        lead.aiAnalysis?.intent === 'purchase_ready' || lead.aiAnalysis?.intent === 'financing'
          ? 'appointmentscheduled'
          : 'qualifying';

      const dealProperties = {
        dealname: dealName,
        dealstage: pipelineStage,
        pipeline: 'default',
        amount: '',
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
        throw new Error(
          `[HubSpotService] Deal Create Error: ${createDealResponse.statusText} - ${await createDealResponse.text()}`,
        );
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
        },
      );

      console.log(
        `[HubSpotService] Created Deal ${dealId} and associated with Contact ${contactId}`,
      );
    } catch (error) {
      console.error('[HubSpotService] Sync Deal Error:', error);
    }
  }

  /**
   * Saves a checkpoint JSON of the lead transaction in the workspace (.agents/workspace)
   * conforming to the persistence protocol [YYYY-MM-DD]_[CATEGORY]_[ID].json.
   */
  private writeWorkspaceCheckpoint(lead: Lead, status: 'synced' | 'pending', error?: string): void {
    if (process.env.NODE_ENV === 'test') {
      // Avoid polluting git with untracked test run checkpoints
      return;
    }

    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const category = 'HUBSPOT-SYNC';
      const cleanId = String(lead.id || 'unknown').replace(/[^a-zA-Z0-9-_]/g, '');
      const fileName = `${dateStr}_${category}_${cleanId}.json`;
      
      const workspaceDir = path.resolve(process.cwd(), '.agents/workspace');
      if (!fs.existsSync(workspaceDir)) {
        fs.mkdirSync(workspaceDir, { recursive: true });
      }
      
      const filePath = path.join(workspaceDir, fileName);
      const payload = {
        timestamp: new Date().toISOString(),
        status,
        error: error || null,
        lead,
      };
      
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
      console.log(`[HubSpotService] Workspace checkpoint saved: ${fileName}`);
    } catch (e) {
      console.error('[HubSpotService] Failed to write workspace checkpoint:', e);
    }
  }
}

export const hubspotService = new HubSpotService();
