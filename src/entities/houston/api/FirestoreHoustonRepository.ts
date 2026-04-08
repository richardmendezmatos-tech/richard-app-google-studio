import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/shared/api/firebase/client';
import { HoustonRepository } from './HoustonRepository';
import { HoustonTelemetry } from '../model/types';
import { withSecureErrorHandling } from '@/shared/lib/errors/AppError';

export class FirestoreHoustonRepository implements HoustonRepository {
  private collectionName = 'system_status';
  private docId = 'houston_telemetry';

  async getTelemetry(): Promise<HoustonTelemetry> {
    return withSecureErrorHandling(async () => {
      const docRef = doc(db, this.collectionName, this.docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Houston Telemetry data not found');
      }

      return this.mapToTelemetry(docSnap.data());
    });
  }

  async pushTelemetry(telemetry: Partial<HoustonTelemetry>): Promise<void> {
    const docRef = doc(db, this.collectionName, this.docId);
    await setDoc(docRef, {
      ...telemetry,
      lastUpdate: serverTimestamp()
    }, { merge: true });
  }

  subscribeToTelemetry(callback: (telemetry: HoustonTelemetry) => void): () => void {
    const docRef = doc(db, this.collectionName, this.docId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(this.mapToTelemetry(snapshot.data()));
      }
    });
  }

  private mapToTelemetry(data: any): HoustonTelemetry {
    return {
      systemHealth: data.systemHealth || 'online',
      lastUpdate: data.lastUpdate?.toMillis?.() || Date.now(),
      metrics: {
        // Phase 1 Metrics
        inferenceLatency: data.metrics?.inferenceLatency || { label: 'Inference', value: 0, status: 'healthy' },
        tokenUsage: data.metrics?.tokenUsage || { label: 'Tokens', value: 0, status: 'healthy' },
        autonomyRate: data.metrics?.autonomyRate || { label: 'Autonomy', value: 0, status: 'healthy' },
        apiStability: data.metrics?.apiStability || { label: 'API', value: 0, status: 'healthy' },
        
        // Nivel 13 Metrics
        structuralHealth: data.metrics?.structuralHealth || { label: 'Structural', value: '100%', status: 'healthy' },
        dbLatency: data.metrics?.dbLatency || { label: 'DB Latency', value: 0, unit: 'ms', status: 'healthy' },
        activeBreakers: data.metrics?.activeBreakers || { label: 'Breakers', value: 0, status: 'healthy' },
        resilienceIndex: data.metrics?.resilienceIndex || { label: 'Resilience', value: '100%', status: 'healthy' },

        // Nivel 14: Predictive Portfolio & Business Health
        leadVelocity: data.metrics?.leadVelocity || { label: 'Lead Velocity', value: 0, unit: 'LPH', status: 'healthy' },
        inventoryTurnover: data.metrics?.inventoryTurnover || { label: 'Inventory Turnover', value: 0, unit: 'days', status: 'healthy' },
        closureProbability: data.metrics?.closureProbability || { label: 'Closure Prob', value: 0, unit: '%', status: 'healthy' },
      },
      recentEvents: data.recentEvents || [],
    };
  }
}
