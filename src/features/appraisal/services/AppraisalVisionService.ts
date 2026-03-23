import { analyzeTradeInImages } from '@/features/ai-agents';

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

    // Calculamos el valor sugerido multiplicando el baseline por el ajuste de la IA (0.7 - 1.1)
    const suggestedAppraisal = Math.round(
      marketBaseline * (result.estimatedValueAdjustment || 1.0),
    );

    return {
      ...result,
      suggestedAppraisal,
    };
  }
}

export const appraisalVisionService = new AppraisalVisionService();
