import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppUser, UserRole } from '@/shared/types/types';

interface AuthState {
  user: AppUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  setUser: (user: AppUser | null) => void;
  setRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  loading: true, // initial state before listener is active
  error: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  logout: () =>
    set({ user: null, role: null, isAuthenticated: false, loading: false, error: null }),
}));
