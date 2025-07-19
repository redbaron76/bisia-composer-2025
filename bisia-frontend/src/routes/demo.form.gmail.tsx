import { Button } from "@/components/ui/button";
import MessageInfo from "@/components/forms/MessageInfo";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/AuthStore";
import { useGmail } from "@/hooks/useGmail";

export const Route = createFileRoute("/demo/form/gmail")({
  component: GmailForm,
});

function GmailForm() {
  const { logoutMutation, protectedMutation, deleteUserMutation } = useAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userAuth = useAuthStore((state) => state.userAuth);

  const { signInWithGoogle, isLoadingAuthUrl } = useGmail();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-white">
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-gray-600 shadow-xl border-8 border-black/10">
        <div className="space-y-6">
          {isAuthenticated ? (
            <div className="flex flex-col gap-4">
              <h2>Utente autenticato: {userAuth?.username}</h2>
              <MessageInfo />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  onClick={() => {
                    protectedMutation.mutate();
                  }}
                >
                  Protected route
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    deleteUserMutation.mutate();
                  }}
                >
                  Delete user
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    logoutMutation.mutate();
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : isLoadingAuthUrl ? (
            <Button disabled>Loading...</Button>
          ) : (
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => {
                  signInWithGoogle();
                }}
              >
                Login con Gmail
              </Button>
              <MessageInfo />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
