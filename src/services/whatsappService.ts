/**
 * whatsappService — punto de entrada global
 * @canonical src/features/leads/services/whatsappService
 *
 * DRY: La versión con AI (Gemini), Firestore, templates, detección de intents
 * y automatización vive en features/leads/services (387 líneas).
 *
 * Nota: se usa ruta relativa para respetar la regla no-restricted-imports
 * que bloquea el alias @/features/* desde src/services/.
 */
export {
    // Tipos
    type WhatsAppMessage,
    type WhatsAppTemplate,
    type AutoResponseRule,
    type MessageContext,

    // Constantes
    MESSAGE_TEMPLATES,

    // Funciones utilitarias
    renderTemplate,
    detectIntent,
    generateAutoResponse,
    sendWhatsAppMessage,
    getConversationHistory,
    scheduleFollowUp,
    createInteractiveMenu,
    processMenuSelection,
    trackWhatsAppConversion,
} from '../features/leads/services/whatsappService';
