// Pruebas Unitarias para el Sentinel F&I Advisor (Gemini 2.0-flash)
// Slice: deal-desker - API
// Creado: 2026-05-24

import { describe, it, expect, vi } from 'vitest';
import { FIAdvisor } from '../fiAdvisor';

// Mock del modulo 'ai' para evitar llamadas reales a Gemini en la suite de pruebas unitarias
vi.mock('ai', () => ({
  generateObject: vi.fn().mockImplementation(async () => {
    return {
      object: {
        approvalProbability: 'high',
        bankRecommendations: ['Banco Popular de Puerto Rico', 'FirstBank PR'],
        reasoning: 'Estructuración excelente con bajo LTV (83%). El pronto pago mitiga el riesgo del perfil.',
        tacticalSuggestions: ['Proceder con radicación inmediata'],
        fiStrategies: ['Ofrecer Contrato de Servicio Premium en modalidad Todo Incluido'],
      },
    };
  }),
}));

describe('FIAdvisor - analyzeDeal', () => {
  it('debe retornar un análisis financiero estructurado completo', async () => {
    const analysis = await FIAdvisor.analyzeDeal({
      make: 'Ford',
      model: 'Bronco',
      year: 2024,
      price: 45000,
      mileage: 12,
      creditTier: 'tier_1',
      downPayment: 10000,
      tradeInValue: 0,
      tradeInPayoff: 0,
      term: 72,
      apr: 5.95,
      ltv: 77.78,
      estimatedMonthlyPayment: 585.32,
      gapInsuranceEnabled: false,
      extendedWarrantyEnabled: true,
    });

    expect(analysis).toBeDefined();
    expect(analysis.approvalProbability).toBe('high');
    expect(analysis.bankRecommendations).toContain('Banco Popular de Puerto Rico');
    expect(analysis.reasoning).toContain('Estructuración excelente');
    expect(analysis.tacticalSuggestions).toContain('Proceder con radicación inmediata');
  });
});
