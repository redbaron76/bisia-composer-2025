import type { JwtPayload, SignupData, SignupUser, Variables } from "@/types";
import {
  checkIsAppAuthorized,
  checkIsUsernameAvailable,
  createUser,
  deleteRefreshToken,
  deleteRefreshTokenByUserId,
  deleteUserById,
  findRefreshTokenByUserId,
  findUserById,
  findUserByKeyReference,
  upsertUser,
} from "@/db/api";

import { Hono } from "hono";
import { env } from "@/env";
import { generateAccessAndRefreshTokens } from "@/middleware/auth";
import { verify } from "hono/jwt";

const auth = new Hono<{ Variables: Variables }>();

/**
 * Signup
 * @param c - The context
 * @returns The response
 */
auth.post("/signup", async (c) => {
  try {
    const { username, email, password } = await c.req.json();
    const origin = c.req.header("Origin");

    if (!origin) {
      return c.json({ error: "Origin mancante nella registrazione" }, 400);
    }

    if (!email && !username) {
      return c.json({ error: "Email o username sono obbligatori" }, 400);
    }

    // la password è obbligatoria
    if (!password) {
      return c.json({ error: "Password è obbligatoria" }, 400);
    }

    // Verifica se l'applicazione è autorizzata
    const isAppAuthorized = await checkIsAppAuthorized(origin);
    if (!isAppAuthorized) {
      return c.json({ error: "Applicazione non autorizzata" }, 403);
    }

    // Verifica se l'username è disponibile
    const isUsernameAvailable = await checkIsUsernameAvailable(
      username,
      origin
    );
    if (!isUsernameAvailable) {
      return c.json({ error: "Username già in uso" }, 409);
    }

    // Verifica se l'utente esiste già
    const existingUser = await findUserByKeyReference(email, origin);
    if (existingUser) {
      return c.json({ error: "Utente già registrato" }, 409);
    }

    // Hash della password
    const saltRounds = 10;

    // use bcrypt
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: saltRounds,
    });

    // Crea il nuovo utente
    const user = await createUser({
      email,
      username,
      password: hashedPassword,
      appId: origin,
      role: "user",
    });

    const { accessToken, refreshToken, refreshTokenExpiration } =
      await generateAccessAndRefreshTokens(c, user);

    return c.json(
      {
        accessToken,
        refreshToken,
        refreshTokenExpiration,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          appId: user.appId,
          wasCreated: true,
        } satisfies SignupUser,
      } satisfies SignupData,
      200
    );
  } catch (error) {
    return c.json({ error: "Errore durante la registrazione" }, 500);
  }
});

/**
 * Phone access
 * @param c - The context
 * @returns The response
 */
auth.post("/phone-access", async (c) => {
  const { username, phone, refId, provider } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!phone || !refId || !username) {
    return c.json(
      { error: "Username, numero di telefono o providerId sono obbligatori" },
      400
    );
  }

  if (!origin) {
    return c.json({ error: "Origin mancante nel signin" }, 400);
  }

  // Crea il nuovo utente
  const user = await upsertUser({
    username,
    phone,
    refId,
    appId: origin,
    provider,
  });

  const { accessToken, refreshToken, refreshTokenExpiration } =
    await generateAccessAndRefreshTokens(c, user);

  return c.json(
    {
      accessToken,
      refreshToken,
      refreshTokenExpiration,
      user: {
        id: user.id,
        username: user.username,
        slug: user.slug,
        email: user.email,
        phone: user.phone,
        role: user.role,
        refId: user.refId,
        appId: user.appId,
        wasCreated: user.wasCreated,
      } satisfies SignupUser,
    } satisfies SignupData,
    user.wasCreated ? 201 : 200
  );
});

/**
 * Login
 * @param c - The context
 * @returns The response
 */
auth.post("/login", async (c) => {
  const { username, email, password, phone } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    return c.json({ error: "Origin mancante nel login" }, 400);
  }

  const user = await findUserByKeyReference(username || email || phone, origin);
  if (!user) {
    return c.json({ error: "Credenziali non valide" }, 401);
  }

  const isValidPassword = await Bun.password.verify(password, user.password);
  if (!isValidPassword) {
    return c.json({ error: "Credenziali non valide" }, 401);
  }

  console.log("Generating tokens for user:", user.id, "from origin:", origin);
  const { accessToken, refreshToken, refreshTokenExpiration } =
    await generateAccessAndRefreshTokens(c, user);

  return c.json(
    {
      accessToken,
      refreshToken,
      refreshTokenExpiration,
      user: {
        id: user.id,
        username: user.username,
        slug: user.slug,
        email: user.email,
        phone: user.phone,
        role: user.role,
        appId: user.appId,
        wasCreated: false,
      } satisfies SignupUser,
    } satisfies SignupData,
    200
  );
});

// Refresh token
auth.post("/refresh", async (c) => {
  const origin = c.req.header("Origin");
  let { refreshToken, userId } = await c.req.json();

  if (!origin) {
    return c.json({ error: "Origin mancante nel refresh" }, 400);
  }

  const isRevocable = userId ? true : false;

  if (userId) {
    const storedToken = await findRefreshTokenByUserId(userId, origin);
    if (!storedToken) {
      return c.json({ error: "Refresh token non valido o scaduto" }, 401);
    }

    refreshToken = storedToken.token;
  }

  if (!refreshToken) {
    return c.json({ error: "Refresh token non valido o scaduto" }, 401);
  }

  try {
    // Decodifica il refresh token
    const payload = (await verify(
      refreshToken,
      env.JWT_SECRET
    )) as unknown as JwtPayload;

    // Verifica che il token sia per l'applicazione corretta e che l'utente sia lo stesso
    if (payload.appId !== origin || (userId && payload.userId !== userId)) {
      return c.json(
        { error: "Refresh token non valido per questa applicazione" },
        401
      );
    }

    // Ottieni l'utente
    const user = await findUserById(payload.userId);
    if (!user) {
      return c.json({ error: "Utente non trovato" }, 401);
    }

    // Genera nuovi token
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(c, user);

    // For revocable tokens, delete the old token
    if (isRevocable) {
      await deleteRefreshToken(refreshToken, origin);
    }

    return c.json({
      accessToken: newAccessToken,
      refreshToken: !isRevocable ? newRefreshToken : "",
    });
  } catch (error) {
    console.error("Errore nella verifica del refresh token:", error);
    return c.json({ error: "Refresh token non valido o scaduto" }, 401);
  }
});

// Logout
auth.post("/logout", async (c) => {
  try {
    const { refreshToken, userId } = await c.req.json();
    const origin = c.req.header("Origin");

    if (!origin) {
      return c.json({ error: "Origin mancante nel logout" }, 400);
    }

    if (userId) {
      await deleteRefreshTokenByUserId(userId, origin);
    }

    if (refreshToken) {
      await deleteRefreshToken(refreshToken, origin);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Errore durante il logout:", error);
    return c.json({ success: false });
  }
});

// check if username + phone is acceptable
// true: username + phone exists or false: username + phone does not exist
// false: username has different phone
auth.post("/check-username-phone", async (c) => {
  try {
    const { username, phone } = await c.req.json();
    const origin = c.req.header("Origin");

    if (!origin) {
      return c.json(
        { error: "Origin mancante nel check-username-phone-ok" },
        500
      );
    }

    // check if phone is already in use
    const userByPhone = await findUserByKeyReference(phone, origin);

    // if user by phone is not found
    if (!userByPhone) {
      // check if username is already in use
      const userByUsername = await findUserByKeyReference(username, origin);

      // if username is already in use and phone is different, return false
      if (
        userByUsername &&
        userByUsername.phone &&
        userByUsername.phone !== phone
      ) {
        return c.json(
          { ok: false, error: "Username o numero di telefono già in uso" },
          200
        );
      }

      // if phone is not in use and username is not in use, return true
      return c.json({ ok: true });
    }

    // if user by phone is found, check if phone and username are the same
    if (userByPhone.phone === phone && userByPhone.username === username) {
      return c.json({ ok: true });
    }

    return c.json(
      { ok: false, error: "Username o numero di telefono già in uso" },
      200
    );
  } catch (error) {
    return c.json({ error: "Errore durante il check-username-phone-ok" }, 500);
  }
});

// delete user
auth.post("/delete-user", async (c) => {
  const { userId } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    return c.json({ error: "Origin mancante nel delete-user" }, 400);
  }

  // check if user exists (get user by id)
  const user = await findUserById(userId);
  if (!user) {
    return c.json({ error: "Utente non trovato" }, 404);
  }

  // delete user
  const isDeleted = await deleteUserById(userId);
  if (!isDeleted) {
    return c.json(
      { error: "Errore durante la cancellazione dell'utente" },
      500
    );
  }

  return c.json({ success: true, userId, refId: user.refId });
});
export default auth;
