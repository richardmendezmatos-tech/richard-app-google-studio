import { db } from '@/services/firebaseService';
import { collection, addDoc, query, orderBy, updateDoc, doc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore/lite';
import { Lead } from '@/types/types';

export type { Lead };

const LEADS_COLLECTION = 'applications';

/**
 * Adds a new lead to Firestore
 */
export const addLead = async (lead: Omit<Lead, 'id' | 'status' | 'createdAt'>) => {
    try {
        await addDoc(collection(db, LEADS_COLLECTION), {
            ...lead,
            status: 'new',
            createdAt: serverTimestamp()
        });
        console.log("Lead added successfully");
    } catch (error) {
        console.error("Error adding lead:", error);
        // We generally don't block the UI for lead capture errors, but logging is vital
    }
};

/**
 * Updates any field of a lead
 */
export const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
        const leadRef = doc(db, LEADS_COLLECTION, leadId);
        await updateDoc(leadRef, updates as { [x: string]: unknown });
    } catch (error) {
        console.error("Error updating lead:", error);
        throw error;
    }
};

/**
 * Updates the status of a lead (e.g. dragging card in Kanban)
 */
export const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    await updateLead(leadId, { status: newStatus });
};

/**
 * CONTINUUM MEMORY SYSTEM (CMS) - Nested Frequency Updates
 */

/**
 * L1: Reactive Memory Update (High Frequency)
 * Triggered by real-time interactions
 */
export const updateLeadL1Memory = async (leadId: string, l1Data: Partial<NonNullable<Lead['customerMemory']>['l1_reactive']>) => {
    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    const snapshot = await getDoc(leadRef);
    if (!snapshot.exists()) return;

    const lead = snapshot.data() as Lead;
    const currentMemory = lead.customerMemory || {};

    await updateDoc(leadRef, {
        "customerMemory.l1_reactive": {
            ...(currentMemory.l1_reactive || {}),
            ...l1Data,
            activeContext: true
        }
    });
};

/**
 * L2: Contextual Memory Update (Medium Frequency)
 * Triggered by daily analysis or significant behavior shifts
 */
export const updateLeadL2Memory = async (leadId: string, l2Data: Partial<NonNullable<Lead['customerMemory']>['l2_contextual']>) => {
    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    const snapshot = await getDoc(leadRef);
    if (!snapshot.exists()) return;

    const lead = snapshot.data() as Lead;
    const currentMemory = lead.customerMemory || {};

    await updateDoc(leadRef, {
        "customerMemory.l2_contextual": {
            ...(currentMemory.l2_contextual || {}),
            ...l2Data
        }
    });
};

/**
 * L3: Evolutivo Memory Update (Low Frequency)
 * Triggered by milestone events or monthly reviews
 */
export const updateLeadL3Memory = async (leadId: string, l3Data: Partial<NonNullable<Lead['customerMemory']>['l3_evolutivo']>) => {
    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    const snapshot = await getDoc(leadRef);
    if (!snapshot.exists()) return;

    const lead = snapshot.data() as Lead;
    const currentMemory = lead.customerMemory || {};

    await updateDoc(leadRef, {
        "customerMemory.l3_evolutivo": {
            ...(currentMemory.l3_evolutivo || {}),
            ...l3Data
        }
    });
};

/**
 * Near-real-time poller for leads - Aggregates from standard and secure collections
 */
export const subscribeToLeads = (callback: (leads: Lead[]) => void) => {
    let cancelled = false;
    const leadsMap: Record<string, Lead[]> = {
        applications: [],
        solicitudes: []
    };

    const fetchAll = async () => {
        try {
            const qApps = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
            const qSols = query(collection(db, 'solicitudes_credito'), orderBy('createdAt', 'desc'));

            const [snapApps, snapSols] = await Promise.all([
                getDocs(qApps),
                getDocs(qSols)
            ]);

            if (cancelled) return;

            const apps = snapApps.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
            const sols = snapSols.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));

            const combined = [...apps, ...sols].sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            callback(combined);
        } catch (error) {
            console.error('Error fetching combined leads:', error);
        }
    };

    fetchAll();
    const intervalId = setInterval(fetchAll, 10000);

    return () => {
        cancelled = true;
        clearInterval(intervalId);
    };
};
/**
 * Fetches sensitive data from the Secure Vault
 * Note: This will fail if the user is not an authorized Admin (Richard/SuperAdmin)
 */
export const getSecureLeadData = async (leadId: string) => {
    try {
        const secureRef = doc(db, 'applications_secure', leadId);
        const snapshot = await getDoc(secureRef);
        if (snapshot.exists()) {
            return snapshot.data() as { ssn: string };
        }
        return null;
    } catch (error) {
        console.error("Vault Access Denied or Error:", error);
        throw new Error("No tienes permisos suficientes para acceder a la Bóveda Segura.");
    }
};
