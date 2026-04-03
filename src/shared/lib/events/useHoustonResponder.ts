import { useEffect } from 'react';
import { houstonBus, HoustonEventType } from './HoustonBus';

/**
 * Hook para reaccionar a eventos del Houston Bus de forma reactiva.
 * @param eventType El tipo de evento a escuchar.
 * @param handler Función que se ejecuta al recibir el evento.
 */
export const useHoustonResponder = <T = any>(
  eventType: HoustonEventType,
  handler: (payload: T) => void
): void => {
  useEffect(() => {
    const subscription = houstonBus.on<T>(eventType).subscribe({
      next: (payload) => {
        console.log(`[Houston:Responder] Reacting to ${eventType}`);
        handler(payload);
      },
      error: (err) => {
        console.error(`[Houston:Responder] Error in subscription for ${eventType}:`, err);
      }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [eventType, handler]);
};
