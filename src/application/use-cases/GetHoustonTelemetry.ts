import { HoustonRepository } from '../../domain/repositories/HoustonRepository';
import { HoustonTelemetry } from '../../domain/entities';

export class GetHoustonTelemetry {
    constructor(private houstonRepo: HoustonRepository) { }

    async execute(): Promise<HoustonTelemetry> {
        return await this.houstonRepo.getTelemetry();
    }

    subscribe(callback: (telemetry: HoustonTelemetry) => void): () => void {
        return this.houstonRepo.subscribeToTelemetry(callback);
    }
}
