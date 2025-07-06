import { createJSONStorage, persist } from "zustand/middleware";

import type { UserAuth } from "@/types/auth";
import { create } from "zustand";

export type AuthProps = {
  isAuthenticated: boolean;
  accessToken: string | null;
  userAuth: UserAuth | null;
  error?: string;
  message?: string;
};

export interface AuthStore extends AuthProps {
  setMessage: (message: string) => void;
  setErrorMessage: (error: string) => void;
  setUserAuth: (
    userAuth: UserAuth,
    accessToken: string,
    message?: string
  ) => void;
  setAuth: (key: keyof AuthProps, value: AuthProps[typeof key]) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      userAuth: null,
      confirmationResult: null,

      setMessage: (message: string) => {
        set({ message, error: undefined });
      },

      setErrorMessage: (error: string) => {
        set({ error, message: undefined });
      },

      setUserAuth: (userAuth: UserAuth, accessToken, message) => {
        set({
          error: undefined,
          message: message || undefined,
          isAuthenticated: true,
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
