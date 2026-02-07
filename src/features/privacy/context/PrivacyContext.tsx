
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PrivacySettings } from '@/types/types';
import { AuthContext } from '../../auth/context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebaseService';

interface PrivacyContextType {
    settings: PrivacySettings;
    updateSettings: (newSettings: Partial<PrivacySettings>) => Promise<void>;
    hasConsented: boolean;
    acceptAll: () => Promise<void>;
    loading: boolean;
}

const DEFAULT_SETTINGS: PrivacySettings = {
    essential: true,
    analytics: false,
    marketing: false,
    aiData: false,
    partnerSharing: false,
    lastUpdated: Date.now()
};

export const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS);
    const [hasConsented, setHasConsented] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    // Load initial settings
    useEffect(() => {
        const loadSettings = async () => {
            // 1. Check LocalStorage (for guests or initial state)
            const savedConsent = localStorage.getItem('privacy_consented');
            const savedSettings = localStorage.getItem('privacy_settings');

            if (savedConsent === 'true') {
                setHasConsented(true);
                if (savedSettings) {
                    try {
                        setSettings(JSON.parse(savedSettings));
                    } catch (e) {
                        console.error("Error parsing saved privacy settings:", e);
                    }
                }
            }

            // 2. If user is logged in, sync with Firestore
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists() && userDoc.data().privacySettings) {
                        const dbSettings = userDoc.data().privacySettings as PrivacySettings;
                        // Ensure essential is always true
                        const syncedSettings = { ...dbSettings, essential: true };
                        setSettings(syncedSettings);
                        setHasConsented(true);
                        localStorage.setItem('privacy_consented', 'true');
                        localStorage.setItem('privacy_settings', JSON.stringify(syncedSettings));
                    }
                } catch (error) {
                    console.error("Error fetching privacy settings from Firestore:", error);
                }
            }
            setLoading(false);
        };

        loadSettings();
    }, [user]);

    const updateSettings = async (newSettings: Partial<PrivacySettings>) => {
        const updated = { ...settings, ...newSettings, lastUpdated: Date.now() };
        setSettings(updated);
        setHasConsented(true);

        localStorage.setItem('privacy_consented', 'true');
        localStorage.setItem('privacy_settings', JSON.stringify(updated));

        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), {
                    privacySettings: updated
                });
            } catch (error) {
                console.error("Error updating privacy settings in Firestore:", error);
            }
        }
    };

    const acceptAll = async () => {
        await updateSettings({
            analytics: true,
            marketing: true,
            aiData: true,
            partnerSharing: true,
        });
    };

    return (
        <PrivacyContext.Provider value={{ settings, updateSettings, hasConsented, acceptAll, loading }}>
            {children}
        </PrivacyContext.Provider>
    );
};

export const usePrivacy = () => {
    const context = useContext(PrivacyContext);
    if (context === undefined) {
        throw new Error('usePrivacy must be used within a PrivacyProvider');
    }
    return context;
};
