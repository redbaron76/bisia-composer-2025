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
  clearTemporaryFields,
} from "@/db/api";

import { Hono } from "hono";
import { env } from "@/env";
import { generateAccessAndRefreshTokens } from "@/middleware/auth";
import { verify } from "hono/jwt";
import { generateOtp, generateOtpExpiration, doSlug } from "@/libs/tools";
import { HTTPException } from "hono/http-exception";
import { ERROR_MESSAGES } from "@/libs/errors";

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
      message: ERROR_MESSAGES.MISSING_ORIGIN.SIGNUP,
    });
  }

  if (!email && !username) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.VALIDATION.EMAIL_OR_USERNAME_REQUIRED,
    });
  }

  // la password è obbligatoria
  if (!password) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.VALIDATION.PASSWORD_REQUIRED,
    });
  }

  try {
    // Verifica se l'applicazione è autorizzata
    const isAppAuthorized = await checkIsAppAuthorized(origin);
    if (!isAppAuthorized) {
      throw new HTTPException(403, {
        message: ERROR_MESSAGES.AUTHORIZATION.APP_NOT_AUTHORIZED,
      });
    }

    // Verifica se l'username è disponibile
    const isUsernameAvailable = await checkIsUsernameAvailable(
      username,
      origin
    );

    if (!isUsernameAvailable) {
      throw new HTTPException(409, {
        message: ERROR_MESSAGES.CONFLICT.USERNAME_ALREADY_IN_USE,
      });
    }

    // Verifica se l'utente esiste già
    const existingUser = await findUserByKeyReference(email, origin);
    if (existingUser) {
      throw new HTTPException(409, {
        message: ERROR_MESSAGES.CONFLICT.USER_ALREADY_REGISTERED,
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
      provider: "password",
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
          provider: user.provider,
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
      message: ERROR_MESSAGES.MISSING_ORIGIN.EMAIL_SIGNUP,
    });
  }

  try {
    // delete expired OTPs
    await deleteExpiredOtp();

    const otp = generateOtp(6);
    const otpExp = generateOtpExpiration(5);

    // Try to find existing user by username (not by email to avoid conflicts)
    const existingUser = await findUserByKeyReference(username, origin);

    console.log("Email signup - existingUser:", existingUser?.id);
    console.log("Email signup - saving email in tmpField:", email);

    await upsertUser({
      id: existingUser?.id, // Use existing user ID if found
      username,
      tmpField: email, // Save new email or phone temporarily
      appId: origin,
      provider: "email",
      otp,
      otpExp,
    });

    console.log("Email signup - user updated with tmpField");

    // TODO: SEND EMAIL WITH OTP
    console.log("E-MAIL OTP", otp);

    return c.json(otpExp);
  } catch (error) {
    throw error;
  }
});

/**
 * sign up with phone (passwordless)
 * @param c - The context
 * @returns The response
 *
 * TODO: SEND SMS WITH OTP
 */
auth.post("/phone-signup", async (c) => {
  const { username, phone } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.MISSING_ORIGIN.EMAIL_SIGNUP, // Reuse the same error message
    });
  }

  try {
    // delete expired OTPs
    await deleteExpiredOtp();

    const otp = generateOtp(6);
    const otpExp = generateOtpExpiration(5);

    // Try to find existing user by username (not by phone to avoid conflicts)
    const existingUser = await findUserByKeyReference(username, origin);

    console.log("Phone signup - existingUser:", existingUser?.id);
    console.log("Phone signup - saving phone in tmpField:", phone);

    await upsertUser({
      id: existingUser?.id, // Use existing user ID if found
      username,
      tmpField: phone, // Save new phone temporarily
      appId: origin,
      provider: "phone",
      otp,
      otpExp,
    });

    console.log("Phone signup - user updated with tmpField");

    // TODO: SEND SMS WITH OTP
    console.log("SMS OTP", otp);

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
  const { otp, email, username } = await c.req.json();
  const origin = c.req.header("Origin");

  console.log("OTP confirmation - received data:", {
    otp,
    email,
    username,
  });

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.MISSING_ORIGIN.OTP_CONFIRMATION,
    });
  }

  try {
    // Try to find user by username first (more reliable), poi by email
    let user = username ? await findUserByKeyReference(username, origin) : null;
    console.log(
      "OTP confirmation - searching by username:",
      username,
      "result:",
      user?.id
    );

    // If username search failed, try to find by email
    if (!user && email) {
      user = await findUserByKeyReference(email, origin);
      console.log(
        "OTP confirmation - searching by email:",
        email,
        "result:",
        user?.id
      );
    }

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

    console.log("User found:", user.id);
    console.log("User tmpField:", user.tmpField);
    console.log("User current email:", user.email);
    console.log("Requested email:", email);

    // Se user ha tmpField e corrisponde all'email richiesta, aggiorna l'email
    if (user.tmpField && email && user.tmpField === email) {
      console.log("Updating email from tmpField:", user.tmpField);
      await upsertUser({
        id: user.id,
        appId: origin,
        email: user.tmpField, // Update actual email with tmpField
      });
      console.log("Email updated successfully");
    }

    // Always clear temporary fields and OTP
    await clearTemporaryFields(user.id);

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
      message: ERROR_MESSAGES.MISSING_ORIGIN.PASSWORDLESS,
    });
  }

  // username must be provided and one of email or phone must be provided
  if (!username || (!isEmail && !isPhone)) {
    throw new HTTPException(400, {
      message: isEmail
        ? ERROR_MESSAGES.VALIDATION.USERNAME_AND_EMAIL_REQUIRED
        : ERROR_MESSAGES.VALIDATION.USERNAME_AND_PHONE_REQUIRED,
    });
  }

  try {
    // Crea il nuovo utente
    // Modifica in /passwordless
    // Cerca l'utente esistente
    const existingUser = userId
      ? await findUserById(userId)
      : await findUserByKeyReference(username, origin);
    let upsertData: any = {
      id: userId || existingUser?.id,
      username,
      appId: origin,
      provider,
      otp: undefined,
      otpExp: undefined,
    };
    if (isEmail) {
      // Se email diversa, salva in tmpField
      if (existingUser && email && existingUser.email !== email) {
        upsertData.tmpField = email;
      } else {
        upsertData.email = email;
      }
    }
    if (isPhone) {
      // Se phone diverso, salva in tmpField per Firebase
      if (existingUser && phone && existingUser.phone !== phone) {
        upsertData.tmpField = phone;
        // Don't update phone immediately, wait for Firebase confirmation
      } else {
        upsertData.phone = phone;
      }
    }
    if (refId) upsertData.refId = refId;

    // Aggiorna o crea l'utente
    const user = await upsertUser(upsertData);

    // Se esiste tmpField e provider è firebase/email, aggiorna il campo vero e svuota tmpField
    if (user.tmpField) {
      if (provider === "firebase") {
        // For Firebase phone authentication, update phone from tmpField
        await upsertUser({
          id: user.id,
          appId: origin,
          phone: user.tmpField,
        });
        user.phone = user.tmpField;
        // Clear tmpField after updating
        await clearTemporaryFields(user.id);
      } else if (provider === "email") {
        await upsertUser({
          id: user.id,
          appId: origin,
          email: user.tmpField,
        });
        user.email = user.tmpField;
        // Clear tmpField after updating
        await clearTemporaryFields(user.id);
      }
    }

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
          provider: user.provider,
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
      message: ERROR_MESSAGES.MISSING_ORIGIN.LOGIN,
    });
  }

  try {
    const user = await findUserByKeyReference(
      username || email || phone,
      origin
    );

    if (!user) {
      throw new HTTPException(404, {
        message: ERROR_MESSAGES.AUTHORIZATION.INVALID_CREDENTIALS,
      });
    }

    if (!user.password) {
      throw new HTTPException(404, {
        message: ERROR_MESSAGES.AUTHORIZATION.INVALID_CREDENTIALS,
      });
    }

    const isValidPassword = await Bun.password.verify(password, user.password);

    if (!isValidPassword) {
      throw new HTTPException(404, {
        message: ERROR_MESSAGES.AUTHORIZATION.INVALID_CREDENTIALS,
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

/**
 * sign up with password and email OTP confirmation
 * @param c - The context
 * @returns The response
 *
 * TODO: SEND EMAIL WITH OTP
 */
auth.post("/password-signup", async (c) => {
  const { username, email, password } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.MISSING_ORIGIN.EMAIL_SIGNUP,
    });
  }

  if (!username || !email || !password) {
    throw new HTTPException(400, {
      message: "Username, email e password sono obbligatori",
    });
  }

  try {
    // Verifica se l'applicazione è autorizzata
    const isAppAuthorized = await checkIsAppAuthorized(origin);
    if (!isAppAuthorized) {
      throw new HTTPException(403, {
        message: ERROR_MESSAGES.AUTHORIZATION.APP_NOT_AUTHORIZED,
      });
    }

    // Verifica se l'username è disponibile
    const isUsernameAvailable = await checkIsUsernameAvailable(
      username,
      origin
    );

    if (!isUsernameAvailable) {
      throw new HTTPException(409, {
        message: ERROR_MESSAGES.CONFLICT.USERNAME_ALREADY_IN_USE,
      });
    }

    // Verifica se l'utente esiste già
    const existingUser = await findUserByKeyReference(email, origin);
    if (existingUser) {
      throw new HTTPException(409, {
        message: ERROR_MESSAGES.CONFLICT.USER_ALREADY_REGISTERED,
      });
    }

    // delete expired OTPs
    await deleteExpiredOtp();

    const otp = generateOtp(6);
    const otpExp = generateOtpExpiration(5);

    // Hash della password
    const saltRounds = 10;
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: saltRounds,
    });

    // Crea il nuovo utente con password e OTP
    const user = await createUser({
      email,
      username,
      slug: doSlug(username),
      password: hashedPassword,
      appId: origin,
      role: "user",
      provider: "password",
      otp,
      otpExp,
    });

    console.log("Password signup - user created with OTP:", otp);

    // TODO: SEND EMAIL WITH OTP
    console.log("E-MAIL OTP", otp);

    return c.json(otpExp);
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

  console.log("Password signup OTP confirmation - received data:", {
    otp,
    email,
    username,
  });

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.MISSING_ORIGIN.OTP_CONFIRMATION,
    });
  }

  try {
    // Try to find user by username first (more reliable), poi by email
    let user = username ? await findUserByKeyReference(username, origin) : null;
    console.log(
      "Password signup OTP confirmation - searching by username:",
      username,
      "result:",
      user?.id
    );

    // If username search failed, try to find by email
    if (!user && email) {
      user = await findUserByKeyReference(email, origin);
      console.log(
        "Password signup OTP confirmation - searching by email:",
        email,
        "result:",
        user?.id
      );
    }

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

    console.log("User found:", user.id);
    console.log("User provider:", user.provider);

    // Verifica che l'utente sia stato creato con provider "password"
    if (user.provider !== "password") {
      throw new HTTPException(400, {
        message: "Utente non registrato con password",
      });
    }

    // Clear OTP fields
    await clearTemporaryFields(user.id);

    // Generate tokens
    const { accessToken, refreshToken, refreshTokenExpiration } =
      await generateAccessAndRefreshTokens(c, user);

    return c.json({
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
        wasCreated: false,
        wasConfirmed: true,
        provider: user.provider,
      } satisfies SignupUser,
    });
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
      message: ERROR_MESSAGES.MISSING_ORIGIN.REFRESH,
    });
  }

  // token can be revoked if userId is provided
  const isRevocable = userId ? true : false;

  if (userId) {
    const storedToken = await findRefreshTokenByUserId(userId, origin);
    if (!storedToken) {
      throw new HTTPException(404, {
        message: ERROR_MESSAGES.AUTHORIZATION.INVALID_REFRESH_TOKEN,
      });
    }

    refreshToken = storedToken.token;
  }

  if (!refreshToken) {
    throw new HTTPException(404, {
      message: ERROR_MESSAGES.AUTHORIZATION.INVALID_REFRESH_TOKEN,
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
        message: ERROR_MESSAGES.AUTHORIZATION.INVALID_REFRESH_TOKEN_APP,
      });
    }

    // Ottieni l'utente
    const user = await findUserById(payload.userId);
    if (!user) {
      throw new HTTPException(404, {
        message: ERROR_MESSAGES.AUTHORIZATION.USER_NOT_FOUND,
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
      message: ERROR_MESSAGES.MISSING_ORIGIN.LOGOUT,
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
  const { username, phone, email, provider } = await c.req.json();
  const origin = c.req.header("Origin");

  console.log("username", username);
  console.log("phone", phone);
  console.log("email", email);
  console.log("provider", provider);
  console.log("origin", origin);
  console.log("------- CHECK USERNAME --------");

  const isCheckingPhone = !!phone;
  const isCheckingEmail = !!email;
  const isPasswordProvider = provider === "password";

  if (!origin) {
    throw new HTTPException(500, {
      message: ERROR_MESSAGES.MISSING_ORIGIN.CHECK_USERNAME,
    });
  }

  try {
    let errorMessage = isCheckingPhone
      ? ERROR_MESSAGES.CONFLICT.PHONE_ALREADY_IN_USE
      : isCheckingEmail
      ? ERROR_MESSAGES.CONFLICT.EMAIL_ALREADY_IN_USE
      : ERROR_MESSAGES.CONFLICT.USERNAME_ALREADY_IN_USE_OTHER_ACCOUNT;

    // Check if email is already in use (when checking email)
    const userByEmail = isCheckingEmail
      ? await findUserByKeyReference(email, origin, provider)
      : null;

    // Check if phone is already in use (when checking phone)
    const userByPhone = isCheckingPhone
      ? await findUserByKeyReference(phone, origin, provider)
      : null;

    // For password signup, we want to check that both username and email are unique
    // regardless of the provider
    if (isCheckingEmail) {
      // Check if username is already taken by a different user
      // We need to check both username and slug since findUserByKeyReference converts username to slug
      const userByUsername = username
        ? await findUserByKeyReference(username, origin, provider)
        : null;

      // Also check by slug directly
      const userBySlug = username
        ? await findUserByKeyReference(username, origin, provider)
        : null;

      // For password provider, strict check - no duplicates allowed
      if (isPasswordProvider) {
        // If username is taken by a different user
        if (userByUsername && userByUsername.email !== email) {
          throw new HTTPException(409, {
            message: ERROR_MESSAGES.CONFLICT.USERNAME_ALREADY_IN_USE,
          });
        }

        // If slug is taken by a different user
        if (userBySlug && userBySlug.email !== email) {
          throw new HTTPException(409, {
            message: ERROR_MESSAGES.CONFLICT.USERNAME_ALREADY_IN_USE,
          });
        }

        // Check if email is already taken by a different user
        if (userByEmail && userByEmail.username !== username) {
          throw new HTTPException(409, {
            message: ERROR_MESSAGES.CONFLICT.EMAIL_ALREADY_IN_USE,
          });
        }
      } else {
        // For passwordless providers (firebase, email), allow updates
        // Check if username is taken by a different user with different email
        if (userByUsername && userByUsername.email !== email) {
          // Allow update only if the existing user has a passwordless provider
          if (userByUsername.provider === "password") {
            throw new HTTPException(409, {
              message: ERROR_MESSAGES.CONFLICT.USERNAME_ALREADY_IN_USE,
            });
          }
          // For passwordless providers, allow the update
        }

        // Check if slug is taken by a different user with different email
        if (userBySlug && userBySlug.email !== email) {
          // Allow update only if the existing user has a passwordless provider
          if (userBySlug.provider === "password") {
            throw new HTTPException(409, {
              message: ERROR_MESSAGES.CONFLICT.USERNAME_ALREADY_IN_USE,
            });
          }
          // For passwordless providers, allow the update
        }

        // Check if email is already taken by a different user
        if (userByEmail && userByEmail.username !== username) {
          // Allow update only if the existing user has a passwordless provider
          if (userByEmail.provider === "password") {
            throw new HTTPException(409, {
              message: ERROR_MESSAGES.CONFLICT.EMAIL_ALREADY_IN_USE,
            });
          }
          // For passwordless providers, allow the update
        }
      }

      // If we get here, either:
      // 1. Both username and email are available
      // 2. Both username and email belong to the same user (which is fine for updates)
      // 3. For passwordless providers, updates are allowed
      return c.json({ error: false }, 200);
    }

    // For phone checks, keep the existing logic for backward compatibility
    if (isCheckingPhone) {
      // if user by phone is found, check if phone and username are the same
      if (
        userByPhone &&
        userByPhone.phone === phone &&
        userByPhone.username === username
      ) {
        return c.json({ error: false }, 200);
      }

      // if user by phone is not found, check if username is available
      if (!userByPhone) {
        // Check both username and slug
        const userByUsername = username
          ? await findUserByKeyReference(username, origin, provider)
          : null;
        const userBySlug = username
          ? await findUserByKeyReference(username, origin, provider)
          : null;

        // if username is already in use, allow update only for email/firebase providers
        if (userByUsername || userBySlug) {
          const existingUser = userByUsername || userBySlug;

          if (existingUser) {
            // For password provider, strict check
            if (isPasswordProvider) {
              throw new HTTPException(409, {
                message: ERROR_MESSAGES.CONFLICT.USERNAME_ALREADY_IN_USE,
              });
            }

            // Allow update only if provider is email or firebase (for phone changes)
            if (
              existingUser.provider === "email" ||
              existingUser.provider === "firebase"
            ) {
              return c.json({ error: false }, 200);
            }

            // For other providers, check if phone matches
            if (existingUser.phone !== phone) {
              throw new HTTPException(409, {
                message:
                  ERROR_MESSAGES.CONFLICT.USERNAME_ALREADY_IN_USE_OTHER_ACCOUNT,
              });
            }
          }
        }

        // if phone is not in use and username is not in use, return true
        return c.json({ error: false }, 200);
      }
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
      message: ERROR_MESSAGES.MISSING_ORIGIN.DELETE_USER,
    });
  }

  try {
    // check if user exists (get user by id)
    const user = await findUserById(userId);
    if (!user) {
      throw new HTTPException(404, {
        message: ERROR_MESSAGES.AUTHORIZATION.USER_NOT_FOUND,
      });
    }

    // delete user
    const isDeleted = await deleteUserById(userId);
    if (!isDeleted) {
      throw new HTTPException(500, {
        message: ERROR_MESSAGES.SERVER.USER_DELETION_ERROR,
      });
    }

    return c.json({ error: false, userId, refId: user.refId });
  } catch (error) {
    throw error;
  }
});
export default auth;
