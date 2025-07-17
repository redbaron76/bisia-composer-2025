import { auth, google } from "@/routes";
import { initApp, optionsMiddleware } from "@/middleware";

import type { AppContext } from "@/types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "@/env";
import { handleException } from "@/middleware/error";
import { logger } from "hono/logger";

// inizializzo l'app e imposto le opzioni per ogni app
const { allowedOrigins, appOptionsMap } = await initApp();

// creo l'app
const app = new Hono<AppContext>();

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

// middleware per gestire gli errori
app.onError(handleException);

// Monta le rotte di autenticazione
app.route("/api/auth", auth);
app.route("/api/google", google);

const port = env.PORT;

// Exporta l'app per Hono
export default {
  port,
  fetch: app.fetch,
};
