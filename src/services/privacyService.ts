import { auth, db } from './firebaseService';
import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { PrivacySettings } from '@/types/types';

const PRIVACY_STORAGE_KEY = 'ra_privacy_settings';

const DEFAULT_SETTINGS: PrivacySettings = {
    essential: true,
    analytics: false,
    marketing: false,
    aiData: false,
    partnerSharing: false,
    lastUpdated: Date.now()
};

export const getPrivacySettings = async (): Promise<PrivacySettings> => {
    // 1. Try Firestore if user is logged in
    if (auth.currentUser) {
        try {
            const userDoc = doc(db, 'users', auth.currentUser.uid);
            const snapshot = await getDoc(userDoc);
            if (snapshot.exists() && snapshot.data()?.privacySettings) {
                return snapshot.data().privacySettings as PrivacySettings;
            }
        } catch (error) {
            console.error('Error fetching privacy settings from Firestore:', error);
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

    // 2. Save to Firestore if user is logged in
    if (auth.currentUser) {
        try {
            const userDoc = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userDoc, { privacySettings: updatedSettings }, { merge: true });
        } catch (error) {
            console.error('Error saving privacy settings to Firestore:', error);
        }
    }

    // 3. Dispatch event for other services to react
    window.dispatchEvent(new CustomEvent('privacySettingsChanged', { detail: updatedSettings }));
};
