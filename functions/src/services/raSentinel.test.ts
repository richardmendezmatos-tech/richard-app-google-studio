import { describe, it, expect, vi } from 'vitest';
import { OperationalSentinel } from '../application/use-cases';
import { saveCheckpoint } from './persistenceService';
import fs from 'node:fs';

let lastWrittenData = '';
vi.mock('node:fs', () => ({
    default: {
        existsSync: vi.fn(() => true),
        mkdirSync: vi.fn(),
        writeFileSync: vi.fn((path, data) => { lastWrittenData = data; }),
        readFileSync: vi.fn(() => lastWrittenData),
        unlinkSync: vi.fn()
    }
}));

describe('raSentinel', () => {
    describe('calculateBusinessHealthScore', () => {
        it('should calculate a correct score based on input data', () => {
            const highRiskData = {
                active_followup: false,
                credit_score: 550,
                unprocessed_incident: true
            };
            const score = OperationalSentinel.calculateManualScore(highRiskData);
            expect(score).toBeLessThan(75);
        });

        it('should calculate a high score for healthy data', () => {
            const healthyData = {
                active_followup: true,
                credit_score: 750,
                unprocessed_incident: false
            };
            const score = OperationalSentinel.calculateManualScore(healthyData);
            expect(score).toBeGreaterThan(80);
        });
    });

    it('should save a valid checkpoint JSON for the persistence protocol', async () => {
        const testId = 'test-id-' + Date.now();
        const data = {
            id: testId,
            fecha: '2026-02-21',
            categoria: 'TEST_CHECKPOINT',
            titulo: 'Verification Test',
            resumen: 'Verifying the workspace manager protocol.',
            estatus: 'VERIFYING'
        };

        const filePath = await saveCheckpoint(data);
        expect(fs.existsSync(filePath)).toBe(true);

        const savedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        expect(savedData.id).toBe(testId);
        expect(savedData.autor).toBe('Antigravity (Workspace Manager)');

        // Cleanup
        fs.unlinkSync(filePath);
    });
});
