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
   * Analiza imágenes de un vehículo y sugiere un valor de tasación basado en un baseline de mercado.
   */
  async appraiseVehicle(images: string[], marketBaseline: number): Promise<AppraisalResult> {
    const analysis = await analyzeTradeInImages(images);

    const result = analysis as unknown as {
      condition: string;
      defects: string[];
      estimatedValueAdjustment: number;
      reasoning: string;
    };

    // 1. Aplicamos el ajuste de la IA (estado físico)
    const iaAdjustment = result.estimatedValueAdjustment || 1.0;
    
    // 2. Aplicamos depreciación estimada por millaje (Simplificado/Dealer-grade)
    // Asumimos un desgaste de 0.5% por cada 5k millas sobre el promedio
    const mileageAdjustment = 1.0; // Placeholder para lógica más compleja
    
    const suggestedAppraisal = Math.round(
      marketBaseline * iaAdjustment * mileageAdjustment
    );

    return {
      ...result,
      suggestedAppraisal,
    };
  }
}

export const appraisalVisionService = new AppraisalVisionService();
