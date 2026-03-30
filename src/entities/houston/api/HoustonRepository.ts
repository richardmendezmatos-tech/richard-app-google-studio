import { HoustonTelemetry } from '../model/types';

export interface HoustonRepository {
  getTelemetry(): Promise<HoustonTelemetry>;
  subscribeToTelemetry(callback: (telemetry: HoustonTelemetry) => void): () => void;
}
