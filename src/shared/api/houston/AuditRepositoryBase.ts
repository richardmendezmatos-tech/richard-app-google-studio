import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  Firestore
} from 'firebase/firestore';

export interface AuditEvent {
  id?: string;
  type: 'info' | 'warning' | 'error' | 'critical' | 'conversion';
  message: string;
  source: string;
  timestamp: any;
  metadata?: Record<string, any>;
}

export class AuditRepositoryBase {
  protected collectionName = 'houston_audit_logs';

  constructor(protected db: Firestore) {}

  async log(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(this.db, this.collectionName), {
        ...event,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('❌ [AuditRepository] Failed to log event:', error);
    }
  }

  async getRecentLogs(max: number = 20): Promise<AuditEvent[]> {
    const q = query(
      collection(this.db, this.collectionName),
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
