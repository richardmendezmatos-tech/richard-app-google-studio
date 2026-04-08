import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CognitiveProfile = 'analytical' | 'impulsive' | 'conservative' | 'neutral';

interface CustomerMemoryState {
  profile: CognitiveProfile;
  interactionHistory: string[];
  setProfile: (profile: CognitiveProfile) => void;
  recordInteraction: (interaction: string) => void;
  inferProfile: () => void;
}

/**
 * CustomerMemoryService (Nivel 16): La memoria cognitiva de Richard Automotive.
 * Almacena y computa el perfil psicológico del usuario de forma persistente.
 */
export const useCustomerMemory = create<CustomerMemoryState>()(
  persist(
    (set, get) => ({
      profile: 'neutral',
      interactionHistory: [],
      
      setProfile: (profile) => set({ profile }),
      
      recordInteraction: (interaction) => {
        const history = [...get().interactionHistory, interaction].slice(-10);
        set({ interactionHistory: history });
        // Auto-inferencia después de cada interacción relevante
        get().inferProfile();
      },
      
      inferProfile: () => {
        const history = get().interactionHistory;
        
        // Conteo de señales heurísticas
        const signals = {
          analytical: history.filter(i => i.includes('spec') || i.includes('tech') || i.includes('roi')).length,
          impulsive: history.filter(i => i.includes('now') || i.includes('offer') || i.includes('status')).length,
          conservative: history.filter(i => i.includes('safe') || i.includes('warranty') || i.includes('family')).length,
        };
        
        let newProfile: CognitiveProfile = 'neutral';
        
        if (signals.analytical > signals.impulsive && signals.analytical > signals.conservative) {
          newProfile = 'analytical';
        } else if (signals.impulsive > signals.analytical && signals.impulsive > signals.conservative) {
          newProfile = 'impulsive';
        } else if (signals.conservative > signals.analytical && signals.conservative > signals.impulsive) {
          newProfile = 'conservative';
        }
        
        if (newProfile !== 'neutral' && newProfile !== get().profile) {
          set({ profile: newProfile });
          console.log(`[Neuro-Sentinel] Perfil inferido: ${newProfile.toUpperCase()}`);
        }
      }
    }),
    {
      name: 'ra-customer-memory', // Persistencia local (Zero-Gravity persistence)
    }
  )
);
