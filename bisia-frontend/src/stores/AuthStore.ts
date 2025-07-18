import { createJSONStorage, persist } from "zustand/middleware";

import type { User } from "@/types/auth";
import { create } from "zustand";

export type AuthProps = {
  isAuthenticated: boolean;
  accessToken: string | null;
  userAuth: User | null;
  error?: boolean;
  message?: string;
};

export interface AuthStore extends AuthProps {
  resetMessage: () => void;
  setMessage: (error: boolean, message?: string) => void;
  setUserAuth: (userAuth: User, accessToken: string, message?: string) => void;
  setAuth: (key: keyof AuthProps, value: AuthProps[typeof key]) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      userAuth: null,
      confirmationResult: null,

      resetMessage: () => {
        set({ error: false, message: undefined });
      },

      setMessage: (error: boolean, message?: string) => {
        set({ error, message });
      },

      setUserAuth: (userAuth, accessToken, message) => {
        set({
          error: false,
          isAuthenticated: true,
          message,
          userAuth,
          accessToken,
        });
      },

      setAuth: (key, value) => {
        set({ [key]: value });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        userAuth: state.userAuth,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
