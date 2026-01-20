import { create } from "zustand";
import { authApi } from "@/services/authApi";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {username: string; password: string; email: string; name?: string}) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: null,

  async login(email, password) {
    const res = await authApi.login({ email, password });

    localStorage.setItem("token", res.token);
    set({ token: res.token, user: res.user });
  },

  async register(payload) {
    const res = await authApi.register(payload);

    localStorage.setItem("token", res.token);
    set({ token: res.token, user: res.user });
  },

  logout() {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  }
}));
