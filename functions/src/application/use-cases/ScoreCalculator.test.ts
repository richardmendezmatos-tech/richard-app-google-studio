import { describe, it, expect } from 'vitest';
import { ScoreCalculator } from './ScoreCalculator';

describe('ScoreCalculator', () => {
    it('should classify a lead as HOT with solid signals', () => {
        const input = {
            monthlyIncome: "5000",
            timeAtJob: "2+ years",
            vehicleId: "car-123",
            hasPronto: true,
            chatInteractions: 10,
            location: "Puerto Rico"
        };
        const result = ScoreCalculator.execute(input);
        expect(result.category).toBe('HOT');
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.insights).toContain("Ingreso sólido (>3k)");
        expect(result.insights).toContain("Interés específico en unidad");
    });

    it('should classify a lead as WARM with moderate signals', () => {
        const input = {
            monthlyIncome: "2500",
            timeAtJob: "1 year",
            chatInteractions: 6,
            hasPronto: true,
            viewedInventoryMultipleTimes: true,
            location: "Puerto Rico"
        };
        const result = ScoreCalculator.execute(input);
        expect(result.category).toBe('WARM');
        expect(result.score).toBeGreaterThanOrEqual(40);
        expect(result.score).toBeLessThan(70);
    });

    it('should classify a lead as COLD with weak signals', () => {
        const input = {
            monthlyIncome: "1500",
            location: "Florida"
        };
        const result = ScoreCalculator.execute(input);
        expect(result.category).toBe('COLD');
        expect(result.score).toBeLessThan(40);
    });
});
