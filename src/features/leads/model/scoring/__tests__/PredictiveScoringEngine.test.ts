import { describe, it, expect } from 'vitest';
import { PredictiveScoringEngine } from '../PredictiveScoringEngine';
import { Lead } from '@/entities/lead';

describe('PredictiveScoringEngine - Nivel 14', () => {
  const engine = new PredictiveScoringEngine();

  it('should increase score significantly with high dwell time and optimal scroll velocity', async () => {
    const mockLead: Partial<Lead> = {
      id: 'lead_123',
      aiScore: 50,
      behavioralMetrics: {
        timeOnSite: 400,
        inventoryViews: 6,
        intentTrajectory: 'improving',
      },
      behavioralFingerprint: {
        scrollVelocity: 150, // Optimal focus
        imageDwellTime: { 'img1': 15000, 'img2': 20000 }, // 35s total
        featureInteractions: ['specs', 'compare'],
        lastMicroInteraction: Date.now(),
        interactionIntensity: 8,
      }
    };

    const result = await engine.compute(mockLead as Lead);

    // Initial 50 
    // +10 (timeOnSite) 
    // +15 (inventoryViews) 
    // +15 (dwellTime > 30s)
    // +10 (scroll velocity optimal)
    // +15 (intensity > 7)
    // = 115 -> Cap 100
    // * 1.1 (improving trajectory) -> 100
    
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.factors).toContain('Exámen visual detallado (Dwell Time High)');
    expect(result.factors).toContain('Patrón de lectura enfocado (Scroll Velocity Optimal)');
    expect(result.predictedAction).toBe('Immediate Outreach - High Conversion');
  });

  it('should maintain stable score for low interaction patterns', async () => {
    const mockLead: Partial<Lead> = {
      id: 'lead_456',
      aiScore: 40,
      behavioralMetrics: {
        timeOnSite: 60,
        inventoryViews: 1,
        intentTrajectory: 'stable',
      },
      behavioralFingerprint: {
        scrollVelocity: 1200, // Rapid scanning, no focus
        imageDwellTime: { 'img1': 1000 },
        featureInteractions: [],
        lastMicroInteraction: Date.now(),
        interactionIntensity: 2,
      }
    };

    const result = await engine.compute(mockLead as Lead);
    
    expect(result.score).toBeLessThan(60);
    expect(result.predictedAction).toBe('Nudge Scheduled');
  });
});
