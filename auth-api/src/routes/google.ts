import type { AppContext } from "@/types";
import { ERROR_MESSAGES } from "@/libs/errors";
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { doSlug } from "@/libs/tools";
import { upsertUser } from "@/db/api";

const google = new Hono<AppContext>();

google.post("/save-user", async (c) => {
  const { refId, email, name, picture } = await c.req.json();
  const origin = c.req.header("Origin");

  if (!origin) {
    throw new HTTPException(400, {
      message: ERROR_MESSAGES.MISSING_ORIGIN.SIGNUP,
    });
  }

  console.log("origin", origin);
  console.log("refId", refId);
  console.log("email", email);
  console.log("name", name);
  console.log("picture", picture);

  const user = await upsertUser({
    appId: origin,
    refId,
    email,
    username: name,
    slug: doSlug(email),
    picture,
    provider: "google",
  });

  return c.json({ userId: user.id });

  // return c.json({ userId: "123" });
});

export default google;
