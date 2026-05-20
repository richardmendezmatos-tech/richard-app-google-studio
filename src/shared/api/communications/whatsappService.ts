import { Lead } from '@/shared/types/types';

/**
 * WhatsApp Automation Service (Richard Automotive Sentinel)
 * Manages automated messaging for sales funnel optimization.
 */

const WHATSAPP_API_URL = process.env.VITE_WHATSAPP_API_URL || '';
const WHATSAPP_TOKEN = process.env.VITE_WHATSAPP_TOKEN || '';

export const sendWhatsAppRetargeting = async (lead: Lead): Promise<void> => {
  if (!WHATSAPP_API_URL || !WHATSAPP_TOKEN) {
    console.warn('[WhatsAppService] Missing credentials. Simulating message dispatch.');
    simulateWhatsAppDispatch(lead);
    return;
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: formatPhoneNumber(lead.phone),
    type: 'template',
    template: {
      name: 'lead_retargeting_prequalify',
      language: { code: 'es' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: lead.firstName || lead.name },
            { type: 'text', text: lead.vehicleOfInterest || 'la unidad de tu interés' },
          ],
        },
      ],
    },
  };

  try {
    const response = await fetch(`${WHATSAPP_API_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[WhatsAppService] Failed to send message. Status: ${response.status}`);
    } else {
      console.log(`[WhatsAppService] Retargeting message sent to ${lead.phone}`);
    }
  } catch (error) {
    console.error('[WhatsAppService] Network error sending WhatsApp:', error);
  }
};

/**
 * Sentinel Nurture - AI Enhanced WhatsApp
 */
export const triggerSentinelNurture = async (
  lead: Lead,
  context: string,
  specs?: any[],
): Promise<void> => {
  try {
    // 1. Generate Personalized Intel via AI
    const res = await fetch('/api/command-center/nurture/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead, context, specs }),
    });

    if (res.ok) {
      const { message } = await res.json();

      // 2. Dispatch (Simulation or Real API)
      if (!WHATSAPP_API_URL || !WHATSAPP_TOKEN) {
        console.log(`
        ==== [SENTINEL AI NURTURE DISPATCH] ====
        Para: ${lead.name} (${lead.phone})
        Contexto: ${context}
        Mensaje Generado por IA:
        "${message}"
        ========================================
        `);
        return;
      }

      // Real Dispatch logic here...
      await fetch(`${WHATSAPP_API_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formatPhoneNumber(lead.phone),
          type: 'text',
          text: { body: message },
        }),
      });
    }
  } catch (error) {
    console.error('[WhatsAppService] Sentinel Nurture failed:', error);
  }
};

/**
 * Formats phone number to E.164 standard (e.g., +17871234567)
 */
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `1${cleaned}`; // Add USA/PR country code
  }
  return cleaned;
};

/**
 * Simulation mode for local development or missing tokens
 */
const simulateWhatsAppDispatch = (lead: Lead) => {
  const vehicle = lead.vehicleOfInterest || 'la unidad';
  const name = lead.firstName || lead.name || 'amigo';

  console.log(`
  ==== [SIMULACIÓN WHATSAPP PREMIUM] ====
  Para: ${name} (${lead.phone})
  Mensaje: "¡Hola ${name}! 🚗 Vimos tu interés en la *${vehicle}*. 🔥 Tenemos buenas noticias: esta unidad califica para aprobación rápida esta semana. ¿Te gustaría saber en cuánto tasaríamos tu *trade-in* para bajar aún más el *pronto*? Responde 'SÍ' y te paso los números ahora mismo."
  =======================================
  `);
};
