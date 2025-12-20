import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  isLoading: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
  setToken: (token) => set({ token }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      token: null,
    }),
}));
