'use client';

import { useEffect, useState, useCallback, useRef, FC } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogleCredential } from '@/features/auth';

interface GoogleOneTapProps {
  clientId?: string;
  redirectPath?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  autoSelect?: boolean;
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
  cancel: () => void;
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
  clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  redirectPath = '/',
  onSuccess,
  onError,
  autoSelect = false,
}) => {
  const router = useRouter();
  const [scriptReady, setScriptReady] = useState(false);
  const initialized = useRef(false);
  const scriptLoadedRef = useRef(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existing) {
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      setScriptReady(true);
    };
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && !initialized.current) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, []);

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        await signInWithGoogleCredential(response.credential);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectPath);
        }
      } catch (error) {
        if (onError) {
          onError(error instanceof Error ? error : new Error('Google One Tap login failed'));
        }
      }
    },
    [onSuccess, onError, redirectPath, router],
  );

  useEffect(() => {
    const isLoaded = scriptReady || scriptLoadedRef.current;
    if (!isLoaded || !clientId || initialized.current) return;

    const initTimer = setTimeout(() => {
      if (!window.google?.accounts?.id) return;

      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: autoSelect,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
      });

      window.google.accounts.id.prompt((notification: GooglePromptMomentNotification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('[Google OneTap] Skipped:', notification.getNotDisplayedReason());
        }
      });
    }, 500);

    return () => {
      clearTimeout(initTimer);
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [scriptReady, clientId, handleCredentialResponse, autoSelect]);

  return (
    <div id="one-tap-container" className="fixed top-4 right-4 z-50 pointer-events-none" />
  );
};

export default GoogleOneTap;
