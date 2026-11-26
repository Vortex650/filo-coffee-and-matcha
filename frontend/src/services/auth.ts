import { api } from "./api";

export type AuthUser = { id: number; email: string; first_name: string; last_name: string; mobile: string; role: string };

export async function login(email: string, password: string) {
  const { data } = await api.post("/accounts/login/", { email, password });
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  const me = await api.get("/accounts/me/");
  localStorage.setItem("user", JSON.stringify(me.data));
  return me.data as AuthUser;
}

export async function register(payload: { email: string; username: string; password: string; first_name?: string; last_name?: string; mobile?: string }) {
  await api.post("/accounts/register/", payload);
  return login(payload.email, payload.password);
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

export function currentUser(): AuthUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function isStaff(user: AuthUser | null) {
  return !!user && ["owner", "manager", "cashier", "barista"].includes(user.role);
}
