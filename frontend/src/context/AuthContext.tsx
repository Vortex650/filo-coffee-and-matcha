import { createContext, useContext, useState, type ReactNode } from "react";
import { currentUser, logout as doLogout, type AuthUser } from "../services/auth";
import { api } from "../services/api";

type AuthContextValue = {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(currentUser());
  const logout = () => { doLogout(); setUser(null); };
  const refreshMe = async () => {
    if (!localStorage.getItem("access_token")) return;
    try { const { data } = await api.get("/accounts/me/"); setUser(data); localStorage.setItem("user", JSON.stringify(data)); } catch { /* ignore */ }
  };
  return <AuthContext.Provider value={{ user, setUser, logout, refreshMe }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
