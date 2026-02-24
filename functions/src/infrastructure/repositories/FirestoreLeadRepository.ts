import { db } from '../../services/firebaseAdmin';
import { LeadRepository } from '../../domain/repositories/LeadRepository';
import { Lead } from '../../domain/entities';
import { Timestamp } from 'firebase-admin/firestore';

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

    async getStaleLeads(days: number, limit: number): Promise<Lead[]> {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - days);

        const snapshot = await db.collection('applications')
            .where('status', '==', 'new')
            .where('timestamp', '<=', Timestamp.fromDate(threshold))
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
    }

    async getLeadsByVehicleId(vehicleId: string): Promise<Lead[]> {
        const snapshot = await db.collection('applications')
            .where('vehicleId', '==', vehicleId)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
    }

    async updateLead(id: string, data: Partial<Lead>): Promise<void> {
        await db.collection('applications').doc(id).update(data);
    }

    async create(data: Lead): Promise<string> {
        const docRef = await db.collection('applications').add(data);
        return docRef.id;
    }

    async getLeadsByEmailSequenceStatus(
        field: string,
        value: any,
        operator: '<=' | '==' | '!=' | '>=',
        limit: number
    ): Promise<Lead[]> {
        // --- Security Hardening: NoSQL Injection Prevention ---
        const safeField = String(field);
        const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 500);

        // Operator Whitelist
        const validOperators: admin.firestore.WhereFilterOp[] = ['<=', '==', '!=', '>=', '<', '>'];
        const safeOperator = validOperators.includes(operator as admin.firestore.WhereFilterOp)
            ? (operator as admin.firestore.WhereFilterOp)
            : '==';

        const snapshot = await db.collection('leads')
            .where(safeField, safeOperator, value)
            .limit(safeLimit)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
    }

    async getGarageByUserId(userId: string): Promise<any[]> {
        const snapshot = await db.collection('users').doc(userId).collection('garage').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}
