import { db } from '../../services/firebaseAdmin';
import { LogRepository } from '../../domain/repositories/LogRepository';
import { Timestamp } from 'firebase-admin/firestore';

export class FirestoreLogRepository implements LogRepository {
    async deleteLogsOlderThan(days: number): Promise<number> {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - days);

        const snapshot = await db.collection('audit_logs')
            .where('timestamp', '<=', Timestamp.fromDate(threshold))
            .limit(500)
            .get();

        if (snapshot.empty) return 0;

        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        return snapshot.size;
    }

    async recordAction(action: string, metadata: any): Promise<void> {
        await db.collection('audit_logs').add({
            action,
            metadata,
            timestamp: Timestamp.now()
        });
    }
}
