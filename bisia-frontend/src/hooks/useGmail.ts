import { env } from "@/env";
import { getFetcher } from "@/lib/fetcher";
import { useAuthStore } from "@/stores/AuthStore";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

export function useGmail() {
  const urlRef = useRef<URL>(new URL(window.location.href));
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Generate Google OAuth2 login URL
  const { data: authUrl, isLoading: isLoadingAuthUrl } = useQuery({
    queryKey: ["auth-url"],
    queryFn: async () => {
      const response = await getFetcher<{ authUrl: string }>(
        `${env.VITE_API_URL}/google/auth-url?origin=${urlRef.current.origin}`
      );
      return response.authUrl;
    },
    enabled: !isAuthenticated,
  });

  // Redirect to Google OAuth2 login page
  const signInWithGoogle = () => {
    if (authUrl) {
      console.log("authUrl", authUrl);
      window.location.href = `${authUrl}&origin=${urlRef.current.origin}`;
    }
    return;
  };

  return {
    signInWithGoogle,
    authUrl,
    isLoadingAuthUrl,
  };
}
