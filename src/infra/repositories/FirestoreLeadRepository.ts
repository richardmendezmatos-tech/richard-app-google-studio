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
import { db } from '../firebase/client';
import { LeadRepository } from '../../domain/repositories/LeadRepository';
import { Lead } from '../../domain/entities';
import { LeadMapper } from '../mappers/LeadMapper';

export class FirestoreLeadRepository implements LeadRepository {
  private collectionName = 'applications';

  async getLeads(dealerId: string, limitCount: number): Promise<Lead[]> {
    const q = query(
      collection(db, this.collectionName),
      where('dealerId', '==', dealerId),
      limit(limitCount),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => LeadMapper.toDomain(doc.id, doc.data()));
  }

  async getLeadById(id: string, dealerId: string): Promise<Lead | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const lead = LeadMapper.toDomain(docSnap.id, docSnap.data());
    if (lead.dealerId !== dealerId) return null; // Aislamiento multi-tenant

    return lead;
  }

  async saveLead(lead: Partial<Lead>): Promise<string> {
    const data = LeadMapper.toPersistence(lead);
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...data,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, data);
  }
}
