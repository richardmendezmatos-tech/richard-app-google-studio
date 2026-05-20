import { supabase } from '@/shared/api/supabase/supabaseClient';

export interface ConversationMessage {
  id?: string;
  leadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source: 'whatsapp' | 'web' | 'sms';
  metadata?: {
    mediaUrl?: string;
    vehicleId?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

/**
 * Service for managing conversation history in Supabase.
 * Enables contextual RAG by storing and retrieving message history.
 */
export class ConversationService {
  private tableName = 'conversations';

  /**
   * Adds a new message to the conversation history.
   */
  async addMessage(
    leadId: string,
    role: 'user' | 'assistant',
    content: string,
    source: 'whatsapp' | 'web' | 'sms',
    metadata?: ConversationMessage['metadata'],
  ): Promise<void> {
    try {
      if (!supabase) return;

      const { error } = await supabase.from(this.tableName).insert({
        lead_id: leadId,
        role,
        content,
        source,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding message to conversation:', error);
      throw error;
    }
  }

  /**
   * Retrieves conversation history for a lead.
   * Returns messages in chronological order (oldest first).
   */
  async getConversationHistory(
    leadId: string,
    messageLimit: number = 10,
  ): Promise<ConversationMessage[]> {
    try {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('lead_id', leadId)
        .order('timestamp', { ascending: false })
        .limit(messageLimit);

      if (error) throw error;

      const messages = (data || []).map((msg: any) => ({
        id: msg.id,
        leadId: msg.lead_id,
        role: msg.role,
        content: msg.content,
        source: msg.source,
        metadata: msg.metadata,
        timestamp: new Date(msg.timestamp),
      }));

      // Reverse to get chronological order (oldest first)
      return messages.reverse();
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  /**
   * Formats conversation history for RAG context.
   * Returns a string suitable for inclusion in Gemini prompts.
   */
  async getContextForRAG(leadId: string, messageLimit: number = 5): Promise<string> {
    const history = await this.getConversationHistory(leadId, messageLimit);

    if (history.length === 0) {
      return 'No hay historial de conversación previo.';
    }

    return history
      .map((msg) => {
        const role = msg.role === 'user' ? 'Cliente' : 'Asistente';
        return `${role}: ${msg.content}`;
      })
      .join('\n');
  }

  /**
   * Gets the last message from a conversation.
   * Useful for detecting context switches or topic changes.
   */
  async getLastMessage(leadId: string): Promise<ConversationMessage | null> {
    const history = await this.getConversationHistory(leadId, 1);
    return history.length > 0 ? history[0] : null;
  }

  /**
   * Counts total messages in a conversation.
   * Useful for analytics and intent scoring.
   */
  async getMessageCount(leadId: string): Promise<number> {
    try {
      if (!supabase) return 0;
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('lead_id', leadId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting messages:', error);
      return 0;
    }
  }
}

export const conversationService = new ConversationService();
