import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appraisalVisionService } from './AppraisalVisionService';
import { analyzeTradeInImages } from '@/features/ai-agents/api/geminiService';

vi.mock('@/features/ai-agents/api/geminiService', () => ({
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
});
