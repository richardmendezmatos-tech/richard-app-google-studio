import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SemanticMatch {
  car_id: string;
  car_name: string;
  content: string;
  similarity: number;
}

export const searchSemanticInventory = async (
  queryEmbedding: number[],
  threshold = 0.5,
  count = 3,
): Promise<SemanticMatch[]> => {
  const { data, error } = await supabase.rpc('match_inventory', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: count,
  });

  if (error) {
    console.error('Error in semantic search:', error);
    return [];
  }

  return data as SemanticMatch[];
};

export const logSearchGap = async (query: string, intent?: string) => {
  const { error } = await supabase.from('search_gaps').insert({
    query,
    detected_intent: intent,
  });
  if (error) console.error('Error logging search gap:', error);
};

export const captureHotLead = async (leadData: {
  vehicleId: string;
  vehicleName: string;
  vehiclePrice: number;
  monthlyPayment?: number;
  downPayment?: number;
  tradeIn?: number;
  term?: number;
  creditTier?: string;
  source: string;
}) => {
  try {
    const { error } = await supabase.from('hot_leads').insert({
      vehicle_id: leadData.vehicleId,
      vehicle_name: leadData.vehicleName,
      vehicle_price: leadData.vehiclePrice,
      monthly_payment: leadData.monthlyPayment,
      down_payment: leadData.downPayment,
      trade_in: leadData.tradeIn,
      term: leadData.term,
      credit_tier: leadData.creditTier,
      source: leadData.source,
      timestamp: new Date().toISOString()
    });
    
    if (error) {
      console.error('[Supabase] Error capturing hot lead:', error);
    } else {
      console.log('[Supabase] Hot lead captured successfully.');
    }
  } catch (err) {
    console.error('[Supabase] Exception in captureHotLead:', err);
  }
};

/**
 * createPurchaseOrderDraft
 * Registra una orden de compra sugerida por la IA de Houston basándose en Search Gaps.
 */
export const createPurchaseOrderDraft = async (orderData: {
  query: string;
  recommendation: string;
  roi: number;
  priority: string;
  reason: string;
}) => {
  try {
    const { error } = await supabase.from('purchase_orders').insert({
      query: orderData.query,
      recommendation: orderData.recommendation,
      estimated_roi: orderData.roi,
      priority: orderData.priority,
      reason: orderData.reason,
      status: 'draft',
      created_at: new Date().toISOString()
    });

    if (error) {
       console.error('[Supabase] Error creating PO draft:', error);
       return { success: false, error };
    }

    console.log('[Supabase] PO Draft created successfully.');
    return { success: true };
  } catch (err) {
    console.error('[Supabase] Exception in createPurchaseOrderDraft:', err);
    return { success: false, error: err };
  }
};

/**
 * getPurchaseOrders
 * Recupera el log de abasto filtrado por estatus activo (draft o confirmed).
 */
export const getPurchaseOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching POs:', error);
      return [];
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Exception in getPurchaseOrders:', err);
    return [];
  }
};

/**
 * updatePurchaseOrderStatus
 * Actualiza el estatus de una orden (confirmar o archivar).
 */
export const updatePurchaseOrderStatus = async (id: string, status: 'confirmed' | 'archived') => {
  try {
    const { error } = await supabase
      .from('purchase_orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating PO status:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('[Supabase] Exception in updatePurchaseOrderStatus:', err);
    return { success: false, error: err };
  }
};
