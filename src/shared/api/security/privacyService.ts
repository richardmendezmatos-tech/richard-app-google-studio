import { supabase } from '@/shared/api/supabase/supabaseClient';
import { PrivacySettings } from '@/shared/types/types';

const PRIVACY_STORAGE_KEY = 'ra_privacy_settings';

const DEFAULT_SETTINGS: PrivacySettings = {
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

export const getPrivacySettings = async (): Promise<PrivacySettings> => {
  // 1. Try Supabase if user is logged in
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('metadata')
          .eq('id', user.id)
          .single();
          
        if (!error && data?.metadata?.privacySettings) {
          return data.metadata.privacySettings as PrivacySettings;
        }
      }
    } catch (error) {
      console.error('Error fetching privacy settings from Supabase:', error);
    }
  }

  // 2. Try Local Storage
  const local = localStorage.getItem(PRIVACY_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local) as PrivacySettings;
    } catch (e) {
      console.error('Error parsing local privacy settings:', e);
    }
  }

  return DEFAULT_SETTINGS;
};

export const savePrivacySettings = async (settings: PrivacySettings): Promise<void> => {
  const updatedSettings = { ...settings, lastUpdated: Date.now() };

  // 1. Save to Local Storage
  localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(updatedSettings));

  // 2. Save to Supabase if user is logged in
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ metadata: { privacySettings: updatedSettings } })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error saving privacy settings to Supabase:', error);
    }
  }


  // 3. Dispatch event for other services to react
  window.dispatchEvent(new CustomEvent('privacySettingsChanged', { detail: updatedSettings }));
};
