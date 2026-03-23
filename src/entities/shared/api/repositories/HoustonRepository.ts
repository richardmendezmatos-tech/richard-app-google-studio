import { HoustonTelemetry } from '../../model/entities';

export interface HoustonRepository {
  getTelemetry(): Promise<HoustonTelemetry>;
  subscribeToTelemetry(callback: (telemetry: HoustonTelemetry) => void): () => void;
}
