import { supabase } from '@/shared/api/supabase/supabase';

export interface InteractionEvent {
  userId?: string;
  carId: string;
  action: 'view' | 'garage_add' | 'configure' | 'doc_upload';
  metadata?: any;
}

export const logBehavioralEvent = async (event: InteractionEvent) => {
  try {
    if (!supabase) return;

    await supabase.from('behavioral_events').insert({
      user_id: event.userId || null,
      car_id: event.carId,
      action: event.action,
      metadata: event.metadata || {},
      session_id:
        typeof window !== 'undefined'
          ? sessionStorage.getItem('richard_session_id') || 'anonymous'
          : 'server',
      timestamp: new Date().toISOString(),
    });

    checkImmediateNudge(event);
  } catch (err) {
    console.error('Retargeting Log Error:', err);
  }
};

const checkImmediateNudge = (event: InteractionEvent) => {
  if (typeof window === 'undefined') return;

  const views = parseInt(localStorage.getItem(`views_${event.carId}`) || '0') + 1;
  localStorage.setItem(`views_${event.carId}`, views.toString());

  if (views >= 2 && event.action === 'view') {
    const dealerName = localStorage.getItem('current_dealer_name') || 'Richard Automotive';

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`¡Interés Detectado en ${dealerName}!`, {
        body: 'Has visto este auto varias veces. ¿Quieres una oferta exclusiva por WhatsApp?',
        icon: '/pwa-192x192.png',
      });
    }
  }
};
