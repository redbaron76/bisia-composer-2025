import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/AuthStore";
import { useFirebase } from "@/hooks/useFirebase";
import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";

export const Route = createFileRoute("/demo/form/phone")({
  component: PhoneForm,
});

function PhoneForm() {
  const phoneRef = useRef<HTMLInputElement>(null);

  const { logoutMutation, protectedMutation, deleteUserMutation } = useAuth();
  const { isAuthenticated, message, error, setErrorMessage, setUserAuth } =
    useAuthStore(
      useShallow((state) => ({
        isAuthenticated: state.isAuthenticated,
        message: state.message,
        error: state.error,
        setErrorMessage: state.setErrorMessage,
        setUserAuth: state.setUserAuth,
      }))
    );

  const { isSigningIn, confirmationResult, formPhone, formOtp } = useFirebase({
    onError: (error) => {
      setErrorMessage(error);
    },
    onSuccess: (userAuth, accessToken, message) => {
      setUserAuth(userAuth, accessToken, message);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-white">
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-gray-600 shadow-xl border-8 border-black/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirmationResult) {
              formOtp.handleSubmit();
            } else {
              formPhone.handleSubmit();
            }
          }}
          className="space-y-6"
        >
          {confirmationResult ? (
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
              <formPhone.AppField name="username">
                {(field) => <field.TextField label="Nickname" />}
              </formPhone.AppField>
              <formPhone.AppField name="phone">
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
              </formPhone.AppField>
              <formPhone.AppForm>
                <formPhone.SubscribeButton
                  label={isSigningIn ? "Signing in..." : "Submit"}
                  disabled={isSigningIn}
                  id="signup-button"
                />
              </formPhone.AppForm>
            </>
          ) : null}

          {isAuthenticated ? (
            <div className="flex flex-col gap-4">
              {message && <div className="text-green-500">{message}</div>}
              {error && <div className="text-red-500">{error}</div>}
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
            <div className="flex gap-4 justify-between">
              <div className="flex flex-col gap-4">
                {message && <div className="text-green-500">{message}</div>}
                {error && <div className="text-red-500">{error}</div>}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
