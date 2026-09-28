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

export const useAuthStore = create<AuthState>((set) => {
  const getStoredUser = (): User | null => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  return {
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
    user: getStoredUser(),
    isAuthenticated:
      typeof window !== "undefined" ? Boolean(localStorage.getItem("token")) : false,

    login: (token: string, user: User | null = null) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
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
        localStorage.removeItem("user");
      }
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    },

    setUser: (user: User | null) => {
      if (typeof window !== "undefined") {
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          localStorage.removeItem("user");
        }
      }
      set({ user });
    },
  };
});
