
import React, { useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthContext } from './AuthContextValue';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { subscribeToAuthChanges, getUserRole } = await import('../services/authService');
      unsubscribe = subscribeToAuthChanges(async (currentUser: FirebaseUser | null) => {
        if (!mounted) return;

        if (currentUser) {
          const userRole = await getUserRole(currentUser.uid);
          if (!mounted) return;
          setRole(userRole);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: userRole
          });
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      });
    })().catch((error) => {
      console.error('Auth bootstrap failed:', error);
      if (mounted) {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
