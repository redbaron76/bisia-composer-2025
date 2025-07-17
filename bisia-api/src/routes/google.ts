import { getFetcher, postFetcher } from "@/libs/fetcher";

import { ERROR_MESSAGES } from "@/libs/errors";
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { callAuthApi } from "@/api/auth";
import { env } from "@/env";

const google = new Hono();

/**
 * Redirect to Google OAuth2 login page
 */
google.get("/login", async (c) => {
  // Get current domain from Origin header or construct from request
  const origin = c.req.query("origin");
  const url = new URL(c.req.url);

  console.log("origin", origin);
  console.log("url", url);

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${url.origin}${env.GOOGLE_REDIRECT_URI}&` +
    `response_type=code&` +
    `scope=email profile&` +
    `access_type=offline` +
    `&state=${encodeURIComponent(origin || "")}`;

  console.log("authUrl", authUrl);

  return c.redirect(authUrl);
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
  const url = new URL(c.req.url);
  const currentDomain = url.origin;

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
    console.log("currentDomain", currentDomain);
    console.log("CLIENT_ID", env.GOOGLE_CLIENT_ID);
    console.log("CLIENT_SECRET", env.GOOGLE_CLIENT_SECRET);
    console.log("REDIRECT_URI", env.GOOGLE_REDIRECT_URI);
    console.log("code", code);

    // Get access token from Google
    const tokenResponse = await postFetcher<{ access_token: string }>(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${currentDomain}${env.GOOGLE_REDIRECT_URI}`,
        grant_type: "authorization_code",
      }
    );

    console.log("tokenResponse", tokenResponse);

    const { access_token } = tokenResponse;

    const userInfoResponse = await getFetcher<{
      id: string;
      email: string;
      name: string;
      picture: string;
    }>("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log("userInfoResponse", userInfoResponse);

    const { id: refId, email, name, picture } = userInfoResponse;

    console.log("refId", refId);
    console.log("email", email);
    console.log("name", name);
    console.log("picture", picture);

    const userId = await callAuthApi<{ userId: string }>(
      "/google/save-user",
      { refId, email, name, picture },
      { origin }
    );

    console.log("userId", userId);

    return c.redirect(`${origin}/demo/form/gmail?userId=${userId.userId}`);
  } catch (error) {
    throw error;
  }
});

export default google;
