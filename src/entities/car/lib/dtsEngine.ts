/**
 * Strategic CEO Engine: Predictive Sales Analytics (DTS Engine)
 * Heuristic based on price deviation, feature density, vehicle age, mileage and lead momentum.
 */
import { Car } from '@/entities/shared';

export interface PredictionResult {
  daysToSale: number;
  confidence: number;
  advantageScore: number; // 0-100
  recommendation: string;
}

type PredictiveCar = Partial<Car>;

const BRAND_TIER: Record<string, number> = {
  Toyota: 0.9,
  Honda: 0.95,
  Kia: 1.0,
  Hyundai: 1.05,
  Mercedes: 1.2,
  BMW: 1.25,
  Lexus: 0.95,
  Ford: 1.1,
  Chevrolet: 1.1,
  Nissan: 1.05,
};

export const calculatePredictiveDTS = (car: PredictiveCar, leadsCount: number = 0): PredictionResult => {
  let baseDays = 45; // Promedio de la industria para autos usados en PR
  let score = 50;

  // 1. Efecto del Precio
  const price = car.price || 0;
  if (price > 0) {
    if (price < 15000) { baseDays -= 15; score += 10; }
    else if (price < 25000) { baseDays -= 10; score += 5; }
    else if (price > 75000) { baseDays += 25; score -= 15; }
  }

  // 2. Efecto del Año (Demanda Subjetiva)
  const currentYear = new Date().getFullYear();
  const year = car.year || currentYear;
  const age = currentYear - year;
  
  if (age <= 3) {
    baseDays -= 10; // Semi-nuevos tienen alta rotación o alto precio
    score += 10;
  } else if (age > 10) {
    baseDays += 20; // Más de 10 años, financiamiento difícil
    score -= 10;
  }

  // 3. Efecto de la Marca (Brand Liquidity Tier)
  const make = car.make || 'Generic';
  const brandMulti = BRAND_TIER[make] || 1.15; // Marcas raras se tardan más
  baseDays = Math.round(baseDays * brandMulti);

  // 4. Feature Density (AI Value perceived)
  const features = car.features || [];
  if (features.length > 5) {
    baseDays -= 5;
    score += 10;
  }

  // 5. Momentum de Leads (Tracción en Tiempo Real)
  if (leadsCount > 3) { baseDays -= 8; score += 15; }
  if (leadsCount > 8) { baseDays -= 15; score += 20; }
  if (leadsCount > 15) { baseDays -= 25; score += 25; }

  // 6. Calidad de Presentación
  if (!car.img) {
    baseDays += 30; // Un carro sin foto no se vende
    score -= 20;
  }

  // Lógica final del Advantage Score
  const advantage = Math.min(100, Math.max(0, score + (leadsCount * 3) - (price / 8000)));

  // Recomendación Estratégica
  let recommendation = 'Mantener precio actual y monitorear.';
  if (advantage > 85) recommendation = '🔥 Alta Demanda: Considerar aumento ligero o protección (GAP).';
  if (advantage > 70 && advantage <= 85) recommendation = '🚀 Tracción Activa: Listo para cierre.';
  if (advantage < 40) recommendation = '⚠️ Baja Tracción: Reducción de precio o campaña agresiva.';

  return {
    daysToSale: Math.max(1, baseDays), // Nunca menos de 1 día
    confidence: leadsCount > 10 || price > 0 ? 92 : 65,
    advantageScore: advantage,
    recommendation,
  };
};

export interface PredictionOutcome {
  predictionId: string;
  actualDaysToSale: number;
  predictedDaysToSale: number;
  wasAccurate: boolean;
  timestamp: number;
}

export const recordPredictionOutcomes = async (outcome: PredictionOutcome) => {
  console.log('[Antigravity DTS] Logging prediction outcome', outcome);
  try {
    const { db } = await import('@/shared/api/firebase/firebaseService');
    const { addDoc, collection } = await import('firebase/firestore/lite');
    await addDoc(collection(db, 'prediction_outcomes'), {
      ...outcome,
      modelVersion: 'dts-v3-heuristic-advanced',
      target: 'richard-automotive-command-center',
    });
  } catch (err) {
    console.error('Failed to log tactical prediction data:', err);
  }
};
