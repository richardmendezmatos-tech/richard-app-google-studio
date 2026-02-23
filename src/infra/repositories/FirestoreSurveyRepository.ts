import { db } from '@/infra/firebase/client';
import { collection, addDoc, getDocs } from 'firebase/firestore/lite';

export class FirestoreSurveyRepository {
    async submitSurvey(data: Record<string, any>): Promise<void> {
        await addDoc(collection(db, 'surveys'), {
            ...data,
            submittedAt: new Date()
        });
    }

    async getSurveys(): Promise<any[]> {
        const snap = await getDocs(collection(db, 'surveys'));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}
