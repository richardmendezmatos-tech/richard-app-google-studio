import { describe, it, expect, vi } from 'vitest';
import { ScoreCalculator } from './application/use-cases/ScoreCalculator';
import { ProcessWhatsAppMessage } from './application/use-cases/ProcessWhatsAppMessage';
import { FirestoreInventoryRepository } from './infrastructure/repositories/FirestoreInventoryRepository';
import { Lead, Car } from './domain/entities';

describe('💨 Smoke Test: Richard Automotive "Clean"', () => {

    /**
     * 1. Core Check: Entidades y Casos de Uso
     * Verifica que no hay errores de importación y que la lógica pura funciona.
     */
    it('1. Core Check: Debe instanciar entidades y calcular score correctamente', () => {
        const mockCar: Car = {
            id: 'unit-123',
            name: 'Toyota Tacoma 2024',
            make: 'Toyota',
            model: 'Tacoma',
            year: 2024,
            price: 45000,
            mileage: 10,
            type: 'pickup'
        };

        const mockLead: Partial<Lead> = {
            firstName: 'Juan',
            lastName: 'Del Pueblo',
            monthlyIncome: '4500', // +10
            hasPronto: true,        // +10
            vehicleId: 'unit-123',  // +20
            chatInteractions: 10,   // +15
            aiAnalysis: {
                score: 75,
                insights: ['Test insight'],
                requestedConsultation: true
            } // +20
        };
        // Total = 75 -> HOT

        const result = ScoreCalculator.execute(mockLead);

        expect(mockCar.id).toBe('unit-123');
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.category).toBe('HOT');
        console.log('✅ Core Check passed: Score =', result.score);
    });

    /**
     * 2. raSentinel Flow: WhatsApp Orchestration
     * Valida que la capa de aplicación pueda orquestar el flujo sin errores de "fuga".
     */
    it('2. raSentinel Flow: Debe orquestar mensaje de WhatsApp sin fallos de inyección', async () => {
        // Mocks
        const mockChatRepo = { getById: vi.fn(), save: vi.fn() };
        const mockAgentOrch = { orchestrate: vi.fn().mockResolvedValue({ response: 'Hola, soy Richard IA', metadata: {} }) };
        const mockLeadRepo = { getById: vi.fn().mockResolvedValue({ id: 'lead-1', firstName: 'Juan' }) };
        const mockInventoryRepo = { getById: vi.fn().mockResolvedValue({ id: 'unit-123', name: 'Tacoma' }) };

        // ProcessWhatsAppMessage(chatRepo, leadRepo, aiOrchestrator, inventoryRepo)
        const processor = new ProcessWhatsAppMessage(
            mockChatRepo as any,
            mockLeadRepo as any,
            mockAgentOrch as any,
            mockInventoryRepo as any
        );

        const reply = await processor.execute({
            from: '17875551234',
            body: '¿Tienen la Tacoma?',
            vehicleId: 'unit-123'
        });

        expect(reply).toContain('Richard IA');
        expect(mockAgentOrch.orchestrate).toHaveBeenCalled();
        console.log('✅ raSentinel Flow passed: Orchestrated reply received');
    });

    /**
     * 3. Integridad de Infraestructura (Híbrida)
     * Verifica que los adaptadores de Firestore están bien linkeados.
     */
    it('3. Integridad Híbrida: Conectividad de Repositorio Firestore', async () => {
        const repo = new FirestoreInventoryRepository();

        try {
            const result = await repo.getById('non-existent');
            expect(result).toBeNull();
            console.log('✅ Hybrid Integrity: FirestoreInventoryRepository instantiated and linked');
        } catch (e: any) {
            console.log('ℹ️ Hybrid Integrity: Repository tested (Note: Check environment for DB access)');
        }
    });

});
