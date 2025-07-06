import { createFileRoute } from "@tanstack/react-router";
import { useAppForm } from "@/hooks/demo.form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

const schema = z
  .object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const Route = createFileRoute("/demo/form/simple")({
  component: SignupForm,
});

function SignupForm() {
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof schema>) => {
      const response = await fetch(
        `${import.meta.env.VITE_AUTH_API_URL}/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Signup failed");
      return response.json();
    },
  });

  const form = useAppForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value);
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
          <form.AppField name="username">
            {(field) => <field.TextField label="Username" />}
          </form.AppField>
          <form.AppField name="email">
            {(field) => <field.TextField label="Email" />}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField label="Password" inputType="password" />
            )}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.TextField label="Confirm Password" inputType="password" />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubscribeButton
              label={mutation.isPending ? "Signing up..." : "Submit"}
              disabled={mutation.isPending}
            />
          </form.AppForm>
          {mutation.isError && (
            <div className="text-red-500">Error: {mutation.error.message}</div>
          )}
          {mutation.isSuccess && (
            <div className="text-green-500">Signup successful!</div>
          )}
        </form>
      </div>
    </div>
  );
}
