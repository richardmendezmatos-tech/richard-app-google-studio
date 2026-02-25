import { CRMRepository, LeadTransition } from '../../domain/repositories';
import { db } from '../../services/firebaseAdmin';
import * as admin from 'firebase-admin';

export class FirestoreCRMRepository implements CRMRepository {
    async recordTransition(transition: LeadTransition): Promise<void> {
        await db.collection('applications').doc(transition.leadId).collection('transitions').add({
            ...transition,
            timestamp: admin.firestore.Timestamp.fromDate(transition.timestamp),
            processedBy: 'CleanArch-CRM-Adapter'
        });
    }

    async syncSalesData(leadId: string, saleData: any): Promise<void> {
        // Mock sync for now
        console.log(`[CRM] Syncing sales data for ${leadId}:`, saleData);
        await db.collection('applications').doc(leadId).update({
            salesData: saleData,
            lastSync: admin.firestore.Timestamp.now()
        });
    }
}
