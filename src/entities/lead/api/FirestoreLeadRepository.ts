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
  Timestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '@/shared/api/firebase/client';
import { LeadRepository } from '@/entities/lead';
import { Lead } from '@/entities/lead';
import { LeadMapper } from '@/entities/lead/lib/mappers/LeadMapper';
import { leadSchema } from '@/entities/lead/lib/schemas/leadSchema';
import { withSecureErrorHandling } from '@/shared/lib/errors/AppError';
import { CircuitBreaker } from '@/shared/lib/resilience/CircuitBreaker';
import { LeadHealthSensor } from '@/features/leads/model/health/LeadHealthSensor';
import { auditRepository } from '@/shared/api/houston/AuditRepository';

const dbBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000, // 30s
});

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
    const action = async () => {
      return withSecureErrorHandling(async () => {
        const data = LeadMapper.toPersistence(lead);
        const safeData = leadSchema.parse(data); // Security Validation

        const docRef = await addDoc(collection(db, this.collectionName), {
          ...safeData,
          timestamp: serverTimestamp(),
        });

        // Nivel 14 Traceability
        auditRepository.log({
          type: 'conversion',
          message: `Nuevo Lead capturado: ${lead.firstName} ${lead.lastName}`,
          source: 'FirestoreLeadRepository',
          metadata: { leadId: docRef.id, dealerId: lead.dealerId }
        });

        // Fire-and-forget CRM / Messaging synchronization
        import('@/features/sales-automation/model/sales-orchestrator.service')
          .then(({ salesOrchestrator }) => {
            salesOrchestrator.processNewLead({ ...safeData, id: docRef.id } as Lead).catch((e) => {
              console.error('[Sync Error] Failed to execute background sales automation:', e);
            });
          })
          .catch((err) => console.error('Failed to load orchestrator dynamically', err));

        return docRef.id;
      });
    };

    const fallback = async (error: any) => {
      console.error('[Sentinel:Resilience] Firestore save failed. Triggering Emergency Save.', error);
      
      // Nivel 14 Critical Alert
      auditRepository.log({
        type: 'critical',
        message: 'Fallo crítico en guardado de Lead. Activando Emergency Save.',
        source: 'FirestoreLeadRepository',
        metadata: { error: error.message }
      });

      // Transform partial lead to a dummy lead if necessary for the sensor
      const emergencyLead = { ...lead, id: `pending_${Date.now()}` } as Lead;
      await LeadHealthSensor.emergencySave(emergencyLead);
      return emergencyLead.id;
    };

    return dbBreaker.fire(action, fallback);
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    return withSecureErrorHandling(async () => {
      const docRef = doc(db, this.collectionName, id);
      const safeData = leadSchema.parse(data);
      await updateDoc(docRef, safeData);
    });
  }

  async getLeadVelocity(dealerId: string, hours: number): Promise<number> {
    return withSecureErrorHandling(async () => {
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      const q = query(
        collection(db, this.collectionName),
        where('dealerId', '==', dealerId),
        where('timestamp', '>=', Timestamp.fromDate(startTime))
      );
      
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;
      return parseFloat((count / hours).toFixed(2));
    });
  }
}
