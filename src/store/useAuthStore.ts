import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface AuthStore {
  token: string | null;
  isTokenLoading: boolean;
  loadToken: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  isTokenLoading: true,

  loadToken: async () => {
    const token = await AsyncStorage.getItem("token");
    set({ token, isTokenLoading: false });
  },

  setToken: async (token) => {
    set({ token });
    await AsyncStorage.setItem("token", token);
  },

  clearToken: async () => {
    set({ token: null });
    await AsyncStorage.removeItem("token");
  },
}));