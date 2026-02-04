import { db } from '@/services/firebaseService';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface InteractionEvent {
    userId?: string;
    carId: string;
    action: 'view' | 'garage_add' | 'configure' | 'doc_upload';
    metadata?: any;
}

export const logBehavioralEvent = async (event: InteractionEvent) => {
    try {
        const eventsRef = collection(db, 'behavioral_events');
        await addDoc(eventsRef, {
            ...event,
            timestamp: serverTimestamp(),
            sessionId: sessionStorage.getItem('richard_session_id') || 'anonymous'
        });

        // Simple local-threshold check for immediate nudge
        checkImmediateNudge(event);
    } catch (err) {
        console.error("Retargeting Log Error:", err);
    }
};

const checkImmediateNudge = (event: InteractionEvent) => {
    const views = parseInt(localStorage.getItem(`views_${event.carId}`) || '0') + 1;
    localStorage.setItem(`views_${event.carId}`, views.toString());

    // COO TUNE: Reduced threshold to 2 for aggressive 90-day cash flow boost
    if (views >= 2 && event.action === 'view') {
        const dealerName = localStorage.getItem('current_dealer_name') || 'Richard Automotive';

        // Trigger "Smart Nudge"
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`¡Interés Detectado en ${dealerName}!`, {
                body: 'Has visto este auto varias veces. ¿Quieres una oferta exclusiva por WhatsApp?',
                icon: '/pwa-192x192.png'
            });
        }
    }
};
