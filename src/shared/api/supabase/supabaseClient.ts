let _supabaseInstance: any = null;
let _supabasePromise: Promise<any> | null = null;

export async function getSupabase() {
  if (_supabaseInstance) return _supabaseInstance;
  if (_supabasePromise) return _supabasePromise;
  _supabasePromise = (async () => {
    const { createClient } = await import('./client');
    _supabaseInstance = createClient();
    return _supabaseInstance;
  })();
  return _supabasePromise;
}

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
  const sb = await getSupabase();
  const { data, error } = await sb.rpc('match_inventory', {
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
  const sb = await getSupabase();
  const { error } = await sb.from('search_gaps').insert({
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
    const sb = await getSupabase();
    const { error } = await sb.from('hot_leads').insert({
      vehicle_id: leadData.vehicleId,
      vehicle_name: leadData.vehicleName,
      vehicle_price: leadData.vehiclePrice,
      monthly_payment: leadData.monthlyPayment,
      down_payment: leadData.downPayment,
      trade_in: leadData.tradeIn,
      term: leadData.term,
      credit_tier: leadData.creditTier,
      source: leadData.source,
      timestamp: new Date().toISOString(),
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
  estimatedPurchasePrice?: number;
  estimatedResalePrice?: number;
  marketScarcity?: number;
  targetSource?: string;
}) => {
  try {
    const sb = await getSupabase();
    const { error } = await sb.from('purchase_orders').insert({
      query: orderData.query,
      recommendation: orderData.recommendation,
      estimated_roi: orderData.roi,
      priority: orderData.priority,
      reason: orderData.reason,
      estimated_purchase_price: orderData.estimatedPurchasePrice,
      estimated_resale_price: orderData.estimatedResalePrice,
      market_scarcity: orderData.marketScarcity,
      target_source: orderData.targetSource,
      status: 'draft',
      created_at: new Date().toISOString(),
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
    const sb = await getSupabase();
    const { data, error } = await sb
      .from('purchase_orders')
      .select('id, created_at, status, query, estimated_roi, priority, recommendation, reason, estimated_purchase_price, estimated_resale_price, market_scarcity, target_source')
      .order('created_at', { ascending: false })
      .limit(100);

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
    const sb = await getSupabase();
    const { error } = await sb.from('purchase_orders').update({ status }).eq('id', id);

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

export const recordPredictionOutcome = async (outcome: any) => {
  try {
    const sb = await getSupabase();
    const { error } = await sb.from('prediction_outcomes').insert({
      ...outcome,
      model_version: 'dts-v3-heuristic-advanced',
      target: 'richard-automotive-command-center',
      timestamp: new Date().toISOString(),
    });
    if (error) console.error('[Supabase] Error recording prediction outcome:', error);
  } catch (err) {
    console.error('[Supabase] Exception in recordPredictionOutcome:', err);
  }
};

/**
 * getInventoryCount
 * Retorna el número total de unidades activas en el inventario.
 */
export const getInventoryCount = async (): Promise<number> => {
  try {
    const sb = await getSupabase();
    const { count, error } = await sb
      .from('inventory')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[Supabase] Error fetching inventory count:', error);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.error('[Supabase] Exception in getInventoryCount:', err);
    return 0;
  }
};
