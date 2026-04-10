/**
 * Sourcing Intelligence (Sentinel N15)
 * Capa de análisis para transformar 'Search Gaps' en 'Oportunidades de Abasto'.
 */

export interface SourcingOpportunity {
  query: string;
  count: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  roi: number; // Porcentaje estimado de retorno (Simulado)
  reason: string;
  recommendation: string;
}

const MODEL_MAPPINGS: Record<string, { model: string; segment: string }> = {
  'jeep': { model: 'Wrangler / Gladiator', segment: 'Off-road' },
  'wrangler': { model: 'Wrangler', segment: 'Off-road' },
  'tacoma': { model: 'Tacoma', segment: 'Pickup' },
  'toyota': { model: 'Tacoma / 4Runner', segment: 'SUV/Pickup' },
  'ford': { model: 'F-150 / Bronco', segment: 'Truck/SUV' },
  'bronco': { model: 'Bronco', segment: 'SUV' },
  'tesla': { model: 'Model 3/Y', segment: 'EV' },
};

export const analyzeGap = (query: string, count: number): SourcingOpportunity => {
  const normalizedQuery = query.toLowerCase();
  const mapping = Object.entries(MODEL_MAPPINGS).find(([key]) => normalizedQuery.includes(key));
  
  const baseRoi = 12 + (count * 0.5); // ROI base + bono por volumen de búsqueda
  const priority = count > 10 ? 'CRITICAL' : count > 5 ? 'HIGH' : 'MEDIUM';
  
  const modelName = mapping ? mapping[1].model : query.toUpperCase();
  const segment = mapping ? mapping[1].segment : 'General';

  return {
    query,
    count,
    priority,
    roi: parseFloat(Math.min(25, baseRoi).toFixed(1)),
    reason: `Volumen detectado (${count}x) en segmento ${segment}.`,
    recommendation: `Adquirir ${Math.ceil(count / 3)} unidades de ${modelName} 2021-2024.`
  };
};
