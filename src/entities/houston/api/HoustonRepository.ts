import { HoustonTelemetry, PurchaseOrder } from '../model/types';

export interface HoustonRepository {
  getTelemetry(): Promise<HoustonTelemetry>;
  pushTelemetry(telemetry: Partial<HoustonTelemetry>): Promise<void>;
  subscribeToTelemetry(callback: (telemetry: HoustonTelemetry) => void): () => void;
  
  // Sourcing Intelligence
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  updatePurchaseOrderStatus(id: string, status: 'confirmed' | 'archived'): Promise<void>;
}
