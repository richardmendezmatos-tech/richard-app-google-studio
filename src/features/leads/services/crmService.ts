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
 * Near-real-time poller for leads
 */
export const subscribeToLeads = (callback: (leads: Lead[]) => void) => {
    const q = query(collection(db, LEADS_COLLECTION), orderBy('createdAt', 'desc'));
    let cancelled = false;

    const fetchLeads = async () => {
        const snapshot = await getDocs(q);
        if (cancelled) return;
        const leads = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Lead));
        callback(leads);
    };

    fetchLeads().catch((error) => console.error('Leads polling error:', error));
    const intervalId = setInterval(() => {
        fetchLeads().catch((error) => console.error('Leads polling error:', error));
    }, 10000);

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
