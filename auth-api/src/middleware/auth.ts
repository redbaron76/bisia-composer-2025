import type { Context, Next } from "hono";
import type { JwtPayload, ReturnTokenGeneration, User } from "@/types";
import { deleteRefreshTokenByUserId, saveRefreshToken } from "@/db/api";
import { jwt, sign } from "hono/jwt";

import { env } from "@/env";

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
      const payload = c.get("jwtPayload") as JwtPayload;

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

/**
 * Genera i token di accesso e refresh
 * @param c - Il contesto della richiesta
 * @param user - L'utente per cui generare i token
 * @returns Il token di accesso, il token di refresh e l'id dell'utente
 */
export const generateAccessAndRefreshTokens = async (
  c: Context,
  user: User
): Promise<ReturnTokenGeneration> => {
  const revocable = c.get("revocable");
  const accessTokenMinutesExp = c.get("accessTokenMinutesExp");
  const refreshTokenDaysExp = c.get("refreshTokenDaysExp");

  const accessToken = await sign(
    {
      userId: user.id,
      username: user.username,
      slug: user.slug,
      phone: user.phone,
      email: user.email,
      appId: user.appId,
      exp: Math.floor(Date.now() / 1000) + accessTokenMinutesExp * 60,
    },
    env.JWT_SECRET
  );

  const refreshTokenExpiration = refreshTokenDaysExp * 24 * 60 * 60;
  const refreshTokenPayload = await sign(
    {
      userId: user.id,
      appId: user.appId,
      exp: Math.floor(Date.now() / 1000) + refreshTokenExpiration,
    },
    env.JWT_SECRET
  );

  // Se il token è revocable, salviamo il refresh token nel database
  // e ritorniamo lo userId (il refresh token sarà null)
  if (revocable) {
    await deleteRefreshTokenByUserId(user.id, user.appId);
    await saveRefreshToken(
      user.id,
      refreshTokenPayload,
      user.appId,
      refreshTokenDaysExp
    );

    return {
      accessToken,
      refreshToken: "",
      refreshTokenExpiration,
    };
  }

  // Se il token non è revocable, ritorniamo il refresh token
  // e lo userId sarà null
  return {
    accessToken,
    refreshToken: refreshTokenPayload,
    refreshTokenExpiration,
  };
};
