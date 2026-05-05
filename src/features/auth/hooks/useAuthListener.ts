import { useEffect } from 'react';
import { useAuthStore } from '@/entities/session';
import { subscribeToAuthChanges, getUserRole, normalizeUser } from '@/features/auth/services/authService';

export const useAuthListener = () => {
  const { setUser, setRole, setLoading, logout } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          setRole(role);
          setUser(normalizeUser(user, role));
        } catch (error) {
          console.error('Error fetching user role:', error);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [setUser, setRole, setLoading, logout]);
};

