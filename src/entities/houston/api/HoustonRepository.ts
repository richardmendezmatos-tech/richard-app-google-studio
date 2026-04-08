import { HoustonTelemetry } from '../model/types';

export interface HoustonRepository {
  getTelemetry(): Promise<HoustonTelemetry>;
  pushTelemetry(telemetry: Partial<HoustonTelemetry>): Promise<void>;
  subscribeToTelemetry(callback: (telemetry: HoustonTelemetry) => void): () => void;
}
