'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Richard Automotive Sentinel: Session Recovery Bridge
 * Purpose: Catch accidental OAuth redirects to the root page and bridge them to /auth/callback.
 */
export const SessionRecoveryBridge = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (code) {
      console.log('🛰️ [Sentinel:Bridge] Session code detected on root. Bridging to auth callback...');
      router.replace(`/auth/callback?code=${code}`);
    }
    
    if (error) {
      console.error('❌ [Sentinel:Bridge] Auth error detected on root:', error);
      router.replace('/login?error=' + error);
    }
  }, [searchParams, router]);

  return null; // Invisible component
};
