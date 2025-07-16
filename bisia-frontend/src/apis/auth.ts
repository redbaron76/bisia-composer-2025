import type {
  ApiResponse,
  AuthResponse,
  CheckUsername,
  DeleteUser,
  OtpConfirmation,
  OtpResponse,
} from "@/types/auth";
import type {
  EmailPasswordSchema,
  PasswordlessAccessSchema,
  UsernameEmail,
  UsernameEmailOrPhone,
} from "@/schemas/auth";
import { getFetcher, postFetcher } from "@/lib/fetcher";

import { deleteFirebaseUser } from "./firebase";
import { env } from "@/env";
import { useAuthStore } from "@/stores/AuthStore";
import { z } from "zod";

export const doCheckUsername = async (
  data: UsernameEmailOrPhone
): Promise<CheckUsername> => {
  return await postFetcher<CheckUsername>(
    `${env.VITE_API_URL}/auth/check-username`,
    data,
    {
      errorFallbackMessage: "Errore durante il controllo username",
    }
  );
};

export const doLogin = async (
  data: z.infer<typeof EmailPasswordSchema>
): Promise<AuthResponse> => {
  const resp = await postFetcher<AuthResponse>(
    `${env.VITE_API_URL}/auth/login`,
    {
      email: data.email,
      password: data.password,
    },
    {
      errorFallbackMessage: "Errore durante il login",
    }
  );

  console.log("doLogin resp", resp);
  return resp;
};

export const doSignUpWithEmail = async (
  data: UsernameEmail
): Promise<number> => {
  return await postFetcher<number>(`${env.VITE_API_URL}/auth/email-signup`, {
    username: data.username,
    email: data.email,
  });
};

export const doSendOtpWithEmail = async (
  data: OtpConfirmation
): Promise<OtpResponse> => {
  return await postFetcher<OtpResponse>(
    `${env.VITE_API_URL}/auth/otp-confirmation`,
    data,
    {
      errorFallbackMessage: "Errore durante l'invio OTP",
    }
  );
};

export const doPasswordlessIn = async (
  data: z.infer<typeof PasswordlessAccessSchema>
): Promise<AuthResponse> => {
  return await postFetcher<AuthResponse>(
    `${env.VITE_API_URL}/auth/passwordless`,
    {
      username: data.username,
      email: data.email,
      phone: data.phone,
      userId: data.userId,
      refId: data.refId,
      provider: data.provider,
    },
    {
      errorFallbackMessage: "Errore durante l'accesso passwordless",
    }
  );
};

export const doLogout = async (): Promise<ApiResponse> => {
  return await postFetcher<ApiResponse>(
    `${env.VITE_API_URL}/auth/logout`,
    {
      credentials: "include",
    },
    {
      errorFallbackMessage: "Errore durante il logout",
    }
  );
};

export const doProtected = async (): Promise<{ message: string }> => {
  return await getFetcher(`${env.VITE_API_URL}/protected`, {
    credentials: "include",
  });
};

export const doDeleteUser = async (): Promise<DeleteUser> => {
  const userId = useAuthStore.getState().userAuth?.id;

  if (!userId) {
    throw new Error("User ID not found");
  }

  const resp = await postFetcher<DeleteUser>(
    `${env.VITE_API_URL}/auth/delete-user`,
    {
      userId,
    }
  );

  if (resp.success && resp.refId) {
    await deleteFirebaseUser();
  }

  return resp;
};
