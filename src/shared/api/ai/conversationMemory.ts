import { createServiceClient } from '@/shared/api/supabase/factory';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_HISTORY = 10;

export const conversationMemory = {
  async loadWhatsAppHistory(phone: string): Promise<ConversationTurn[]> {
    try {
      const supabase = createServiceClient();
      const { data } = await supabase
        .from('conversations')
        .select('role, content')
        .eq('source', 'whatsapp')
        .filter('metadata->>phone', 'eq', phone)
        .order('timestamp', { ascending: true })
        .limit(MAX_HISTORY);
      return (data || []) as ConversationTurn[];
    } catch {
      return [];
    }
  },

  async saveWhatsAppTurn(phone: string, userMessage: string, assistantReply: string): Promise<void> {
    try {
      const supabase = createServiceClient();
      const now = new Date().toISOString();
      await supabase.from('conversations').insert([
        { role: 'user', content: userMessage, source: 'whatsapp', metadata: { phone }, timestamp: now },
        { role: 'assistant', content: assistantReply, source: 'whatsapp', metadata: { phone }, timestamp: now },
      ]);
    } catch {
      // non-blocking — never let storage failure break the bot response
    }
  },

  async saveWebTurn(sessionId: string, userMessage: string, assistantReply: string): Promise<void> {
    try {
      const supabase = createServiceClient();
      const now = new Date().toISOString();
      await supabase.from('conversations').insert([
        { role: 'user', content: userMessage, source: 'web', metadata: { session_id: sessionId }, timestamp: now },
        { role: 'assistant', content: assistantReply, source: 'web', metadata: { session_id: sessionId }, timestamp: now },
      ]);
    } catch {
      // non-blocking
    }
  },
};
