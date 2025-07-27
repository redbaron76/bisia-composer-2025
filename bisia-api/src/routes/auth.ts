import type {
  CheckUsername,
  DeleteUser,
  OtpResponse,
  RefreshToken,
  Role,
  SignupData,
} from "@/types/user";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { ERROR_MESSAGES } from "@/libs/errors";
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { callAuthApi } from "@/api/auth";
import { log } from "@/libs/tools";
import { upsertProfile } from "@/api/profile";
import { upsertUser } from "@/api/user";

const auth = new Hono();

auth.post("/signup", async (c) => {
  const { username, email, password } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /signup",
    });
  }

  if (!username && !email) {
    throw new HTTPException(400, {
      message: "Username o email sono obbligatori",
    });
  }

  if (!password) {
    throw new HTTPException(400, {
      message: "Password è obbligatoria",
    });
  }

  try {
    const authData = await callAuthApi<SignupData>(
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
    throw error;
  }
});

/**
 * sign up with email (passwordless)
 * return otpExp
 */
auth.post("/email-signup", async (c) => {
  const { username, email } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /email-signup",
    });
  }

  if (!email) {
    throw new HTTPException(400, {
      message: "Email è obbligatoria",
    });
  }

  try {
    const authData = await callAuthApi<number>(
      "/auth/email-signup",
      { username, email },
      { origin }
    );

    return c.json(authData);
  } catch (error) {
    throw error;
  }
});

/**
 * Confirm the OTP
 * @param c - The context
 * @returns The response
 */
auth.post("/otp-confirmation", async (c) => {
  const { otp, email } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /otp-confirmation",
    });
  }

  if (!email) {
    throw new HTTPException(400, {
      message: "Indirizzo email è obbligatorio",
    });
  }

  try {
    const authData = await callAuthApi<OtpResponse>(
      "/auth/otp-confirmation",
      { otp, email },
      { origin }
    );

    return c.json(authData);
  } catch (error) {
    throw error;
  }
});

/**
 * sign in with phone or email (passwordless)
 * return accessToken, refreshToken, user and message
 */
auth.post("/passwordless", async (c) => {
  const {
    username,
    email,
    phone,
    refId,
    userId,
    provider: requestProvider,
  } = await c.req.json();
  const origin = c.req.header("Origin");

  const isEmail = !!email;
  const isPhone = !!phone;

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /passwordless",
    });
  }

  // username must be provided and one of email or phone must be provided
  if (!username || (!isEmail && !isPhone)) {
    throw new HTTPException(400, {
      message: isEmail
        ? "Username e email sono obbligatori"
        : "Username e numero di telefono sono obbligatori",
    });
  }

  try {
    const authData = await callAuthApi<SignupData>(
      "/auth/passwordless",
      { username, email, phone, refId, userId, provider: requestProvider },
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

    let createFirstProfile = false;
    const { wasCreated, wasConfirmed, provider: userProvider } = authData.user;

    // Create profile when:
    // 1. User was created in this session (new user) OR
    // 2. User was confirmed (first login after OTP confirmation for email)
    createFirstProfile =
      wasCreated || (wasConfirmed && userProvider === "email");

    // Create a new user in the database

    if (createFirstProfile) {
      await upsertUser({
        id: authData.user.id,
        refId: authData.user.refId,
        username: authData.user.username,
        slug: authData.user.slug,
        phone: authData.user.phone,
        email: authData.user.email,
        role: authData.user.role as Role,
        isDisabled: false,
      });

      await upsertProfile({
        id: authData.user.id,
        userId: authData.user.id,
      });
    } else {
      // aggiorno email e phone
      await upsertUser({
        id: authData.user.id,
        email,
        phone,
      });
    }

    return c.json({
      message: "Accesso effettuato con successo",
      accessToken: authData.accessToken,
      user: authData.user,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * login with email and password
 * return accessToken, refreshToken, user and message
 */
auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /login",
    });
  }

  if (!email || !password) {
    throw new HTTPException(400, {
      message: "Email e password sono obbligatori",
    });
  }

  try {
    const authData = await callAuthApi<SignupData>(
      "/auth/login",
      { email, password },
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

    return c.json({
      error: false,
      message: "Accesso effettuato con successo",
      accessToken: authData.accessToken,
      user: authData.user,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * refresh the token
 * return accessToken
 */
auth.post("/refresh", async (c) => {
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /refresh",
    });
  }

  const refreshToken = getCookie(c, "refreshToken");
  const userId = getCookie(c, "userId");

  log(refreshToken, "bisia-api refreshToken");
  log(userId, "bisia-api userId");

  try {
    const resp = await callAuthApi<RefreshToken>(
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
    throw error;
  }
});

/**
 * logout the user by removing the refreshToken and userId cookies
 */
auth.post("/logout", async (c) => {
  const origin = c.req.header("Origin");

  log(origin, "bisia-api origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /logout",
    });
  }

  const refreshToken = getCookie(c, "refreshToken");
  const userId = getCookie(c, "userId");

  log(refreshToken, "bisia-api refreshToken");
  log(userId, "bisia-api userId");

  try {
    const { error } = await callAuthApi<{
      error: boolean;
    }>("/auth/logout", { refreshToken, userId }, { origin });

    log(error, "error");
    log(refreshToken, "refreshToken");
    log(userId, "userId");

    if (!error && refreshToken) {
      deleteCookie(c, "refreshToken", {
        path: "/",
        domain: new URL(origin).hostname,
      });
    }

    if (!error && userId) {
      deleteCookie(c, "userId", {
        path: "/",
        domain: new URL(origin).hostname,
      });
    }

    return c.json({ error });
  } catch (error) {
    throw error;
  }
});

/**
 * check if username + phone or username + email is acceptable
 * true: username + phone or username + email exists or false: username + phone or username + email does not exist
 * false: username has different phone or email
 */
auth.post("/check-username", async (c) => {
  const { username, phone, email, provider } = await c.req.json();
  const origin = c.req.header("Origin");

  console.log("username", username);
  console.log("phone", phone);
  console.log("email", email);
  console.log("provider", provider);
  console.log("origin", origin);
  console.log("--------------------------------");

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.MISSING_ORIGIN.CHECK_USERNAME,
    });
  }

  const resp = await callAuthApi<CheckUsername>(
    "/auth/check-username",
    { username, phone, email, provider },
    { origin }
  );

  return c.json(resp);
});

/**
 * delete the user by userId and remove the refreshToken and userId cookies
 */
auth.post("/delete-user", async (c) => {
  const { userId } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.MISSING_ORIGIN.DELETE_USER,
    });
  }

  const resp = await callAuthApi<DeleteUser>(
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

/**
 * sign up with password and email OTP confirmation
 * return otpExp
 */
auth.post("/password-signup", async (c) => {
  const { username, email, password } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /password-signup",
    });
  }

  if (!username || !email || !password) {
    throw new HTTPException(400, {
      message: "Username, email e password sono obbligatori",
    });
  }

  try {
    const authData = await callAuthApi<number>(
      "/auth/password-signup",
      { username, email, password },
      { origin }
    );

    return c.json(authData);
  } catch (error) {
    throw error;
  }
});

/**
 * Confirm the OTP for password signup
 * @param c - The context
 * @returns The response
 */
auth.post("/password-signup-confirmation", async (c) => {
  const { otp, email, username } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /password-signup-confirmation",
    });
  }

  if (!otp || !email) {
    throw new HTTPException(400, {
      message: "OTP e email sono obbligatori",
    });
  }

  try {
    const authData = await callAuthApi<SignupData>(
      "/auth/password-signup-confirmation",
      { otp, email, username },
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

    let createFirstProfile = false;
    const { wasCreated, wasConfirmed, provider: userProvider } = authData.user;

    // Create profile when:
    // 1. User was created in this session (new user) OR
    // 2. User was confirmed (first login after OTP confirmation for email or password)
    createFirstProfile =
      wasCreated ||
      (wasConfirmed &&
        (userProvider === "email" || userProvider === "password"));

    // Create a new user in the database

    if (createFirstProfile) {
      await upsertUser({
        id: authData.user.id,
        refId: authData.user.refId,
        username: authData.user.username,
        slug: authData.user.slug,
        phone: authData.user.phone,
        email: authData.user.email,
        role: authData.user.role as Role,
        isDisabled: false,
      });

      await upsertProfile({
        id: authData.user.id,
        userId: authData.user.id,
      });
    } else {
      // aggiorno email e phone
      await upsertUser({
        id: authData.user.id,
        email,
      });
    }

    return c.json({
      message: "Registrazione confermata con successo",
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      user: authData.user,
    });
  } catch (error) {
    throw error;
  }
});

export default auth;
