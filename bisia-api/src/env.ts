import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_API_URL: z.string().url(),
    BISIA_BASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
    ORIGIN_CORS_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
