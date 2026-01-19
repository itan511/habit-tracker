import { create } from "zustand";
import { api } from "@/mocks/api";

interface AuthState {
  token: string | null;
  user: any | null;
  login: (u: string, p: string) => Promise<void>;
  register: (payload: {username: string; password: string; name: string; email: string}) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: null,

  async login(username, password) {
    const res = await api.login(username, password);

    localStorage.setItem("token", res.token);
    set({ token: res.token, user: res.user });
  },

  async register(payload) {
    const res = await api.register(payload);

    localStorage.setItem("token", res.token);
    set({ token: res.token, user: res.user });
  },

  logout() {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  }
}));
