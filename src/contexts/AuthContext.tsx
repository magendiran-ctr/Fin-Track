"use client";

// Authentication context for managing user state

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authApi } from "@/lib/api-client";

interface AuthUser {
  id: string;
  User_id: string | null;
  name: string;
  email: string;
  createdAt: string;
  avatar?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateAvatar: (avatarDataUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Initialize auth state from localStorage synchronously (avoids setState-in-effect lint error)
function getInitialAuthState(): { user: AuthUser | null; token: string | null } {
  if (typeof window === "undefined") return { user: null, token: null };
  const savedToken = localStorage.getItem("expense_tracker_token");
  const savedUser = localStorage.getItem("expense_tracker_user");
  if (savedToken && savedUser) {
    try {
      return { user: JSON.parse(savedUser), token: savedToken };
    } catch {
      localStorage.removeItem("expense_tracker_token");
      localStorage.removeItem("expense_tracker_user");
    }
  }
  return { user: null, token: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = getInitialAuthState();
  const [user, setUser] = useState<AuthUser | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);
  const isLoading = false;

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("expense_tracker_token", data.token);
    localStorage.setItem("expense_tracker_user", JSON.stringify(data.user));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authApi.register(name, email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("expense_tracker_token", data.token);
    localStorage.setItem("expense_tracker_user", JSON.stringify(data.user));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("expense_tracker_token");
    localStorage.removeItem("expense_tracker_user");
  }, []);

  const updateAvatar = useCallback(async (avatarDataUrl: string) => {
    const data = await authApi.updateAvatar(avatarDataUrl);
    setUser(data.user);
    localStorage.setItem("expense_tracker_user", JSON.stringify(data.user));
  }, []);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const syncUser = async () => {
      try {
        const data = await authApi.getMe();
        if (!isMounted) return;
        setUser(data.user);
        localStorage.setItem("expense_tracker_user", JSON.stringify(data.user));
      } catch {
        if (!isMounted) return;
        setToken(null);
        setUser(null);
        localStorage.removeItem("expense_tracker_token");
        localStorage.removeItem("expense_tracker_user");
      }
    };

    syncUser();
    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
