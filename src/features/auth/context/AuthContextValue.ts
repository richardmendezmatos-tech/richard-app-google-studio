import { createContext } from 'react';
import { User, UserRole } from '@/types/types';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});
