import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/shared/api/firebase/client';
import { PredictiveRepository } from './PredictiveRepository';
import { Lead, PredictiveInsight } from '../model/types';
import { LeadMapper } from '../lib/mappers/LeadMapper';
import { withSecureErrorHandling } from '@/shared/lib/errors/AppError';

export class FirestorePredictiveRepository implements PredictiveRepository {
  private insightsCollection = 'predictive_insights';
  private leadsCollection = 'applications';

  async getPredictiveInsight(leadId: string): Promise<PredictiveInsight | null> {
    return withSecureErrorHandling(async () => {
      const docRef = doc(db, this.insightsCollection, leadId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        ...data,
        leadId: docSnap.id,
        timestamp: data.timestamp?.toMillis?.() || Date.now(),
      } as PredictiveInsight;
    });
  }

  async savePredictiveInsight(insight: PredictiveInsight): Promise<void> {
    return withSecureErrorHandling(async () => {
      const docRef = doc(db, this.insightsCollection, insight.leadId);
      await setDoc(docRef, {
        ...insight,
        timestamp: serverTimestamp(),
      });
    });
  }

  async getHighProbabilityLeads(threshold: number): Promise<Lead[]> {
    return withSecureErrorHandling(async () => {
      const q = query(
        collection(db, this.leadsCollection),
        where('predictiveScore', '>=', threshold)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => LeadMapper.toDomain(doc.id, doc.data()));
    });
  }
}
