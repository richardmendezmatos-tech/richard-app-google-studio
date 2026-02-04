
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { subscribeToAuthChanges, getUserRole } from '../services/authService';
import { User, UserRole } from '@/types/types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

// Export context separately to help with Fast Refresh
export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (currentUser: FirebaseUser | null) => {
      if (currentUser) {
        const userRole = await getUserRole(currentUser.uid);
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
