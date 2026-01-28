import { db } from './firebaseService';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type MonetizableEvent = 'ai_call' | 'lead_capture' | 'doc_processed' | 'onboarding';

interface UsageLog {
    dealerId: string;
    eventType: MonetizableEvent;
    count: number;
    metadata?: any;
    costEstimate?: number; // Estimated internal cost in USD
}

export const logUsageEvent = async (event: UsageLog) => {
    try {
        const usageRef = collection(db, 'usage_logs');
        await addDoc(usageRef, {
            ...event,
            timestamp: serverTimestamp()
        });
    } catch (err) {
        console.error("Billing Log Error:", err);
    }
};

// Estimación de costos simplificada (COO level)
export const calculateAICost = (tokens: number): number => {
    // Aprox $0.002 per 1k tokens for Gemini Pro (simplified)
    return (tokens / 1000) * 0.002;
};
