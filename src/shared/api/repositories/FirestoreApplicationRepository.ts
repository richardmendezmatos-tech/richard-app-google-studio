import { dbLite } from '@/shared/api/firebase/client';
import { collection, addDoc, query, where, limit, getDocs } from 'firebase/firestore';

export class FirestoreApplicationRepository {
  async submitApplication(data: Record<string, unknown>, dealerId: string): Promise<string> {
    const isSecure = !!data.ssn_encrypted;
    const collectionName = isSecure ? 'solicitudes_credito' : 'applications';

    const safeData = {
      ...data,
      dealerId,
      timestamp: new Date(),
      status: 'new',
    };
    const docRef = await addDoc(collection(dbLite, collectionName), safeData);
    return docRef.id;
  }

  async getApplications(dealerId: string, limitCount: number = 200) {
    const q = query(
      collection(dbLite, 'applications'),
      where('dealerId', '==', dealerId),
      limit(limitCount),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
