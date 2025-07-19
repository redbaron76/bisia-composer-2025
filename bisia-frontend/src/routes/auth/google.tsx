import { createFileRoute, redirect } from "@tanstack/react-router";

import type { AuthResponse } from "@/types/auth";
import { env } from "@/env";
import { getFetcher } from "@/lib/fetcher";
import { useAuthStore } from "@/stores/AuthStore";
import z from "zod";

const googleRouteSchema = z.object({
  token: z.string(),
});

export const Route = createFileRoute("/auth/google")({
  validateSearch: googleRouteSchema,
  beforeLoad: async ({ context, search }) => {
    const { token } = search;

    if (!token) throw redirect({ to: "/demo/form/gmail" });

    const queryClient = context.queryClient;

    try {
      const response = await queryClient.fetchQuery({
        queryKey: ["google-user", token],
        queryFn: () =>
          getFetcher<AuthResponse>(
            `${env.VITE_API_URL}/google/user?token=${token}`
          ),
      });

      if (!response.error) {
        const { user, accessToken, message } = response;
        useAuthStore.getState().setUserAuth(user, accessToken, message);
      }
    } catch (error) {
      useAuthStore
        .getState()
        .setMessage(
          true,
          (error as Error).message || "Errore nel login con Google"
        );
    }

    throw redirect({ to: "/demo/form/gmail" });
  },
});
