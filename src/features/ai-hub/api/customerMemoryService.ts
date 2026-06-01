import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export interface CustomerPreference {
  brands: string[];
  carTypes: string[];
  priceRange: { min: number; max: number };
  lastSeen: string;
  intentScore: number;
}

export interface StructuredNote {
  timestamp: string;
  content: string;
  category: 'intent' | 'objection' | 'budget' | 'general';
}

export interface CustomerMemory {
  leadId: string;
  preferences: CustomerPreference;
  history: string[]; // List of vehicle IDs viewed or discussed
  notes: StructuredNote[]; // AI-generated synthesis of customer persona (Sanitized)
}

/**
 * Service to manage long-term customer memory and preferences.
 */
export class CustomerMemoryService {
  private tableName = 'customer_memory';

  /**
   * Sanitizes input to remove potential PII (Phones, SSN patterns, etc.)
   */
  private sanitizeSnippet(text: string): string {
    // Mask PR Phones: (787/939) XXX-XXXX or XXX-XXXX
    let sanitized = text.replace(/(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g, '[PHONE_MASKED]');
    // Mask generic 9-digit patterns (SSN potential)
    sanitized = sanitized.replace(/\d{3}-\d{2}-\d{4}/g, '[ID_MASKED]');
    return sanitized;
  }

  /**
   * Updates customer memory based on a new interaction.
   */
  async updateMemory(
    leadId: string,
    vehicleId?: string,
    interactionSnippet?: string,
    category: StructuredNote['category'] = 'general',
  ): Promise<void> {
    const supabase = createServerSupabaseClient();
    const { data: existing, error: fetchError } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('lead_id', leadId)
      .single();

    const currentMemory: any = existing ? existing.memory_data : this.getDefaultMemory(leadId);

    if (vehicleId && !currentMemory.history.includes(vehicleId)) {
      currentMemory.history.push(vehicleId);
    }

    if (interactionSnippet) {
      const sanitized = this.sanitizeSnippet(interactionSnippet);
      currentMemory.notes.push({
        timestamp: new Date().toISOString(),
        content: sanitized,
        category,
      });
    }

    currentMemory.preferences.lastSeen = new Date().toISOString();

    const { error: upsertError } = await supabase.from(this.tableName).upsert({
      lead_id: leadId,
      memory_data: currentMemory,
      updated_at: new Date().toISOString(),
    });

    if (upsertError) throw upsertError;
  }

  /**
   * Retrieves the stored memory for a lead.
   */
  async getMemory(leadId: string): Promise<CustomerMemory | null> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('memory_data')
      .eq('lead_id', leadId)
      .single();

    if (error || !data) return null;
    return data.memory_data as CustomerMemory;
  }

  private getDefaultMemory(leadId: string): CustomerMemory {
    return {
      leadId,
      preferences: {
        brands: [],
        carTypes: [],
        priceRange: { min: 0, max: 0 },
        lastSeen: new Date().toISOString(),
        intentScore: 0,
      },
      history: [],
      notes: [],
    };
  }
}

export const customerMemoryService = new CustomerMemoryService();
