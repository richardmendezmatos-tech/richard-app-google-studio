import { useState, useCallback, useEffect } from 'react';
import { create } from 'zustand';

export interface DealerConfig {
  id: string;
  name: string;
  logo?: string;
  themeColor?: string;
  welcomeMessage?: string;
}

const DEFAULT_DEALER: DealerConfig = {
  id: 'richard-automotive',
  name: 'Richard Automotive',
  themeColor: '#00aed9',
  welcomeMessage: 'Bienvenido a Richard Automotive. ¿En qué vehículo estás interesado hoy?',
};

interface DealerState {
  currentDealer: DealerConfig;
  setDealer: (config: DealerConfig) => void;
  hydrate: () => void;
}

// Removiendo getInitialDealer síncrono para evitar hydration mismatches

export const useDealerStore = create<DealerState>((set) => ({
  currentDealer: DEFAULT_DEALER,
  hydrate: () => {
    if (typeof window === 'undefined') return;

    const savedId = localStorage.getItem('current_dealer_id');
    const savedName = localStorage.getItem('current_dealer_name');
    const savedLogo = localStorage.getItem('current_dealer_logo');
    const savedWelcome = localStorage.getItem('current_dealer_welcome');

    if (savedId && savedName) {
      set({
        currentDealer: {
          id: savedId,
          name: savedName,
          logo: savedLogo || undefined,
          welcomeMessage: savedWelcome || undefined,
        },
      });
    }
  },
  setDealer: (config: DealerConfig) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_dealer_id', config.id);
      localStorage.setItem('current_dealer_name', config.name);
      if (config.logo) localStorage.setItem('current_dealer_logo', config.logo);
      if (config.welcomeMessage) {
        localStorage.setItem('current_dealer_welcome', config.welcomeMessage);
      }
    }
    set({ currentDealer: config });
  },
}));

export const useDealer = () => {
  const store = useDealerStore();

  useEffect(() => {
    store.hydrate();
  }, [store]);

  return store;
};
