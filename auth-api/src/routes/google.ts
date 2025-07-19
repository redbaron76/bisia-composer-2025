import { findUserById, findUserByKeyReference, upsertUser } from "@/db/api";
import { sign, verify } from "hono/jwt";

import type { AppContext, SignupData, SignupUser } from "@/types";
import { ERROR_MESSAGES } from "@/libs/errors";
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { doSlug } from "@/libs/tools";
import { env } from "@/env";
import { generateAccessAndRefreshTokens } from "@/middleware/auth";

const google = new Hono<AppContext>();

/**
 * Signup with Google
 * @param c - The context
 * @returns The response
 */
google.post("/signup", async (c) => {
  const { refId, email, name, picture } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.MISSING_ORIGIN.GOOGLE_SIGNUP,
    });
  }

  if (!email) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.VALIDATION.EMAIL_REQUIRED,
    });
  }

  // Try to find existing user by username (not by email to avoid conflicts)
  const existingUser = await findUserByKeyReference(email, origin);

  // Upsert user
  const user = await upsertUser({
    id: existingUser?.id, // Use existing user ID if found
    appId: origin,
    refId,
    email,
    username: name,
    slug: doSlug(email),
    picture,
    provider: "google",
  });

  // Generate token
  const token = await sign(
    {
      userId: user.id,
      appId: origin,
      provider: "google",
    },
    env.JWT_SECRET
  );

  return c.json(token);
});

google.post("/user", async (c) => {
  const { token } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.MISSING_ORIGIN.GOOGLE_SIGNUP,
    });
  }

  if (!token) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.MISSING_TOKEN,
    });
  }

  try {
    const payload = (await verify(token, env.JWT_SECRET)) as {
      userId: string;
      appId: string;
      provider: string;
    };

    const user = await findUserById(payload.userId);

    if (!user) {
      throw new HTTPException(404, {
        message: ERROR_MESSAGES.USER.USER_NOT_FOUND,
      });
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
          wasCreated: false,
          wasConfirmed: false,
          provider: user.provider,
        } satisfies SignupUser,
      } satisfies SignupData,
      200
    );
  } catch (error) {
    throw error;
  }
});

export default google;
