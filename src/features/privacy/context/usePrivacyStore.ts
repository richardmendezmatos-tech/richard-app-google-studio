import { create } from 'zustand';
import { PrivacySettings } from '@/shared/types/types';
import { useAuthStore } from '@/entities/session';

export const DEFAULT_SETTINGS: PrivacySettings = {
  essential: true,
  analytics: false,
  marketing: false,
  aiData: false,
  partnerSharing: false,
  language: 'es',
  darkMode: true,
  notifications: true,
  lastUpdated: Date.now(),
};

interface PrivacyState {
  settings: PrivacySettings;
  hasConsented: boolean;
  loading: boolean;
  updateSettings: (newSettings: Partial<PrivacySettings>) => Promise<void>;
  acceptAll: () => Promise<void>;
  _initialize: () => void;
}

export const usePrivacyStore = create<PrivacyState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  hasConsented: false,
  loading: true,

  _initialize: async () => {
    let savedConsent: string | null = null;
    let savedSettingsStr: string | null = null;

    if (typeof window !== 'undefined') {
      savedConsent = localStorage.getItem('privacy_consented');
      savedSettingsStr = localStorage.getItem('privacy_settings');
    }

    if (savedConsent === 'true') {
      set({ hasConsented: true });
      if (savedSettingsStr) {
        try {
          set({ settings: JSON.parse(savedSettingsStr) });
        } catch (e) {
          console.error('Error parsing saved privacy settings:', e);
        }
      }
    }

    const { user } = useAuthStore.getState();

    if (user) {
      try {
        const [{ db }, { doc, getDoc }] = await Promise.all([
          import('@/shared/api/firebase/firebaseService'),
          import('firebase/firestore/lite'),
        ]);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().privacySettings) {
          const dbSettings = userDoc.data().privacySettings as PrivacySettings;
          const syncedSettings = { ...dbSettings, essential: true };
          set({ settings: syncedSettings, hasConsented: true });

          if (typeof window !== 'undefined') {
            localStorage.setItem('privacy_consented', 'true');
            localStorage.setItem('privacy_settings', JSON.stringify(syncedSettings));
          }
        }
      } catch (error) {
        console.error('Error fetching privacy settings from Firestore:', error);
      }
    }

    set({ loading: false });
  },

  updateSettings: async (newSettings: Partial<PrivacySettings>) => {
    const { settings } = get();
    const updated = { ...settings, ...newSettings, lastUpdated: Date.now() };
    set({ settings: updated, hasConsented: true });

    if (typeof window !== 'undefined') {
      localStorage.setItem('privacy_consented', 'true');
      localStorage.setItem('privacy_settings', JSON.stringify(updated));
    }

    const { user } = useAuthStore.getState();

    if (user) {
      try {
        const [{ db }, { doc, updateDoc }] = await Promise.all([
          import('@/shared/api/firebase/firebaseService'),
          import('firebase/firestore/lite'),
        ]);
        await updateDoc(doc(db, 'users', user.uid), {
          privacySettings: updated,
        });
      } catch (error) {
        console.error('Error updating privacy settings in Firestore:', error);
      }
    }
  },

  acceptAll: async () => {
    await get().updateSettings({
      analytics: true,
      marketing: true,
      aiData: true,
      partnerSharing: true,
    });
  },
}));

// Initialize immediately (non-blocking) and also subscribe to auth changes
usePrivacyStore.getState()._initialize();

useAuthStore.subscribe((state, prevState) => {
  if (state.user?.uid !== prevState.user?.uid) {
    // If user changes (login/logout), re-initialize to grab Firestore data if available
    usePrivacyStore.getState()._initialize();
  }
});

// For backward compatibility while refactoring
export const usePrivacy = () => usePrivacyStore();
