import { Lead } from '@/entities/lead';

/**
 * Service to interact with WhatsApp Business API.
 * Production calls should be made from a cloud function or backend to protect the token.
 */
export class WhatsAppService {
  private readonly token = import.meta.env.VITE_WHATSAPP_TOKEN;
  private readonly phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_ID;
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';

  async sendWelcomeTemplate(lead: Lead): Promise<void> {
    if (!this.token || !this.phoneNumberId) {
      console.warn('⚠️ [WhatsAppService] Missing WHATSAPP credentials. Running in Mock Mode.');
      console.info(`[WhatsApp Mock] Would send Welcome message to: ${lead.phone}`);
      return;
    }

    // Clean phone number (assuming format mostly clean, but ideally needs E.164 parsing)
    const cleanPhone = lead.phone.replace(/\\D/g, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: 'welcome_lead', // Replace with exact template name configured in Meta
        language: {
          code: 'es_US' // Adjust based on target demographic
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: lead.firstName // Dynamic variable for the template greeting
              }
            ]
          }
        ]
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errbody = await response.text();
          throw new Error(`WhatsApp API Error: ${response.status} - ${errbody}`);
      }
    } catch (error) {
      console.error('[WhatsAppService] Failed to send message:', error);
      // Suppress error so UI isn't blocked by messaging failures
    }
  }
}

export const whatsappService = new WhatsAppService();
