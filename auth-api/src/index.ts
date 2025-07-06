import { initApp, optionsMiddleware } from "@/middleware";

import { Hono } from "hono";
import type { Variables } from "@/types";
import auth from "@/routes/auth";
import { cors } from "hono/cors";
import { env } from "@/env";
import { logger } from "hono/logger";

// inizializzo l'app e imposto le opzioni per ogni app
const { allowedOrigins, appOptionsMap } = await initApp();

// creo l'app
const app = new Hono<{ Variables: Variables }>();

// middleware per settare le opzioni dell'app
app.use("*", optionsMiddleware(appOptionsMap));

// middleware per settare il cors
app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    // allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowHeaders: ["Content-Type", "Authorization", "Origin"],
    // exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    // maxAge: 600,
  })
);

// middleware per loggare le richieste
app.use("*", logger());

// Monta le rotte di autenticazione
app.route("/api/auth", auth);

const port = env.PORT;

// Exporta l'app per Hono
export default {
  port,
  fetch: app.fetch,
};
