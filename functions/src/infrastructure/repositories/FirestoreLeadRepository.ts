import { db } from '../../services/firebaseAdmin';
import { LeadRepository } from '../../domain/repositories/LeadRepository';
import { Lead } from '../../domain/entities';

export class FirestoreLeadRepository implements LeadRepository {
    async getById(id: string): Promise<Lead | null> {
        const doc = await db.collection('applications').doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Lead;
    }

    async getHotLeads(limit: number): Promise<Lead[]> {
        const snapshot = await db.collection('applications')
            .where('category', '==', 'HOT')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
    }

    async update(id: string, data: Partial<Lead>): Promise<void> {
        await db.collection('applications').doc(id).update(data);
    }
}
