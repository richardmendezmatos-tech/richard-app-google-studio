import { Lead } from '@/shared/types/types';

/**
 * Webhook Automation Service
 * Safely dispatches new Leads or Conversions to external systems
 * like Make.com, Zapier, or Meta Conversion API proxies.
 */

const WEBHOOK_URL = import.meta.env.VITE_AUTOMATION_WEBHOOK_URL || '';

export const dispatchLeadToWebhook = async (lead: Lead): Promise<void> => {
  if (!WEBHOOK_URL) {
    console.warn(
      '[WebhookService] No VITE_AUTOMATION_WEBHOOK_URL defined. Skipping webhook dispatch.',
    );
    return;
  }

  const payload = {
    event: 'NEW_LEAD_ACQUISITION',
    timestamp: new Date().toISOString(),
    source: 'RICHARD_AUTOMOTIVE_HOUSTON_V3',
    data: {
      id: lead.id,
      firstName: lead.firstName || lead.name,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      carInterest: lead.vehicleOfInterest,
      leadType: lead.type,
      marketing: lead.marketingData || {},
      score: lead.predictiveScore || lead.aiScore || 0,
    },
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[WebhookService] Failed to dispatch. Status: ${response.status}`);
    } else {
      console.log(`[WebhookService] Lead ${lead.id} safely dispatched to Analytics Pipeline.`);
    }
  } catch (error) {
    // Fail softly so we never brick the main UI CRM flow.
    console.error('[WebhookService] Network error dispatching webhook:', error);
  }
};
