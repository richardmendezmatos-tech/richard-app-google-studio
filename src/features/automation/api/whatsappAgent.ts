export interface LeadContext {
  id: string;
  firstName: string;
  phone: string;
  notes: string;
}

export class WhatsAppAgent {
  /**
   * Dispara el mensaje de bienvenida y validación vía Rube Webhook (Composio)
   */
  async sendWelcomeValidation(lead: LeadContext): Promise<void> {
    if (!lead.phone) {
      console.warn('WhatsApp Agent skipped: No phone available for lead', lead.id);
      return;
    }

    try {
      const templateParams = {
        name: lead.firstName,
        // Extrayendo info del vehiculo si existe en las notas
        carContext: lead.notes.includes('RA-Elite') ? 'vehículo en evaluación' : 'búsqueda',
      };

      console.log(`[Jules - WhatsApp Agent] Triggering Compiosio / Rube MCP for ${lead.phone}...`, templateParams);
      
      // Simulación de conexión a la API de Meta / Composio
      // fetch('https://rube-mcp-webhook.ur', POST...)
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error dispatching WhatsApp sequence:', err);
    }
  }
}

export const whatsappAgent = new WhatsAppAgent();
