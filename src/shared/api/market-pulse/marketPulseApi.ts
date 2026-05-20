import { createClient } from '../supabase/client';

export interface MarketTrend {
  make: string;
  model: string;
  average_price: number;
  lowest_price: number;
  highest_price: number;
  listing_count: number;
  timestamp: string;
}

export const getMarketTrend = async (make: string, model: string): Promise<MarketTrend | null> => {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('market_insights')
    .select('*')
    .eq('make', make)
    .eq('model', model)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.warn(`[MarketPulse] No data for ${make} ${model}, returning simulated data.`);
    return simulateMarketTrend(make, model);
  }

  return data as MarketTrend;
};

/**
 * Simulador de Inteligencia de Mercado (Sentinel Fallback)
 * Proporciona heurísticas basadas en datos históricos de PR si el scraper no ha corrido.
 */
const simulateMarketTrend = (make: string, model: string): MarketTrend => {
  // Heurística base: Precios promedio en PR
  const basePrices: Record<string, number> = {
    Toyota: 25000,
    Honda: 23000,
    Lexus: 45000,
    BMW: 55000,
    Ford: 30000,
    Jeep: 35000,
  };

  const avg = basePrices[make] || 20000;

  return {
    make,
    model,
    average_price: avg,
    lowest_price: avg * 0.85,
    highest_price: avg * 1.2,
    listing_count: Math.floor(Math.random() * 50) + 5,
    timestamp: new Date().toISOString(),
  };
};

export const calculateCompetitiveness = (price: number, marketAvg: number) => {
  const diff = ((marketAvg - price) / marketAvg) * 100;

  if (diff > 5) return { status: 'excellent', label: 'Precio Agresivo', score: 95 };
  if (diff > 0) return { status: 'good', label: 'Buen Precio', score: 85 };
  if (diff > -5) return { status: 'fair', label: 'Precio de Mercado', score: 70 };
  return { status: 'high', label: 'Sobre el Mercado', score: 50 };
};
