import { create } from "zustand";
import type { User } from "@/types";
import { authApi } from "@/api/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  hydrate: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user) => {
    set({ user, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  // In authStore.ts
hydrate: async () => {
  try {
    // Small delay to ensure cookie is sent
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const res = await authApi.getProfile();
    set({ user: res.data.user, isAuthenticated: true, isHydrated: true });
    return true;
  } catch {
    set({ user: null, isAuthenticated: false, isHydrated: true });
    return false;
  }
},
}));
