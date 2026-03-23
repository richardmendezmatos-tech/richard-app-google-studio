import { db } from '@/shared/api/firebase/client';
import { collection, doc, getDoc, setDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { Lead, PredictiveInsight } from '@/entities/shared/model/entities';
import { PredictiveRepository } from '@/entities/shared/api/repositories/PredictiveRepository';

export class FirestorePredictiveRepository implements PredictiveRepository {
  private collectionName = 'predictive_insights';

  async getPredictiveInsight(leadId: string): Promise<PredictiveInsight | null> {
    const docRef = doc(db, this.collectionName, leadId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as PredictiveInsight) : null;
  }

  async savePredictiveInsight(insight: PredictiveInsight): Promise<void> {
    const docRef = doc(db, this.collectionName, insight.leadId);
    await setDoc(
      docRef,
      {
        ...insight,
        timestamp: Date.now(),
      },
      { merge: true },
    );
  }

  async getHighProbabilityLeads(threshold: number): Promise<Lead[]> {
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, where('predictiveScore', '>=', threshold), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Lead);
  }
}
