import { ScoreInsight } from '@/features/predictive/model/TrajectoryAnalyzer';
import { sendWhatsAppMessage } from '@/features/leads/model/whatsappService';
import { antigravityFetch } from '@/shared/api/antigravity/antigravityService';

export class NudgeService {
  private static NUDGE_THRESHOLD = 75; // Alta intención requerida

  /**
   * Evalúa si se debe disparar un nudge autónomo.
   */
  static async evaluateAndDispatch(
    leadId: string, 
    phone: string, 
    name: string, 
    insight: ScoreInsight
  ): Promise<{ dispatched: boolean; messageId?: string }> {
    
    if (insight.score < this.NUDGE_THRESHOLD) {
      return { dispatched: false };
    }

    // Evitar nudges duplicados en la misma sesión (esto se controlaría idealmente en un store persistente)
    if (sessionStorage.getItem(`nudge_sent_${leadId}`)) {
      return { dispatched: false };
    }

    console.log(`[Sentinel:Automation] Disparando Nudge Autónomo para ${name} (Score: ${insight.score})`);

    try {
      // Generación de mensaje hiper-personalizado con Gemini
      const prompt = `
        Genera un mensaje de WhatsApp para un cliente de Richard Automotive.
        Nombre: ${name}
        Factores de Interés: ${insight.factors.join(', ')}
        Intención: ${insight.category} (Score: ${insight.score}/100)
        
        REGLAS:
        - Tono: Richard Automotive (Premium, experto, pero cercano).
        - Máximo 250 caracteres.
        - Incluye 1 emoji estratégico.
        - Menciona específicamente un factor de interés.
        - No sonar como bot.
      `;

      const aiResponse = await antigravityFetch<{ text: string }>('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, system_instruction: 'Eres Richard, experto automotriz.' })
      });

      const messageContent = aiResponse.text || `¡Hola ${name}! Richard por aquí. Noté tu interés en nuestra sección de ${insight.factors[0] || 'inventario'}. ¿Te gustaría que te ayude con una consulta rápida personalizada? 🚗`;

      const result = await sendWhatsAppMessage(phone, messageContent);
      
      if (result.success) {
        sessionStorage.setItem(`nudge_sent_${leadId}`, 'true');
        return { dispatched: true, messageId: result.messageId };
      }
      
      return { dispatched: false };
    } catch (error) {
      console.error('[Sentinel:Automation] Error dispatching predictive nudge:', error);
      return { dispatched: false };
    }
  }
}
