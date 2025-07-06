import type {
  CheckUsernamePhone,
  DeleteUser,
  RefreshToken,
  Role,
  SignupData,
} from "@/types/user";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { Hono } from "hono";
import { log } from "@/libs/tools";
import { postFetcher } from "@/libs/fetcher";
import { upsertUser } from "@/api/user";

const auth = new Hono();

auth.post("/signup", async (c) => {
  const { username, email, password } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!username && !email) {
    return c.json({ error: "Username o email sono obbligatori" }, 400);
  }

  if (!password) {
    return c.json({ error: "Password è obbligatoria" }, 400);
  }

  if (!origin) {
    return c.json({ error: "Origin mancante nella registrazione" }, 400);
  }

  try {
    const authData = await postFetcher<SignupData>(
      "/auth/signup",
      { name: username, email, password },
      { origin }
    );

    if (authData.refreshToken) {
      setCookie(c, "refreshToken", authData.refreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: authData.refreshTokenExpiration,
        sameSite: "None",
        secure: true,
        domain: new URL(origin).hostname,
      });
    } else {
      setCookie(c, "userId", authData.user.id, {
        httpOnly: true,
        path: "/",
        maxAge: authData.refreshTokenExpiration,
        sameSite: "None",
        secure: true,
        domain: new URL(origin).hostname,
      });
    }

    return c.json({
      message: "Registrazione effettuata con successo",
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      user: authData.user,
    });
  } catch (error) {
    return c.json({ error: "Errore nella registrazione 2" }, 500);
  }
});

auth.post("/phone-access", async (c) => {
  const { username, phone, refId, provider } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!username || !phone || !refId) {
    return c.json(
      { error: "Username, numero di telefono o providerId sono obbligatori" },
      400
    );
  }

  if (!origin) {
    return c.json({ error: "Origin mancante nel signin" }, 400);
  }

  try {
    const authData = await postFetcher<SignupData>(
      "/auth/phone-access",
      { username, phone, refId, provider },
      { origin }
    );

    if (authData.refreshToken) {
      log(authData.refreshToken, "refresh token cookie set with value");

      setCookie(c, "refreshToken", authData.refreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: authData.refreshTokenExpiration,
        sameSite: "Lax",
        secure: true,
        domain: new URL(origin).hostname,
      });
    } else {
      log(authData.user.id, "userId cookie set with value");
      setCookie(c, "userId", authData.user.id, {
        httpOnly: true,
        path: "/",
        maxAge: authData.refreshTokenExpiration,
        sameSite: "Lax",
        secure: true,
        domain: new URL(origin).hostname,
      });
    }

    log(authData, "authData");

    // Create a new user in the database
    await upsertUser(
      {
        id: authData.user.id,
        refId: authData.user.refId,
        username: authData.user.username,
        slug: authData.user.slug,
        phone: authData.user.phone,
        email: authData.user.email,
        role: authData.user.role as Role,
        isDisabled: false,
      },
      authData.user.wasCreated // force create user
    );

    return c.json({
      message: "Accesso effettuato con successo",
      accessToken: authData.accessToken,
      user: authData.user,
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
});

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!email || !password) {
    return c.json({ error: "Email e password sono obbligatori" }, 400);
  }

  if (!origin) {
    return c.json({ error: "Origin mancante nella login" }, 400);
  }

  try {
    const authData = await postFetcher<SignupData>(
      "/auth/login",
      { email, password },
      { origin, throwOnError: false }
    );

    if (authData.refreshToken) {
      log(authData.refreshToken, "refresh token cookie set with value");
      setCookie(c, "refreshToken", authData.refreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: authData.refreshTokenExpiration,
        sameSite: "Lax",
        secure: true,
        domain: new URL(origin).hostname,
      });
    } else {
      log(authData.user.id, "userId cookie set with value");
      setCookie(c, "userId", authData.user.id, {
        httpOnly: true,
        path: "/",
        maxAge: authData.refreshTokenExpiration,
        sameSite: "Lax",
        secure: true,
        domain: new URL(origin).hostname,
      });
    }

    return c.json({
      message: "Accesso effettuato con successo",
      accessToken: authData.accessToken,
      user: authData.user,
    });
  } catch (error: unknown) {
    return c.json(
      { error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
});

auth.post("/refresh", async (c) => {
  const origin = c.req.header("Origin");

  if (!origin) {
    return c.json({ error: "Origin mancante nel refresh" }, 400);
  }

  const refreshToken = getCookie(c, "refreshToken");
  const userId = getCookie(c, "userId");

  log(refreshToken, "bisia-api refreshToken");
  log(userId, "bisia-api userId");

  try {
    const resp = await postFetcher<RefreshToken>(
      "/auth/refresh",
      {
        refreshToken,
        userId,
      },
      { origin }
    );

    log(resp, "bisia-api response");

    return c.json({ accessToken: resp.accessToken });
  } catch (error) {
    return c.json({ error: "Errore nel refresh del token" }, 500);
  }
});

auth.post("/logout", async (c) => {
  const origin = c.req.header("Origin");

  log(origin, "bisia-api origin");

  if (!origin) {
    return c.json({ error: "Origin mancante nel logout" }, 400);
  }

  const refreshToken = getCookie(c, "refreshToken");
  const userId = getCookie(c, "userId");

  log(refreshToken, "bisia-api refreshToken");
  log(userId, "bisia-api userId");

  try {
    const { success } = await postFetcher<{
      success: boolean;
    }>("/auth/logout", { refreshToken, userId }, { origin });

    log(success, "success");
    log(refreshToken, "refreshToken");
    log(userId, "userId");

    if (success && refreshToken) {
      deleteCookie(c, "refreshToken", {
        path: "/",
        domain: new URL(origin).hostname,
      });
    }

    if (success && userId) {
      deleteCookie(c, "userId", {
        path: "/",
        domain: new URL(origin).hostname,
      });
    }

    return c.json({ success });
  } catch (error) {
    return c.json({ error: "Errore nel logout" }, 500);
  }
});

/**
 * check if username + phone is acceptable
 * true: username + phone exists or false: username + phone does not exist
 * false: username has different phone
 */
auth.post("/check-username-phone", async (c) => {
  const { username, phone } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    return c.json({ error: "Origin mancante nel check-username-phone" }, 400);
  }

  // Esempio di utilizzo del fetcher
  const resp = await postFetcher<CheckUsernamePhone>(
    "/auth/check-username-phone",
    { username, phone },
    { origin }
  );

  return c.json(resp);
});

auth.post("/delete-user", async (c) => {
  const { userId } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    return c.json({ error: "Origin mancante nel delete-user" }, 400);
  }

  const resp = await postFetcher<DeleteUser>(
    "/auth/delete-user",
    { userId },
    { origin }
  );

  if (resp.success) {
    deleteCookie(c, "refreshToken", {
      path: "/",
      domain: new URL(origin).hostname,
    });

    deleteCookie(c, "userId", {
      path: "/",
      domain: new URL(origin).hostname,
    });
  }

  return c.json(resp);
});

export default auth;
