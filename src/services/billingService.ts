import { db } from './firebaseService';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore/lite';

export type MonetizableEvent = 'ai_call' | 'lead_capture' | 'doc_processed' | 'onboarding';

export interface UsageLog {
  dealerId: string;
  eventType: MonetizableEvent;
  count: number;
  metadata?: Record<string, unknown>;
  costEstimate?: number; // Estimated internal cost in USD
  timestamp?: any;
}

export const logUsageEvent = async (event: UsageLog) => {
  try {
    const usageRef = collection(db, 'usage_logs');
    await addDoc(usageRef, {
      ...event,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('Billing Log Error:', err);
  }
};

export const getUsageLogs = async (
  dealerId: string,
  limitCount: number = 50,
): Promise<UsageLog[]> => {
  try {
    const usageRef = collection(db, 'usage_logs');
    const q = query(
      usageRef,
      where('dealerId', '==', dealerId),
      orderBy('timestamp', 'desc'),
      limit(limitCount),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as UsageLog);
  } catch (err) {
    console.error('Fetch Usage Logs Error:', err);
    return [];
  }
};

// Estimación de costos simplificada (COO level)
export const calculateAICost = (tokens: number): number => {
  // Aprox $0.002 per 1k tokens for Gemini Pro (simplified)
  return (tokens / 1000) * 0.002;
};
