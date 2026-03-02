import { createContext } from 'react';
import { AppUser, UserRole } from '@/domain/entities';

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
