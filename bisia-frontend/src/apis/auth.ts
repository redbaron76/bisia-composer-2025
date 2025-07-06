import type {
  EmailPasswordSchema,
  RefIdPhoneSchema,
  UsernamePhone,
} from "@/schemas/auth";
import { getFetcher, postFetcher } from "@/lib/fetcher";

import type { UserAuth } from "@/types/auth";
import { deleteFirebaseUser } from "./firebase";
import { env } from "@/env";
import { useAuthStore } from "@/stores/AuthStore";
import { z } from "zod";

type LoginResponse = {
  accessToken: string;
  user: UserAuth;
  message?: string;
};

// check if username + phone is acceptable
// true: username + phone exists or false: username + phone does not exist
// false: username has different phone
export const doCheckUsernamePhoneOk = async (
  data: UsernamePhone
): Promise<{ ok: boolean; error?: string }> => {
  return await postFetcher<{ ok: boolean; error?: string }>(
    `${env.VITE_API_URL}/auth/check-username-phone`,
    data
  );
};

export const doLogin = async (
  data: z.infer<typeof EmailPasswordSchema>
): Promise<LoginResponse> => {
  return await postFetcher<LoginResponse>(`${env.VITE_API_URL}/auth/login`, {
    email: data.email,
    password: data.password,
  });
};

export const doPhoneIn = async (
  data: z.infer<typeof RefIdPhoneSchema>
): Promise<LoginResponse> => {
  return await postFetcher<LoginResponse>(
    `${env.VITE_API_URL}/auth/phone-access`,
    {
      username: data.username,
      phone: data.phone,
      refId: data.refId,
      provider: data.provider,
    }
  );
};

export const doLogout = async (): Promise<{ success: boolean }> => {
  return await postFetcher(`${env.VITE_API_URL}/auth/logout`, {
    credentials: "include",
  });
};

export const doProtected = async (): Promise<{ message: string }> => {
  return await getFetcher(`${env.VITE_API_URL}/protected`, {
    credentials: "include",
  });
};

export const doDeleteUser = async (): Promise<{
  success: boolean;
  userId: string;
  refId?: string;
}> => {
  const userId = useAuthStore.getState().userAuth?.id;

  if (!userId) {
    throw new Error("User ID not found");
  }

  const resp = await postFetcher<{
    success: boolean;
    userId: string;
    refId?: string;
  }>(`${env.VITE_API_URL}/auth/delete-user`, {
    userId,
  });

  if (resp.success && resp.refId) {
    await deleteFirebaseUser();
  }

  return resp;
};
