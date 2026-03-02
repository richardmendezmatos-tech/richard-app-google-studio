import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadLifecycleManager } from './LeadLifecycleManager.usecase';
import { CRMRepository, LeadTransition } from '../../../domain/repositories';

class MockCRMRepository implements CRMRepository {
    transitions: LeadTransition[] = [];
    async recordTransition(transition: LeadTransition): Promise<void> {
        this.transitions.push(transition);
    }
    async syncSalesData(leadId: string, saleData: any): Promise<void> { }
}

describe('LeadLifecycleManager', () => {
    let repo: MockCRMRepository;
    let manager: LeadLifecycleManager;

    beforeEach(() => {
        repo = new MockCRMRepository();
        manager = new LeadLifecycleManager(repo);
    });

    it('should generate "new" lead message and record transition', async () => {
        const result = await manager.processTransition({
            leadId: 'lead-1',
            status: 'new',
            source: 'Facebook'
        });

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value.message).toContain('Nuevo lead desde Facebook');
        }
        expect(repo.transitions.length).toBe(1);
        expect(repo.transitions[0].toStatus).toBe('new');
    });

    it('should generate "qualified" message with score', async () => {
        const result = await manager.processTransition({
            leadId: 'lead-1',
            status: 'qualified',
            score: 85,
            assignedAgent: 'Jose'
        });

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value.message).toContain('calificado con 85');
            expect(result.value.message).toContain('Jose');
        }
    });

    it('should handle "sold" status with sale ID', async () => {
        const result = await manager.processTransition({
            leadId: 'lead-1',
            status: 'sold',
            saleId: 'SALE-999',
            amount: 25000.50
        });

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value.message).toContain('VENTA CERRADA');
            expect(result.value.message).toContain('SALE-999');
            expect(result.value.message).toContain('25000.50');
        }
    });

    it('should return failure on repository error', async () => {
        vi.spyOn(repo, 'recordTransition').mockRejectedValue(new Error('DB Down'));

        const result = await manager.processTransition({
            leadId: 'lead-1',
            status: 'new'
        });

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error.message).toContain('DB Down');
        }
    });
});
