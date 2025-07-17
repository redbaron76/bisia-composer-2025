import { Button } from "@/components/ui/button";
import MessageInfo from "@/components/forms/MessageInfo";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/AuthStore";
import { usePasswordless } from "@/hooks/usePasswordless";

export const Route = createFileRoute("/demo/form/email")({
  component: EmailForm,
});

function EmailForm() {
  const { logoutMutation, protectedMutation, deleteUserMutation } = useAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userAuth = useAuthStore((state) => state.userAuth);

  const { isSigningIn, confirmOtp, formPasswordless, formOtp } =
    usePasswordless();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-white">
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-gray-600 shadow-xl border-8 border-black/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirmOtp) {
              formOtp.handleSubmit();
            } else {
              formPasswordless.handleSubmit();
            }
          }}
          className="space-y-6"
        >
          {confirmOtp ? (
            <>
              <formOtp.AppField name="otp">
                {(field) => <field.TextField label="OTP" />}
              </formOtp.AppField>
              <formOtp.AppForm>
                <formOtp.SubscribeButton
                  label={isSigningIn ? "Sending OTP..." : "Confirm"}
                  disabled={isSigningIn}
                  id="otp-button"
                />
              </formOtp.AppForm>
            </>
          ) : !isAuthenticated ? (
            <>
              <formPasswordless.AppField name="username">
                {(field) => <field.TextField label="Nickname" />}
              </formPasswordless.AppField>
              <formPasswordless.AppField name="email">
                {(field) => <field.TextField label="Email" inputType="email" />}
              </formPasswordless.AppField>
              <formPasswordless.AppForm>
                <formPasswordless.SubscribeButton
                  label={isSigningIn ? "Signing in..." : "Submit"}
                  disabled={isSigningIn}
                  id="signup-button"
                />
              </formPasswordless.AppForm>
            </>
          ) : null}

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
          ) : (
            <MessageInfo />
          )}
        </form>
      </div>
    </div>
  );
}
