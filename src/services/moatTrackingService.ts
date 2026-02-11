import { db } from './firebaseService';
import { collection, addDoc, serverTimestamp, increment, doc, updateDoc } from 'firebase/firestore/lite';

export interface IntentSignal {
    carId: string;
    dealerId: string;
    eventType: 'engaged_time' | 'gallery_open' | 'finance_calc' | 'specification_read';
    value?: number;
    sessionId: string;
}

/**
 * MOAT SERVICE: Proprietary Intent Tracking
 * This service captures micro-behaviors that generic analytics (GA4) misses.
 * This feeds our proprietary Lead Scoring algorithm.
 */
export const logIntentSignal = async (signal: IntentSignal) => {
    try {
        const intentRef = collection(db, 'proprietary_intent_data');
        await addDoc(intentRef, {
            ...signal,
            timestamp: serverTimestamp()
        });

        // Optimization: Atomic update of the Lead's intent score if session is linked
        const leadId = localStorage.getItem('current_lead_id');
        if (leadId) {
            const leadRef = doc(db, 'leads', leadId);
            await updateDoc(leadRef, {
                intentScore: increment(getSignalWeight(signal.eventType)),
                lastActivity: serverTimestamp()
            });
        }
    } catch (err) {
        console.warn("Moat Tracking Silently Failed (Non-blocking):", err);
    }
};

const getSignalWeight = (type: string): number => {
    switch (type) {
        case 'finance_calc': return 15; // High purchase intent
        case 'gallery_open': return 5;
        case 'specification_read': return 10;
        case 'engaged_time': return 2; // Per unit of time
        default: return 1;
    }
};
