import { createClient } from '@/shared/api/supabase/client';

export interface ReferralInput {
  referrerPhone: string;
  referrerName?: string;
  refereeName: string;
  refereePhone: string;
  refereeEmail?: string;
  code?: string;
}

export interface Referral {
  id: string;
  referrer_phone: string;
  referrer_name: string | null;
  referee_name: string;
  referee_phone: string;
  referee_email: string | null;
  code: string;
  status: 'pending' | 'converted' | 'expired';
  referrer_reward_amount: number;
  referee_reward_amount: number;
  lead_id: string | null;
  converted_at: string | null;
  created_at: string;
}

export async function registerReferral(data: ReferralInput): Promise<{ referralId: string; code: string }> {
  const supabase = createClient();

  // Generate unique code
  const code = data.code || generateCode();

  const { data: referral, error } = await supabase
    .from('referrals')
    .insert({
      referrer_phone: data.referrerPhone,
      referrer_name: data.referrerName || null,
      referee_name: data.refereeName,
      referee_phone: data.refereePhone,
      referee_email: data.refereeEmail || null,
      code,
      status: 'pending',
      referrer_reward_amount: 200,
      referee_reward_amount: 100,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Este código de referido ya existe. Intenta de nuevo.');
    }
    throw new Error(error.message);
  }

  return { referralId: referral.id, code };
}

export async function getReferralByCode(code: string): Promise<Referral | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (error) {
    console.error('[ReferralService] Error fetching referral:', error);
    return null;
  }

  return data;
}

export async function convertReferral(code: string, leadId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('referrals')
    .update({
      status: 'converted',
      lead_id: leadId,
      converted_at: new Date().toISOString(),
    })
    .eq('code', code.toUpperCase())
    .eq('status', 'pending');

  if (error) {
    console.error('[ReferralService] Error converting referral:', error);
    throw new Error(error.message);
  }
}

export async function getReferralsByPhone(phone: string): Promise<Referral[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_phone', phone)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ReferralService] Error fetching referrals:', error);
    return [];
  }

  return data || [];
}

export async function getReferralStats(phone: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('referrals')
    .select('status, referrer_reward_amount')
    .eq('referrer_phone', phone);

  if (error) {
    console.error('[ReferralService] Error fetching stats:', error);
    return { total: 0, pending: 0, converted: 0, earned: 0 };
  }

    const total = data?.length || 0;
    const pending = data?.filter((r: { status: string }) => r.status === 'pending').length || 0;
    const converted = data?.filter((r: { status: string }) => r.status === 'converted').length || 0;
    const earned = data
      ?.filter((r: { status: string; referrer_reward_amount?: number }) => r.status === 'converted')
      .reduce((sum: number, r: { referrer_reward_amount?: number }) => sum + (r.referrer_reward_amount || 0), 0) || 0;

  return { total, pending, converted, earned };
}

function generateCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
