import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import { supabase } from '@/shared/api/supabase/supabase';
import { Lead } from '@/shared/types/types';

/**
 * Sentinel Lead Intelligence Service (Sentinel-LEI)
 * Part of the Richard Automotive Nivel 18 Hardening.
 */
export const leadIntelligenceService = {
  /**
   * Enriches a lead with AI-driven insights asynchronously.
   */
  async enrichLead(leadId: string, vehicleInfo?: string, customerNotes?: string) {
    try {
      if (!supabase) return;

      console.log(`[Sentinel-LEI] 🧠 Inició enriquecimiento para lead: ${leadId}`);

      // 1. Gather context
      const context = `
        Vehículo de Interés: ${vehicleInfo || 'General'}
        Notas del Cliente: ${customerNotes || 'N/A'}
      `;

      // 2. Generate Intelligence via Sentinel AI
      const intelligence = await sentinelAI.generateInventoryIntelligence(context);

      // 3. Extract Intent (Bonus)
      const intent = customerNotes ? await sentinelAI.extractSearchIntent(customerNotes) : null;

      // 4. Persist to Supabase
      const aiAnalysis = {
        ideal_buyer: intelligence.idealBuyer,
        sales_pitch: intelligence.salesPitch,
        intent_data: intent,
        enriched_at: new Date().toISOString(),
        version: 'Sentinel-N24-LEI',
      };

      const { error } = await supabase
        .from('leads')
        .update({ ai_analysis: aiAnalysis })
        .eq('id', leadId);

      if (error) throw error;

      console.log(`[Sentinel-LEI] ✅ Lead ${leadId} enriquecido con éxito.`);
    } catch (error) {
      console.error(`[Sentinel-LEI] ❌ Error enriqueciendo lead ${leadId}:`, error);
    }
  },
};
