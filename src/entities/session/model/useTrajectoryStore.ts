import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TrajectoryEvent {
  type: 'page_view' | 'component_interaction' | 'calculation_run' | 'image_view';
  path: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface TrajectoryState {
  events: TrajectoryEvent[];
  dwellTimes: Record<string, number>; // path -> ms
  lastInteraction: number;
  currentScore: number;
  
  // Actions
  addEvent: (event: Omit<TrajectoryEvent, 'timestamp'>) => void;
  updateDwellTime: (path: string, duration: number) => void;
  setScore: (score: number) => void;
  reset: () => void;
}

export const useTrajectoryStore = create<TrajectoryState>()(
  persist(
    (set, get) => ({
      events: [],
      dwellTimes: {},
      lastInteraction: Date.now(),
      currentScore: 0,

      addEvent: (event) => set((state) => {
        const newEvent = { ...event, timestamp: Date.now() };
        // Limit history to last 50 events to prevent storage bloat
        const newEvents = [...state.events.slice(-49), newEvent];
        return { 
          events: newEvents, 
          lastInteraction: Date.now() 
        };
      }),

      updateDwellTime: (path, duration) => set((state) => {
        const currentDwell = state.dwellTimes[path] || 0;
        return {
          dwellTimes: { ...state.dwellTimes, [path]: currentDwell + duration }
        };
      }),

      setScore: (currentScore) => set({ currentScore }),

      reset: () => set({ events: [], dwellTimes: {}, currentScore: 0, lastInteraction: Date.now() }),
    }),
    {
      name: 'sentinel_trajectory_vault',
      storage: createJSONStorage(() => sessionStorage), // Only for current session
    }
  )
);
