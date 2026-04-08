import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/api/firebase/client';
import { SubscriberRepository, SurveyRepository } from './ApplicationRepository';
import { SubscriberData, SurveyData } from '../model/captureTypes';

export class FirestoreSubscriberRepository implements SubscriberRepository {
  private collectionName = 'subscribers';

  async subscribe(data: SubscriberData): Promise<void> {
    await addDoc(collection(db, this.collectionName), {
      ...data,
      subscribedAt: serverTimestamp(),
    });
  }

  async getSubscribers(): Promise<SubscriberData[]> {
    const snap = await getDocs(collection(db, this.collectionName));
    return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as SubscriberData) }));
  }
}

export class FirestoreSurveyRepository implements SurveyRepository {
  private collectionName = 'surveys';

  async submitSurvey(data: SurveyData): Promise<void> {
    await addDoc(collection(db, this.collectionName), {
      ...data,
      submittedAt: serverTimestamp(),
    });
  }
}
