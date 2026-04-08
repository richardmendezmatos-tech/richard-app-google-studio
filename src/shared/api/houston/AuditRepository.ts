import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/shared/api/firebase/client';

export interface AuditEvent {
  id?: string;
  type: 'info' | 'warning' | 'error' | 'critical' | 'conversion';
  message: string;
  source: string;
  timestamp: any;
  metadata?: Record<string, any>;
}

export class AuditRepository {
  private collectionName = 'houston_audit_logs';

  async log(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, this.collectionName), {
        ...event,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('❌ [AuditRepository] Failed to log event:', error);
    }
  }

  async getRecentLogs(max: number = 20): Promise<AuditEvent[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('timestamp', 'desc'),
      limit(max)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuditEvent[];
  }
}

export const auditRepository = new AuditRepository();
