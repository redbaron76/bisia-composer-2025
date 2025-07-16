import { z } from "zod";

const UsernameEmailPhoneObject = z.object({
  username: z.string().min(3),
  email: z.string().email("Inserisci un indirizzo email valido").optional(),
  phone: z
    .string()
    .min(10, "Il numero di telefono deve essere lungo almeno 10 cifre")
    .startsWith(
      "+",
      "Il numero di telefono deve avere il prefisso internazionale (es. +39)"
    )
    .optional(),
});

// Schema per form con username + email
export const UsernameEmailSchema = z.object({
  username: z.string().min(3),
  email: z.string().email("Inserisci un indirizzo email valido"),
});

// Schema per form con username + phone
export const UsernamePhoneSchema = z.object({
  username: z.string().min(3),
  phone: z
    .string()
    .min(10, "Il numero di telefono deve essere lungo almeno 10 cifre")
    .startsWith(
      "+",
      "Il numero di telefono deve avere il prefisso internazionale (es. +39)"
    ),
});

// Schema flessibile che valida dinamicamente in base ai campi presenti
export const UsernameEmailOrPhoneSchema = z
  .object({
    username: z.string().min(3),
    email: z.string().optional(),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Se email è presente, valida solo email
    if (data.email && !data.phone) {
      if (!data.email.includes("@")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Inserisci un indirizzo email valido",
          path: ["email"],
        });
      }
      return;
    }

    // Se phone è presente, valida solo phone
    if (data.phone && !data.email) {
      if (data.phone.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Il numero di telefono deve essere lungo almeno 10 cifre",
          path: ["phone"],
        });
      }
      if (!data.phone.startsWith("+")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Il numero di telefono deve avere il prefisso internazionale (es. +39)",
          path: ["phone"],
        });
      }
      return;
    }

    // Se entrambi sono presenti, valida entrambi
    if (data.email && data.phone) {
      if (!data.email.includes("@")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Inserisci un indirizzo email valido",
          path: ["email"],
        });
      }
      if (data.phone.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Il numero di telefono deve essere lungo almeno 10 cifre",
          path: ["phone"],
        });
      }
      if (!data.phone.startsWith("+")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Il numero di telefono deve avere il prefisso internazionale (es. +39)",
          path: ["phone"],
        });
      }
      return;
    }

    // Se nessuno è presente, aggiungi errore
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Devi fornire almeno un'email o un numero di telefono",
      path: ["email", "phone"],
    });
  });

// Schema legacy per compatibilità (usa il primo approccio che hai)
export const UsernameEmailOrPhoneLegacySchema = UsernameEmailPhoneObject.refine(
  (data) => data.email || data.phone,
  {
    message: "Devi fornire almeno un'email o un numero di telefono",
    path: ["email", "phone"],
  }
);

export const OtpSchema = z.object({
  otp: z.string().max(6, "Il codice OTP deve essere lungo al massimo 6 cifre"),
});

export const PasswordlessAccessSchema = UsernameEmailPhoneObject.extend({
  refId: z.string().optional(),
  userId: z.string().optional(),
  provider: z.enum(["firebase", "email", "google"]).optional(),
});

export const UsernamePasswordSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export const EmailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const UsernameEmailPasswordSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export type EmailPassword = z.infer<typeof EmailPasswordSchema>;
export type UsernameEmailOrPhone = z.infer<typeof UsernameEmailOrPhoneSchema>;
export type UsernameEmail = z.infer<typeof UsernameEmailSchema>;
export type UsernamePhone = z.infer<typeof UsernamePhoneSchema>;
export type Otp = z.infer<typeof OtpSchema>;
export type PasswordlessAccess = z.infer<typeof PasswordlessAccessSchema>;
export type UsernamePassword = z.infer<typeof UsernamePasswordSchema>;
export type UsernameEmailPassword = z.infer<typeof UsernameEmailPasswordSchema>;
