import { Button } from "@/components/ui/button";
import { EmailPasswordSchema } from "@/schemas/auth";
import MessageInfo from "@/components/forms/MessageInfo";
import { createFileRoute } from "@tanstack/react-router";
import { useAppForm } from "@/hooks/demo.form";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/AuthStore";

export const Route = createFileRoute("/demo/form/login")({
  component: LoginForm,
});

function LoginForm() {
  const { loginMutation, logoutMutation, protectedMutation } = useAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: EmailPasswordSchema,
    },
    onSubmit: ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-white">
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-gray-600 shadow-xl border-8 border-black/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {!isAuthenticated ? (
            <>
              <form.AppField name="email">
                {(field) => <field.TextField label="Email" />}
              </form.AppField>
              <form.AppField name="password">
                {(field) => (
                  <field.TextField label="Password" inputType="password" />
                )}
              </form.AppField>
              <form.AppForm>
                <form.SubscribeButton
                  label={loginMutation.isPending ? "Logging in..." : "Submit"}
                  disabled={loginMutation.isPending}
                />
              </form.AppForm>
            </>
          ) : null}
          {isAuthenticated ? (
            <div className="flex gap-4 justify-between">
              <div className="flex flex-col gap-4">
                <MessageInfo />
                <div>
                  <Button
                    type="button"
                    onClick={() => {
                      protectedMutation.mutate();
                    }}
                  >
                    Protected route
                  </Button>
                </div>
              </div>
              <div>
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
