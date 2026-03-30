import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/shared/api/firebase/client';
import { LeadRepository } from '@/entities/lead';
import { Lead } from '@/entities/lead';
import { LeadMapper } from '@/entities/lead/lib/mappers/LeadMapper';
import { leadSchema } from '@/entities/lead/lib/schemas/leadSchema';
import { withSecureErrorHandling } from '@/shared/lib/errors/AppError';

export class FirestoreLeadRepository implements LeadRepository {
  private collectionName = 'applications';

  async getLeads(dealerId: string, limitCount: number): Promise<Lead[]> {
    return withSecureErrorHandling(async () => {
      const q = query(
        collection(db, this.collectionName),
        where('dealerId', '==', dealerId),
        limit(limitCount),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => LeadMapper.toDomain(doc.id, doc.data()));
    });
  }

  async getLeadById(id: string, dealerId: string): Promise<Lead | null> {
    return withSecureErrorHandling(async () => {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;

      const lead = LeadMapper.toDomain(docSnap.id, docSnap.data());
      if (lead.dealerId !== dealerId) return null; // Aislamiento multi-tenant

      return lead;
    });
  }

  async saveLead(lead: Partial<Lead>): Promise<string> {
    return withSecureErrorHandling(async () => {
      const data = LeadMapper.toPersistence(lead);
      const safeData = leadSchema.parse(data); // Security Validation

      const docRef = await addDoc(collection(db, this.collectionName), {
        ...safeData,
        timestamp: serverTimestamp(),
      });

      // Fire-and-forget CRM / Messaging synchronization
      // Se castea as Lead garantizando que tiene al menos los datos base, en un entorno
      // productivo real aquí usaríamos un EventBus o Cloud Function (Trigger).
      import('@/features/sales-automation/model/sales-orchestrator.service')
        .then(({ salesOrchestrator }) => {
          salesOrchestrator.processNewLead({ ...safeData, id: docRef.id } as Lead).catch((e) => {
            console.error('[Sync Error] Failed to execute background sales automation:', e);
          });
        })
        .catch((err) => console.error('Failed to load orchestrator dynamically', err));

      return docRef.id;
    });
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    return withSecureErrorHandling(async () => {
      const docRef = doc(db, this.collectionName, id);
      const safeData = leadSchema.parse(data);
      await updateDoc(docRef, safeData);
    });
  }
}
