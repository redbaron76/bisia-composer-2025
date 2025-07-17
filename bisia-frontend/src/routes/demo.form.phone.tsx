import { Button } from "@/components/ui/button";
import MessageInfo from "@/components/forms/MessageInfo";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/AuthStore";
import { usePasswordless } from "@/hooks/usePasswordless";
import { useRef } from "react";

export const Route = createFileRoute("/demo/form/phone")({
  component: PhoneForm,
});

function PhoneForm() {
  const phoneRef = useRef<HTMLInputElement>(null);

  const { logoutMutation, protectedMutation, deleteUserMutation } = useAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userAuth = useAuthStore((state) => state.userAuth);

  const { isSigningIn, formPasswordless, formOtp, confirmOtp } =
    usePasswordless();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-white">
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-gray-600 shadow-xl border-8 border-black/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("confirmOtp", confirmOtp);
            if (confirmOtp) {
              formOtp.handleSubmit();
            } else {
              console.log("formPasswordless", formPasswordless.state);
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
              <formPasswordless.AppField name="phone">
                {(field) => (
                  <field.TextField
                    label="Phone"
                    inputType="tel"
                    ref={phoneRef}
                    onFocus={() => {
                      if (phoneRef.current) {
                        phoneRef.current.value = "+39";
                      }
                    }}
                  />
                )}
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
