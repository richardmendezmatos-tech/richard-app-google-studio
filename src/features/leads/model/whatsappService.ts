import { getAIResponse } from '@/shared/api/ai';
import { validationAgentService } from '@/features/ai-hub';
import { Car } from '@/shared/types/types';
import { supabase } from '@/shared/api/supabase/supabaseClient';

export interface WhatsAppMessage {
  id: string;
  from: string; // Phone number
  to: string;
  message: string;
  timestamp: Date;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  leadId?: string;
}
// ... [rest of interfaces kept] ...
export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[]; // e.g., ['customerName', 'carName', 'price']
}

export interface AutoResponseRule {
  trigger: string | RegExp;
  response: string | ((context: MessageContext) => Promise<string>);
  priority: number;
}

export interface MessageContext {
  message: string;
  customerPhone: string;
  customerName?: string;
  conversationHistory: WhatsAppMessage[];
  inventory: Car[];
}

export const MESSAGE_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'welcome',
    name: 'Bienvenida',
    content: '¡Hola {{customerName}}! 👋 Soy Richard IA, tu asistente virtual de Richard Automotive. ¿En qué puedo ayudarte hoy?',
    variables: ['customerName'],
  },
  {
    id: 'car_details',
    name: 'Detalles de Auto',
    content: '🚗 *{{carName}}*\n\n💰 Precio: ${{price}}\n📅 Año: {{year}}\n\n{{description}}\n\n¿Te gustaría agendar una prueba de manejo?',
    variables: ['carName', 'price', 'year', 'description'],
  },
  {
    id: 'financing_info',
    name: 'Información de Financiamiento',
    content: '💳 *Opciones de Financiamiento*\n\nTrabajamos con todos los bancos locales:\n• Banco Popular\n• Oriental Bank\n• FirstBank\n\nPagos desde ${{monthlyPayment}}/mes\n\n¿Quieres pre-cualificar ahora?',
    variables: ['monthlyPayment'],
  },
  {
    id: 'appointment',
    name: 'Agendar Cita',
    content: '📅 *Agendar Cita*\n\nPerfecto! Estamos disponibles:\n• Lunes a Viernes: 9am - 6pm\n• Sábados: 10am - 4pm\n\n¿Qué día y hora te viene mejor?',
    variables: [],
  },
  {
    id: 'sentinel_nudge',
    name: 'Sentinel Nudge (Rescate)',
    content: 'Hola {{customerName}}! 👋 Vimos que tenías interés en una unidad con nosotros 🚗.\n\nTuvimos un pequeño inconveniente técnico procesando tu solicitud, pero tu espacio de pre-aprobación está reservado.\n\n¿Te gustaría que te ayude a completarla por aquí? 💳✨',
    variables: ['customerName'],
  },
];

export const triggerSentinelNudge = async (
  leadId: string,
  customerName: string,
  phoneNumber: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const template = MESSAGE_TEMPLATES.find((t) => t.id === 'sentinel_nudge');
    if (!template) throw new Error('Sentinel nudge template not found');

    const message = renderTemplate(template, { customerName });

    const result = await sendWhatsAppMessage(phoneNumber, message, {
      template: 'sentinel_nudge',
    });

    if (result.success) {
      await trackWhatsAppConversion(phoneNumber, 'lead', {
        leadId,
        source: 'sentinel-auto-healing',
        timestamp: new Date(),
      });
    }

    return result;
  } catch (error) {
    console.error('🔴 Sentinel: Fallo al disparar Nudge de Rescate.', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const renderTemplate = (
  template: WhatsAppTemplate,
  variables: Record<string, string>,
): string => {
  let content = template.content;
  template.variables.forEach((varName) => {
    const value = variables[varName] || '';
    content = content.replace(new RegExp(`{{${varName}}}`, 'g'), value);
  });
  return content;
};

export const detectIntent = (
  message: string,
): {
  intent: 'greeting' | 'inventory' | 'financing' | 'appointment' | 'trade_in' | 'other';
  confidence: number;
  entities: Record<string, string>;
} => {
  const lower = message.toLowerCase();
  if (/^(hola|buenos|buenas|saludos|hey)/i.test(lower)) {
    return { intent: 'greeting', confidence: 0.95, entities: {} };
  }
  if (/(ver|mostrar|busco|quiero|interesa|disponible|inventario|autos|carros)/i.test(lower)) {
    const carType = lower.match(/(suv|sedan|pickup|luxury)/i)?.[1];
    return { intent: 'inventory', confidence: 0.85, entities: carType ? { carType } : {} };
  }
  if (/(financiamiento|credito|prestamo|pago|mensual|banco|interes|apr)/i.test(lower)) {
    return { intent: 'financing', confidence: 0.9, entities: {} };
  }
  if (/(cita|prueba|test drive|visitar|ir|horario|disponibilidad)/i.test(lower)) {
    return { intent: 'appointment', confidence: 0.88, entities: {} };
  }
  if (/(trade|cambio|entregar|mi auto|mi carro|vender)/i.test(lower)) {
    return { intent: 'trade_in', confidence: 0.87, entities: {} };
  }
  return { intent: 'other', confidence: 0.5, entities: {} };
};

export const generateAutoResponse = async (context: MessageContext): Promise<string> => {
  const { message, conversationHistory, inventory } = context;
  const { intent, entities } = detectIntent(message);
  const history = conversationHistory.slice(-5).map((msg) => ({
    role: msg.direction === 'inbound' ? ('user' as const) : ('bot' as const),
    text: msg.message,
  }));

  const systemPrompt = `
    Eres el asistente de WhatsApp de Richard Automotive. 
    REGLAS IMPORTANTES:
    1. Respuestas CORTAS (máximo 3 líneas para WhatsApp)
    2. Usa emojis apropiados 🚗 💰 📅
    3. Siempre ofrece siguiente paso claro
    4. Si detectas interés alto, sugiere llamada o cita
    5. Formato WhatsApp: *negrita*, _cursiva_
    
    INTENCIÓN DETECTADA: ${intent}
    ${Object.keys(entities).length > 0 ? `ENTIDADES: ${JSON.stringify(entities)}` : ''}
    
    CTA WHATSAPP: https://wa.me/${(process.env.VITE_TWILIO_PHONE_NUMBER || '17873682880').replace('+', '')}
  `;

  try {
    const rawResponse = await getAIResponse(message, inventory, history, systemPrompt);
    const validation = await validationAgentService.validateResponse(message, rawResponse, inventory);
    return validation.sanitizedResponse;
  } catch (error) {
    console.error('Auto-response error:', error);
    return `Disculpa, estoy teniendo problemas técnicos. ¿Puedes llamarnos al ${process.env.VITE_TWILIO_PHONE_NUMBER || '787-368-2880'}? 📞`;
  }
};

export const sendWhatsAppMessage = async (
  to: string,
  message: string,
  options?: {
    mediaUrl?: string;
    template?: string;
  },
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');

    console.log(`[WhatsApp] Sending to ${to}:`, { message, options });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const messageData = {
      to,
      message,
      media_url: options?.mediaUrl || null,
      template: options?.template || null,
      direction: 'outbound',
      status: 'sent',
      provider: 'twilio-mock',
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert(messageData)
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Send WhatsApp error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const getConversationHistory = async (
  phoneNumber: string,
  limitCount: number = 20,
): Promise<WhatsAppMessage[]> => {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .or(`from.eq.${phoneNumber},to.eq.${phoneNumber}`)
      .order('timestamp', { ascending: false })
      .limit(limitCount);

    if (error) throw error;

    return (data || []).map((msg: any) => ({
      id: msg.id,
      from: msg.from,
      to: msg.to,
      message: msg.message,
      timestamp: new Date(msg.timestamp),
      direction: msg.direction,
      status: msg.status,
      leadId: msg.lead_id,
    })).reverse();
  } catch (error) {
    console.error('Get conversation error:', error);
    return [];
  }
};

export const scheduleFollowUp = async (
  phoneNumber: string,
  carId: string,
  delayHours: number = 24,
): Promise<void> => {
  try {
    if (!supabase) return;
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + delayHours);

    await supabase.from('scheduled_messages').insert({
      phone_number: phoneNumber,
      car_id: carId,
      scheduled_time: scheduledTime.toISOString(),
      status: 'pending',
      type: 'follow_up',
    });

    console.log(`Follow-up scheduled for ${phoneNumber} in ${delayHours} hours`);
  } catch (error) {
    console.error('Schedule follow-up error:', error);
  }
};

export const createInteractiveMenu = (): string => {
  return `
🚗 *Richard Automotive - Menú Principal*

Responde con el número de tu opción:

1️⃣ Ver inventario disponible
2️⃣ Información de financiamiento
3️⃣ Agendar prueba de manejo
4️⃣ Evaluar mi auto (trade-in)
5️⃣ Hablar con un asesor

_Escribe el número o describe lo que necesitas_
  `.trim();
};

export const processMenuSelection = async (
  selection: string,
  context: MessageContext,
): Promise<string> => {
  const { inventory } = context;

  switch (selection.trim()) {
    case '1': {
      const categories = inventory.reduce((acc, car) => {
        acc[car.type] = (acc[car.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let inventoryMsg = '🚗 *Inventario Disponible*\n\n';
      Object.entries(categories).forEach(([type, count]) => {
        inventoryMsg += `• ${type.toUpperCase()}: ${count} unidades\n`;
      });
      inventoryMsg += '\n¿Qué tipo de vehículo te interesa?';
      return inventoryMsg;
    }
    case '2':
      return renderTemplate(MESSAGE_TEMPLATES[2], { monthlyPayment: '350' });
    case '3':
      return renderTemplate(MESSAGE_TEMPLATES[3], {});
    case '4':
      return '📸 *Evaluación de Trade-In*\n\nPerfecto! Para darte el mejor valor:\n\n1. Envíame fotos de tu auto (exterior e interior)\n2. Dime marca, modelo y año\n3. Millaje aproximado\n\n¿Listo para empezar?';
    case '5':
      return `👤 *Contacto Directo*\n\nPuedes llamar a Richard directamente:\n📞 ${process.env.VITE_TWILIO_PHONE_NUMBER || '787-368-2880'}\n\nO déjame tu nombre y te contactamos en breve.`;
    default:
      return await generateAutoResponse(context);
  }
};

export const trackWhatsAppConversion = async (
  phoneNumber: string,
  conversionType: 'appointment' | 'test_drive' | 'sale' | 'lead',
  metadata?: Record<string, unknown>,
): Promise<void> => {
  try {
    if (!supabase) return;
    await supabase.from('whatsapp_conversions').insert({
      phone_number: phoneNumber,
      conversion_type: conversionType,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    });

    console.log(`WhatsApp conversion tracked: ${conversionType}`);
  } catch (error) {
    console.error('Track conversion error:', error);
  }
};

export const getFallbackLink = (phone: string, message: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

