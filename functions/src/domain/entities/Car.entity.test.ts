import { describe, it, expect } from 'vitest';
import { CarEntity, Car } from './Car.entity';

describe('CarEntity', () => {
    const mockCar: Car = {
        id: '123',
        year: 2024,
        make: 'Toyota',
        model: 'Rav4',
        name: 'Toyota Rav4 2024',
        price: 35000,
        mileage: 5000,
        type: 'SUV',
        category: 'SUV',
        condition: 'Used',
        daysInInventory: 10
    };

    it('debe calcular un score de deseabilidad alto para unidades nuevas SUV', () => {
        const entity = new CarEntity(mockCar);
        const score = entity.calculateMarketDesirability();

        // Base 50 + 20 (Reciente) + 15 (SUV) = 85 (aprox)
        expect(score).toBeGreaterThan(80);
    });

    it('debe identificar unidades de alto riesgo por estancamiento', () => {
        const stagnantCar: Car = {
            ...mockCar,
            daysInInventory: 60
        };
        const entity = new CarEntity(stagnantCar);

        expect(entity.isHighRiskOfStagnation()).toBe(true);
    });

    it('debe penalizar el score por millaje excesivo', () => {
        const highMileageCar: Car = {
            ...mockCar,
            year: 2023,
            mileage: 60000 // 60k en 1 año es excesivo
        };
        const entity = new CarEntity(highMileageCar);
        const score = entity.calculateMarketDesirability();

        // No debería recibir el bonus de millaje bajo
        expect(score).toBeLessThan(85);
    });

    it('debe generar una descripción formateada persuasiva', () => {
        const entity = new CarEntity(mockCar);
        const description = entity.getFormattedDescription();

        expect(description).toContain('Increíble 2024 Toyota Rav4');
        expect(description).toContain('Richard Automotive');
    });
});
