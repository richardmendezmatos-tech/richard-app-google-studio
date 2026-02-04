import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const BIOMETRIC_KEY = 'biometric_enabled';

export const BiometricService = {
    // Check if hardware is available (Mocked true for Web Demo)
    isAvailable: async (): Promise<boolean> => {
        if (Capacitor.getPlatform() === 'web') {
            return true; // Simulate availability on web
        }
        // TODO: Implement native check when ready
        return false;
    },

    // Check if user has enabled it
    isEnabled: async (): Promise<boolean> => {
        const { value } = await Preferences.get({ key: BIOMETRIC_KEY });
        return value === 'true';
    },

    // Toggle setting
    setEnabled: async (enabled: boolean): Promise<void> => {
        await Preferences.set({
            key: BIOMETRIC_KEY,
            value: String(enabled),
        });
    },

    // Perform Verification
    verifyIdentity: async (): Promise<boolean> => {
        if (Capacitor.getPlatform() === 'web') {
            // Simulation Delay
            return new Promise((resolve) => {
                setTimeout(() => resolve(true), 2000);
            });
        }

        // TODO: Native Implementation
        return false;
    }
};
