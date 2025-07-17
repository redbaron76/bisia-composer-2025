import { env } from "@/env";

export function useGmail() {
  const signInWithGoogle = () => {
    const url = new URL(window.location.href);
    console.log("url origin", url.origin);
    window.location.href = `${env.VITE_API_URL}/google/login?origin=${url.origin}`;
  };

  return {
    signInWithGoogle,
  };
}
