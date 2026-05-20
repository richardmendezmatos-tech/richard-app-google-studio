import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface GamificationState {
  selectedRewards: string[];
  prontoBonus: number | null;
  countdownSeconds: number;
  isKeySpun: boolean;
  rewardToken: string | null;
  timerActive: boolean;

  // Actions
  selectReward: (rewardId: string) => void;
  deselectReward: (rewardId: string) => void;
  spinKey: () => number;
  startTimer: () => void;
  tickTimer: () => void;
  resetGamification: () => void;
}

// Opciones de premios premium (delivery gifts)
export const PREMIUM_DELIVERY_GIFTS = [
  { id: 'gasolina', label: 'Gasolina Gratis (Tanque Lleno)', value: 100 },
  { id: 'asistencia', label: 'Asistencia en Carretera 24/7 (1er Año)', value: 150 },
  { id: 'lavado', label: 'Lavado de Autos Full Detail Premium', value: 80 },
  { id: 'accesorios', label: '15% de Descuento en Accesorios Originales', value: 200 },
];

// Probabilidades ponderadas para el bono de pronto
// 200: 15% | 450: 70% | 600: 10% | 800: 5% (Promedio ~ $445)
const PRONTO_BONUS_POOL = [
  { value: 200, weight: 15 },
  { value: 450, weight: 70 },
  { value: 600, weight: 10 },
  { value: 800, weight: 5 },
];

const selectWeightedBonus = (): number => {
  const randomValue = Math.random() * 100;
  let cumulativeWeight = 0;
  for (const bonus of PRONTO_BONUS_POOL) {
    cumulativeWeight += bonus.weight;
    if (randomValue <= cumulativeWeight) {
      return bonus.value;
    }
  }
  return 450; // Fallback seguro
};

const generateSecureToken = (): string => {
  return `RA-REWARD-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      selectedRewards: [],
      prontoBonus: null,
      countdownSeconds: 900, // 15 minutos en segundos
      isKeySpun: false,
      rewardToken: null,
      timerActive: false,

      selectReward: (rewardId) =>
        set((state) => {
          if (state.selectedRewards.includes(rewardId)) return state;
          if (state.selectedRewards.length >= 2) return state; // Máximo 2 regalos
          return { selectedRewards: [...state.selectedRewards, rewardId] };
        }),

      deselectReward: (rewardId) =>
        set((state) => ({
          selectedRewards: state.selectedRewards.filter((id) => id !== rewardId),
        })),

      spinKey: () => {
        const { isKeySpun } = get();
        if (isKeySpun) return get().prontoBonus || 450;

        const bonus = selectWeightedBonus();
        const secureToken = generateSecureToken();

        set({
          prontoBonus: bonus,
          isKeySpun: true,
          rewardToken: secureToken,
          timerActive: true,
        });

        return bonus;
      },

      startTimer: () => set({ timerActive: true }),

      tickTimer: () =>
        set((state) => {
          if (!state.timerActive) return state;
          const nextSeconds = state.countdownSeconds - 1;
          if (nextSeconds <= 0) {
            return {
              countdownSeconds: 0,
              timerActive: false,
            };
          }
          return { countdownSeconds: nextSeconds };
        }),

      resetGamification: () =>
        set({
          selectedRewards: [],
          prontoBonus: null,
          countdownSeconds: 900,
          isKeySpun: false,
          rewardToken: null,
          timerActive: false,
        }),
    }),
    {
      name: 'richard_gamification_vault',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
