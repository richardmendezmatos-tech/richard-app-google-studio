import { analyzeTradeInImages } from '@/shared/api/ai';

export interface AppraisalResult {
  condition: string;
  defects: string[];
  estimatedValueAdjustment: number;
  reasoning: string;
  suggestedAppraisal: number;
}

export class AppraisalVisionService {
  /**
   * Analiza imágenes de un vehículo y sugiere un valor de tasación basado en un baseline de mercado y heurísticas locales de PR.
   */
  async appraiseVehicle(
    images: string[],
    marketBaseline: number,
    year?: number,
    make?: string,
    mileage?: number,
  ): Promise<AppraisalResult> {
    const analysis = await analyzeTradeInImages(images);

    const result = analysis as unknown as {
      condition: string;
      defects: string[];
      estimatedValueAdjustment: number;
      reasoning: string;
    };

    // 1. Aplicamos el ajuste de la IA (estado físico)
    const iaAdjustment = result.estimatedValueAdjustment || 1.0;

    // 2. Aplicamos depreciación estimada por millaje (promedio anual de 12k millas en PR, año de referencia 2026)
    let mileageAdjustment = 1.0;
    if (year && mileage) {
      const currentYear = 2026;
      let age = currentYear - year;
      if (age <= 0) age = 1;

      const expectedMileage = age * 12000;
      if (mileage > expectedMileage) {
        const overage = mileage - expectedMileage;
        const penalty = Math.min((overage / 5000) * 0.005, 0.2); // 0.5% por cada 5k millas extra, tope 20%
        mileageAdjustment = 1.0 - penalty;
      } else if (mileage < expectedMileage) {
        const underage = expectedMileage - mileage;
        const bonus = Math.min((underage / 5000) * 0.005, 0.08); // 0.5% por cada 5k millas de menos, tope 8%
        mileageAdjustment = 1.0 + bonus;
      }
    }

    // 3. Bono de Demanda Regional de Puerto Rico (PR Power Brands de alta retención de valor)
    let brandBonus = 1.0;
    if (make) {
      const brandLower = make.toLowerCase();
      // Toyota y Honda: +8% (resale value máximo/excelente en la isla)
      if (['toyota', 'honda'].includes(brandLower)) {
        brandBonus = 1.08;
      }
      // Hyundai y Kia: +5% (resale value bueno/muy bueno)
      else if (['hyundai', 'kia'].includes(brandLower)) {
        brandBonus = 1.05;
      }
    }

    // 4. Incentivo Pickup & 4x4 Prestige
    let pickupBonus = 1.0;
    if (make && ['toyota'].includes(make.toLowerCase())) {
      // Las Tacoma/Tundra son el estándar de retención extrema de valor en Puerto Rico
      pickupBonus = 1.05;
    }

    const suggestedAppraisal = Math.round(
      marketBaseline * iaAdjustment * mileageAdjustment * brandBonus * pickupBonus,
    );

    return {
      ...result,
      suggestedAppraisal,
    };
  }
}

export const appraisalVisionService = new AppraisalVisionService();
