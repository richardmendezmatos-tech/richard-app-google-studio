import { useEffect } from 'react';
import { useAuthStore } from '@/entities/session';
import { subscribeToAuthChanges, getUserRole, normalizeUser } from '@/features/auth/services/authService';

export const useAuthListener = () => {
  const { setUser, setRole, setLoading, logout } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      console.log('🔄 [useAuthListener] Auth State Change Detected:', user ? `User: ${user.email}` : 'User: None');
      
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          console.log('✅ [useAuthListener] User authenticated with role:', role);
          setRole(role);
          setUser(normalizeUser(user, role));
        } catch (error) {
          console.error('❌ [useAuthListener] Error fetching user role:', error);
          logout();
        }
      } else {
        console.warn('⚠️ [useAuthListener] No user detected, logging out.');
        logout();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [setUser, setRole, setLoading, logout]);
};

