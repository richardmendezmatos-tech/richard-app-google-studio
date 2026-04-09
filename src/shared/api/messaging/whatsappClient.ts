/**
 * WhatsApp Business API Client (Meta Cloud API)
 * 
 * Abstraction layer over the WhatsApp Cloud API.
 * Uses the Meta Business Platform for message delivery.
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
}

function getConfig(): WhatsAppConfig {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  };
}

export interface TemplateMessage {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: TemplateComponent[];
}

interface TemplateComponent {
  type: 'body' | 'header';
  parameters: { type: 'text'; text: string }[];
}

export interface TextMessage {
  to: string;
  body: string;
}

/**
 * Sends a WhatsApp template message (pre-approved by Meta).
 * Templates are required for first-contact messaging.
 */
export async function sendTemplateMessage(msg: TemplateMessage): Promise<{ success: boolean; messageId?: string }> {
  const config = getConfig();
  
  if (!config.phoneNumberId || !config.accessToken) {
    console.warn('[WhatsApp] Missing credentials. Message simulated:', msg.to);
    return { success: true, messageId: `sim_${Date.now()}` };
  }

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formatPhoneForWhatsApp(msg.to),
        type: 'template',
        template: {
          name: msg.templateName,
          language: { code: msg.languageCode || 'es' },
          components: msg.components || [],
        },
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('[WhatsApp] Template send failed:', errorBody);
      return { success: false };
    }

    const data = await res.json();
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error('[WhatsApp] Network error:', error);
    return { success: false };
  }
}

/**
 * Sends a freeform text message (only within 24h conversation window).
 */
export async function sendTextMessage(msg: TextMessage): Promise<{ success: boolean; messageId?: string }> {
  const config = getConfig();

  if (!config.phoneNumberId || !config.accessToken) {
    console.warn('[WhatsApp] Missing credentials. Text simulated:', msg.to);
    return { success: true, messageId: `sim_${Date.now()}` };
  }

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formatPhoneForWhatsApp(msg.to),
        type: 'text',
        text: { body: msg.body },
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('[WhatsApp] Text send failed:', errorBody);
      return { success: false };
    }

    const data = await res.json();
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error('[WhatsApp] Network error:', error);
    return { success: false };
  }
}

/**
 * Normalizes a PR phone number (787/939) into WhatsApp international format.
 */
function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // If already starts with 1 (US/PR country code)
  if (digits.startsWith('1') && digits.length === 11) return digits;
  // If just 10 digits (area code + number)
  if (digits.length === 10) return `1${digits}`;
  return digits;
}
