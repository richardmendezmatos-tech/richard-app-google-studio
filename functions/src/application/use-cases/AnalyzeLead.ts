import { InventoryRepository } from '../../domain/repositories/InventoryRepository';
import { ScoreCalculator } from './ScoreCalculator';
import { Lead } from '../../domain/entities';

export class AnalyzeLead {
  constructor(private inventoryRepo: InventoryRepository) {}

  async execute(input: Partial<Lead>): Promise<any> {
    let unidad_interes = input.vehicleId || 'General';

    if (input.vehicleId) {
      try {
        const car = await this.inventoryRepo.getById(input.vehicleId);
        if (car) {
          unidad_interes = `${car.year} ${car.make} ${car.model}`;
          const vehicleContext = `Vehicle: ${unidad_interes}, Price: $${car.price}, Mileage: ${car.mileage}`;
          console.log(`Analyzing lead with vehicle context: ${vehicleContext}`);
        }
      } catch (e) {
        console.error('Error fetching vehicle context in AnalyzeLead:', e);
      }
    }

    const scoringResult = ScoreCalculator.execute(input);

    return {
      ...scoringResult,
      unidad_interes,
    };
  }
}
