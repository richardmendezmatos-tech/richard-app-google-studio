import React, { useContext, useState, useEffect, ReactNode } from 'react';
import { PrivacySettings } from '@/types/types';
import { AuthContext } from '../../auth/context/AuthContextValue';
import { DEFAULT_SETTINGS, PrivacyContext } from './PrivacyContextValue';

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS);
    const [hasConsented, setHasConsented] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    // Load initial settings
    useEffect(() => {
        let mounted = true;

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
                    const [{ db }, { doc, getDoc }] = await Promise.all([
                        import('@/services/firebaseService'),
                        import('firebase/firestore/lite')
                    ]);
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (mounted && userDoc.exists() && userDoc.data().privacySettings) {
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
            if (mounted) setLoading(false);
        };

        loadSettings().catch((error) => {
            console.error("Error loading privacy settings:", error);
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
        };
    }, [user]);

    const updateSettings = async (newSettings: Partial<PrivacySettings>) => {
        const updated = { ...settings, ...newSettings, lastUpdated: Date.now() };
        setSettings(updated);
        setHasConsented(true);

        localStorage.setItem('privacy_consented', 'true');
        localStorage.setItem('privacy_settings', JSON.stringify(updated));

        if (user) {
            try {
                const [{ db }, { doc, updateDoc }] = await Promise.all([
                    import('@/services/firebaseService'),
                    import('firebase/firestore/lite')
                ]);
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
