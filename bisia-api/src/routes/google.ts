import type { Role, SignupData, User } from "@/types/user";
import { getFetcher, postFetcher } from "@/libs/fetcher";

import { ERROR_MESSAGES } from "@/libs/errors";
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { OAuth2Client } from "google-auth-library";
import { callAuthApi } from "@/api/auth";
import { env } from "@/env";
import { log } from "@/libs/tools";
import { setCookie } from "hono/cookie";
import { upsertProfile } from "@/api/profile";
import { upsertUser } from "@/api/user";

// create oauth2 client
const oauth2Client = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URI,
});

const google = new Hono();

/**
 * Generate Google OAuth2 login URL
 */
google.get("/auth-url", async (c) => {
  const origin = c.req.query("origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.GOOGLE.MISSING_ORIGIN,
    });
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["email", "profile"],
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    state: origin,
  });

  return c.json({ authUrl });
});

/**
 * Handle Google OAuth2 callback
 * Get access token from Google
 * Get user info from Google
 * Create or update user in database
 * Return user data
 */
google.get("/callback", async (c) => {
  const { code } = c.req.query();
  const origin = c.req.query("state");

  if (!code) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.GOOGLE.MISSING_CODE,
    });
  }

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.GOOGLE.MISSING_ORIGIN,
    });
  }

  try {
    console.log("ORIGIN", origin);
    console.log("code", code);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("TOKENS", tokens);

    const userInfoResponse = await getFetcher<{
      id: string;
      email: string;
      name: string;
      picture: string;
    }>("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    console.log("userInfoResponse", userInfoResponse);

    const { id: refId, email, name, picture } = userInfoResponse;

    console.log("refId", refId);
    console.log("email", email);
    console.log("name", name);
    console.log("picture", picture);

    const token = await callAuthApi<string>(
      "/google/signup",
      { refId, email, name, picture },
      { origin }
    );

    if (!token) {
      throw new HTTPException(400, {
        message: ERROR_MESSAGES.GOOGLE.MISSING_TOKEN,
      });
    }

    console.log("REDIRECTING TO", `${origin}/auth/google?token=${token}`);

    return c.redirect(`${origin}/auth/google?token=${token}`, 302);
  } catch (error) {
    throw error;
  }
});

google.get("/user", async (c) => {
  const origin = c.req.header("Origin");
  const token = c.req.query("token");

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.GOOGLE.MISSING_ORIGIN,
    });
  }

  if (!token) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.GOOGLE.MISSING_TOKEN,
    });
  }

  try {
    const authData = await callAuthApi<SignupData>(
      "/google/user",
      { token },
      { origin }
    );

    console.log("authData", authData);

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

    const user = await upsertUser({
      ...authData.user,
    });

    await upsertProfile({
      ...user,
      userId: user.id,
    });

    return c.json({
      message: "Accesso effettuato con successo",
      accessToken: authData.accessToken,
      user: authData.user,
    });
  } catch (error) {
    throw error;
  }
});

export default google;
