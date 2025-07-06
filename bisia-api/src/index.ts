import { Hono } from "hono";
import type { JWTPayload } from "hono/utils/jwt/types";
import auth from "@/routes/auth";
import { authenticateToken } from "@/middleware/auth";
import { cors } from "hono/cors";
import { env } from "@/env";
import { logger } from "hono/logger";

const app = new Hono();

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

app.use("*", logger());

app.route("/api/auth", auth);

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
