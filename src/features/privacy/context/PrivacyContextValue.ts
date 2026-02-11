import { createContext } from 'react';
import { PrivacySettings } from '@/types/types';

export interface PrivacyContextType {
  settings: PrivacySettings;
  updateSettings: (newSettings: Partial<PrivacySettings>) => Promise<void>;
  hasConsented: boolean;
  acceptAll: () => Promise<void>;
  loading: boolean;
}

export const DEFAULT_SETTINGS: PrivacySettings = {
  essential: true,
  analytics: false,
  marketing: false,
  aiData: false,
  partnerSharing: false,
  lastUpdated: Date.now()
};

export const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);
