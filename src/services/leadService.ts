import { db } from './firebaseService';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    serverTimestamp
} from 'firebase/firestore';

export interface Lead {
    id?: string;
    phone: string;
    email?: string;
    name?: string;
    source: 'whatsapp' | 'web' | 'sms' | 'phone';
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    firstMessage?: string;
    timestamp: Date;
    dealerId: string;
    metadata?: {
        intentScore?: number;
        preferredContact?: string;
        lastInteraction?: Date;
    };
}

/**
 * Service for managing leads from multiple sources.
 * Integrates with WhatsApp webhook for automatic lead creation.
 */
export class LeadService {
    private collection = 'applications'; // Using existing collection for compatibility

    /**
     * Creates a new lead in Firebase.
     */
    async createLead(leadData: Omit<Lead, 'id' | 'timestamp' | 'dealerId'>): Promise<Lead> {
        try {
            const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';

            const newLead = {
                ...leadData,
                dealerId,
                timestamp: serverTimestamp(),
                metadata: leadData.metadata || {}
            };

            const docRef = await addDoc(collection(db, this.collection), newLead);

            return {
                id: docRef.id,
                ...leadData,
                timestamp: new Date(),
                dealerId
            };
        } catch (error) {
            console.error('Error creating lead:', error);
            throw error;
        }
    }

    /**
     * Retrieves a lead by phone number.
     * Returns null if no lead exists for that phone.
     */
    async getLeadByPhone(phone: string): Promise<Lead | null> {
        try {
            const q = query(
                collection(db, this.collection),
                where('phone', '==', phone)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date()
            } as Lead;
        } catch (error) {
            console.error('Error fetching lead by phone:', error);
            return null;
        }
    }

    /**
     * Retrieves a lead by ID.
     */
    async getLeadById(leadId: string): Promise<Lead | null> {
        try {
            const docRef = doc(db, this.collection, leadId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data(),
                timestamp: docSnap.data().timestamp?.toDate() || new Date()
            } as Lead;
        } catch (error) {
            console.error('Error fetching lead by ID:', error);
            return null;
        }
    }

    /**
     * Gets or creates a lead for a phone number.
     * Useful for WhatsApp webhook to ensure lead exists.
     */
    async getOrCreateLead(
        phone: string,
        source: Lead['source'],
        firstMessage?: string
    ): Promise<Lead> {
        let lead = await this.getLeadByPhone(phone);

        if (!lead) {
            lead = await this.createLead({
                phone,
                source,
                status: 'new',
                firstMessage
            });
        }

        return lead;
    }

    /**
     * Updates lead metadata (intent score, preferences, etc.)
     */
    async updateLeadMetadata(
        leadId: string,
        metadata: Lead['metadata']
    ): Promise<void> {
        try {
            const docRef = doc(db, this.collection, leadId);
            await addDoc(docRef, { metadata }, { merge: true } as any);
        } catch (error) {
            console.error('Error updating lead metadata:', error);
            throw error;
        }
    }
}

export const leadService = new LeadService();
