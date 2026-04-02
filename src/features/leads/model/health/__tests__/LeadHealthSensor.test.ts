import { describe, test, expect } from 'vitest';
import { LeadHealthSensor } from '../LeadHealthSensor';
import { Lead, PredictiveInsight } from '@/entities/lead';

describe('LeadHealthSensor', () => {
  const mockLead: Lead = {
    id: 'test_123',
    status: 'new',
    type: 'finance',
    name: 'Juan Perez',
  };

  const highIntentInsight: PredictiveInsight = {
    leadId: 'test_123',
    score: 90,
    confidence: 0.95,
    factors: ['Alta interacción'],
    predictedAction: 'Immediate Outreach',
    timestamp: Date.now(),
  };

  const lowIntentInsight: PredictiveInsight = {
    leadId: 'test_123',
    score: 40,
    confidence: 0.8,
    factors: ['Poco interés'],
    predictedAction: 'Nurture',
    timestamp: Date.now(),
  };

  test('debe detectar que un lead de alta intención necesita curación (Nivel 13)', () => {
    const status = LeadHealthSensor.check(mockLead, highIntentInsight);
    expect(status.needsHealing).toBe(true);
    expect(status.score).toBe(90);
  });

  test('no debe activar curación para leads de baja intención', () => {
    const status = LeadHealthSensor.check(mockLead, lowIntentInsight);
    expect(status.needsHealing).toBe(false);
  });

  test('debe detectar abandono después de 120 segundos', () => {
    const oldInteraction = Date.now() - 130000;
    const isAbandoned = LeadHealthSensor.isAbandoned(mockLead, oldInteraction);
    expect(isAbandoned).toBe(true);
  });

  test('no debe detectar abandono antes de los 120 segundos', () => {
    const recentInteraction = Date.now() - 30000;
    const isAbandoned = LeadHealthSensor.isAbandoned(mockLead, recentInteraction);
    expect(isAbandoned).toBe(false);
  });
});
