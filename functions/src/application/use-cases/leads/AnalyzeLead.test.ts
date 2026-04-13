import { describe, it, expect, vi } from 'vitest';
import { AnalyzeLead } from './AnalyzeLead.usecase';
import { InventoryRepository } from '../../../domain/repositories';
import { Car, Lead } from '../../../domain/entities';

describe('AnalyzeLead Use Case', () => {
    const mockInventoryRepo: InventoryRepository = {
        save: vi.fn(),
        getById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        list: vi.fn(),
        search: vi.fn()
    } as unknown as InventoryRepository;

    const useCase = new AnalyzeLead(mockInventoryRepo);

    it('should enrich lead analysis with vehicle data when vehicleId is provided', async () => {
        const mockCar: Partial<Car> = {
            id: 'car-123',
            make: 'Hyundai',
            model: 'Tucson',
            year: 2024,
            price: 32000,
            mileage: 0
        };

        vi.mocked(mockInventoryRepo.getById).mockResolvedValue(mockCar as Car);

        const input: Partial<Lead> = {
            firstName: 'Richard',
            lastName: 'Mendez',
            phone: '7870000000',
            email: 'richard@example.com',
            vehicleId: 'car-123',
            monthlyIncome: "5000",
            chatInteractions: 10,
            hasPronto: true,
            timeAtJob: '2+ years',
            aiAnalysis: { score: 75, insights: [], requestedConsultation: true } as any
        };

        const result = await useCase.execute(input);

        expect(result.tag).toBe('success');
        if (result.tag === 'success') {
            expect(result.value.unidad_interes).toBe('2024 Hyundai Tucson');
            expect(result.value.category).toBe('HOT');
        }
        expect(mockInventoryRepo.getById).toHaveBeenCalledWith('car-123');
    });

    it('should handle missing vehicle gracefully', async () => {
        vi.mocked(mockInventoryRepo.getById).mockResolvedValue(null);

        const input = {
            firstName: 'Cold',
            lastName: 'Lead',
            phone: '7871112222',
            email: 'cold@example.com',
            vehicleId: 'missing-car',
            monthlyIncome: "1000"
        };

        const result = await useCase.execute(input);

        expect(result.tag).toBe('success');
        if (result.tag === 'success') {
            expect(result.value.unidad_interes).toBe('missing-car'); // Fallback to id if not found
            expect(result.value.category).toBe('COLD');
        }
    });
});
