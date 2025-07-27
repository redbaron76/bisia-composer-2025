import MessageInfo from "@/components/forms/MessageInfo";
import { createFileRoute } from "@tanstack/react-router";
import { useSignupWithOtp } from "@/hooks/useSignupWithOtp";

export const Route = createFileRoute("/demo/form/signup")({
  component: SignupForm,
});

function SignupForm() {
  const { confirmOtp, formSignup, formOtp, isSigningUp } = useSignupWithOtp();

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
              formSignup.handleSubmit();
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
                  label={isSigningUp ? "Confirming..." : "Confirm OTP"}
                  disabled={isSigningUp}
                  id="otp-button"
                />
              </formOtp.AppForm>
            </>
          ) : (
            <>
              <formSignup.AppField name="name">
                {(field) => <field.TextField label="Name" />}
              </formSignup.AppField>
              <formSignup.AppField name="email">
                {(field) => <field.TextField label="Email" inputType="email" />}
              </formSignup.AppField>
              <formSignup.AppField name="password">
                {(field) => (
                  <field.TextField label="Password" inputType="password" />
                )}
              </formSignup.AppField>
              <formSignup.AppField name="confirmPassword">
                {(field) => (
                  <field.TextField
                    label="Confirm Password"
                    inputType="password"
                  />
                )}
              </formSignup.AppField>
              <formSignup.AppForm>
                <formSignup.SubscribeButton
                  label={isSigningUp ? "Signing up..." : "Submit"}
                  disabled={isSigningUp}
                  id="signup-button"
                />
              </formSignup.AppForm>
            </>
          )}

          <MessageInfo />
        </form>
      </div>
    </div>
  );
}
