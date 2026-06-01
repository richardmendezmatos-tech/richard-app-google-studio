import { WhatsAppRepository, WhatsAppSequence, WhatsAppStage } from '@/features/automation/api';
import { sendTwilioMessage } from '@/shared/api/communications/TwilioAdapter';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export class TwilioWhatsAppRepository implements WhatsAppRepository {
  private tableName = 'whatsapp_sequences';

  async getSequence(leadId: string): Promise<WhatsAppSequence | null> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('lead_id', leadId)
      .single();

    if (error || !data) return null;
    return data as WhatsAppSequence;
  }

  async saveSequence(sequence: WhatsAppSequence): Promise<void> {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from(this.tableName).upsert({
      lead_id: sequence.leadId,
      current_stage: sequence.currentStage,
      sequence_data: sequence,
      last_interaction: new Date().toISOString(),
    });
    if (error) throw error;
  }

  async updateStage(leadId: string, stage: WhatsAppStage): Promise<void> {
    const supabase = createServerSupabaseClient();
    await supabase
      .from(this.tableName)
      .update({
        current_stage: stage,
        last_interaction: new Date().toISOString(),
      })
      .eq('lead_id', leadId);
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      await sendTwilioMessage(formattedTo, message);
      return true;
    } catch (error) {
      console.error('TwilioWhatsAppRepository Error:', error);
      return false;
    }
  }
}
