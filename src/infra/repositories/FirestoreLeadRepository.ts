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
    serverTimestamp
} from 'firebase/firestore/lite';
import { db } from '../firebase/client';
import { LeadRepository } from '../../domain/repositories/LeadRepository';
import { Lead } from '../../domain/entities';

export class FirestoreLeadRepository implements LeadRepository {
    private collectionName = 'applications';

    async getLeads(dealerId: string, limitCount: number): Promise<Lead[]> {
        const q = query(
            collection(db, this.collectionName),
            where('dealerId', '==', dealerId),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Lead));
    }

    async getLeadById(id: string): Promise<Lead | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() } as Lead;
    }

    async saveLead(lead: Partial<Lead>): Promise<string> {
        const docRef = await addDoc(collection(db, this.collectionName), {
            ...lead,
            timestamp: serverTimestamp()
        });
        return docRef.id;
    }

    async updateLead(id: string, data: Partial<Lead>): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, data);
    }
}
