import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/api/firebase/client';
import { ApplicationRepository } from './ApplicationRepository';
import { ApplicationData } from '../model/captureTypes';

export class FirestoreApplicationRepository implements ApplicationRepository {
  private collectionName = 'applications';

  async submitApplication(data: ApplicationData, dealerId: string): Promise<string> {
    // Audit log inclusion and strict data mapping
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...data,
      dealerId,
      createdAt: serverTimestamp(),
      type: 'credit_application',
      status: 'pending'
    });
    return docRef.id;
  }

  async getApplicationById(id: string): Promise<ApplicationData | null> {
    const docRef = doc(db, this.collectionName, id);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } as ApplicationData : null;
  }
}
