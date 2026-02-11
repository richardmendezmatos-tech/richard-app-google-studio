
import { useEffect, useState, useCallback, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/services/firebaseService';

interface GoogleOneTapProps {
    clientId?: string;
    onSuccess?: () => void;
}

interface GoogleCredentialResponse {
    credential: string;
}

interface GooglePromptMomentNotification {
    isNotDisplayed: () => boolean;
    isSkippedMoment: () => boolean;
    getNotDisplayedReason: () => string;
}

interface GoogleAccountsIdApi {
    initialize: (params: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select: boolean;
        cancel_on_tap_outside: boolean;
        use_fedcm_for_prompt: boolean;
    }) => void;
    prompt: (cb: (notification: GooglePromptMomentNotification) => void) => void;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                id: GoogleAccountsIdApi;
            };
        };
    }
}

const GoogleOneTap: FC<GoogleOneTapProps> = ({
    clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID,
    onSuccess
}) => {
    const navigate = useNavigate();
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // 1. Load Google Identity Services Script dynamically
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
        try {
            console.log('Google Security Token Recibido:', response.credential);
            const credential = GoogleAuthProvider.credential(response.credential);
            const result = await signInWithCredential(auth, credential);

            console.log('Usuario autenticado vía One Tap:', result.user.email);

            if (onSuccess) onSuccess();
            else {
                navigate('/admin');
            }

        } catch (error) {
            console.error('Error en One Tap Login:', error);
        }
    }, [onSuccess, navigate]);

    useEffect(() => {
        if (!scriptLoaded || !clientId) return;

        const initializeGoogleOneTap = () => {
            if (!window.google) return;

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: true
            });

            window.google.accounts.id.prompt((notification: GooglePromptMomentNotification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log('One Tap skipped/not displayed:', notification.getNotDisplayedReason());
                }
            });
        };

        initializeGoogleOneTap();
    }, [scriptLoaded, clientId, handleCredentialResponse]);

    return (
        // One Tap is an overlay, so this component doesn't need to render UI unless we want a fallback button
        <div id="one-tap-container" className="fixed top-4 right-4 z-50 pointer-events-none" />
    );
};

export default GoogleOneTap;
