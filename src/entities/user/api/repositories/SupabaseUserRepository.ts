import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/shared/api/supabase/client';
import { UserProfile, UserRole } from '../../model/types';

export class SupabaseUserRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    if (client) {
      this.client = client;
    } else {
      this.client = createClient();
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const { data, error } = await this.client.from('profiles').select('*').eq('id', uid).single();

    if (error) {
      console.error(`[SupabaseUserRepository] Error fetching profile ${uid}:`, error);
      return null;
    }

    return data as UserProfile;
  }

  async saveUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const { error } = await this.client.from('profiles').upsert({ id: uid, ...data });

    if (error) {
      console.error(`[SupabaseUserRepository] Error saving profile ${uid}:`, error);
      throw error;
    }
  }

  async getUserRole(uid: string): Promise<UserRole> {
    const profile = await this.getUserProfile(uid);
    return profile?.role || 'user';
  }

  async logActivity(activity: any): Promise<void> {
    try {
      const { error } = await this.client.from('audit_logs').insert([activity]);

      if (error) {
        // Silently log to console, don't break the app if table is missing
        console.warn(
          '[SupabaseUserRepository] Audit log skipped (Table might be missing):',
          error.message,
        );
      }
    } catch (e) {
      console.warn('[SupabaseUserRepository] Critical fail in audit log (Non-blocking):', e);
    }
  }

  async deleteRateLimit(attemptId: string): Promise<void> {
    // Note: Rate limiting in Supabase is usually handled differently (e.g. built-in auth limits)
    // For now, we'll just mock it or use a separate table if strictly needed.
  }

  async getUserByPasskeyId(passkeyId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('passkey_id', passkeyId)
      .single();

    if (error) {
      return null;
    }

    return data as UserProfile;
  }
}
