import type { AppContext, JwtPayload, SignupData, SignupUser } from "@/types";
import {
  checkIsAppAuthorized,
  checkIsUsernameAvailable,
  createUser,
  deleteRefreshToken,
  deleteRefreshTokenByUserId,
  deleteUserById,
  deteleExpiredOtp as deleteExpiredOtp,
  findRefreshTokenByUserId,
  findUserById,
  findUserByKeyReference,
  upsertUser,
} from "@/db/api";

import { Hono } from "hono";
import { env } from "@/env";
import { generateAccessAndRefreshTokens } from "@/middleware/auth";
import { verify } from "hono/jwt";
import { generateOtp, generateOtpExpiration } from "@/libs/tools";
import { HTTPException } from "hono/http-exception";

const auth = new Hono<AppContext>();

/**
 * Signup
 * @param c - The context
 * @returns The response
 */
auth.post("/signup", async (c) => {
  const { username, email, password } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /signup",
    });
  }

  if (!email && !username) {
    throw new HTTPException(400, {
      message: "Email o username sono obbligatori",
    });
  }

  // la password è obbligatoria
  if (!password) {
    throw new HTTPException(400, {
      message: "Password è obbligatoria",
    });
  }

  try {
    // Verifica se l'applicazione è autorizzata
    const isAppAuthorized = await checkIsAppAuthorized(origin);
    if (!isAppAuthorized) {
      throw new HTTPException(403, {
        message: "Applicazione non autorizzata",
      });
    }

    // Verifica se l'username è disponibile
    const isUsernameAvailable = await checkIsUsernameAvailable(
      username,
      origin
    );
    if (!isUsernameAvailable) {
      throw new HTTPException(409, {
        message: "Username già in uso",
      });
    }

    // Verifica se l'utente esiste già
    const existingUser = await findUserByKeyReference(email, origin);
    if (existingUser) {
      throw new HTTPException(409, {
        message: "Utente già registrato",
      });
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
          wasConfirmed: false,
        } satisfies SignupUser,
      } satisfies SignupData,
      200
    );
  } catch (error) {
    throw error;
  }
});

/**
 * sign up with email (passwordless)
 * @param c - The context
 * @returns The response
 *
 * TODO: SEND EMAIL WITH OTP
 */
auth.post("/email-signup", async (c) => {
  const { username, email } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /email-signup",
    });
  }

  try {
    // delete expired OTPs
    await deleteExpiredOtp();

    const otp = generateOtp(6);
    const otpExp = generateOtpExpiration(5);

    await upsertUser({
      username,
      email,
      appId: origin,
      provider: "email",
      otp,
      otpExp,
    });

    // TODO: SEND EMAIL WITH OTP
    console.log("E-MAIL OTP", otp);

    return c.json(otpExp);
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

  try {
    const user = await findUserByKeyReference(email, origin);
    if (!user) {
      throw new HTTPException(404, {
        message: "Utente non trovato",
      });
    }

    if (user.otp !== otp) {
      throw new HTTPException(400, {
        message: "Codice OTP non valido",
      });
    }

    if (user.otpExp && user.otpExp < Date.now()) {
      throw new HTTPException(400, {
        message: "Codice OTP scaduto",
      });
    }

    return c.json({ error: false, userId: user.id });
  } catch (error) {
    throw error;
  }
});

/**
 * Passwordless access
 * @param c - The context
 * @returns The response
 */
auth.post("/passwordless", async (c) => {
  const { username, email, phone, refId, userId, provider } =
    await c.req.json();
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
    // Crea il nuovo utente
    const user = await upsertUser({
      id: userId || undefined,
      username,
      email,
      phone,
      refId,
      appId: origin,
      provider,
      otp: undefined, // remove otp and otpExp from the user
      otpExp: 0, // remove otp and otpExp from the user
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
          wasConfirmed: user.wasConfirmed,
        } satisfies SignupUser,
      } satisfies SignupData,
      user.wasCreated ? 201 : 200
    );
  } catch (error) {
    throw error;
  }
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
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /login",
    });
  }

  try {
    const user = await findUserByKeyReference(
      username || email || phone,
      origin
    );

    if (!user) {
      throw new HTTPException(404, {
        message: "Credenziali non valide",
      });
    }

    if (!user.password) {
      throw new HTTPException(404, {
        message: "Credenziali non valide",
      });
    }

    const isValidPassword = await Bun.password.verify(password, user.password);

    if (!isValidPassword) {
      throw new HTTPException(404, {
        message: "Credenziali non valide",
      });
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
          wasConfirmed: false,
        } satisfies SignupUser,
      } satisfies SignupData,
      200
    );
  } catch (error) {
    throw error;
  }
});

// Refresh token
auth.post("/refresh", async (c) => {
  const origin = c.req.header("Origin");
  let { refreshToken, userId } = await c.req.json();

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /refresh",
    });
  }

  // token can be revoked if userId is provided
  const isRevocable = userId ? true : false;

  if (userId) {
    const storedToken = await findRefreshTokenByUserId(userId, origin);
    if (!storedToken) {
      throw new HTTPException(404, {
        message: "Refresh token non valido o scaduto",
      });
    }

    refreshToken = storedToken.token;
  }

  if (!refreshToken) {
    throw new HTTPException(404, {
      message: "Refresh token non valido o scaduto",
    });
  }

  try {
    // Decodifica il refresh token
    const payload = (await verify(
      refreshToken,
      env.JWT_SECRET
    )) as unknown as JwtPayload;

    // Verifica che il token sia per l'applicazione corretta e che l'utente sia lo stesso
    if (payload.appId !== origin || (userId && payload.userId !== userId)) {
      throw new HTTPException(404, {
        message: "Refresh token non valido per questa applicazione",
      });
    }

    // Ottieni l'utente
    const user = await findUserById(payload.userId);
    if (!user) {
      throw new HTTPException(404, {
        message: "Utente non trovato",
      });
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
    throw error;
  }
});

/**
 * logout the user by removing the refreshToken and userId cookies
 */
auth.post("/logout", async (c) => {
  const { refreshToken, userId } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /logout",
    });
  }

  try {
    if (userId) {
      await deleteRefreshTokenByUserId(userId, origin);
    }

    if (refreshToken) {
      await deleteRefreshToken(refreshToken, origin);
    }

    return c.json({ error: false });
  } catch (error) {
    throw error;
  }
});

// check if username + phone or username + email is acceptable
// true: username + phone or username + email exists or false: username + phone or username + email does not exist
// false: username has different phone or email
auth.post("/check-username", async (c) => {
  const { username, phone, email } = await c.req.json();
  const origin = c.req.header("Origin");

  console.log("username", username);
  console.log("phone", phone);
  console.log("email", email);
  console.log("origin", origin);
  console.log("------- CHECK USERNAME --------");

  const isCheckingPhone = !!phone;
  const isCheckingEmail = !!email;

  if (!origin) {
    throw new HTTPException(500, {
      message: "Origin mancante nella chiamata: /check-username",
    });
  }

  try {
    let errorMessage = isCheckingPhone
      ? "Numero di telefono già in uso"
      : isCheckingEmail
      ? "Indirizzo E-mail già in uso"
      : "Username già in uso";

    // check if phone or email is already in use
    const userByPhone = isCheckingPhone
      ? await findUserByKeyReference(phone, origin)
      : null;
    const userByEmail = isCheckingEmail
      ? await findUserByKeyReference(email, origin)
      : null;

    const userByReference = userByPhone || userByEmail;

    console.log("userByReference", userByReference);

    // if user by phone or email is not found
    if (!userByReference) {
      // check if username is already in use
      const userByUsername = await findUserByKeyReference(username, origin);

      console.log("userByUsername", userByUsername);

      // if username is already in use and if isCheckingPhone is true, check if phone is different
      // if isCheckingEmail is true, check if email is different
      // if isCheckingPhone and isCheckingEmail are true, check if phone and email are different
      // if isCheckingPhone and isCheckingEmail are false, return false
      // if isCheckingPhone and isCheckingEmail are true, return false
      // if isCheckingPhone and isCheckingEmail are false, return false
      if (userByUsername) {
        if (isCheckingPhone && userByUsername.phone !== phone) {
          throw new HTTPException(409, {
            message: errorMessage,
          });
        }

        if (isCheckingEmail && userByUsername.email !== email) {
          throw new HTTPException(409, {
            message: errorMessage,
          });
        }
      }

      // if phone or email is not in use and username is not in use, return true
      return c.json({ error: false }, 200);
    }

    // if user by phone is found, check if phone and username are the same
    if (
      userByPhone &&
      userByPhone.phone === phone &&
      userByPhone.username === username
    ) {
      return c.json({ error: false }, 200);
    }

    // if user by email is found, check if email and username are the same
    if (
      userByEmail &&
      userByEmail.email === email &&
      userByEmail.username === username
    ) {
      return c.json({ error: false }, 200);
    }

    return c.json({ error: true, message: errorMessage }, 409);
  } catch (error) {
    throw error;
  }
});

// delete user
auth.post("/delete-user", async (c) => {
  const { userId } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: "Origin mancante nella chiamata: /delete-user",
    });
  }

  try {
    // check if user exists (get user by id)
    const user = await findUserById(userId);
    if (!user) {
      throw new HTTPException(404, {
        message: "Utente non trovato",
      });
    }

    // delete user
    const isDeleted = await deleteUserById(userId);
    if (!isDeleted) {
      throw new HTTPException(500, {
        message: "Errore durante la cancellazione dell'utente",
      });
    }

    return c.json({ error: false, userId, refId: user.refId });
  } catch (error) {
    throw error;
  }
});
export default auth;
