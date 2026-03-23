import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/shared/api/firebase/firebaseService';
import { FirestoreTimestamp } from '@/shared/types/types';

export interface AuditLog {
  id: string;
  email: string;
  ip: string;
  device: string;
  method: string;
  success: boolean;
  timestamp: FirestoreTimestamp;
  location: string;
}

export const getAuditLogs = async (maxLogs: number = 50): Promise<AuditLog[]> => {
  const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(maxLogs));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AuditLog[];
};
