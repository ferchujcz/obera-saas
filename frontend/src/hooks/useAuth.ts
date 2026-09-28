"use client";

import { useAuthStore } from "@/store/useAuthStore";

export function useAuth() {
  const { token, user, isAuthenticated, login, logout, setUser } = useAuthStore();

  return {
    token,
    user,
    isAuthenticated,
    isOwner: user?.role === "OWNER",
    isTenant: user?.role === "TENANT",
    isAdmin: user?.role === "ADMIN",
    login,
    logout,
    setUser,
  };
}
