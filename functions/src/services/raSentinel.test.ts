import { calculateOperationalScore } from './raSentinel';
import { saveCheckpoint } from './persistenceService';
import * as fs from 'fs';

describe('Richard Automotive Sentinel & Persistence', () => {
    it('should calculate Operational Score correctly for business health', () => {
        const highHealth = calculateOperationalScore({ credit_score: 750, active_followup: true });
        const lowHealth = calculateOperationalScore({ unprocessed_incident: true });

        expect(highHealth).toBeGreaterThan(90);
        expect(lowHealth).toBeLessThan(50);
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
