import * as admin from 'firebase-admin';

export interface Appointment {
    leadId: string;
    vehicleId?: string;
    date: admin.firestore.Timestamp;
    status: 'scheduled' | 'cancelled' | 'completed';
    dealerId: string;
    type: 'test-drive' | 'closing' | 'service';
}

export class AppointmentService {
    private db = admin.firestore();
    private collection = 'appointments';

    async schedule(data: { leadId: string, date: Date, type: Appointment['type'], vehicleId?: string }): Promise<string> {
        const docRef = await this.db.collection(this.collection).add({
            ...data,
            date: admin.firestore.Timestamp.fromDate(data.date),
            status: 'scheduled',
            dealerId: 'richard-automotive',
            createdAt: admin.firestore.Timestamp.now()
        });
        return docRef.id;
    }

    async getLeadAppointments(leadId: string): Promise<Appointment[]> {
        const snapshot = await this.db.collection(this.collection)
            .where('leadId', '==', leadId)
            .orderBy('date', 'desc')
            .get();
        return snapshot.docs.map(doc => doc.data() as Appointment);
    }
}

export const appointmentService = new AppointmentService();
