import type { Context, Next } from "hono";

import type { JWTPayload } from "hono/utils/jwt/types";
import { env } from "@/env";
import { jwt } from "hono/jwt";

/**
 * Autenticazione del token
 * @param c - Il contesto della richiesta
 * @param next - La funzione successiva
 * @returns Un errore se il token non è valido o l'utente non è autenticato
 */
export const authenticateToken = async (c: Context, next: Next) => {
  const origin = c.req.header("Origin");

  if (!origin) {
    return c.json({ error: "Origin mancante" }, 400);
  }

  const middleware = jwt({
    secret: env.JWT_SECRET,
  });

  try {
    await middleware(c, async () => {
      const payload = c.get("jwtPayload") as JWTPayload;

      // richiesta da applicativo diverso
      if (payload.appId !== origin) {
        throw new Error("Token non valido per questo applicativo");
      }

      // imposto l'id dell'utente nel contesto
      c.set("userId", payload.userId);

      await next();
    });
  } catch (err) {
    const error = err as Error;
    return c.json({ error: error.message || "Token non valido" }, 401);
  }
};
