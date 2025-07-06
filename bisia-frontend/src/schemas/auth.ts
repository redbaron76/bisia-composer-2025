import { z } from "zod";

export const UsernamePhoneSchema = z.object({
  username: z
    .string()
    .min(3, "Il nickname deve essere lungo almeno 3 caratteri")
    .max(15, "Il nickname deve essere lungo al massimo 15 caratteri"),
  phone: z
    .string()
    .min(10, "Il numero di telefono deve essere lungo almeno 10 cifre")
    .startsWith(
      "+",
      "Il numero di telefono deve avere il prefisso internazionale (es. +39)"
    ),
});

export const OtpPhoneSchema = z.object({
  otp: z.string().max(6, "Il codice OTP deve essere lungo al massimo 6 cifre"),
});

export const RefIdPhoneSchema = UsernamePhoneSchema.extend({
  refId: z.string(),
  provider: z.enum(["firebase", "google"]).optional(),
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
export type UsernamePhone = z.infer<typeof UsernamePhoneSchema>;
export type OtpPhone = z.infer<typeof OtpPhoneSchema>;
export type RefIdPhone = z.infer<typeof RefIdPhoneSchema>;
export type UsernamePassword = z.infer<typeof UsernamePasswordSchema>;
export type UsernameEmailPassword = z.infer<typeof UsernameEmailPasswordSchema>;
