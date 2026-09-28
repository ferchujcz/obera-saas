import { create } from "zustand";

export interface User {
  id: number;
  email: string;
  role: "ADMIN" | "OWNER" | "TENANT" | string;
  is_active: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user?: User | null) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  user: null,
  isAuthenticated: typeof window !== "undefined" ? Boolean(localStorage.getItem("token")) : false,

  login: (token: string, user: User | null = null) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  setUser: (user: User | null) => set({ user }),
}));
