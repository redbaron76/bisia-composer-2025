import type { AppContext } from "@/types";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export const handleException = (
  err: Error | HTTPException,
  c: Context<AppContext>
) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: true,
        message: err.message,
        status: err.status,
      },
      err.status
    );
  }
  console.error(err); // Log per debugging
  return c.json(
    {
      error: true,
      message: "Errore interno del server Auth-API",
    },
    500
  );
};
