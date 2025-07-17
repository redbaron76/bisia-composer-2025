import { auth, google } from "@/routes";

import { Hono } from "hono";
import type { JWTPayload } from "hono/utils/jwt/types";
import { authenticateToken } from "@/middleware/auth";
import { cors } from "hono/cors";
import { env } from "@/env";
import { handleException } from "./middleware/error";
import { logger } from "hono/logger";

const app = new Hono();

// cors
app.use(
  "*",
  cors({
    origin: env.ORIGIN_CORS_URL,
    credentials: true,
    // allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowHeaders: ["Content-Type", "Authorization"],
    // exposeHeaders: ["Content-Type", "Authorization"],
    // maxAge: 86400, // 24 hours
  })
);

// logger
app.use("*", logger());

// handle exceptions
app.onError(handleException);

// routes
app.route("/api/auth", auth);
app.route("/api/google", google);

// root route
app.get("/", (c) => {
  return c.text("Hello World");
});

// protected route for testing
app.get("/api/protected", authenticateToken, (c) => {
  const payload = c.get("jwtPayload") as JWTPayload;

  const { userId, username, phone, appId } = payload;

  const time = new Date().toISOString();

  return c.json({
    message: `Protected route for user ${username} (${userId}) with phone ${phone} and app ${appId} at ${time}`,
  });
});

export default {
  port: env.PORT,
  fetch: app.fetch,
};
