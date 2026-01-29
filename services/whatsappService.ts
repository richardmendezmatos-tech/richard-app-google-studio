/**
 * WhatsApp Business Automation Service
 * 
 * Handles automated responses, lead tracking, and intelligent chatbot
 * integration with Gemini AI for Richard Automotive.
 */

import { getAIResponse } from './geminiService';
import { Car } from '../types';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebaseService';

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

// Predefined message templates
export const MESSAGE_TEMPLATES: WhatsAppTemplate[] = [
    {
        id: 'welcome',
        name: 'Bienvenida',
        content: '¡Hola {{customerName}}! 👋 Soy Richard IA, tu asistente virtual de Richard Automotive. ¿En qué puedo ayudarte hoy?',
        variables: ['customerName']
    },
    {
        id: 'car_details',
        name: 'Detalles de Auto',
        content: '🚗 *{{carName}}*\n\n💰 Precio: ${{price}}\n📅 Año: {{year}}\n\n{{description}}\n\n¿Te gustaría agendar una prueba de manejo?',
        variables: ['carName', 'price', 'year', 'description']
    },
    {
        id: 'financing_info',
        name: 'Información de Financiamiento',
        content: '💳 *Opciones de Financiamiento*\n\nTrabajamos con todos los bancos locales:\n• Banco Popular\n• Oriental Bank\n• FirstBank\n\nPagos desde ${{monthlyPayment}}/mes\n\n¿Quieres pre-cualificar ahora?',
        variables: ['monthlyPayment']
    },
    {
        id: 'appointment',
        name: 'Agendar Cita',
        content: '📅 *Agendar Cita*\n\nPerfecto! Estamos disponibles:\n• Lunes a Viernes: 9am - 6pm\n• Sábados: 10am - 4pm\n\n¿Qué día y hora te viene mejor?',
        variables: []
    },
    {
        id: 'follow_up',
        name: 'Seguimiento',
        content: 'Hola {{customerName}}! 👋\n\nVi que estabas interesado en {{carName}}. ¿Aún te interesa? Tengo una oferta especial que podría gustarte 🎉',
        variables: ['customerName', 'carName']
    }
];

/**
 * Render template with variables
 */
export const renderTemplate = (template: WhatsAppTemplate, variables: Record<string, string>): string => {
    let content = template.content;

    template.variables.forEach(varName => {
        const value = variables[varName] || '';
        content = content.replace(new RegExp(`{{${varName}}}`, 'g'), value);
    });

    return content;
};

/**
 * Detect user intent from message
 */
export const detectIntent = (message: string): {
    intent: 'greeting' | 'inventory' | 'financing' | 'appointment' | 'trade_in' | 'other';
    confidence: number;
    entities: Record<string, string>;
} => {
    const lower = message.toLowerCase();

    // Greeting
    if (/^(hola|buenos|buenas|saludos|hey)/i.test(lower)) {
        return { intent: 'greeting', confidence: 0.95, entities: {} };
    }

    // Inventory search
    if (/(ver|mostrar|busco|quiero|interesa|disponible|inventario|autos|carros)/i.test(lower)) {
        const carType = lower.match(/(suv|sedan|pickup|luxury)/i)?.[1];
        return {
            intent: 'inventory',
            confidence: 0.85,
            entities: carType ? { carType } : {}
        };
    }

    // Financing
    if (/(financiamiento|credito|prestamo|pago|mensual|banco|interes|apr)/i.test(lower)) {
        return { intent: 'financing', confidence: 0.9, entities: {} };
    }

    // Appointment
    if (/(cita|prueba|test drive|visitar|ir|horario|disponibilidad)/i.test(lower)) {
        return { intent: 'appointment', confidence: 0.88, entities: {} };
    }

    // Trade-in
    if (/(trade|cambio|entregar|mi auto|mi carro|vender)/i.test(lower)) {
        return { intent: 'trade_in', confidence: 0.87, entities: {} };
    }

    return { intent: 'other', confidence: 0.5, entities: {} };
};

/**
 * Generate intelligent auto-response using Gemini
 */
export const generateAutoResponse = async (context: MessageContext): Promise<string> => {
    const { message, conversationHistory, inventory } = context;

    // Detect intent
    const { intent, entities } = detectIntent(message);

    // Build conversation history for AI
    const history = conversationHistory.slice(-5).map(msg => ({
        role: msg.direction === 'inbound' ? 'user' as const : 'bot' as const,
        text: msg.message
    }));

    // Custom system prompt for WhatsApp
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
  `;

    try {
        const response = await getAIResponse(message, inventory, history, systemPrompt);
        return response;
    } catch (error) {
        console.error('Auto-response error:', error);
        return 'Disculpa, estoy teniendo problemas técnicos. ¿Puedes llamarnos al 787-368-2880? 📞';
    }
};

/**
 * Send WhatsApp message (placeholder - requires Twilio/WhatsApp Business API)
 */
export const sendWhatsAppMessage = async (
    to: string,
    message: string,
    options?: {
        mediaUrl?: string;
        template?: string;
    }
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    try {
        // TODO: Integrate with Twilio WhatsApp API or WhatsApp Business API
        // For now, log to Firestore for tracking

        const messageDoc = {
            to,
            message,
            mediaUrl: options?.mediaUrl,
            template: options?.template,
            timestamp: new Date(),
            direction: 'outbound' as const,
            status: 'sent' as const
        };

        const docRef = await addDoc(collection(db, 'whatsapp_messages'), messageDoc);

        console.log('WhatsApp message logged:', messageDoc);

        return { success: true, messageId: docRef.id };
    } catch (error) {
        console.error('Send WhatsApp error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Get conversation history for a phone number
 */
export const getConversationHistory = async (
    phoneNumber: string,
    limitCount: number = 20
): Promise<WhatsAppMessage[]> => {
    try {
        const q = query(
            collection(db, 'whatsapp_messages'),
            where('from', '==', phoneNumber),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const messages: WhatsAppMessage[] = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                from: data.from,
                to: data.to,
                message: data.message,
                timestamp: data.timestamp.toDate(),
                direction: data.direction,
                status: data.status,
                leadId: data.leadId
            });
        });

        return messages.reverse(); // Oldest first
    } catch (error) {
        console.error('Get conversation error:', error);
        return [];
    }
};

/**
 * Schedule follow-up message
 */
export const scheduleFollowUp = async (
    phoneNumber: string,
    carId: string,
    delayHours: number = 24
): Promise<void> => {
    try {
        const scheduledTime = new Date();
        scheduledTime.setHours(scheduledTime.getHours() + delayHours);

        await addDoc(collection(db, 'scheduled_messages'), {
            phoneNumber,
            carId,
            scheduledTime,
            status: 'pending',
            type: 'follow_up',
            createdAt: new Date()
        });

        console.log(`Follow-up scheduled for ${phoneNumber} in ${delayHours} hours`);
    } catch (error) {
        console.error('Schedule follow-up error:', error);
    }
};

/**
 * Create interactive menu for WhatsApp
 */
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

/**
 * Process menu selection
 */
export const processMenuSelection = async (
    selection: string,
    context: MessageContext
): Promise<string> => {
    const { inventory } = context;

    switch (selection.trim()) {
        case '1': {
            // Show inventory summary
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
            return '👤 *Contacto Directo*\n\nPuedes llamar a Richard directamente:\n📞 787-368-2880\n\nO déjame tu nombre y te contactamos en breve.';

        default:
            // Use AI for natural language
            return await generateAutoResponse(context);
    }
};

/**
 * Track WhatsApp conversion
 */
export const trackWhatsAppConversion = async (
    phoneNumber: string,
    conversionType: 'appointment' | 'test_drive' | 'sale' | 'lead',
    metadata?: Record<string, unknown>
): Promise<void> => {
    try {
        await addDoc(collection(db, 'whatsapp_conversions'), {
            phoneNumber,
            conversionType,
            metadata,
            timestamp: new Date()
        });

        console.log(`WhatsApp conversion tracked: ${conversionType}`);
    } catch (error) {
        console.error('Track conversion error:', error);
    }
};
