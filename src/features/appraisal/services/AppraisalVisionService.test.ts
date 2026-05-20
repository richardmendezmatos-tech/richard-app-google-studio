import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appraisalVisionService } from './AppraisalVisionService';
import { analyzeTradeInImages } from '@/shared/api/ai/geminiService';

vi.mock('@/shared/api/ai/geminiService', () => ({
  analyzeTradeInImages: vi.fn(),
}));

describe('AppraisalVisionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate suggested appraisal based on market baseline and adjustment', async () => {
    const mockAnalysis = {
      condition: 'Excelente',
      defects: [],
      estimatedValueAdjustment: 1.1,
      reasoning: 'El vehículo está en condiciones óptimas.',
    };
    (analyzeTradeInImages as any).mockResolvedValue(mockAnalysis);

    const result = await appraisalVisionService.appraiseVehicle(['base64image'], 10000);

    expect(result.suggestedAppraisal).toBe(11000);
    expect(result.condition).toBe('Excelente');
    expect(analyzeTradeInImages).toHaveBeenCalledWith(['base64image']);
  });

  it('should handle poor condition with downward adjustment', async () => {
    const mockAnalysis = {
      condition: 'Pobre',
      defects: ['Golpe frontal', 'Pintura quemada'],
      estimatedValueAdjustment: 0.7,
      reasoning: 'Daños estructurales visibles.',
    };
    (analyzeTradeInImages as any).mockResolvedValue(mockAnalysis);

    const result = await appraisalVisionService.appraiseVehicle(['base64image'], 10000);

    expect(result.suggestedAppraisal).toBe(7000);
    expect(result.condition).toBe('Pobre');
  });

  it('should fallback to baseline if adjustment is missing', async () => {
    (analyzeTradeInImages as any).mockResolvedValue({
      condition: 'Bueno',
      defects: [],
      reasoning: 'N/A',
    });

    const result = await appraisalVisionService.appraiseVehicle(['base64image'], 10000);

    expect(result.suggestedAppraisal).toBe(10000);
  });

  it('should apply high mileage depreciation penalty', async () => {
    (analyzeTradeInImages as any).mockResolvedValue({
      condition: 'Bueno',
      defects: [],
      estimatedValueAdjustment: 1.0,
      reasoning: 'N/A',
    });

    // 2024 model in 2026 has age 2. Expected mileage = 24k miles. 50k mileage is 26k over.
    // Penalty: (26k / 5k) * 0.005 = 2.6%. Adjustment = 0.974.
    const result = await appraisalVisionService.appraiseVehicle(
      ['base64image'],
      10000,
      2024,
      'Generic',
      50000,
    );

    expect(result.suggestedAppraisal).toBe(9740);
  });

  it('should apply low mileage preservation bonus', async () => {
    (analyzeTradeInImages as any).mockResolvedValue({
      condition: 'Bueno',
      defects: [],
      estimatedValueAdjustment: 1.0,
      reasoning: 'N/A',
    });

    // 2024 model in 2026 has age 2. Expected mileage = 24k miles. 4k mileage is 20k under.
    // Bonus: (20k / 5k) * 0.005 = 2%. Adjustment = 1.02.
    const result = await appraisalVisionService.appraiseVehicle(
      ['base64image'],
      10000,
      2024,
      'Generic',
      4000,
    );

    expect(result.suggestedAppraisal).toBe(10200);
  });

  it('should apply PR power brand demand bonus and Toyota pickup incentive', async () => {
    (analyzeTradeInImages as any).mockResolvedValue({
      condition: 'Bueno',
      defects: [],
      estimatedValueAdjustment: 1.0,
      reasoning: 'N/A',
    });

    // Toyota brand bonus: 1.08. Toyota pickup bonus: 1.05. Total bonus: 1.134
    const result = await appraisalVisionService.appraiseVehicle(
      ['base64image'],
      10000,
      2026,
      'Toyota',
      12000,
    );

    expect(result.suggestedAppraisal).toBe(11340);
  });
});
