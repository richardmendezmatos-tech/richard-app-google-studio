import {
  doc,
  onSnapshot,
  getDoc,
  Timestamp,
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
        inferenceLatency: data.metrics?.inferenceLatency || { label: 'Inference', value: 0, status: 'healthy' },
        tokenUsage: data.metrics?.tokenUsage || { label: 'Tokens', value: 0, status: 'healthy' },
        autonomyRate: data.metrics?.autonomyRate || { label: 'Autonomy', value: 0, status: 'healthy' },
        apiStability: data.metrics?.apiStability || { label: 'API', value: 0, status: 'healthy' },
      },
      recentEvents: data.recentEvents || [],
    };
  }
}
