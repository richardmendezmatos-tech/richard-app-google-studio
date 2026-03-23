import { db } from '@/shared/api/firebase/client';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export class FirestoreSubscriberRepository {
  async subscribe(email: string, source: string = 'newsletter'): Promise<void> {
    await addDoc(collection(db, 'subscribers'), {
      email,
      source,
      subscribedAt: new Date(),
      status: 'active',
    });
  }

  async getSubscribers(): Promise<any[]> {
    const snap = await getDocs(collection(db, 'subscribers'));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
