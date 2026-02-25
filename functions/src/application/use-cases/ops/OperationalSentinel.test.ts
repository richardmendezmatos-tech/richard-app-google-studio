import { describe, it, expect } from 'vitest';
import { OperationalSentinel } from './OperationalSentinel.usecase';

describe('OperationalSentinel', () => {
    describe('calculateManualScore', () => {
        it('should return a high score for healthy operational data', () => {
            const data = {
                active_followup: true,
                credit_score: 750,
                unprocessed_incident: false
            };
            const score = OperationalSentinel.calculateManualScore(data);
            expect(score).toBeGreaterThan(80);
        });

        it('should return a low score if there are unprocessed incidents', () => {
            const data = {
                unprocessed_incident: true
            };
            const score = OperationalSentinel.calculateManualScore(data);
            expect(score).toBeLessThan(50);
        });

        it('should clamp the score between 0 and 100', () => {
            const badData = { unprocessed_incident: true, credit_score: 300 };
            const goodData = { active_followup: true, credit_score: 900 };

            expect(OperationalSentinel.calculateManualScore(badData)).toBeGreaterThanOrEqual(0);
            expect(OperationalSentinel.calculateManualScore(goodData)).toBeLessThanOrEqual(100);
        });
    });
});
