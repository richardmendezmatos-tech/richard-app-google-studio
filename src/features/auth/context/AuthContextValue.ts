import { createContext } from 'react';
import { AppUser, UserRole } from '@/types/types';

export interface AuthContextType {
  user: AppUser | null;
  role: UserRole | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});
