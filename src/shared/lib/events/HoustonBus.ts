import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export enum HoustonEventType {
  RESILIENCE_CIRCUIT_OPENED = 'RESILIENCE_CIRCUIT_OPENED',
  RESILIENCE_REHYDRATION_COMPLETED = 'RESILIENCE_REHYDRATION_COMPLETED',
  PREDICTIVE_HIGH_INTENT = 'PREDICTIVE_HIGH_INTENT',
  PREDICTIVE_NUDGE_DISPATCHED = 'PREDICTIVE_NUDGE_DISPATCHED',
  UI_ADAPTATION_REQUESTED = 'UI_ADAPTATION_REQUESTED',
  LEAD_EMERGENCY_SAVE = 'LEAD_EMERGENCY_SAVE',
}

export interface HoustonEvent<T = any> {
  type: HoustonEventType;
  payload: T;
  timestamp: number;
  source: string;
}

export class HoustonBus {
  private static instance: HoustonBus;
  private bus$ = new Subject<HoustonEvent>();

  private constructor() {}

  static getInstance(): HoustonBus {
    if (!HoustonBus.instance) {
      HoustonBus.instance = new HoustonBus();
    }
    return HoustonBus.instance;
  }

  /**
   * Emite un evento al ecosistema Houston.
   */
  emit<T>(type: HoustonEventType, payload: T, source: string = 'unknown'): void {
    const event: HoustonEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source,
    };
    console.log(`[Houston:Bus] Emitting ${type} from ${source}`);
    this.bus$.next(event);
  }

  /**
   * Se suscribe a un tipo específico de evento.
   */
  on<T>(type: HoustonEventType): Observable<T> {
    return this.bus$.asObservable().pipe(
      filter((event) => event.type === type),
      map((event) => event.payload as T)
    );
  }

  /**
   * Observable global para monitoreo.
   */
  get events$(): Observable<HoustonEvent> {
    return this.bus$.asObservable();
  }
}

export const houstonBus = HoustonBus.getInstance();
