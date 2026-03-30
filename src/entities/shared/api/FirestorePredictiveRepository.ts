import { db } from '@/shared/api/firebase/client';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { Lead, PredictiveInsight, PredictiveInsightSchema } from '@/entities/shared/model/entities';
import { PredictiveRepository } from '@/entities/shared/api/repositories/PredictiveRepository';

export class FirestorePredictiveRepository implements PredictiveRepository {
  private collectionName = 'predictive_insights';

  async getPredictiveInsight(leadId: string): Promise<PredictiveInsight | null> {
    try {
      const docRef = doc(db, this.collectionName, leadId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;

      const parsed = PredictiveInsightSchema.safeParse(docSnap.data());
      if (!parsed.success) {
        console.error('[PredictiveRepository] Fallo de validación Zod (Insight):', parsed.error);
        return null;
      }
      return parsed.data;
    } catch (error) {
      console.error('[PredictiveRepository] Error en getPredictiveInsight:', error);
      return null;
    }
  }

  async savePredictiveInsight(insight: PredictiveInsight): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, insight.leadId);
      const { timestamp, ...insightData } = insight; // Ignora timestamp local para inyectar serverTimestamp

      await setDoc(
        docRef,
        {
          ...insightData,
          timestamp: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error('[PredictiveRepository] Error en savePredictiveInsight:', error);
      throw error;
    }
  }

  async getHighProbabilityLeads(threshold: number): Promise<Lead[]> {
    try {
      const leadsRef = collection(db, 'leads');
      const q = query(
        leadsRef,
        where('predictiveScore', '>=', threshold),
        orderBy('predictiveScore', 'desc'),
        limit(20),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Lead);
    } catch (error) {
      console.error('[PredictiveRepository] Error recuperando Leads predictivos:', error);
      return [];
    }
  }
}
