import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_API_URL: z.string().url(),
    BISIA_BASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
    ORIGIN_CORS_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REDIRECT_URI: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
