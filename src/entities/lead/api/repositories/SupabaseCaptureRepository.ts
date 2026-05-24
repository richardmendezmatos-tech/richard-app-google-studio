import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/shared/api/supabase/client';
import { SubscriberRepository, SurveyRepository } from '../ApplicationRepository';
import { SubscriberData, SurveyData } from '../../model/captureTypes';

export class SupabaseSubscriberRepository implements SubscriberRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    if (client) {
      this.client = client;
    } else {
      this.client = createClient();
    }
  }

  async subscribe(data: SubscriberData): Promise<void> {
    const { error } = await this.client.from('subscribers').insert([data]);

    if (error) {
      console.error('[SupabaseSubscriberRepository] Error subscribing:', error);
      throw error;
    }
  }

  async getSubscribers(): Promise<SubscriberData[]> {
    const { data, error } = await this.client
      .from('subscribers')
      .select('id, email, first_name, phone, source, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[SupabaseSubscriberRepository] Error fetching subscribers:', error);
      return [];
    }

    return (data || []) as any[];
  }
}

export class SupabaseSurveyRepository implements SurveyRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    if (client) {
      this.client = client;
    } else {
      this.client = createClient();
    }
  }

  async submitSurvey(data: SurveyData): Promise<void> {
    const { error } = await this.client.from('surveys').insert([data]);

    if (error) {
      console.error('[SupabaseSurveyRepository] Error submitting survey:', error);
      throw error;
    }
  }
}
